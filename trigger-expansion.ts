import { coinGeckoExpansionService } from './server/coingecko-expansion';

console.log('🚀 Starting CoinGecko-based cryptocurrency monitoring expansion...');

coinGeckoExpansionService.expandCryptocurrencyMonitoring()
  .then(() => {
    console.log('✅ Cryptocurrency monitoring expansion completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Expansion failed:', error);
    process.exit(1);
  });