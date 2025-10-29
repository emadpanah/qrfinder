import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { DataRepository } from '../../data/database/repositories/data.repository';
import { logDuration, mapSymbol } from 'src/shared/helper';
import { CalendarRepository } from 'src/modules/data/database/repositories/calendar.repository';

@Injectable()
export class AiSignalService {
  private readonly logger = new Logger(AiSignalService.name);
  private readonly openai: OpenAI;

  constructor(private readonly dataRepository: DataRepository, private readonly calendarRepository: CalendarRepository) {
    this.openai = new OpenAI({ apiKey: process.env.CHATGPT_API_KEY });
  }

async analyzeAndCreateSignals(symbols: string[], language: string, timeframe: '15m'|'1h'|'4h'|'1d' = '1h', userPrompt: string): Promise<string> {
    let sym;
    if (symbols.length >= 1) {
      sym = symbols[0];
    }
    const effectiveDate = new Date().toISOString().split('T')[0];
    const timestamp1 = new Date(effectiveDate).getTime() / 1000;

    // Start timing for FNG data retrieval
    const fngStart = Date.now();
    const fngData = await this.dataRepository.findFngByDate();
    const fngHis = await this.dataRepository.getLast7DaysFngDataOptimized(timestamp1);
    const fngEnd = Date.now();
    logDuration(fngStart, fngEnd, 'Fetching FNG data');
    const fng = fngData
      ? { value: fngData.value || "0", value_classification: fngData.value_classification || "Neutral" }
      : { value: "0", value_classification: "Neutral" };

    let responseText = ``;
    const symbol = mapSymbol(sym.toLowerCase(), 'pair');

    const overallStart = Date.now();

    const rsiStart = Date.now();
    const rsiPromise = this.dataRepository.getRSIBySymbolAndDate(symbol)
      .then(res => { logDuration(rsiStart, Date.now(), 'RSI'); return res; });

    const sortsStart = Date.now();
    const sortsPromise = this.dataRepository.getAllSortsForSymbol(symbol)
      .then(res => { logDuration(sortsStart, Date.now(), 'SORTS'); return res; });

    const macdStart = Date.now();
    const macdPromise = this.dataRepository.getMACDBySymbolAndDate(symbol)
      .then(res => { logDuration(macdStart, Date.now(), 'MACD'); return res; });

    const adxStart = Date.now();
    const adxPromise = this.dataRepository.getADXBySymbolAndDate(symbol)
      .then(res => { logDuration(adxStart, Date.now(), 'ADX'); return res; });

    const cciStart = Date.now();
    const cciPromise = this.dataRepository.getCCIBySymbolAndDate(symbol)
      .then(res => { logDuration(cciStart, Date.now(), 'CCI'); return res; });

    const stoStart = Date.now();
    const stochasticPromise = this.dataRepository.getStochasticBySymbolAndDate(symbol)
      .then(res => { logDuration(stoStart, Date.now(), 'Stochastic'); return res; });

    const emaStart = Date.now();
    const emaPromise = this.dataRepository.getEMABySymbolAndDate(symbol)
      .then(res => { logDuration(emaStart, Date.now(), 'EMA'); return res; });

    const priceStart = Date.now();
    const pricePromise = this.dataRepository.getLatestPriceBySymbol(symbol, timestamp1)
      .then(res => { logDuration(priceStart, Date.now(), 'Price'); return res; });

    // Preserve your original destructuring order/names
    const [
      rsi, 
      sorts, 
      macd, 
      adx, 
      cci, 
      stochastic, 
      ema, 
      price
    ] = await Promise.all([
      rsiPromise,
      sortsPromise,
      macdPromise,
      adxPromise,
      cciPromise,
      stochasticPromise,
      emaPromise,
      pricePromise,
    ]);

    logDuration(overallStart, Date.now(), 'Fetching indicators data (overall)');



    // Transform priceHistoryRaw into the expected format
    const priceHistoryStart = Date.now();
    const priceHistory = await this.dataRepository.getLast7DaysDailyPriceOptimized(symbol, timestamp1);
    const priceHistoryEnd = Date.now();
    logDuration(priceHistoryStart, priceHistoryEnd, 'Transforming price history data');

    // Start timing for historical data retrieval
    const historicalDataStart = Date.now();
    const historicalData = {
      priceHistory,
      RSIHistory: await this.dataRepository.getLast7DaysRSI(symbol, timestamp1),
      MACDHistory: await this.dataRepository.getLast7DaysMACD(symbol, timestamp1),
      ADXHistory: await this.dataRepository.getLast7DaysADX(symbol, timestamp1),
      CCIHistory: await this.dataRepository.getLast7DaysCCI(symbol, timestamp1),
      EMAHistory: await this.dataRepository.getLast7DaysEMA(symbol, timestamp1),
      StochasticHistory: await this.dataRepository.getLast7DaysStochastic(symbol, timestamp1)
    };
    const historicalDataEnd = Date.now();
    logDuration(historicalDataStart, historicalDataEnd, 'Fetching historical data');

    // Fetch last 10 news articles for the symbol
    const newsStart = Date.now();
    const news = await this.dataRepository.getLatestNews(5, symbol); // Assuming this method exists
    const newsEnd = Date.now();
    logDuration(newsStart, newsEnd, 'Fetching news data');

    // Format news data
    const formattedNews = await Promise.all(
      news.map(async (item) => {
        // Translate the title if the language is not English
        let title;
        if (language === 'en') {
          title = item.post_title;
        } else {
          title = await this.getTranslatedText(item.id, item.post_title, language);
        }
        return `
  📰 *News Title*: ${title}
  - *Sentiment*: ${item.post_sentiment}
  - *Interactions*: ${item.post_interactions || 'N/A'}
  - *Link*: [Read more](${item.post_link})
      `;
      })
    );
    const formattedNewsString = formattedNews.join('\n\n');

   // Fetch calendar events for the next 30 days
    const calendarStart = Date.now();
    const currentTimestamp = Date.now(); // Use milliseconds
    const thirtyDaysLater = currentTimestamp + 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    const calendarEvents = await this.calendarRepository.getEventsBySymbol(symbol);
    console.log(`Fetched ${calendarEvents.length} calendar events for ${symbol} at runtime`);
    const upcomingEvents = calendarEvents
      .filter(event => event.fetched_at >= currentTimestamp && event.fetched_at <= thirtyDaysLater)
      .sort((a, b) => a.fetched_at - b.fetched_at);
    console.log(`Upcoming events for ${symbol}:`, upcomingEvents);
    const calendarEnd = Date.now();
    logDuration(calendarStart, calendarEnd, 'Fetching calendar events');

    // Format calendar events
    const formattedCalendarEvents = upcomingEvents.length > 0
      ? upcomingEvents.map(event => `
  📅 *Event*: ${event.name}
  - *Date*: ${new Date(event.event_date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}
  - *Type*: ${event.event_type}
  - *Description*: ${event.event_description}
  - *Impact Level*: ${event.impact_level}
  - *Expected Price Impact*: ${event.expected_price_impact > 0 ? '+' : ''}${event.expected_price_impact}%
  - *Sentiment Score*: ${event.sentiment_score}
  - *Related Assets*: ${event.related_assets.join(', ')}
  `).join('\n\n')
      : `No upcoming events found for ${symbol} in the next 30 days.`;

    function formatHistoricalData(historicalData: any[], indicator: string): string {
      if (!historicalData || historicalData.length === 0) {
        return `No historical ${indicator} data available for the last 7 days.`;
      }
      return `Here is the historical ${indicator} data for the past 7 days:\n${historicalData
        .map((entry, index) => {
          const time = entry.time ? new Date(entry.time * 1000).toLocaleString() : 'N/A';
          const valueString = Object.entries(entry)
            .filter(([key]) => key !== 'time')
            .map(([key, value]) => `${key}: ${value !== undefined ? value : 'N/A'}`)
            .join(', ');
          return `Day ${index + 1}: ${valueString}, Time: ${time}`;
        })
        .join('\n')}`;
    }

    // Format individual indicators
    const formattedRSIHistory = formatHistoricalData(historicalData.RSIHistory, 'RSI');
    const formattedMACDHistory = formatHistoricalData(historicalData.MACDHistory, 'MACD');
    const formattedADXHistory = formatHistoricalData(historicalData.ADXHistory, 'ADX');
    const formattedCCIHistory = formatHistoricalData(historicalData.CCIHistory, 'CCI');
    const formattedStochasticHistory = formatHistoricalData(historicalData.StochasticHistory, 'Stochastic');
    const formattedEMAHistory = formatHistoricalData(historicalData.EMAHistory, 'EMA');
    const formattedPriceHistory = formatHistoricalData(historicalData.priceHistory, 'Price');
    const formattedFNGHistory = formatHistoricalData(fngHis, 'FNG');

    const analyzeSorts = (sortLabel: string, current: any, previous: any = null) => {
      if (current === "No data") {
        return `${sortLabel}: No data available for analysis.`;
      }
      if (previous !== null) {
        const trend = current > previous ? "an upward trend" : "a downward trend";
        return `${sortLabel}: The current value is ${current}, showing ${trend} compared to the previous value (${previous}).`;
      }
      return `${sortLabel}: The current value is ${current}.`;
    };
    const currentPrice = price;

     const isCFD = /^(XAUUSD|US100)$/i.test(symbol);
     console.log('--symbol Detection : is gold or US100 : ', isCFD)
    //  const cryptoActionBlock = `
    //       ### **Trading Action Section Instructions (Crypto)**
    //       Generate a trading action section with one of the following actions:
    //       - **Buy**
    //       - **Strong Buy**
    //       - **Sell**
    //       - **Strong Sell**
    //       - **Hold**

    //       📌 Based on the chosen action, apply this logic:
    //       - For **Buy**:
    //         - 🎯 Target = currentPrice × 1.01
    //         - 🛑 Stop Loss = currentPrice × 0.9905
    //       - For **Strong Buy**:
    //         - 🎯 Target = currentPrice × 1.0102
    //         - 🛑 Stop Loss = currentPrice × 0.9905
    //       - For **Sell**:
    //         - 🎯 Target = currentPrice × 0.99
    //         - 🛑 Stop Loss = currentPrice × 1.0095
    //       - For **Strong Sell**:
    //         - 🎯 Target = currentPrice × 0.9898
    //         - 🛑 Stop Loss = currentPrice × 1.0095
    //       - For **Hold**: Do not provide target or stop loss. Just summarize the reason for holding.

    //       📝 Format the trading action section like this:
    //       \`\`\`
    //       📊 Trading Action: [ACTION]
    //       🎯 Target Price: $[value] ([percentage])
    //       🛑 Stop Loss: $[value] ([percentage])
    //       ⏲ TimeFrame : ${timeframe}
    //       📋 Summary:
    //       [Short summary of reasoning for the action.]
    //       🧠 Explanation:
    //       [Detailed explanation combining technical indicators, price movement, sentiment, sorts, news, and calendar events.]
    //       \`\`\`
    //         `.trim();

    const cryptoActionBlock = `
  ### Trading Action Section Instructions (Crypto) — 3 Targets

  Choose exactly ONE action:
  - Buy | Strong Buy | Sell | Strong Sell | Hold

  Let currentPrice be the live price.

  Rules (TP2 matches your original single target; TP1 is softer, TP3 is more ambitious):

  - Buy:
    • TP1 = currentPrice × 1.0050
    • TP2 = currentPrice × 1.0100
    • TP3 = currentPrice × 1.0150
    • SL  = currentPrice × 0.9905

  - Strong Buy:
    • TP1 = currentPrice × 1.0070
    • TP2 = currentPrice × 1.0102
    • TP3 = currentPrice × 1.0180
    • SL  = currentPrice × 0.9905

  - Sell:
    • TP1 = currentPrice × 0.9950
    • TP2 = currentPrice × 0.9900
    • TP3 = currentPrice × 0.9850
    • SL  = currentPrice × 1.0095

  - Strong Sell:
    • TP1 = currentPrice × 0.9940
    • TP2 = currentPrice × 0.9898
    • TP3 = currentPrice × 0.9840
    • SL  = currentPrice × 1.0095

  - Hold:
    • Do NOT return SL or Targets. Provide a brief reason only.

  Percent formula (show sign, 2 decimals):
  percent(x) = 100 * (x - currentPrice) / currentPrice

  Output exactly in this format (prices ≤4 decimals; include percent vs currentPrice). No extra text:

  \`\`\`
  📊 Trading Action: [ACTION]
  🎯 TP1: $[value] ([percent])   🎯 TP2: $[value] ([percent])   🎯 TP3: $[value] ([percent])
  🛑 Stop Loss: $[value] ([percent])
  ⏲ TimeFrame : ${timeframe}
  📋 Summary:
  [Short reason]
  🧠 Explanation:
  [Detailed reasoning combining technical indicators, price movement, sentiment, sorts, news, and calendar events.]
  \`\`\`

  If action is Hold: return only "📊 Trading Action", "⏲ TimeFrame", "📋 Summary", "🧠 Explanation".
`.trim();


//      const cfdActionBlock = `
//   ### Trading Action Rules (XAUUSD & US100) — 3 Take-Profit Levels

//   Select exactly ONE action:
//   Buy | Strong Buy | Sell | Strong Sell | Hold

//   Inputs:
//   - currentPrice: number (live price)
//   - tf ∈ {15m, 1h, 4h, 1d}  // timeframe
//   - tick = 0.01             // pip/tick size

//   Pip table by timeframe (SL and TP levels in pips):
//   - 15m:  SL=25,  TP1=20,  TP2=30,  TP3=40
//   - 1h :  SL=50,  TP1=40,  TP2=60,  TP3=80
//   - 4h :  SL=100, TP1=120, TP2=160, TP3=200
//   - 1d :  SL=200, TP1=240, TP2=320, TP3=400

//   Use the row that matches \`${timeframe}\`. Let slPips,tp1Pips,tp2Pips,tp3Pips be from the table.

//   If action == "Buy":
//     SL  = currentPrice - slPips  * tick
//     TP1 = currentPrice + tp1Pips * tick
//     TP2 = currentPrice + tp2Pips * tick
//     TP3 = currentPrice + tp3Pips * tick

//   If action == "Sell":
//     SL  = currentPrice + slPips  * tick
//     TP1 = currentPrice - tp1Pips * tick
//     TP2 = currentPrice - tp2Pips * tick
//     TP3 = currentPrice - tp3Pips * tick

//   If action == "Strong Buy":
//     SL  = currentPrice - slPips * tick
//     TP1 = currentPrice + (tp1Pips * tick * 1.02)
//     TP2 = currentPrice + (tp2Pips * tick * 1.02)
//     TP3 = currentPrice + (tp3Pips * tick * 1.02)

//   If action == "Strong Sell":
//     SL  = currentPrice + slPips * tick
//     TP1 = currentPrice - (tp1Pips * tick * 1.02)
//     TP2 = currentPrice - (tp2Pips * tick * 1.02)
//     TP3 = currentPrice - (tp3Pips * tick * 1.02)

//   If action == "Hold":
//     Do NOT return SL or Targets; give only a brief reason.

//   Percent formula (include sign, 2 decimals):
//   percent(x) = 100 * (x - currentPrice) / currentPrice

//   Output exactly in this format (prices with 2 decimals; include percent vs currentPrice in parentheses). No extra text:

//   \`\`\`
//   📊 Trading Action: [ACTION]
//   🎯 TP1: $[value] ([percent])   🎯 TP2: $[value] ([percent])   🎯 TP3: $[value] ([percent])
//   🛑 Stop Loss: $[value] ([percent])
//   ⏲ TimeFrame : ${timeframe}
//   📋 Summary:
//   <short reason>
//   🧠 Explanation:
//   <detailed reasoning using indicators, price action, sentiment, sorts, news, and calendar>
//   \`\`\`

//   If action is Hold: return only "📊 Trading Action", "⏲ TimeFrame", "📋 Summary", "🧠 Explanation".
// `.trim();


const cfdActionBlock = `
### **Trading Action Section (CFD)**

**Inputs**
- symbol (e.g., XAUUSD, US30, GER40, WTI)
- currentPrice (number)
- action: **Buy | Strong Buy | Sell | Strong Sell | Hold**

**Rules**
- Always produce **three targets (T1, T2, T3)** and **one Stop Loss (SL)** — except **Hold** (no targets/SL).
- Levels are **percentages of entry (currentPrice)**.
- Round to the instrument's **tickSize**.

**Default Percent Sets (good starting point for Gold/XAUUSD)**
- **Buy**:       T1 = +0.50%, T2 = +1.00%, T3 = +2.00%; **SL = –0.75%**
- **Strong Buy**: T1 = +0.70%, T2 = +1.40%, T3 = +2.80%; **SL = –0.70%**
- **Sell**:      T1 = –0.50%, T2 = –1.00%, T3 = –2.00%; **SL = +0.75%**
- **Strong Sell**:T1 = –0.70%, T2 = –1.40%, T3 = –2.80%; **SL = +0.70%**
- **Hold**: no targets, no SL.

**Formulas**
- For **Buy / Strong Buy**:
  - Tn = currentPrice × (1 + pct_n)
  - SL = currentPrice × (1 – sl_pct)
- For **Sell / Strong Sell**:
  - Tn = currentPrice × (1 – |pct_n|)
  - SL = currentPrice × (1 + sl_pct)

**Output (JSON)**
- \`{ symbol, action, entry, targets: [T1,T2,T3], stopLoss, rrToT2 }\`
- \`rrToT2\` = |(T2 – entry)| / |(entry – SL)|

**TypeScript Helper**
\`\`\`ts
type Action = 'Buy' | 'Strong Buy' | 'Sell' | 'Strong Sell' | 'Hold';

const pctSets: Record<Action, any> = {
  Buy:          { t1: 0.005,  t2: 0.010,  t3: 0.020,  sl: 0.0075 },
  'Strong Buy': { t1: 0.007,  t2: 0.014,  t3: 0.028,  sl: 0.007  },
  Sell:         { t1:-0.005,  t2:-0.010,  t3:-0.020,  sl: 0.0075 },
  'Strong Sell':{ t1:-0.007,  t2:-0.014,  t3:-0.028,  sl: 0.007  },
  Hold:         null
};

// Optional: default tick sizes per common symbols (override as needed)
const defaultTickSize: Record<string, number> = {
  XAUUSD: 0.1,   // gold
  XAGUSD: 0.001, // silver
  US30:   1,
  GER40:  1,
  WTI:    0.01
};

function calcCFDLevels(
  symbol: string,
  currentPrice: number,
  action: Action,
  tickSize?: number
) {
  const set = pctSets[action];
  if (!set) return { symbol, action, note: 'Hold — no targets/SL' };

  const ts = tickSize ?? defaultTickSize[symbol] ?? 0.1;
  const round = (p: number) => Math.round(p / ts) * ts;

  const targets = [
    round(currentPrice * (1 + set.t1)),
    round(currentPrice * (1 + set.t2)),
    round(currentPrice * (1 + set.t3)),
  ];

  const stopLoss =
    action === 'Buy' || action === 'Strong Buy'
      ? round(currentPrice * (1 - set.sl))
      : round(currentPrice * (1 + set.sl));

  const rrToT2 = Math.abs((targets[1] - currentPrice) / (currentPrice - stopLoss));

  return {
    symbol,
    action,
    entry: round(currentPrice),
    targets,
    stopLoss,
    rrToT2: Number(rrToT2.toFixed(2))
  };
}
\`\`\`

**Example (Gold / XAUUSD)**
- \`calcCFDLevels('XAUUSD', 2000, 'Buy')\`
  → \`targets: [2010, 2020, 2040]\`, \`stopLoss: 1985\`, \`rrToT2 ≈ 1.33\`
`;



    const actionBlock = isCFD ? cfdActionBlock : cryptoActionBlock;

    const prompt = `
    [Timeframe]: ${timeframe} (always mention the timeframe in the result)
As you are a trading assistant specializing in cryptocurrency analysis. Use the following methodologies, indicators, and data points to generate a comprehensive trading signal for the symbol ${symbol}
 :

### **Price Data**
- **Price Analysis**: The current price is ${currentPrice?.price || 'N/A'}. Historical data indicates:
${formattedPriceHistory}
(always mention  "Trading Action Section Instructions" data then go for showing other explanation)
### **Trading Action Section Instructions**
${actionBlock}
### **Indicators Analysis**
- **RSI Analysis**: Current RSI value is ${JSON.stringify(rsi) || 'N/A'}. Historical data:
${formattedRSIHistory}
- **MACD Analysis**: Current MACD values are ${JSON.stringify(macd) || 'N/A'}. Historical data:
${formattedMACDHistory}
- **ADX Analysis**: Current ADX value is ${JSON.stringify(adx) || 'N/A'}. Historical data:
${formattedADXHistory}
- **CCI Analysis**: Current CCI value is ${JSON.stringify(cci) || 'N/A'}. Historical data:
${formattedCCIHistory}
- **Stochastic Analysis**: Current Stochastic values are ${JSON.stringify(stochastic) || 'N/A'}. Historical data:
${formattedStochasticHistory}
- **EMA Analysis**: Current EMA value is ${JSON.stringify(ema) || 'N/A'}. Historical data:
${formattedEMAHistory}

### **Sentiment**
- **Fear and Greed Index (FNG)**: ${fng.value} (${fng.value_classification}). Historical data:
${formattedFNGHistory}

### **Social and Market Live Data** (always mention galaxy score and altrank in this section add one line of simple description for them)
-**Volume (24h)**: ${analyzeSorts("Volume (24h)", sorts?.volume_24h || 'N/A')}
-**Volatility**: ${analyzeSorts("Volatility", sorts?.volatility || 'N/A')}
-**Circulating Supply**: ${analyzeSorts("Circulating Supply", sorts?.circulating_supply || 'N/A')}
-**Max Supply**: ${analyzeSorts("Max Supply", sorts?.max_supply || 'N/A')}
-**Market Cap**: ${analyzeSorts("Market Cap", sorts?.market_cap || 'N/A')}
-**Market Dominance**: ${analyzeSorts("Market Dominance", sorts?.market_dominance || 'N/A', sorts?.market_dominance_prev)}
-**Galaxy Score**: ${analyzeSorts("Galaxy Score", sorts?.galaxy_score || 'N/A', sorts?.galaxy_score_previous)}
-**Alt Rank**: ${analyzeSorts("Alt Rank", sorts?.alt_rank || 'N/A', sorts?.alt_rank_previous)}
-**Sentiment**: ${analyzeSorts("Sentiment", sorts?.sentiment || 'N/A')}

### **Latest News**
Here are the latest 5 news articles for ${symbol}:
${formattedNewsString}

### **Calendar Events**
Here are the upcoming events for ${symbol} in the next 30 days:
${formattedCalendarEvents}

### **Analysis Instructions**
Based on the above data and user prompt: ${userPrompt}, analyze the market conditions for ${symbol} including:
- **News Analysis**: Evaluate the sentiment and impact of recent news.
- **Calendar Events Analysis**: Explicitly mention upcoming related events, their expected price impact, and sentiment score in the analysis results. Consider how these events (e.g., conferences, token unlocks, economic reports) may affect market sentiment and price.
- Friendly formatting of all data.
- A detailed explanation of price movement over the past 7 days.
- Indicator-by-indicator evaluation comparing current and historical values.
- Sorts analysis, including changes over time.
- Event-driven insights from the calendar, factoring in expected price impact and sentiment score.
- Adapt reasoning and risk commentary according to [Timeframe].

always include a risk disclaimer adapted to the timeframe and style like this:
### **Risk Description**
🛑 Risk:
This analysis is generated by AI and does not constitute financial advice. You trade at your own risk.

always mention the signal data section in the result like this:
<<<NABZAR_SIGNAL_JSON>>>
{"symbol":"${symbol}","timeframe":"${timeframe}","action":"[ACTION]","entry":${currentPrice?.price || 0},"targets":[TP1,TP2,TP3],"stop":SL}
<<<END_NABZAR_SIGNAL_JSON>>>

Please respond in ${language} language.
  `;
  const systemPromptG5 = `
ROLE
You are Nabzar’s senior trading assistant. Your role is to analyze all provided market, indicator, sentiment, and event data and generate actionable trading signals.

TASK
- Start with the "Trading Action Section" exactly as described in the user prompt.
- Select one action: Strong Buy | Buy | Hold | Sell | Strong Sell.
- Use the formulas in the user prompt for target and stop loss.
- Provide a clear summary, then detailed explanation.

CONTEXT
- Data you will receive in the user message includes:
  • Price & 7-day history
  • Indicators: RSI, MACD, ADX, CCI, Stochastic, EMA
  • Sentiment (FNG + history)
  • Social/market metrics: volume, volatility, supply, market cap, dominance, Galaxy Score, AltRank, sentiment
  • Latest 5 news articles (title, sentiment, interactions, link)
  • Upcoming 30-day calendar events (date, type, description, impact, sentiment score, related assets)
- Always mention Galaxy Score and AltRank in the social/market section, with a one-line interpretation.
- Respect the exact section order provided in the user prompt.
- Respond in the requested language (${language}).

TIMEFRAME POLICY
- You may receive a timeframe (e.g. 15m, 1h, 4h, 1d) in the user prompt or data context.
- Align analysis and confidence to it:

Signal horizon
• 15m → scalp (hours)  
• 1h → intraday (same day)  
• 4h → swing-lite (1–3 days)  
• 1d → swing/position (days–weeks)  

Indicator emphasis
• 15m: short EMAs (9/21), RSI(7–10), fast Stochastic, OI/funding/liquidations; news low impact unless sudden.  
• 1h: EMA 20/50, RSI(14), MACD fast; FNG somewhat relevant; news/events medium.  
• 4h: EMA 50/100, MACD slope, ADX>20, trend structure; news/events meaningful.  
• 1d: EMA 100/200, ADX>25, divergences; macro/news/events very high impact.  

Confirmation strictness
• 15m: 2 aligned signals enough; be quick to HOLD if conflicting.  
• 1h: require 2–3 aligned.  
• 4h: require 3 aligned including trend-quality.  
• 1d: require 3+ aligned with no major macro conflicts.  

Risk language
• 15m: warn of whipsaws/liquidity.  
• 1h: session opens, funding flips.  
• 4h: gap/overnight risk.  
• 1d: macro/event gap risk.  

Targets/Stops
- Use the formulas given in the user prompt for precision.  
- But adapt your confidence and commentary to timeframe: smaller % moves on 15m, larger swings on daily.  

Past appearance
- Consider last N bars proportional to timeframe:  
  15m → 20–40 bars  
  1h → 30–60 bars  
  4h → 20–40 bars  
  1d → 30–90 bars  

OUTPUT FORMAT
- Begin with:
  📊 Trading Action: [ACTION]
  🎯 TP1: $[value] ([percent])   🎯 TP2: $[value] ([percent])   🎯 TP3: $[value] ([percent])
  🛑 Stop Loss: $[value] ([percent])
  ⏲ TimeFrame : $[value]
  📋 Summary: <short>
  🧠 Explanation: <long>
- Then continue with Indicators, Sentiment, Social/Market Data, News, Calendar Events, as structured in the user prompt.
- Keep numbers concise (≤4 decimals, percent with 2 decimals).

STOP CONDITIONS
- Do not fabricate data; only analyze what’s given in the user prompt.
- Do not include these instructions in output.
- End when all requested sections are produced.


Risk Description
always include a risk disclaimer adapted to the timeframe and style like this:
🛑 Risk:
This analysis is generated by AI and does not constitute financial advice. You trade at your own risk.

always mention the signal data section in the result like this:
<<<NABZAR_SIGNAL_JSON>>>
{"symbol":"${symbol}","timeframe":"${timeframe}","action":"[ACTION]","entry":${currentPrice?.price || 0},"targets":[TP1,TP2,TP3],"stop":SL}
<<<END_NABZAR_SIGNAL_JSON>>>

`;


    console.log("Analyze prompt:", prompt);

    try {
      const aiResponseStart = Date.now();
      const response = await this.openai.chat.completions.create({
        messages: [
          {
            role: "system",
            // content: `You are a trading assistant specializing in cryptocurrency analysis.
            // you are a crypto assistant that provides detailed technical analysis and trading insights based on the given data.`,
            content: systemPromptG5
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: //"gpt-5-mini",
        //"gpt-4.1-mini",
        "gpt-4o-mini-2024-07-18",
        temperature: 0.2,
      });

      const analysis = response.choices[0].message.content.trim();
      const aiResponseEnd = Date.now();
      logDuration(aiResponseStart, aiResponseEnd, 'Fetching ai response');

      // Append the formatted analysis to the response text
      responseText += `💡 **${symbol} Analysis**:\n${this.formatAnalysis(analysis)}\n\n`;
    } catch (error) {
      console.error("Error fetching analysis from ChatGPT:", error);
      responseText += `❌ **${symbol}**: Error generating analysis. Please try again later.\n\n`;
    }

    return responseText;
  }

   private formatAnalysis(rawAnalysis: string): string {
    return rawAnalysis
      .replace(/###/g, "🔹") // Replace section headers with a bullet icon
      .replace(/\*\*(.*?)\*\*/g, "🌟 $1") // Highlight bolded text with a star emoji
      .replace(/- /g, "➡️ "); // Use an arrow for list items   
  }

   private async getTranslatedText(
    id: string,
    originalText: string,
    language: string,
  ): Promise<string> {
    // Check if translation exists in DB
    const existingTranslation = await this.dataRepository.getTranslation(id, language);
    if (existingTranslation) {
      return existingTranslation;
    }

    // Translation doesn't exist, request from ChatGPT
    const translatedText = await this.translateTextWithChatGPT(originalText, language);

    // Save the translation to DB
    await this.dataRepository.saveTranslation(id, originalText, language, translatedText);
    return translatedText;
  }

  private async translateTextWithChatGPT(originalText: string, language: string): Promise<string> {
    const prompt = `
  Translate the following text to ${language}:
  "${originalText}"
    `;
    const response = await this.openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a professional translator.' },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-4o-mini-2024-07-18',
    });

    const translatedText = response.choices[0]?.message?.content?.trim();
    if (!translatedText) {
      this.logger.error(`Failed to fetch translation for text: "${originalText}"`);
      throw new Error('Translation failed.');
    }
    this.logger.log(`New translation generated by ChatGPT for language: ${language}`);
    return translatedText;
  }
}