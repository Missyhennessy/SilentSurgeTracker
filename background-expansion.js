// Background expansion process with rate limiting
const fetch = require('node:fetch');

async function backgroundExpansion() {
  console.log('🔄 Starting background cryptocurrency expansion...');
  
  const baseUrl = 'https://api.coingecko.com/api/v3/coins/markets';
  let page = 1;
  const maxPages = 40; // More conservative approach
  
  while (page <= maxPages) {
    try {
      console.log(`Processing page ${page}/${maxPages}...`);
      
      const params = new URLSearchParams({
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: '250',
        page: page.toString(),
        sparkline: 'false'
      });

      const response = await fetch(`${baseUrl}?${params}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SilentSurgeTracker/1.0'
        }
      });

      if (response.status === 429) {
        console.log('Rate limited, waiting 2 minutes...');
        await delay(120000); // Wait 2 minutes
        continue;
      }

      if (!response.ok) {
        console.log(`API error: ${response.status}, waiting and retrying...`);
        await delay(60000);
        continue;
      }

      const assets = await response.json();
      console.log(`Received ${assets.length} assets from page ${page}`);
      
      page++;
      
      // Rate limiting - wait 2 seconds between pages
      await delay(2000);
      
    } catch (error) {
      console.log(`Error on page ${page}:`, error.message);
      await delay(30000); // Wait 30 seconds on error
    }
  }
  
  console.log('✅ Background expansion completed');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the background expansion
backgroundExpansion().catch(console.error);