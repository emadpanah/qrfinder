export function mapSymbol(input: string, mode: 'pair' | 'plain'): string {
  const symbolMapping: { [key: string]: string } = {

    // US100 / Nasdaq 100
    us100: 'US100',
    US100: 'US100',
    'نزدک ۱۰۰': 'US100',
    'نزدک 100': 'US100',

    usdcad:'USDCAD',
    USDCAD:'USDCAD',
    usdjpy:'USDJPY',
    eurusd:'EURUSD',
    usdchf:'USDCHF',
    gbpusd:'GBPUSD',
    us500:'US500',
    xagusd:'XAGUSD',
    USDJPY:'USDJPY',
    EURUSD:'EURUSD',
    USDCHF:'USDCHF',
    GBPUSD:'GBPUSD',
    US500:'US500',
    XAGUSD:'XAGUSD',
    xauusd :'XAUUSD',
    XAUUSD :'XAUUSD',
    bitcoin: 'BTCUSDT',
    BTCUSDT: 'BTCUSDT',
    'آواایکس': 'AVAXUSDT',
    'آوا': 'AVAXUSDT',
    ava: 'AVAXUSDT',
    avaxusdt: 'AVAXUSDT',
    AVAUSDT: 'AVAXUSDT',
    avax: 'AVAXUSDT',
    'تن': 'TONUSDT',
    'تون': 'TONUSDT',
    'تون کوین': 'TONUSDT',
    'تن کوین': 'TONUSDT',
    ton: 'TONUSDT',
    toncoin: 'TONUSDT',
    tonusdt: 'TONUSDT',
    'بیتکوین': 'BTCUSDT',
    'بیت کوین': 'BTCUSDT',
    'بیت': 'BTCUSDT',
    btc: 'BTCUSDT',
    ethereum: 'ETHUSDT',
    eth: 'ETHUSDT',
    'اتر': 'ETHUSDT',
    'اتریوم': 'ETHUSDT',
    ripple: 'XRPUSDT',
    'ریپل': 'XRPUSDT',
    xrp: 'XRPUSDT',
    binancecoin: 'BNBUSDT',
    bnb: 'BNBUSDT',
    'بایننس کوین': 'BNBUSDT',
    'بایننسکوین': 'BNBUSDT',
    'بی ان بی': 'BNBUSDT',
    cardano: 'ADAUSDT',
    ada: 'ADAUSDT',
    'کاردانو': 'ADAUSDT',
    'آدا': 'ADAUSDT',
    solana: 'SOLUSDT',
    sol: 'SOLUSDT',
    'سولانا': 'SOLUSDT',
    dogecoin: 'DOGEUSDT',
    doge: 'DOGEUSDT',
    'دوجکوین': 'DOGEUSDT',
    'دوج کوین': 'DOGEUSDT',
    'دوج': 'DOGEUSDT',
    polkadot: 'DOTUSDT',
    dot: 'DOTUSDT',
    'پولکادات': 'DOTUSDT',
    'دات': 'DOTUSDT',
    tron: 'TRXUSDT',
    'ترون': 'TRXUSDT',
    shiba: 'SHIBUSDT',
    'شیبا': 'SHIBUSDT',
    litecoin: 'LTCUSDT',
    'لایت کوین': 'LTCUSDT',
    'لایتکوین': 'LTCUSDT',
    uniswap: 'UNIUSDT',
    uni: 'UNIUSDT',
    'یونی‌سواپ': 'UNIUSDT',
    chainlink: 'LINKUSDT',
    chain: 'LINKUSDT',
    'چین لینک': 'LINKUSDT',
    'چینلینک': 'LINKUSDT',
    'لینک': 'LINKUSDT',
    floki: 'FLOKIUSDT',
    'فلوکی': 'FLOKIUSDT',
    pepe: 'PEPEUSDT',
    'پپه': 'PEPEUSDT',
    cosmos: 'ATOMUSDT',
    'کازموس': 'ATOMUSDT',
    dai: 'DAIUSDT',
    'دای': 'DAIUSDT',
    wrappedbitcoin: 'WBTCUSDT',
    'بیتکوین‌رپد': 'WBTCUSDT',
    usdcoin: 'USDC',
    'یو‌اس‌دی‌کوین': 'USDC',

    'btcusdt': 'BTCUSDT',
    'ethusdt': 'ETHUSDT',
    'ETHUSDT': 'ETHUSDT',
  'XRPUSDT': 'XRPUSDT',
  'BNBUSDT': 'BNBUSDT',
  'ADAUSDT': 'ADAUSDT',
  'SOLUSDT': 'SOLUSDT',
  'DOGEUSDT': 'DOGEUSDT',
  'DOTUSDT': 'DOTUSDT',
  'TRXUSDT': 'TRXUSDT',
  'SHIBUSDT': 'SHIBUSDT',
  'ATOMUSDT': 'ATOMUSDT',
  'DAIUSDT': 'DAIUSDT',
  'WBTCUSDT': 'WBTCUSDT',
  'PEPEUSDT': 'PEPEUSDT',
  'xrpusdt': 'XRPUSDT',
  'bnbusdt': 'BNBUSDT',
  'adausdt': 'ADAUSDT',
  'solusdt': 'SOLUSDT',
  'dogeusdt': 'DOGEUSDT',
  'dotusdt': 'DOTUSDT',
  'trxusdt': 'TRXUSDT',
  'shibusdt': 'SHIBUSDT',
  'atomusdt': 'ATOMUSDT',
  'daiusdt': 'DAIUSDT',
  'wbtcusdt': 'WBTCUSDT',
  'pepeusdt': 'PEPEUSDT',
   

  };

  //input = input.trim().toLowerCase().replace(/usd$/, 'usdt');
    const mappedSymbol = symbolMapping[input];
    //console.log("mappedSymbol map :", mappedSymbol);
    if (!mappedSymbol) return null; // Return null if no mapping found

    // For plain mode, strip "USDT" if present
    return mode === 'plain' ? mappedSymbol.replace(/USDT$/, '').replace(/USD$/, '') : mappedSymbol;
}




