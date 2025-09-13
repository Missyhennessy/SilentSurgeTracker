// CryptoCompare API Service - Free alternative with generous limits

export interface CryptoComparePrice {
  [currency: string]: number;
}

export interface CryptoCompareMultiPrice {
  [symbol: string]: {
    [currency: string]: number;
  };
}

export class CryptoCompareService {
  private readonly baseUrl = 'https://min-api.cryptocompare.com/data';
  private readonly apiKey: string | undefined;
  private readonly maxRetries = 3;

  constructor() {
    this.apiKey = process.env.CRYPTOCOMPARE_API_KEY;
    // CryptoCompare works without API key for free tier
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add API key if available
    if (this.apiKey) {
      params.api_key = this.apiKey;
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Silent-Surge-Tracker/1.0'
          },
          // @ts-ignore
          timeout: 10000
        });

        if (!response.ok) {
          throw new Error(`CryptoCompare API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as T;
        return data;
      } catch (error: any) {
        console.error(`CryptoCompare API attempt ${attempt} failed:`, error);
        
        if (attempt === this.maxRetries) {
          throw new Error(`CryptoCompare API failed after ${this.maxRetries} attempts: ${error?.message || 'Unknown error'}`);
        }
        
        await this.delay(1000 * attempt);
      }
    }

    throw new Error('CryptoCompare API: Max retries exceeded');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getPrice(fromSymbol: string, toSymbols: string[] = ['USD']): Promise<CryptoComparePrice> {
    return this.makeRequest<CryptoComparePrice>('/price', {
      fsym: fromSymbol.toUpperCase(),
      tsyms: toSymbols.join(',')
    });
  }

  async getMultiplePrices(fromSymbols: string[], toSymbols: string[] = ['USD']): Promise<CryptoCompareMultiPrice> {
    return this.makeRequest<CryptoCompareMultiPrice>('/pricemulti', {
      fsyms: fromSymbols.join(','),
      tsyms: toSymbols.join(',')
    });
  }

  async get24HourData(symbol: string, currency: string = 'USD'): Promise<any> {
    return this.makeRequest('/pricemultifull', {
      fsyms: symbol.toUpperCase(),
      tsyms: currency.toUpperCase()
    });
  }

  // Convert to our standard format
  convertToStandardFormat(cryptoCompareData: any, symbol: string): any {
    const currency = 'USD';
    const data = cryptoCompareData.RAW?.[symbol.toUpperCase()]?.[currency] || cryptoCompareData;
    
    return {
      id: symbol.toLowerCase(),
      symbol: symbol.toUpperCase(),
      name: symbol,
      current_price: data.PRICE || data.USD || 0,
      market_cap: data.MKTCAP || 0,
      market_cap_rank: null,
      total_volume: data.TOTALVOLUME24HTO || 0,
      price_change_24h: data.CHANGE24HOUR || 0,
      price_change_percentage_24h: data.CHANGEPCT24HOUR || 0,
      high_24h: data.HIGH24HOUR || null,
      low_24h: data.LOW24HOUR || null,
      last_updated: new Date().toISOString()
    };
  }

  // Get top cryptocurrencies list for expansion
  async getTopList(limit: number = 2000): Promise<any[]> {
    try {
      const response = await this.makeRequest('/top/mktcapfull', {
        limit: Math.min(limit, 2000), // CryptoCompare allows up to 2000
        tsym: 'USD'
      });
      
      if (response.Data) {
        return response.Data.map((item: any) => ({
          symbol: item.CoinInfo?.Name || item.symbol,
          name: item.CoinInfo?.FullName || item.name,
          marketCap: item.DISPLAY?.USD?.MKTCAP ? parseFloat(item.DISPLAY.USD.MKTCAP.replace(/[\$,]/g, '')) : 0,
          volume24h: item.RAW?.USD?.TOTALVOLUME24HTO || 0,
          price: item.RAW?.USD?.PRICE || 0
        }));
      }
      
      return [];
    } catch (error) {
      console.error('CryptoCompare top list failed:', error);
      return [];
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.getPrice('BTC', ['USD']);
      return true;
    } catch (error) {
      console.error('CryptoCompare API health check failed:', error);
      return false;
    }
  }
}

export const cryptoCompareService = new CryptoCompareService();