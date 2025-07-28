import { storage } from "./storage";
// We'll calculate SSS score directly here since it's simpler
function calculateSSS(metrics: {
  behavioralActivity: number;
  velocityAnomaly: number;
  communityCohesion: number;
  anchorPressure: number;
  hypeToHoldRatio: number;
  historicalVolatility: number;
}): number {
  const {
    behavioralActivity,
    velocityAnomaly,
    communityCohesion,
    anchorPressure,
    hypeToHoldRatio,
    historicalVolatility
  } = metrics;

  // SSS Formula with proper weightings
  const sssScore = (
    (anchorPressure * 0.25) +
    (behavioralActivity * 0.20) +
    (velocityAnomaly * 0.20) +
    (communityCohesion * 0.20) +
    (hypeToHoldRatio * 0.10) +
    (historicalVolatility * 0.05)
  );

  return Math.min(100, Math.max(0, sssScore));
}

interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
}

interface CoinGeckoResponse {
  data: CoinGeckoMarketData[];
}

class CryptoDataService {
  private apiKey: string;
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private updateInterval: NodeJS.Timeout | null = null;
  private totalPages = 50; // CoinGecko supports up to 50 pages (250 coins per page = 12,500+ cryptocurrencies)
  private coinsPerPage = 250;
  private currentPage = 1;
  private allCoinsCache: Map<string, string> = new Map(); // symbol -> id mapping
  private lastCacheUpdate = 0;
  private cacheValidTime = 24 * 60 * 60 * 1000; // 24 hours
  
  // Core mapping for essential cryptocurrencies (fallback)
  private coreMapping = {
    // Major cryptocurrencies
    'BTC': 'bitcoin',
    'ETH': 'ethereum', 
    'SOL': 'solana',
    'ADA': 'cardano',
    'LINK': 'chainlink',
    'DOT': 'polkadot',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'ATOM': 'cosmos',
    'NEAR': 'near',
    
    // Gaming & NFT tokens
    'LBLOCK': 'lucky-block',
    'SAND': 'the-sandbox',
    'MANA': 'decentraland',
    'AXS': 'axie-infinity',
    'ENJ': 'enjincoin',
    'GALA': 'gala',
    'FLOW': 'flow',
    'IMX': 'immutable-x',
    'ALICE': 'my-neighbor-alice',
    'TLM': 'alien-worlds',
    
    // DeFi tokens
    'UNI': 'uniswap',
    'SUSHI': 'sushi',
    'CAKE': 'pancakeswap-token',
    'COMP': 'compound-governance-token',
    'AAVE': 'aave',
    'MKR': 'maker',
    'CRV': 'curve-dao-token',
    '1INCH': '1inch',
    'BAL': 'balancer',
    'SNX': 'synthetix-network-token',
    
    // Layer 1 & Alt coins
    'XRP': 'ripple',
    'LTC': 'litecoin',
    'BCH': 'bitcoin-cash',
    'XLM': 'stellar',
    'ALGO': 'algorand',
    'HBAR': 'hedera-hashgraph',
    'ICP': 'internet-computer',
    'FTM': 'fantom',
    'ONE': 'harmony',
    'LUNA': 'terra-luna-2',
    
    // Meme coins
    'DOGE': 'dogecoin',
    'SHIB': 'shiba-inu',
    'PEPE': 'pepe',
    'FLOKI': 'floki',
    'BONK': 'bonk',
    'WIF': 'dogwifcoin',
    'BOME': 'book-of-meme',
    'BRETT': 'brett',
    'POPCAT': 'popcat',
    'MEW': 'cat-in-a-dogs-world',
    
    // AI & Tech tokens
    'FET': 'fetch-ai',
    'AGIX': 'singularitynet',
    'OCEAN': 'ocean-protocol',
    'RNDR': 'render-token',
    'GRT': 'the-graph',
    'FIL': 'filecoin',
    'AR': 'arweave',
    'THETA': 'theta-token',
    'JASMY': 'jasmycoin',
    'TAO': 'bittensor',
    
    // Newer trending tokens  
    'PONKE': 'ponke',
    'MYRO': 'myro',
    'JUP': 'jupiter-exchange-solana',
    'PYTH': 'pyth-network',
    'JTO': 'jito-governance-token',
    'WEN': 'wen-4',
    'SLERF': 'slerf',
    'BODEN': 'jeo-boden'
  };

  // Dynamic coin discovery for new tokens
  private coinCache = new Map<string, string>();

