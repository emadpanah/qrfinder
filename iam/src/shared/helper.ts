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
      xrp : 'XRPUSDT',
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
    };
  
    // Reverse mapping to handle plain symbols
    const plainSymbolMapping: { [key: string]: string } = Object.entries(symbolMapping).reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value.replace(/USDT$/, '') }),
      {}
    );
  
    // Normalize input
    input = input.trim().toLowerCase().replace(/usd$/, 'usdt'); // Handle variations like BTCUSD -> BTCUSDT
  
    const mappedSymbol = symbolMapping[input] || input.toUpperCase();
    return mode === 'plain'
      ? plainSymbolMapping[input] || input.replace(/USDT$/, '').toUpperCase()
      : mappedSymbol;
  }
  