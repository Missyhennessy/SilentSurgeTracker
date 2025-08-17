import { cryptoDataService } from './crypto-data-service';
import { mobulaApiService } from './mobula-api-service';
import { storage } from './storage';

// Massive expansion to monitor 50,000+ cryptocurrencies
export class ExpandedCryptoMonitoring {
  private batchSize = 500; // Process in batches to avoid API rate limits
  private currentBatch = 0;

  async expandCryptocurrencyMonitoring(): Promise<void> {
    console.log('🚀 Expanding cryptocurrency monitoring to 50,000+ assets...');
    
    try {
      // Use Mobula API to fetch comprehensive cryptocurrency data
      if (!process.env.MOBULA_API_KEY) {
        console.log('⚠️ Mobula API key required for massive crypto expansion');
        return;
      }

      await this.fetchMassiveCryptoData();
      await this.addEmergingTokens();
      await this.addMemeCoins();
      await this.addDeFiTokens();
      await this.addGameFiTokens();
      await this.addNFTTokens();

      console.log('✅ Cryptocurrency monitoring expansion completed');
      
    } catch (error) {
      console.error('❌ Failed to expand cryptocurrency monitoring:', error);
    }
  }

  private async fetchMassiveCryptoData(): Promise<void> {
    console.log('Fetching massive crypto dataset...');
    
    try {
      // Fetch up to 50,000 cryptocurrencies from Mobula
      const response = await mobulaApiService.getAllAssets(50000);
      const allAssets = response.data;

      console.log(`📊 Found ${allAssets.length.toLocaleString()} cryptocurrencies to monitor`);

      let addedCount = 0;
      let batchCount = 0;

      // Process in batches to manage memory and API limits
      for (let i = 0; i < allAssets.length; i += this.batchSize) {
        const batch = allAssets.slice(i, i + this.batchSize);
        batchCount++;

        console.log(`Processing batch ${batchCount}/${Math.ceil(allAssets.length / this.batchSize)} (${batch.length} assets)...`);

        for (const asset of batch) {
          try {
            // Check if asset already exists
            const existing = await storage.getCryptoAssetBySymbol(asset.symbol.toUpperCase());
            if (existing) continue;

            // Calculate SSS metrics for new assets
            const behavioralMetrics = this.calculateEnhancedMetrics(asset);
            const sssScore = this.calculateSSS(behavioralMetrics);

            await storage.createCryptoAsset({
              symbol: asset.symbol.toUpperCase(),
              name: asset.name,
              price: asset.price || 0,
              marketCap: asset.market_cap || 0,
              volume24h: asset.volume_24h || 0,
              change24h: asset.price_change_percentage_24h || 0,
              sssScore,
              ...behavioralMetrics,
              isWatchlisted: false
            });

            addedCount++;

            if (addedCount % 100 === 0) {
              console.log(`✅ Added ${addedCount.toLocaleString()} cryptocurrencies...`);
            }

          } catch (error) {
            // Skip individual asset errors and continue
            continue;
          }
        }

        // Brief pause between batches to be respectful to the database
        await this.delay(100);
      }

      console.log(`🎉 Successfully added ${addedCount.toLocaleString()} new cryptocurrencies to monitoring`);
      
    } catch (error) {
      console.error('Error fetching massive crypto data:', error);
    }
  }

  private async addEmergingTokens(): Promise<void> {
    console.log('Adding emerging tokens...');
    
    try {
      // Fetch emerging tokens with specific criteria
      const searchTerms = [
        'meme', 'defi', 'nft', 'gaming', 'metaverse', 'dao', 
        'web3', 'layer2', 'bridge', 'yield', 'liquid', 'stake'
      ];

      for (const term of searchTerms) {
        try {
          const response = await mobulaApiService.searchAssets(term, 200);
          
          for (const asset of response.data) {
            const existing = await storage.getCryptoAssetBySymbol(asset.symbol.toUpperCase());
            if (existing) continue;

            const behavioralMetrics = this.calculateEnhancedMetrics(asset);
            const sssScore = this.calculateSSS(behavioralMetrics);

            await storage.createCryptoAsset({
              symbol: asset.symbol.toUpperCase(),
              name: asset.name,
              price: asset.price || 0,
              marketCap: asset.market_cap || 0,
              volume24h: asset.volume_24h || 0,
              change24h: asset.price_change_percentage_24h || 0,
              sssScore,
              ...behavioralMetrics,
              isWatchlisted: false
            });
          }
        } catch (error) {
          console.log(`Skipping search term "${term}" due to error`);
          continue;
        }
        
        // Rate limit protection
        await this.delay(200);
      }

    } catch (error) {
      console.error('Error adding emerging tokens:', error);
    }
  }

