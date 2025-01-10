export function mapSymbol(input: string, mode: 'pair' | 'plain'): string {
  const symbolMapping: { [key: string]: string } = {
    bitcoin: 'BTCUSDT',
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
    toncoin: 'TONUSDT',
    'تون‌کوین': 'TONUSDT',
    'تن‌کوین': 'TONUSDT',
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
  'pepeusdt': 'PEPEUSDT'

  };

  input = input.trim().toLowerCase().replace(/usd$/, 'usdt');
    const mappedSymbol = symbolMapping[input];

    if (!mappedSymbol) return null; // Return null if no mapping found

    // For plain mode, strip "USDT" if present
    return mode === 'plain' ? mappedSymbol.replace(/USDT$/, '') : mappedSymbol;
}


// Utility function to truncate text
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) {
    return text;
  }
  const half = Math.floor((maxLength - 3) / 2); // Subtract 3 for the ellipsis
  return `${text.slice(0, half)}...${text.slice(-half)}`;
}

export function sanitizeString(input: string, maxLength: number): string {
  // Define allowed characters:
  // - Persian letters (Unicode range: \u0600-\u06FF)
  // - English letters (a-zA-Z)
  // - Numbers (0-9)
  // - Underscore (_) and space ( )
  const allowedCharactersRegex = /[^\u0600-\u06FFa-zA-Z0-9_ ]/g;

  // Remove unwanted characters
  const sanitizedString = input.replace(allowedCharactersRegex, '');

  // Limit the length of the string
  const truncatedString = sanitizedString.substring(0, maxLength);

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

export function formatNumber(number: number, language: string): string {
  const locale = language === 'fa' ? 'fa-IR' : 'en-US';
  return number.toLocaleString(locale);
}