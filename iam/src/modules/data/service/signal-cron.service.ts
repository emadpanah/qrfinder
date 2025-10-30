// src/modules/data/service/signal-cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SignalBacktestService } from './signal-backtest.service';
import { DataRepository } from '../database/repositories/data.repository';
import { AiSignalService } from 'src/modules/ai/services/ai-signal.service';
import { extractSignalJsonEnvelope } from 'src/shared/helper';
import { TradeSignal } from '../database/schema/trade-signal.schema';

type TF = '5m'|'15m'|'1h'|'4h'|'1d';

@Injectable()
export class SignalCronService {
  private readonly logger = new Logger(SignalCronService.name);
  constructor(
    private readonly backtest: SignalBacktestService,
    private readonly repo: DataRepository,
    private readonly ai: AiSignalService,
  ) {}

  private serializeErr(e: any): string {
    if (!e) return 'unknown';
    if (e instanceof Error) return `${e.name}: ${e.message}\n${e.stack}`;
    try { return JSON.stringify(e); } catch { return String(e); }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async run() {
    const startedAt = Date.now();
    const iso = new Date().toISOString();

    try {
      this.logger.log(`▶️ Backtest cron start @ ${iso} pid=${process.pid}`);
      const { checked, updated } = await this.backtest.evaluateOpenSignals();
      const took = Date.now() - startedAt;
      this.logger.log(`✅ Backtest cron done: checked=${checked} updated=${updated} took=${took}ms`);
    } catch (e) {
      const took = Date.now() - startedAt;
      this.logger.error(`❌ Backtest cron failed after ${took}ms\n${this.serializeErr(e)}`);
    }
  }

  // Generate signals every 15 minutes for BOTH 5m and 15m timeframes
  @Cron('0 */15 * * * *')
  async generateSignals() {
    const startedAt = Date.now();
    const iso = new Date().toISOString();
    const TIMEFRAMES: TF[] = ['5m', '15m'];
    const language = process.env.NABZAR_LANG || 'fa';

    // <<< edit your list here >>>
    const symbols = [
      'BTCUSDT','ETHUSDT','SOLUSDT','XAUUSD','US100',
      'BNBUSDT','ADAUSDT','DOGEUSDT','XRPUSDT','TRXUSDT'
    ];

    // tunables
    const CONCURRENCY = Number(process.env.SIGNAL_CRON_CONCURRENCY || 4);
    const RECENT_SEC  = 2 * 60; // as requested
    const TIMEOUT_MS  = Number(process.env.SIGNAL_PER_SYMBOL_TIMEOUT_MS || 70_000);

    const timeout = <T>(p: Promise<T>, ms: number, label: string) =>
      Promise.race<T>([
        p,
        new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`Timeout: ${label} > ${ms}ms`)), ms))
      ]);

    // simple concurrency runner (no extra deps)
    async function runWithConcurrency<T, R>(
      items: T[],
      limit: number,
      handler: (item: T, idx: number) => Promise<R>
    ): Promise<PromiseSettledResult<R>[]> {
      const results: PromiseSettledResult<R>[] = new Array(items.length);
      let next = 0;

      async function worker() {
        while (true) {
          const i = next++;
          if (i >= items.length) break;
          try {
            const r = await handler(items[i], i);
            results[i] = { status: 'fulfilled', value: r };
          } catch (e: any) {
            results[i] = { status: 'rejected', reason: e };
          }
        }
      }

      const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
      await Promise.all(workers);
      return results;
    }

    type PerSymbolResult = {
      symbol: string;
      timeframe: TF;
      created: boolean;
      skipped: boolean;
      deepseekSaved?: boolean;
    };

    let totalCreated = 0, totalSkipped = 0, totalFailed = 0, totalDeepseekSaved = 0;

    try {
      this.logger.log(`🚀 Signal generation start @ ${iso} (tf=${TIMEFRAMES.join(',')}, conc=${CONCURRENCY})`);

      // Process each timeframe sequentially to keep logs and load tidy
      for (const timeframe of TIMEFRAMES) {
        let created = 0, skipped = 0, failed = 0, deepseekSavedCount = 0;

        this.logger.log(`⏱️ Processing timeframe: ${timeframe}`);

        const results = await runWithConcurrency<string, PerSymbolResult>(
          symbols,
          CONCURRENCY,
          async (sym) => {
            // 1) skip if recent open FOR THIS TIMEFRAME
            // const hasRecent = await this.repo.hasRecentOpen(sym, timeframe, RECENT_SEC);
            // if (hasRecent) {
            //   this.logger.debug(`[${sym} ${timeframe}] skipped: found recent open within ${RECENT_SEC}s`);
            //   return { symbol: sym, timeframe, created: false, skipped: true };
            // }

            // 2) call ChatGPT with timeout
            const userPrompt = 'Generate concise trading action first; keep explanations tight.';
            const { responseText, prompt, systemPrompt }   = await timeout(
              this.ai.analyzeAndCreateSignals([sym], language, timeframe, userPrompt),
              TIMEOUT_MS,
              `AI ${sym} ${timeframe}`
            );

            // 3) parse envelope from ChatGPT output
            const sig = extractSignalJsonEnvelope(responseText);
            if (!sig) {
              throw new Error(`[${sym} ${timeframe}] No NABZAR_SIGNAL_JSON envelope found in ChatGPT output`);
            }

            // 4) persist ChatGPT signal
            const nowSec = Math.floor(Date.now() / 1000);
            const chatgptDoc: Partial<TradeSignal> = {
              symbol: sig.symbol,
              timeframe: (sig.timeframe as TF) || timeframe,
              side: sig.action,
              entry: sig.entry,
              targets: sig.targets || [],
              stop: sig.stop ?? null,
              generated_at: nowSec,
              generated_iso: new Date().toISOString(),
              source: 'gpt-4o-mini-2024-07-18-Automated',
              status: 'open',
              reached: { T1: false, T2: false, T3: false, SL: false },
              extras: {
                responseText, prompt, systemPrompt
              },
            };

            await this.repo.createTradeSignal(chatgptDoc as any);
            this.logger.debug(`[${sym} ${timeframe}] created ChatGPT open signal @ ${nowSec}`);

            // 5) call DeepSeek with the SAME prompt/systemPrompt and save its signal separately
            let deepseekSaved = false;
            try {
              const { deepseekText, saved } =
                await this.ai.generateDeepseekSignalAndSave(prompt, systemPrompt);
              deepseekSaved = !!saved;

              if (deepseekSaved) {
                this.logger.debug(`[${sym} ${timeframe}] DeepSeek signal saved.`);
              } else {
                this.logger.warn(`[${sym} ${timeframe}] DeepSeek produced no valid envelope; not saved.`);
              }

              // (Optional) If you later want to patch the ChatGPT record with DeepSeek raw, add a repo method to append extras.
              // await this.repo.appendExtrasToSignal(chatgptDocId, { deepseek: { responseText: deepseekText } });

            } catch (deepErr: any) {
              this.logger.error(`[${sym} ${timeframe}] DeepSeek call/save failed: ${deepErr?.message || deepErr}`);
            }

            return { symbol: sym, timeframe, created: true, skipped: false, deepseekSaved };
          }
        );

        // reduce per-timeframe counters
        for (const r of results) {
          if (r.status === 'fulfilled') {
            if (r.value.created) {
              created++;
              if (r.value.deepseekSaved) deepseekSavedCount++;
            } else if (r.value.skipped) {
              skipped++;
            }
          } else {
            failed++;
            const reason = r.reason?.message || String(r.reason);
            this.logger.error(`❌ Symbol job failed (${timeframe}): ${reason}`);
          }
        }

        this.logger.log(
          `✅ Timeframe ${timeframe} done: created=${created}, skipped=${skipped}, failed=${failed}, deepseekSaved=${deepseekSavedCount}`
        );

        totalCreated += created;
        totalSkipped += skipped;
        totalFailed  += failed;
        totalDeepseekSaved += deepseekSavedCount;
      }

      const took = Date.now() - startedAt;
      this.logger.log(
        `🎯 All timeframes done: created=${totalCreated}, skipped=${totalSkipped}, failed=${totalFailed}, deepseekSaved=${totalDeepseekSaved}, took=${took}ms`
      );
    } catch (e) {
      const took = Date.now() - startedAt;
      this.logger.error(`❌ Signal generation cron failed after ${took}ms\n${this.serializeErr(e)}`);
    }
  }
}