  // Calculate SSS score
  calculateSSS(metrics: {
    behavioralActivity: number;
    velocityAnomaly: number;
    communityCohesion: number;
    anchorPressure: number;
    hypeToHoldRatio: number;
    historicalVolatility: number;
  }): number {
    return calculateSSS(metrics);
  }



  // Search for new coins not in our mapping
  async searchCoin(query: string): Promise<string | null> {
    try {
      const url = `${this.baseUrl}/search`;
      const params = new URLSearchParams({ query });
      
      const headers: HeadersInit = { 'accept': 'application/json' };
      if (this.apiKey) headers['x-cg-demo-api-key'] = this.apiKey;

      const response = await fetch(`${url}?${params}`, { headers });
      if (!response.ok) return null;

      const data = await response.json();
      const coin = data.coins?.[0];
      
      if (coin) {
        this.coinCache.set(query.toUpperCase(), coin.id);
        return coin.id;
      }
      return null;
    } catch (error) {
      console.error(`Error searching for coin ${query}:`, error);
      return null;
    }
  }

  // Get coin ID for any symbol
  async getCoinId(symbol: string): Promise<string | null> {
    const upperSymbol = symbol.toUpperCase();
    
    // Check static mapping first
    if (this.coreMapping[upperSymbol as keyof typeof this.coreMapping]) {
      return this.coreMapping[upperSymbol as keyof typeof this.coreMapping];
    }
    
    // Check cache
    if (this.coinCache.has(upperSymbol)) {
      return this.coinCache.get(upperSymbol) || null;
    }
    
    // Search dynamically
    return await this.searchCoin(symbol);
  }

  // Fetch data for any cryptocurrency
  async fetchSingleCoinData(symbol: string): Promise<any> {
    try {
      const coinId = await this.getCoinId(symbol);
      if (!coinId) {
        throw new Error(`Cryptocurrency ${symbol} not found`);
      }

      const url = `${this.baseUrl}/coins/markets`;
      const params = new URLSearchParams({
        vs_currency: 'usd',
        ids: coinId,
        order: 'market_cap_desc',
        sparkline: 'false',
        price_change_percentage: '24h'
      });

      const headers: HeadersInit = { 'accept': 'application/json' };
      if (this.apiKey) headers['x-cg-demo-api-key'] = this.apiKey;

      const response = await fetch(`${url}?${params}`, { headers });
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      return data[0];
    } catch (error) {
      console.error(`Error fetching ${symbol} data:`, error);
      throw error;
    }
  }

