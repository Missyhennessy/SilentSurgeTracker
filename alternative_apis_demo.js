// Alternative Cryptocurrency APIs Demo - Free Tiers

// 1. MOBULA API (Best Free Alternative - 300K credits/month)
async function getMobulaPrice(symbol) {
  try {
    const response = await fetch(`https://api.mobula.io/api/1/market/data?asset=${symbol}`);
    const data = await response.json();
    return {
      price: data.data.price,
      change24h: data.data.price_change_24h,
      volume: data.data.volume,
      marketCap: data.data.market_cap
    };
  } catch (error) {
    console.error('Mobula API error:', error);
  }
}

// 2. CRYPTOCOMPARE API (50 req/sec, generous free tier)
async function getCryptoComparePrice(fromSymbol, toSymbol = 'USD') {
  try {
    const response = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${fromSymbol}&tsyms=${toSymbol}`);
    const data = await response.json();
    return data[toSymbol];
  } catch (error) {
    console.error('CryptoCompare API error:', error);
  }
}

// Multiple symbols at once
async function getCryptoComparePrices(symbols, currencies = 'USD,BTC,EUR') {
  try {
    const response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols.join(',')}&tsyms=${currencies}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('CryptoCompare API error:', error);
  }
}

// 3. BINANCE API (6000 weight/minute - highest performance)
async function getBinancePrice(symbol) {
  try {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`);
    const data = await response.json();
    return {
      price: parseFloat(data.lastPrice),
      change24h: parseFloat(data.priceChangePercent),
      volume: parseFloat(data.volume),
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice)
    };
  } catch (error) {
    console.error('Binance API error:', error);
  }
}

// All Binance 24hr tickers at once
async function getAllBinancePrices() {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    const data = await response.json();
    return data.map(ticker => ({
      symbol: ticker.symbol,
      price: parseFloat(ticker.lastPrice),
      change24h: parseFloat(ticker.priceChangePercent),
      volume: parseFloat(ticker.volume)
    }));
  } catch (error) {
    console.error('Binance API error:', error);
  }
}

// 4. COINMARKETCAP API (10K credits/month, requires API key)
async function getCMCPrice(symbol, apiKey) {
  try {
    const response = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}`, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey
      }
    });
    const data = await response.json();
    const coinData = data.data[symbol];
    return {
      price: coinData.quote.USD.price,
      change24h: coinData.quote.USD.percent_change_24h,
      volume: coinData.quote.USD.volume_24h,
      marketCap: coinData.quote.USD.market_cap
    };
  } catch (error) {
    console.error('CoinMarketCap API error:', error);
  }
}

// WEBSOCKET EXAMPLES

// CryptoCompare WebSocket (Real-time)
function connectCryptoCompareWebSocket(symbols) {
  const socket = new WebSocket('wss://streamer.cryptocompare.com/v2?api_key=YOUR_API_KEY');
  
  socket.onopen = () => {
    const subscriptionMsg = {
      action: 'SubAdd',
      subs: symbols.map(symbol => `5~CCCAGG~${symbol}~USD`)
    };
    socket.send(JSON.stringify(subscriptionMsg));
  };
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.TYPE === '5') {
      console.log(`${data.FROMSYMBOL}: $${data.PRICE}`);
    }
  };
}

// Binance WebSocket (Real-time)
function connectBinanceWebSocket(symbols) {
  const streams = symbols.map(symbol => `${symbol.toLowerCase()}usdt@ticker`).join('/');
  const socket = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(`${data.s}: $${parseFloat(data.c).toFixed(6)} (${parseFloat(data.P).toFixed(2)}%)`);
  };
}

// USAGE EXAMPLES
async function demonstrateAPIs() {
  console.log('🚀 Testing Alternative Crypto APIs\n');
  
  // Test Mobula (Best free tier)
  console.log('1. Mobula API:');
  const mobulaData = await getMobulaPrice('bitcoin');
  console.log(`BTC: $${mobulaData?.price} (${mobulaData?.change24h?.toFixed(2)}%)\n`);
  
  // Test CryptoCompare
  console.log('2. CryptoCompare API:');
  const ccPrice = await getCryptoComparePrice('BTC');
  console.log(`BTC: $${ccPrice}\n`);
  
  // Test Binance
  console.log('3. Binance API:');
  const binanceData = await getBinancePrice('BTC');
  console.log(`BTC: $${binanceData?.price} (${binanceData?.change24h?.toFixed(2)}%)\n`);
  
  // Test multiple symbols
  console.log('4. Multiple symbols (CryptoCompare):');
  const multiData = await getCryptoComparePrices(['BTC', 'ETH', 'XRP']);
  console.log(multiData);
}

// Run demonstration
demonstrateAPIs();

export {
  getMobulaPrice,
  getCryptoComparePrice,
  getCryptoComparePrices,
  getBinancePrice,
  getAllBinancePrices,
  getCMCPrice,
  connectCryptoCompareWebSocket,
  connectBinanceWebSocket
};