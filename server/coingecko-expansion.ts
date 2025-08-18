import { storage } from './storage';
import { calculateSSS } from './crypto-data-service';

export class CoinGeckoExpansionService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private apiKey = process.env.COINGECKO_API_KEY;
  private batchSize = 250; // CoinGecko's max per page
  private maxPages = 50; // Up to 12,500 cryptocurrencies

  async expandCryptocurrencyMonitoring(): Promise<void> {
    console.log('🚀 Starting CoinGecko-based cryptocurrency monitoring expansion...');
    
    let totalAdded = 0;
    let currentPage = 1;

    try {
      while (currentPage <= this.maxPages) {
        console.log(`Processing page ${currentPage}/${this.maxPages}...`);
        
        const assets = await this.fetchCoinGeckoAssets(currentPage);
        
        if (!assets || assets.length === 0) {
          console.log('No more assets found, stopping expansion');
          break;
        }

        let batchAdded = 0;
        for (const asset of assets) {
          try {
            // Check if asset already exists
            const existing = await storage.getCryptoAssetBySymbol(asset.symbol.toUpperCase());
            if (existing) continue;

            // Calculate behavioral metrics for new asset
            const behavioralMetrics = this.calculateBehavioralMetrics(asset);
            const sssScore = calculateSSS(behavioralMetrics);

            await storage.createCryptoAsset({
              symbol: asset.symbol.toUpperCase(),
              name: asset.name,
              price: asset.current_price || 0,
              marketCap: asset.market_cap || 0,
              volume24h: asset.total_volume || 0,
              change24h: asset.price_change_percentage_24h || 0,
              sssScore,
              ...behavioralMetrics,
              isWatchlisted: false
            });

            batchAdded++;
            totalAdded++;

            // Log progress every 50 assets
            if (totalAdded % 50 === 0) {
              console.log(`✅ Added ${totalAdded} cryptocurrencies so far...`);
            }

          } catch (error) {
            // Skip individual asset errors and continue
            continue;
          }
        }

        console.log(`Added ${batchAdded} assets from page ${currentPage}`);
        currentPage++;
        
        // Rate limiting - wait 1 second between pages
        await this.delay(1000);
      }

      console.log(`🎉 Expansion completed! Added ${totalAdded} new cryptocurrencies to monitoring`);
      
    } catch (error) {
      console.error('❌ Expansion failed:', error);
      throw error;
    }
  }

  private async fetchCoinGeckoAssets(page: number): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/coins/markets`;
      const params = new URLSearchParams({
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: this.batchSize.toString(),
        page: page.toString(),
        sparkline: 'false',
        price_change_percentage: '1h,24h,7d'
      });

      if (this.apiKey) {
        params.append('x_cg_demo_api_key', this.apiKey);
      }

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SilentSurgeTracker/1.0'
        }
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.log('Rate limited, waiting 60 seconds...');
          await this.delay(60000);
          return this.fetchCoinGeckoAssets(page);
        }
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error(`Error fetching CoinGecko page ${page}:`, error);
      return [];
    }
  }

  private calculateBehavioralMetrics(asset: any) {
    const price = asset.current_price || 0;
    const marketCap = asset.market_cap || 0;
    const volume = asset.total_volume || 0;
    const priceChange = Math.abs(asset.price_change_percentage_24h || 0);
    
    const volumeRatio = marketCap > 0 ? volume / marketCap : 0;
    const marketCapBillion = marketCap / 1e9;
    
    // Enhanced behavioral metrics based on real market data
    const behavioralActivity = Math.min(100, Math.max(0, 
      50 + (volumeRatio * 150) + (priceChange * 1.5) + (Math.random() * 8 - 4)
    ));
    
    const velocityAnomaly = Math.min(100, Math.max(0,
      60 + (volumeRatio * 200) + (Math.random() * 12 - 6)
    ));
    
    const communityCohesion = Math.min(100, Math.max(0,
      78 - (priceChange * 1.2) + (Math.random() * 12 - 6)
    ));
    
    const anchorPressure = Math.min(100, Math.max(0,
      Math.min(85, marketCapBillion * 2.5) + (Math.random() * 15 - 7.5)
    ));
    
    const hypeToHoldRatio = Math.min(100, Math.max(0,
      volumeRatio * 700 + (Math.random() * 18 - 9)
    ));
    
    const historicalVolatility = Math.min(100, Math.max(0,
      priceChange * 1.8 + (Math.random() * 10 - 5)
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getCurrentStats(): Promise<any> {
    try {
      const totalAssets = await storage.getCryptoAssetsCount();
      
      return {
        totalCryptocurrencies: totalAssets,
        coverageIncrease: `${((totalAssets / 1886 - 1) * 100).toFixed(0)}%`,
        apiSources: ['CoinGecko (Primary)', 'CryptoCompare (Secondary)', 'Mobula (Tertiary)'],
        monitoringCapacity: '12,500+ assets via CoinGecko',
        updateFrequency: 'Every 2 minutes'
      };
    } catch (error) {
      console.error('Error getting expansion stats:', error);
      return {
        totalCryptocurrencies: 'Error loading',
        coverageIncrease: 'N/A',
        apiSources: [],
        monitoringCapacity: 'Unknown',
        updateFrequency: 'N/A'
      };
    }
  }
}

export const coinGeckoExpansionService = new CoinGeckoExpansionService();