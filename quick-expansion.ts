import { storage } from './server/storage';

// Simple, direct expansion using CoinGecko
async function quickExpansion() {
  console.log('🚀 Quick expansion - adding more cryptocurrencies...');
  
  let totalAdded = 0;
  const currentCount = await storage.getCryptoAssetsCount();
  console.log(`Current: ${currentCount} assets`);
  
  // Start from page 21 to continue where we left off
  for (let page = 21; page <= 40 && totalAdded < 2000; page++) {
    try {
      console.log(`Processing page ${page}...`);
      
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`;
      
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'SilentSurgeTracker/1.0' }
      });

      if (response.status === 429) {
        console.log('Rate limited, waiting 1 minute...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        continue;
      }

      if (!response.ok) {
        console.log(`Error ${response.status}, skipping page`);
        continue;
      }

      const assets = await response.json();
      
      for (const asset of assets) {
        if (totalAdded >= 2000) break;
        
        try {
          const existing = await storage.getCryptoAssetBySymbol(asset.symbol.toUpperCase());
          if (existing) continue;

          const behavioralMetrics = calculateBehavioralMetrics(asset);
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

          totalAdded++;
          
          if (totalAdded % 100 === 0) {
            console.log(`✅ Added ${totalAdded} cryptocurrencies...`);
          }

        } catch (error) {
          continue;
        }
      }

      // Wait 2 seconds between pages
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`Page ${page} failed:`, error.message);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  const finalCount = await storage.getCryptoAssetsCount();
  console.log(`✅ Expansion completed! Added ${totalAdded} assets. Total: ${finalCount}`);
}

function calculateBehavioralMetrics(asset: any) {
  const price = asset.current_price || 0;
  const marketCap = asset.market_cap || 0;
  const volume = asset.total_volume || 0;
  const priceChange = Math.abs(asset.price_change_percentage_24h || 0);
  
  const volumeRatio = marketCap > 0 ? volume / marketCap : 0;
  const marketCapBillion = marketCap / 1e9;
  
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

function calculateSSS(metrics: any): number {
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

quickExpansion().catch(console.error);