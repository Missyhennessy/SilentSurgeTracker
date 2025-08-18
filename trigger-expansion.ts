import { multiApiExpansionService } from './server/multi-api-expansion';

console.log('🚀 Starting targeted 15,000 cryptocurrency monitoring expansion...');

multiApiExpansionService.expandCryptocurrencyMonitoring()
  .then(() => {
    console.log('✅ Cryptocurrency monitoring expansion completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Expansion failed:', error);
    process.exit(1);
  });