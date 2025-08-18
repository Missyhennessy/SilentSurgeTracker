// Start cryptocurrency monitoring expansion
async function startExpansion() {
  console.log('🚀 Starting cryptocurrency monitoring expansion...');
  
  try {
    // Import the expansion service
    const { expandedCryptoMonitoring } = await import('./server/expanded-crypto-monitoring.js');
    
    // Start the expansion process
    await expandedCryptoMonitoring.expandCryptocurrencyMonitoring();
    
    console.log('✅ Cryptocurrency monitoring expansion completed successfully!');
    
  } catch (error) {
    console.error('❌ Expansion failed:', error.message);
  }
}

// Run the expansion
startExpansion();