// Utility function to truncate text
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) {
    return text;
  }
  const half = Math.floor((maxLength - 3) / 2); // Subtract 3 for the ellipsis
  return `${text.slice(0, half)}...${text.slice(-half)}`;
}

export function escapeMarkdown(text: string): string {
  if (!text) return '-';
  return text
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/~/g, '\\~')
    .replace(/`/g, '\\`')
    .replace(/>/g, '\\>')
    .replace(/#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/\-/g, '\\-')
    .replace(/=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/\./g, '\\.')
    .replace(/!/g, '\\!');
}

export function sanitizeString(input: string, maxLength: number): string {

  // if (!input || typeof input !== 'string') {
  //   throw new Error('Invalid string value');
  // }
  // Define allowed characters:
  // - Persian letters (Unicode range: \u0600-\u06FF)
  // - English letters (a-zA-Z)
  // - Numbers (0-9)
  // - Underscore (_) and space ( )
  const allowedCharactersRegex = /[^\u0600-\u06FFa-zA-Z0-9_ ]/g;

  // Remove unwanted characters
  const sanitizedStrings = input.replace(allowedCharactersRegex, '');

  // Limit the length of the string
  let truncatedString = sanitizedStrings;
  if (truncatedString.length < maxLength) {
   truncatedString = sanitizedStrings.substring(0, maxLength);
  }

  // Escape special characters to prevent injection
  const escapedString = truncatedString
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return escapedString;
}

export function isValidUnixTimestamp(value: number): boolean {
  return Number.isInteger(value) && value > 0 && value < 2147483647; // Valid within the 32-bit timestamp range
}

export function formatNumber(number: number, language: string): string {
  const locale = language === 'fa' ? 'fa-IR' : 'en-US';
  return number.toLocaleString(locale);
}