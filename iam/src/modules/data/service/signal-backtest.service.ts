// src/modules/data/service/signal-backtest.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DataRepository } from '../database/repositories/data.repository';

type TF = '5m'|'15m'|'1h'|'4h'|'1d';
type HitLabel = 'T1'|'T2'|'T3'|'SL';

interface TradeSignal {
  _id: any;
  symbol: string;
  timeframe: TF;
  side: 'Buy'|'Strong Buy'|'Sell'|'Strong Sell'|'Hold';
  entry: number;
  targets: number[];
  stop: number|null;
  generated_at: number;
  status: 'open'|'hit'|'stopped'|'expired';
  reached: { T1:boolean; T2:boolean; T3:boolean; SL:boolean };
}

@Injectable()
export class SignalBacktestService {
  private readonly logger = new Logger(SignalBacktestService.name);
  constructor(private readonly repo: DataRepository) {}

  // === Lifetimes: 5m→8m, 15m→20m, 1h→1h, 4h→4h, 1d→24h ===
  // private expiryHorizonSec(tf: TF): number {
  //   switch (tf) {
  //     case '5m':  return 8 * 60;              // 8 minutes
  //     case '15m': return 20 * 60;             // 20 minutes
  //     case '1h':  return 60 * 60;             // 1 hour
  //     case '4h':  return 4 * 60 * 60;         // 4 hours
  //     case '1d':  return 24 * 60 * 60;        // 24 hours
  //     default:    return 15 * 60;             // fallback (15 min)
  //   }
  // }

  private expiryHorizonSec(tf: TF): number {
  switch (tf) {
    case '5m':  return 20 * 60;              // 20 minutes lifespan
    case '15m': return 60 * 60;              // 1 hour lifespan
    case '1h':  return 4 * 60 * 60;          // 4 hours lifespan
    case '4h':  return 24 * 60 * 60;         // 24 hours lifespan
    case '1d':  return 24 * 60 * 60;         // 24 hours (1 day)
    default:    return 60 * 60;              // fallback (1 hour)
    }
  }


  private serializeErr(e: any): string {
    if (!e) return 'unknown';
    if (e instanceof Error) return `${e.name}: ${e.message}\n${e.stack}`;
    try { return JSON.stringify(e); } catch { return String(e); }
  }

  // %PnL based on entry→hitPrice, direction-aware
  private calcPnL(sig: TradeSignal, hitPrice: number | null): number {
    if (hitPrice == null) return 0;
    const dir = (sig.side === 'Buy' || sig.side === 'Strong Buy') ? 1 : -1;
    return ((hitPrice - sig.entry) / sig.entry) * dir; // e.g., 0.0123 = +1.23%
  }