  // Get trending cryptocurrencies
  async getTrendingCoins(): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/search/trending`;
      const headers: HeadersInit = { 'accept': 'application/json' };
      if (this.apiKey) headers['x-cg-demo-api-key'] = this.apiKey;
      
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.coins || [];
    } catch (error) {
      console.error('Error fetching trending coins:', error);
      return [];
    }
  }

  // Fetch comprehensive market data in batches
  async fetchMarketDataBatch(page: number = 1, perPage: number = 250): Promise<CoinGeckoMarketData[]> {
    try {
      const url = `${this.baseUrl}/coins/markets`;
      const params = new URLSearchParams({
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: perPage.toString(),
        page: page.toString(),
        sparkline: 'false',
        price_change_percentage: '24h'
      });
      
      const headers: HeadersInit = { 'accept': 'application/json' };
      if (this.apiKey) headers['x-cg-demo-api-key'] = this.apiKey;
      
      const response = await fetch(`${url}?${params}`, { headers });
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching market data page ${page}:`, error);
      return [];
    }
  }

  // Update all cryptocurrencies in comprehensive batches
  async updateAllCryptocurrencies(): Promise<void> {
    try {
      console.log('Starting comprehensive cryptocurrency database update...');
      
      // Fetch top 2,500 cryptocurrencies (10 pages × 250 per page)
      for (let page = 1; page <= 10; page++) {
        try {
          const marketData = await this.fetchMarketDataBatch(page, 250);
          
          for (const coinData of marketData) {
            const behavioralMetrics = this.calculateBehavioralMetrics(coinData);
            const sssScore = this.calculateSSS(behavioralMetrics);
            
            await storage.upsertCryptoAsset({
              symbol: coinData.symbol.toUpperCase(),
              name: coinData.name,
              price: coinData.current_price,
              marketCap: coinData.market_cap || 0,
              volume24h: coinData.total_volume || 0,
              change24h: coinData.price_change_percentage_24h || 0,
              sssScore,
              ...behavioralMetrics,
            });
          }
          
          console.log(`Updated page ${page}/10 (${marketData.length} cryptocurrencies)`);
          
          // Rate limiting: wait between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`Error updating page ${page}:`, error);
          continue;
        }
      }
      
      const totalAssets = await storage.getCryptoAssetsCount();
      console.log(`Comprehensive cryptocurrency database updated: ${totalAssets} total assets`);
      
    } catch (error) {
      console.error('Error in comprehensive cryptocurrency update:', error);
    }
  }

  constructor() {
    this.apiKey = process.env.COINGECKO_API_KEY || '';
    if (!this.apiKey) {
      console.warn('CoinGecko API key not found. Using demo mode.');
    }
  }

  async fetchMarketData(): Promise<CoinGeckoMarketData[]> {
    try {
      const coinIds = Object.values(this.coreMapping).join(',');
      const url = `${this.baseUrl}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`;
      
      const headers: Record<string, string> = {
        'accept': 'application/json'
      };
      
      if (this.apiKey) {
        headers['x-cg-demo-api-key'] = this.apiKey;
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  async updateCryptoAssets(): Promise<void> {
    try {
      console.log('Fetching live crypto data...');
      const marketData = await this.fetchMarketData();
      
      for (const coinData of marketData) {
        // Find matching symbol in our coin mapping
        const symbol = Object.keys(this.coreMapping).find(
          key => this.coreMapping[key as keyof typeof this.coreMapping] === coinData.id
        );
        
        if (!symbol) continue;
        
        // Get existing asset from database
        const existingAsset = await storage.getCryptoAssetBySymbol(symbol);
        
        if (existingAsset) {
          // Calculate behavioral metrics (simulated for now)
          const behavioralMetrics = this.calculateBehavioralMetrics(coinData);
          
          // Calculate new SSS score
          const sssScore = calculateSSS(behavioralMetrics);
          
          // Update asset with new data
          await storage.updateCryptoAsset(existingAsset.id, {
            price: coinData.current_price,
            marketCap: coinData.market_cap || 0,
            volume24h: coinData.total_volume || 0,
            change24h: coinData.price_change_percentage_24h || 0,
            sssScore,
            ...behavioralMetrics
          });
          
          console.log(`Updated ${symbol}: $${coinData.current_price.toFixed(2)} (SSS: ${sssScore.toFixed(1)})`);
        } else {
          // Create new asset if it doesn't exist
          const behavioralMetrics = this.calculateBehavioralMetrics(coinData);
          const sssScore = calculateSSS(behavioralMetrics);
          
          await storage.createCryptoAsset({
            symbol: symbol.toUpperCase(),
            name: coinData.name,
            price: coinData.current_price,
            marketCap: coinData.market_cap || 0,
            volume24h: coinData.total_volume || 0,
            change24h: coinData.price_change_percentage_24h || 0,
            sssScore,
            ...behavioralMetrics,
            isWatchlisted: false
          });
          
          console.log(`Added new asset ${symbol}: $${coinData.current_price.toFixed(2)}`);
        }
      }
      
      console.log('Crypto data update completed');
    } catch (error) {
      console.error('Error updating crypto assets:', error);
    }
  }

  // Fetch new cryptocurrency listings (recently added)
  async fetchNewListings(): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&order=date_added_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d&x_cg_demo_api_key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch new listings: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching new listings:', error);
      return [];
    }
  }

  // Fetch emerging tokens (low market cap with high volume)
  async fetchEmergingTokens(): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&order=volume_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d&x_cg_demo_api_key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch emerging tokens: ${response.statusText}`);
      }

      const data = await response.json();
      // Filter for low market cap (under $50M) with significant volume
      return data.filter((coin: any) => 
        coin.market_cap && coin.market_cap < 50000000 && 
        coin.total_volume && coin.total_volume > 100000
      );
    } catch (error) {
      console.error('Error fetching emerging tokens:', error);
      return [];
    }
  }

  // Fetch GameFi and NFT tokens
  async fetchGameFiTokens(): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&category=gaming&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d&x_cg_demo_api_key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch GameFi tokens: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching GameFi tokens:', error);
      return [];
    }
  }

  // Fetch meme tokens
  async fetchMemeTokens(): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&category=meme-token&order=volume_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d&x_cg_demo_api_key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch meme tokens: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching meme tokens:', error);
      return [];
    }
  }

  // Enhanced method to add newer cryptocurrencies
  async addNewerCryptocurrencies(): Promise<void> {
    try {
      console.log('Fetching newer and emerging cryptocurrencies...');
      
      // Fetch multiple categories of newer tokens
      const [newListings, emergingTokens, gameFiTokens, memeTokens] = await Promise.all([
        this.fetchNewListings(),
        this.fetchEmergingTokens(), 
        this.fetchGameFiTokens(),
        this.fetchMemeTokens()
      ]);

      const allNewTokens = [
        ...newListings.slice(0, 25),  // Top 25 new listings
        ...emergingTokens.slice(0, 25), // Top 25 emerging tokens
        ...gameFiTokens.slice(0, 15),   // Top 15 GameFi tokens  
        ...memeTokens.slice(0, 15)      // Top 15 meme tokens
      ];

      let addedCount = 0;
      for (const coinData of allNewTokens) {
        try {
          // Check if we already have this token
          const existing = await storage.getCryptoAssetBySymbol(coinData.symbol.toUpperCase());
          if (existing) continue;

          const behavioralMetrics = this.calculateBehavioralMetrics(coinData);
          const sssScore = calculateSSS(behavioralMetrics);

          await storage.createCryptoAsset({
            symbol: coinData.symbol.toUpperCase(),
            name: coinData.name,
            price: coinData.current_price,
            marketCap: coinData.market_cap || 0,
            volume24h: coinData.total_volume || 0,
            change24h: coinData.price_change_percentage_24h || 0,
            sssScore,
            ...behavioralMetrics,
            isWatchlisted: false
          });

          addedCount++;
          console.log(`Added newer token ${coinData.symbol.toUpperCase()}: ${coinData.name} (SSS: ${sssScore.toFixed(1)})`);
          
        } catch (error) {
          console.error(`Error adding ${coinData.symbol}:`, error);
          continue;
        }
      }

      console.log(`Successfully added ${addedCount} newer cryptocurrencies to the platform`);
      
    } catch (error) {
      console.error('Error adding newer cryptocurrencies:', error);
    }
  }

  private calculateBehavioralMetrics(coinData: CoinGeckoMarketData) {
    // Enhanced behavioral metrics based on real market data
    const marketCapBillion = (coinData.market_cap || 0) / 1e9;
    const volumeRatio = (coinData.total_volume || 0) / (coinData.market_cap || 1);
    const priceChange = Math.abs(coinData.price_change_percentage_24h || 0);
    
    // Behavioral Activity - based on volume and price volatility
    const behavioralActivity = Math.min(100, Math.max(0, 
      50 + (volumeRatio * 200) + (priceChange * 2)
    ));
    
    // Token Velocity Anomaly - based on volume patterns
    const velocityAnomaly = Math.min(100, Math.max(0,
      60 + (volumeRatio * 300) + (Math.random() * 20 - 10)
    ));
    
    // Community Cohesion - inversely related to volatility
    const communityCohesion = Math.min(100, Math.max(0,
      80 - (priceChange * 1.5) + (Math.random() * 20 - 10)
    ));
    
    // Anchor Pressure - based on market cap stability
    const anchorPressure = Math.min(100, Math.max(0,
      Math.min(85, marketCapBillion * 2) + (Math.random() * 15 - 7.5)
    ));
    
    // Hype-to-Hold Ratio - based on volume vs market cap
    const hypeToHoldRatio = Math.min(100, Math.max(0,
      volumeRatio * 1000 + (Math.random() * 20 - 10)
    ));
    
    // Historical Volatility - based on price changes
    const historicalVolatility = Math.min(100, Math.max(0,
      priceChange * 2 + (Math.random() * 10 - 5)
    ));
    
    return {
      behavioralActivity: Math.round(behavioralActivity),
      velocityAnomaly: Math.round(velocityAnomaly),
      communityCohesion: Math.round(communityCohesion),
      anchorPressure: Math.round(anchorPressure),
      hypeToHoldRatio: Math.round(hypeToHoldRatio),
      historicalVolatility: Math.round(historicalVolatility)
    };
  }

  startRealTimeUpdates(intervalMinutes = 2): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    // Initial update
    this.updateCryptoAssets();
    
    // Set up periodic updates
    this.updateInterval = setInterval(() => {
      this.updateCryptoAssets();
    }, intervalMinutes * 60 * 1000);
    
    console.log(`Started real-time updates every ${intervalMinutes} minutes`);
  }

  stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('Stopped real-time updates');
    }
  }
}

export default CryptoDataService;
export const cryptoDataService = new CryptoDataService();