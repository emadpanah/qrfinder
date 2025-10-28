// src/modules/data/service/signal-cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SignalBacktestService } from './signal-backtest.service';

@Injectable()
export class SignalCronService {
  private readonly logger = new Logger(SignalCronService.name);
  constructor(private readonly backtest: SignalBacktestService) {}

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
      this.logger.log(
        `✅ Backtest cron done: checked=${checked} updated=${updated} took=${took}ms`
      );
    } catch (e) {
      const took = Date.now() - startedAt;
      this.logger.error(
        `❌ Backtest cron failed after ${took}ms\n${this.serializeErr(e)}`
      );
    }
  }
}