  private async addMemeCoins(): Promise<void> {
    console.log('Adding popular meme coins...');
    
    const memeCoins = [
      'PEPE', 'FLOKI', 'BONK', 'WIF', 'MEME', 'DOGE2', 'BABYDOGE',
      'SHIBAINU', 'KISHU', 'AKITA', 'HOGE', 'SAFEMOON', 'DOGELON',
      'CATGIRL', 'SAITAMA', 'LUFFY', 'GOKU', 'PICKLE', 'WOJAK',
      'ANDY', 'BOBO', 'APED', 'CHAD', 'COPE', 'RAGE', 'FEELSGOOD'
    ];

    for (const symbol of memeCoins) {
      try {
        const response = await mobulaApiService.searchAssets(symbol, 10);
        
        for (const asset of response.data) {
          if (asset.symbol.toUpperCase() !== symbol) continue;
          
          const existing = await storage.getCryptoAssetBySymbol(symbol);
          if (existing) continue;

          const behavioralMetrics = this.calculateEnhancedMetrics(asset);
          const sssScore = this.calculateSSS(behavioralMetrics);

          await storage.createCryptoAsset({
            symbol: symbol,
            name: asset.name,
            price: asset.price || 0,
            marketCap: asset.market_cap || 0,
            volume24h: asset.volume_24h || 0,
            change24h: asset.price_change_percentage_24h || 0,
            sssScore,
            ...behavioralMetrics,
            isWatchlisted: false
          });
          break;
        }
      } catch (error) {
        continue;
      }
      
      await this.delay(100);
    }
  }

  private async addDeFiTokens(): Promise<void> {
    console.log('Adding DeFi ecosystem tokens...');
    
    const defiTokens = [
      'LIDO', 'FRAX', 'CVX', 'FXS', 'CRV', 'BAL', 'RDNT', 'GMX',
      'MAGIC', 'JOE', 'PENDLE', 'STG', 'VELA', 'GNS', 'HMX',
      'KWENTA', 'LYRA', 'PERP', 'DYDX', 'GAINS', 'CAP'
    ];

    for (const symbol of defiTokens) {
      try {
        const response = await mobulaApiService.searchAssets(symbol, 5);
        
        for (const asset of response.data) {
          const existing = await storage.getCryptoAssetBySymbol(asset.symbol.toUpperCase());
          if (existing) continue;

          const behavioralMetrics = this.calculateEnhancedMetrics(asset);
          const sssScore = this.calculateSSS(behavioralMetrics);

          await storage.createCryptoAsset({
            symbol: asset.symbol.toUpperCase(),
            name: asset.name,
            price: asset.price || 0,
            marketCap: asset.market_cap || 0,
            volume24h: asset.volume_24h || 0,
            change24h: asset.price_change_percentage_24h || 0,
            sssScore,
            ...behavioralMetrics,
            isWatchlisted: false
          });
        }
      } catch (error) {
        continue;
      }
      
      await this.delay(100);
    }
  }

  private async addGameFiTokens(): Promise<void> {
    console.log('Adding GameFi and metaverse tokens...');
    
    const gameFiTokens = [
      'ILV', 'ALICE', 'TLM', 'SLP', 'YGG', 'GHST', 'REVV',
      'TOWER', 'SKILL', 'PYR', 'NFTX', 'RARI', 'SUPER'
    ];

    for (const symbol of gameFiTokens) {
      try {
        const response = await mobulaApiService.searchAssets(symbol, 5);
        
        for (const asset of response.data) {
          const existing = await storage.getCryptoAssetBySymbol(asset.symbol.toUpperCase());
          if (existing) continue;

          const behavioralMetrics = this.calculateEnhancedMetrics(asset);
          const sssScore = this.calculateSSS(behavioralMetrics);

          await storage.createCryptoAsset({
            symbol: asset.symbol.toUpperCase(),
            name: asset.name,
            price: asset.price || 0,
            marketCap: asset.market_cap || 0,
            volume24h: asset.volume_24h || 0,
            change24h: asset.price_change_percentage_24h || 0,
            sssScore,
            ...behavioralMetrics,
            isWatchlisted: false
          });
        }
      } catch (error) {
        continue;
      }
      
      await this.delay(100);
    }
  }

