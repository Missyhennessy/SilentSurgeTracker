// Using native fetch in Node.js 18+

export interface MobulaAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  price_change_24h?: number;
  price_change_percentage_24h?: number;
  market_cap?: number;
  volume_24h?: number;
  circulating_supply?: number;
  total_supply?: number;
  rank?: number;
}

export interface MobulaPriceResponse {
  data: {
    price: number;
    price_change_24h: number;
    market_cap: number;
    volume: number;
    volume_change_24h: number;
    ath: number;
    atl: number;
    rank: number;
    circulating_supply: number;
    total_supply: number;
  };
}

export interface MobulaMultiDataResponse {
  data: {
    [symbol: string]: {
      price: number;
      price_change_24h: number;
      market_cap: number;
      volume: number;
      rank: number;
    };
  };
}

export class MobulaApiService {
  private readonly baseUrl = 'https://api.mobula.io/api/1';
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;
  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.MOBULA_API_KEY;
    if (!this.apiKey) {
      console.log('⚠️ Mobula API key not found. Using free tier with limited functionality.');
    }
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const headers: HeadersInit = {
          'Accept': 'application/json',
          'User-Agent': 'Silent-Surge-Tracker/1.0'
        };

        if (this.apiKey) {
          headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers,
          // @ts-ignore - timeout is supported in Node.js fetch
          timeout: 10000
        });

        if (!response.ok) {
          throw new Error(`Mobula API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as T;
        return data;
      } catch (error: any) {
        console.error(`Mobula API attempt ${attempt} failed:`, error);
        
        if (attempt === this.maxRetries) {
          throw new Error(`Mobula API failed after ${this.maxRetries} attempts: ${error?.message || 'Unknown error'}`);
        }
        
        await this.delay(this.retryDelay * attempt);
      }
    }

    throw new Error('Mobula API: Max retries exceeded');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAssetPrice(symbol: string): Promise<MobulaPriceResponse> {
    return this.makeRequest<MobulaPriceResponse>('/market/data', { asset: symbol });
  }

  async getMultipleAssetPrices(symbols: string[]): Promise<MobulaMultiDataResponse> {
    // Mobula allows comma-separated symbols
    const symbolString = symbols.join(',');
    return this.makeRequest<MobulaMultiDataResponse>('/market/multi-data', { assets: symbolString });
  }

  async getAllAssets(limit: number = 50000): Promise<{ data: MobulaAsset[] }> {
    return this.makeRequest<{ data: MobulaAsset[] }>('/market/data', { 
      limit,
      order: 'market_cap_desc'
    });
  }

  async getAllAssetsMetadata(limit: number = 100000): Promise<{ data: any[] }> {
    // Use Mobula's metacore endpoint for comprehensive token metadata
    return this.makeRequest<{ data: any[] }>('/metadata', { 
      limit,
      blockchain: 'all'
    });
  }

  async searchAssets(query: string, limit: number = 100): Promise<{ data: MobulaAsset[] }> {
    return this.makeRequest<{ data: MobulaAsset[] }>('/search', { 
      q: query,
      limit
    });
  }

  async getAssetDetails(symbol: string): Promise<any> {
    return this.makeRequest('/metadata', { asset: symbol });
  }

  async getAssetPairs(symbol: string): Promise<any> {
    // Get trading pairs and exchanges for where to buy
    return this.makeRequest('/pairs', { asset: symbol });
  }

  // Convert Mobula data to our internal format
  convertToStandardFormat(mobulaData: any, symbol: string): any {
    const data = mobulaData.data || mobulaData;
    
    return {
      id: symbol.toLowerCase(),
      symbol: symbol.toUpperCase(),
      name: symbol,
      current_price: data.price || 0,
      market_cap: data.market_cap || 0,
      market_cap_rank: data.rank || null,
      fully_diluted_valuation: data.market_cap || null,
      total_volume: data.volume || 0,
      high_24h: data.ath || null,
      low_24h: data.atl || null,
      price_change_24h: data.price_change_24h || 0,
      price_change_percentage_24h: data.price_change_24h ? 
        (data.price_change_24h / (data.price - data.price_change_24h)) * 100 : 0,
      market_cap_change_24h: null,
      market_cap_change_percentage_24h: null,
      circulating_supply: data.circulating_supply || 0,
      total_supply: data.total_supply || 0,
      max_supply: data.total_supply || null,
      ath: data.ath || null,
      atl: data.atl || null,
      last_updated: new Date().toISOString()
    };
  }

  // Health check for the service
  async healthCheck(): Promise<boolean> {
    try {
      // Use a simple endpoint that should work without API key
      const response = await fetch(`${this.baseUrl}/market/data?asset=bitcoin`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Silent-Surge-Tracker/1.0'
        },
        // @ts-ignore - timeout is supported in Node.js fetch
        timeout: 5000
      });
      
      if (response.status === 401 && !this.apiKey) {
        console.log('ℹ️ Mobula API requires API key for full functionality');
        return false; // Disable if API key required but not provided
      }
      
      return response.ok;
    } catch (error) {
      console.error('Mobula API health check failed:', error);
      return false;
    }
  }
}

export const mobulaApiService = new MobulaApiService();