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
  
  // Map of symbols to CoinGecko IDs
  private coinMapping = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum', 
    'SOL': 'solana',
    'ADA': 'cardano',
    'LINK': 'chainlink',
    'DOT': 'polkadot',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'ATOM': 'cosmos',
    'NEAR': 'near'
  };

  constructor() {
    this.apiKey = process.env.COINGECKO_API_KEY || '';
    if (!this.apiKey) {
      console.warn('CoinGecko API key not found. Using demo mode.');
    }
  }

  async fetchMarketData(): Promise<CoinGeckoMarketData[]> {
    try {
      const coinIds = Object.values(this.coinMapping).join(',');
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
        const symbol = Object.keys(this.coinMapping).find(
          key => this.coinMapping[key as keyof typeof this.coinMapping] === coinData.id
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

export const cryptoDataService = new CryptoDataService();