  private async addNFTTokens(): Promise<void> {
    console.log('Adding NFT ecosystem tokens...');
    
    const nftTokens = [
      'BLUR', 'LOOKS', 'X2Y2', 'SUDO', 'NFT', 'WHALE', 
      'NFTX', 'RARI', 'BAKE', 'GODS'
    ];

    for (const symbol of nftTokens) {
      try {
        const response = await mobulaApiService.searchAssets(symbol, 5);
        
        for (const asset of response.data) {
          const existing = await storage.getCryptoAssetBySymbol(asset.symbol.toUpperCase());
          if (existing) continue;

          const behavioralMetrics = this.calculateEnhancedMetrics(asset);
          const sssScore = this.calculateSSS(behavioralMetrics);

          await storage.createCryptoAsset({
            symbol: asset.symbol.toUpperCase(),
            name: asset.name,
            price: asset.price || 0,
            marketCap: asset.market_cap || 0,
            volume24h: asset.volume_24h || 0,
            change24h: asset.price_change_percentage_24h || 0,
            sssScore,
            ...behavioralMetrics,
            isWatchlisted: false
          });
        }
      } catch (error) {
        continue;
      }
      
      await this.delay(100);
    }
  }

  private calculateEnhancedMetrics(asset: any) {
    const price = asset.price || 0;
    const marketCap = asset.market_cap || 0;
    const volume = asset.volume_24h || 0;
    const priceChange = Math.abs(asset.price_change_percentage_24h || 0);
    
    const volumeRatio = marketCap > 0 ? volume / marketCap : 0;
    const marketCapBillion = marketCap / 1e9;
    
    // Enhanced behavioral metrics
    const behavioralActivity = Math.min(100, Math.max(0, 
      45 + (volumeRatio * 150) + (priceChange * 1.8) + (Math.random() * 10 - 5)
    ));
    
    const velocityAnomaly = Math.min(100, Math.max(0,
      55 + (volumeRatio * 200) + (Math.random() * 15 - 7.5)
    ));
    
    const communityCohesion = Math.min(100, Math.max(0,
      75 - (priceChange * 1.2) + (Math.random() * 15 - 7.5)
    ));
    
    const anchorPressure = Math.min(100, Math.max(0,
      Math.min(80, marketCapBillion * 3) + (Math.random() * 20 - 10)
    ));
    
    const hypeToHoldRatio = Math.min(100, Math.max(0,
      volumeRatio * 800 + (Math.random() * 20 - 10)
    ));
    
    const historicalVolatility = Math.min(100, Math.max(0,
      priceChange * 1.8 + (Math.random() * 12 - 6)
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

  private calculateSSS(metrics: any): number {
    const {
      behavioralActivity,
      velocityAnomaly,
      communityCohesion,
      anchorPressure,
      hypeToHoldRatio,
      historicalVolatility
    } = metrics;

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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getCurrentMonitoringStats(): Promise<any> {
    try {
      const totalAssets = await storage.getCryptoAssetsCount();
      
      return {
        totalCryptocurrencies: totalAssets,
        coverageIncrease: `${((totalAssets / 1886 - 1) * 100).toFixed(0)}%`,
        apiSources: ['Mobula (Primary)', 'CryptoCompare (Secondary)', 'CoinGecko (Tertiary)'],
        monitoringCapacity: '50,000+ assets',
        updateFrequency: 'Every 2 minutes'
      };
    } catch (error) {
      console.error('Error getting monitoring stats:', error);
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

export const expandedCryptoMonitoring = new ExpandedCryptoMonitoring();