  // evaluate one signal against ticker stream
  private async evaluateOne(sig: TradeSignal) {
    const tag = `[sig ${sig.symbol} ${sig.timeframe} ${sig.side} id=${sig._id}]`;
    const started = Date.now();

    try {
      // Hold: only expire by time
      if (sig.side === 'Hold' || !sig.targets?.length) {
        const now = Math.floor(Date.now() / 1000);
        const horizon = this.expiryHorizonSec(sig.timeframe);
        this.logger.debug(`${tag} HOLD check: now=${now} gen=${sig.generated_at} horizonSec=${horizon}`);
        if (now - sig.generated_at > horizon) {
          await this.repo.updateTradeSignalResult(sig._id.toString(), {
            status: 'expired',
            // for HOLD we mark timeoutRate=1; expectancy=0
            timeoutRate: 1,
            expectancy: 0
          } as any);
          this.logger.log(`${tag} → expired (hold) took=${Date.now()-started}ms`);
          return { updated: true };
        }
        this.logger.debug(`${tag} still open (hold) took=${Date.now()-started}ms`);
        return { updated: false };
      }

      const start = sig.generated_at;
      const end = Math.min(
        start + this.expiryHorizonSec(sig.timeframe),
        Math.floor(Date.now() / 1000)
      );

      // --- Guard logs for connection & cursor
      const conn: any = (this.repo as any).connection;
      if (!conn) {
        this.logger.error(`${tag} ❌ repo.connection is undefined`);
        return { updated: false };
      }
      const col = conn.collection('_tickerdata');
      if (!col) {
        this.logger.error(`${tag} ❌ _tickerdata collection handle is undefined`);
        return { updated: false };
      }

      this.logger.debug(`${tag} scan window: [${start}..${end}] entry=${sig.entry} stop=${sig.stop ?? '-'} targets=${JSON.stringify(sig.targets)}`);

      // stream prices chronologically for this window
      const cursor = col
        .find({ symbol: sig.symbol, time: { $gte: start, $lte: end } })
        .sort({ time: 1 })
        .project({ _id: 0, price: 1, time: 1 });

      let scanCount = 0;
      let first: any = null;
      let last: any = null;

      let hit: HitLabel | null = null;
      let hitPrice: number | null = null;
      let hitTime: number | null = null;

      const reached = { ...sig.reached };
      const isBuy = sig.side === 'Buy' || sig.side === 'Strong Buy';

      try {
        while (await cursor.hasNext()) {
          const doc = await cursor.next();
          if (!first) first = doc;
          last = doc;
          scanCount++;

          const price = doc.price;
          const time  = doc.time;

          if (isBuy) {
            if (sig.stop != null && price <= sig.stop) { reached.SL = true; hit='SL'; hitPrice=price; hitTime=time; break; }
            if (!reached.T1 && price >= sig.targets[0]) { reached.T1 = true; hit='T1'; hitPrice=price; hitTime=time; break; }
            if (!reached.T2 && price >= sig.targets[1]) { reached.T2 = true; hit='T2'; hitPrice=price; hitTime=time; break; }
            if (!reached.T3 && price >= sig.targets[2]) { reached.T3 = true; hit='T3'; hitPrice=price; hitTime=time; break; }
          } else {
            if (sig.stop != null && price >= sig.stop) { reached.SL = true; hit='SL'; hitPrice=price; hitTime=time; break; }
            if (!reached.T1 && price <= sig.targets[0]) { reached.T1 = true; hit='T1'; hitPrice=price; hitTime=time; break; }
            if (!reached.T2 && price <= sig.targets[1]) { reached.T2 = true; hit='T2'; hitPrice=price; hitTime=time; break; }
            if (!reached.T3 && price <= sig.targets[2]) { reached.T3 = true; hit='T3'; hitPrice=price; hitTime=time; break; }
          }
        }
      } catch (streamErr) {
        this.logger.error(`${tag} ❌ cursor stream error: ${this.serializeErr(streamErr)}`);
        // Let it fall through as "no update" to keep cron stable
      }

      if (first || last) {
        this.logger.debug(
          `${tag} scan stats: count=${scanCount}` +
          (first ? ` first={t:${first.time},p:${first.price}}` : '') +
          (last  ? ` last={t:${last.time},p:${last.price}}` : '')
        );
      } else {
        this.logger.warn(`${tag} no prices found in window; leaving open`);
      }

      // --- Case 1: A level was hit (T1/T2/T3/SL)
      if (hit) {
        const pnl = this.calcPnL(sig, hitPrice);
        await this.repo.updateTradeSignalResult(sig._id.toString(), {
          status: hit === 'SL' ? 'stopped' : 'hit',
          hitLabel: hit,
          hitPrice,
          hitTime,
          durationSec: (hitTime ?? start) - start,
          reached,
          // new fields
          expectancy: pnl,     // store realized % move as expectancy contribution
          timeoutRate: 0       // this signal did not time out
        } as any);
        this.logger.log(`${tag} → ${hit} @ ${hitPrice} t=${hitTime} took=${Date.now()-started}ms`);
        return { updated: true };
      }

      // --- Case 2: No hit → check expiry
      const now = Math.floor(Date.now() / 1000);
      if (now >= start + this.expiryHorizonSec(sig.timeframe)) {
        // Use last seen price (or entry if nothing streamed) as terminal price
        const lastPrice = last?.price ?? sig.entry;
        const lastTime  = last?.time ?? end;
        const pnl = this.calcPnL(sig, lastPrice);
        await this.repo.updateTradeSignalResult(sig._id.toString(), {
          status: 'expired',
          hitPrice: lastPrice,       // terminal price at expiry
          hitTime: lastTime,         // terminal time at expiry
          durationSec: lastTime - start,
          reached,
          // new fields
          expectancy: pnl,           // realized % drift vs entry
          timeoutRate: 1             // this signal timed out
        } as any);
        this.logger.log(`${tag} → expired (no hit) took=${Date.now()-started}ms`);
        return { updated: true };
      }

      // --- Case 3: Still open within horizon
      this.logger.debug(`${tag} still open; took=${Date.now()-started}ms`);
      return { updated: false };
    } catch (e) {
      this.logger.error(`${tag} fatal evaluateOne error: ${this.serializeErr(e)}`);
      return { updated: false };
    }
  }

  // public: evaluate all open signals (batch)
  async evaluateOpenSignals(): Promise<{ checked: number; updated: number }> {
    const started = Date.now();
    let signals: any[] = [];
    try {
      signals = await this.repo.getOpenSignals(500);
      this.logger.log(`🔎 open signals fetched: ${signals.length}`);
    } catch (e) {
      this.logger.error(`❌ getOpenSignals failed: ${this.serializeErr(e)}`);
      throw e;
    }

    let updated = 0;
    for (const s of signals as any[]) {
      try {
        const r = await this.evaluateOne(s as any);
        if (r.updated) updated++;
      } catch (inner) {
        this.logger.error(
          `[sig ${s?.symbol ?? '?'} ${s?.timeframe ?? '?'} id=${s?._id ?? '?'}] evaluateOne threw: ${this.serializeErr(inner)}`
        );
      }
    }

    const took = Date.now() - started;
    this.logger.log(`📈 evaluateOpenSignals done: checked=${signals.length} updated=${updated} took=${took}ms`);
    return { checked: signals.length, updated };
  }

  // public: bulk mark obviously expired (no scan) — fast path for “finished timed”
  async expireTimedOutSignals(): Promise<number> {
    const started = Date.now();
    const now = Math.floor(Date.now() / 1000);
    try {
      const conn: any = (this.repo as any).connection;
      if (!conn) {
        this.logger.error(`❌ expireTimedOutSignals: repo.connection undefined`);
        return 0;
      }
      const col = conn.collection('_tradesignals');
      const minHorizon = this.expiryHorizonSec('5m');

      // NOTE: rough mass-expire — we set timeoutRate=1; expectancy left unchanged
      const res = await col.updateMany(
        {
          status: 'open',
          generated_at: { $lte: now - minHorizon },
        },
        { $set: { status: 'expired', timeoutRate: 1 } }
      );

      const modified = res?.modifiedCount ?? 0;
      this.logger.log(`🧹 expired timed-out (rough): modified=${modified} took=${Date.now()-started}ms`);
      return modified;
    } catch (e) {
      this.logger.error(`❌ expireTimedOutSignals failed: ${this.serializeErr(e)}`);
      return 0;
    }
  }
}
