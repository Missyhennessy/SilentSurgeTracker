import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";

// Cross-Exchange Price Monitoring Service
interface ExchangePrice {
  exchange: string;
  symbol: string;
  price: number;
  volume24h: number;
  lastUpdate: Date;
  spread: number; // bid-ask spread
  depth: {
    bids: number; // total bid volume
    asks: number; // total ask volume
  };
}

interface ArbitrageOpportunity {
  id: string;
  symbol: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  priceDifference: number;
  percentageDifference: number;
  estimatedProfit: number;
  volume: number;
  fees: {
    trading: number;
    withdrawal: number;
    total: number;
  };
  netProfit: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeWindow: number; // seconds opportunity is valid
  timestamp: Date;
}

interface ExchangeInfo {
  name: string;
  type: 'cex' | 'dex'; // centralized or decentralized
  fees: {
    maker: number;
    taker: number;
    withdrawal: Record<string, number>;
  };
  liquidity: 'high' | 'medium' | 'low';
  reputation: number; // 0-100
  countries: string[]; // supported countries
  api: {
    hasPublic: boolean;
    hasPrivate: boolean;
    rateLimit: number; // requests per minute
  };
}

export class CrossExchangeService {
  private exchanges: Map<string, ExchangeInfo> = new Map();
  private currentPrices: Map<string, ExchangePrice[]> = new Map();
  private arbitrageOpportunities: ArbitrageOpportunity[] = [];
  private priceHistory: Map<string, ExchangePrice[]> = new Map();

  constructor() {
    this.initializeExchanges();
    this.startPriceMonitoring();
  }

  // Initialize exchange information
  private initializeExchanges() {
    const exchangeData: Array<[string, ExchangeInfo]> = [
      ['binance', {
        name: 'Binance',
        type: 'cex',
        fees: {
          maker: 0.001,
          taker: 0.001,
          withdrawal: { BTC: 0.0005, ETH: 0.005, SOL: 0.01 }
        },
        liquidity: 'high',
        reputation: 95,
        countries: ['global'],
        api: { hasPublic: true, hasPrivate: true, rateLimit: 1200 }
      }],
      ['coinbase', {
        name: 'Coinbase Pro',
        type: 'cex',
        fees: {
          maker: 0.005,
          taker: 0.005,
          withdrawal: { BTC: 0.0, ETH: 0.0, SOL: 0.0 }
        },
        liquidity: 'high',
        reputation: 92,
        countries: ['US', 'EU', 'UK'],
        api: { hasPublic: true, hasPrivate: true, rateLimit: 1000 }
      }],
      ['kraken', {
        name: 'Kraken',
        type: 'cex',
        fees: {
          maker: 0.0016,
          taker: 0.0026,
          withdrawal: { BTC: 0.00015, ETH: 0.0025, SOL: 0.01 }
        },
        liquidity: 'high',
        reputation: 90,
        countries: ['US', 'EU', 'CA'],
        api: { hasPublic: true, hasPrivate: true, rateLimit: 900 }
      }],
      ['kucoin', {
        name: 'KuCoin',
        type: 'cex',
        fees: {
          maker: 0.001,
          taker: 0.001,
          withdrawal: { BTC: 0.0005, ETH: 0.005, SOL: 0.01 }
        },
        liquidity: 'medium',
        reputation: 85,
        countries: ['global'],
        api: { hasPublic: true, hasPrivate: true, rateLimit: 1800 }
      }],
      ['uniswap', {
        name: 'Uniswap V3',
        type: 'dex',
        fees: {
          maker: 0.003,
          taker: 0.003,
          withdrawal: { BTC: 0.0, ETH: 0.0, SOL: 0.0 }
        },
        liquidity: 'high',
        reputation: 88,
        countries: ['global'],
        api: { hasPublic: true, hasPrivate: false, rateLimit: 2000 }
      }],
      ['pancakeswap', {
        name: 'PancakeSwap',
        type: 'dex',
        fees: {
          maker: 0.0025,
          taker: 0.0025,
          withdrawal: { BTC: 0.0, ETH: 0.0, SOL: 0.0 }
        },
        liquidity: 'medium',
        reputation: 82,
        countries: ['global'],
        api: { hasPublic: true, hasPrivate: false, rateLimit: 1500 }
      }]
    ];

    exchangeData.forEach(([key, info]) => {
      this.exchanges.set(key, info);
    });
  }

  // Generate realistic price data for an exchange
  private generateExchangePrice(exchange: string, symbol: string, basePrice: number): ExchangePrice {
    const exchangeInfo = this.exchanges.get(exchange);
    if (!exchangeInfo) throw new Error(`Unknown exchange: ${exchange}`);

    // Add some variation based on exchange characteristics
    let priceVariation = 1.0;
    
    // Smaller exchanges might have slightly different prices
    if (exchangeInfo.liquidity === 'medium') {
      priceVariation = 0.998 + Math.random() * 0.004; // ±0.2%
    } else if (exchangeInfo.liquidity === 'low') {
      priceVariation = 0.995 + Math.random() * 0.01; // ±0.5%
    } else {
      priceVariation = 0.9995 + Math.random() * 0.001; // ±0.05%
    }

    // DEX prices might vary more due to slippage
    if (exchangeInfo.type === 'dex') {
      priceVariation *= 0.996 + Math.random() * 0.008; // Additional ±0.4%
    }

    const price = basePrice * priceVariation;
    const volume24h = Math.random() * 1000000 + 100000;
    
    return {
      exchange,
      symbol,
      price,
      volume24h,
      lastUpdate: new Date(),
      spread: price * (0.0001 + Math.random() * 0.0005), // 0.01-0.06%
      depth: {
        bids: volume24h * 0.1,
        asks: volume24h * 0.1
      }
    };
  }

  // Get current prices across all exchanges for a symbol
  public getCurrentPrices(symbol: string): ExchangePrice[] {
    return this.currentPrices.get(symbol) || [];
  }

  // Find arbitrage opportunities
  private findArbitrageOpportunities(symbol: string, prices: ExchangePrice[]): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];
    
    // Compare all exchange pairs
    for (let i = 0; i < prices.length; i++) {
      for (let j = i + 1; j < prices.length; j++) {
        const price1 = prices[i];
        const price2 = prices[j];
        
        let buyExchange, sellExchange, buyPrice, sellPrice;
        
        if (price1.price < price2.price) {
          buyExchange = price1.exchange;
          sellExchange = price2.exchange;
          buyPrice = price1.price;
          sellPrice = price2.price;
        } else {
          buyExchange = price2.exchange;
          sellExchange = price1.exchange;
          buyPrice = price2.price;
          sellPrice = price1.price;
        }
        
        const priceDifference = sellPrice - buyPrice;
        const percentageDifference = (priceDifference / buyPrice) * 100;
        
        // Only consider opportunities with >0.1% difference
        if (percentageDifference > 0.1) {
          const buyExchangeInfo = this.exchanges.get(buyExchange)!;
          const sellExchangeInfo = this.exchanges.get(sellExchange)!;
          
          // Calculate fees
          const tradingFees = (buyPrice * buyExchangeInfo.fees.taker) + (sellPrice * sellExchangeInfo.fees.maker);
          const withdrawalFees = (buyExchangeInfo.fees.withdrawal[symbol] || 0) * buyPrice;
          const totalFees = tradingFees + withdrawalFees;
          
          // Estimate volume (conservative)
          const volume = Math.min(price1.depth.asks, price2.depth.bids) * 0.1;
          const estimatedProfit = priceDifference * volume;
          const netProfit = estimatedProfit - totalFees;
          
          // Risk assessment
          let riskLevel: 'low' | 'medium' | 'high' = 'low';
          if (buyExchangeInfo.reputation < 85 || sellExchangeInfo.reputation < 85) riskLevel = 'medium';
          if (percentageDifference > 2.0) riskLevel = 'high'; // Too good to be true
          if (buyExchangeInfo.type !== sellExchangeInfo.type) riskLevel = 'medium'; // CEX-DEX arbitrage
          
          opportunities.push({
            id: Math.random().toString(36).substring(7),
            symbol,
            buyExchange,
            sellExchange,
            buyPrice,
            sellPrice,
            priceDifference,
            percentageDifference,
            estimatedProfit,
            volume,
            fees: {
              trading: tradingFees,
              withdrawal: withdrawalFees,
              total: totalFees
            },
            netProfit,
            riskLevel,
            timeWindow: 30 + Math.random() * 120, // 30-150 seconds
            timestamp: new Date()
          });
        }
      }
    }
    
    return opportunities.sort((a, b) => b.percentageDifference - a.percentageDifference);
  }

  // Get arbitrage opportunities
  public getArbitrageOpportunities(symbol?: string): ArbitrageOpportunity[] {
    if (symbol) {
      return this.arbitrageOpportunities.filter(opp => opp.symbol === symbol);
    }
    return this.arbitrageOpportunities;
  }

  // Get exchange information
  public getExchangeInfo(exchangeName?: string): ExchangeInfo[] | ExchangeInfo | null {
    if (exchangeName) {
      return this.exchanges.get(exchangeName) || null;
    }
    return Array.from(this.exchanges.values());
  }

  // Get price spread analysis
  public getPriceSpreadAnalysis(symbol: string): {
    symbol: string;
    minPrice: number;
    maxPrice: number;
    priceSpread: number;
    percentageSpread: number;
    averagePrice: number;
    medianPrice: number;
    exchangeCount: number;
    liquidityWeightedPrice: number;
    timestamp: Date;
  } | null {
    const prices = this.getCurrentPrices(symbol);
    if (prices.length === 0) return null;

    const priceValues = prices.map(p => p.price);
    const minPrice = Math.min(...priceValues);
    const maxPrice = Math.max(...priceValues);
    const priceSpread = maxPrice - minPrice;
    const percentageSpread = (priceSpread / minPrice) * 100;
    const averagePrice = priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length;
    
    // Calculate median
    const sortedPrices = [...priceValues].sort((a, b) => a - b);
    const medianPrice = sortedPrices.length % 2 === 0
      ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
      : sortedPrices[Math.floor(sortedPrices.length / 2)];

    // Calculate liquidity-weighted price
    const totalVolume = prices.reduce((sum, p) => sum + p.volume24h, 0);
    const liquidityWeightedPrice = prices.reduce((sum, p) => sum + (p.price * p.volume24h), 0) / totalVolume;

    return {
      symbol,
      minPrice,
      maxPrice,
      priceSpread,
      percentageSpread,
      averagePrice,
      medianPrice,
      exchangeCount: prices.length,
      liquidityWeightedPrice,
      timestamp: new Date()
    };
  }

  // Get historical price data
  public getPriceHistory(symbol: string, exchange?: string): ExchangePrice[] {
    const history = this.priceHistory.get(symbol) || [];
    if (exchange) {
      return history.filter(h => h.exchange === exchange);
    }
    return history;
  }

  // Start monitoring prices
  private startPriceMonitoring() {
    const symbols = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA'];
    const exchangeNames = Array.from(this.exchanges.keys());

    // Initial price generation
    symbols.forEach(symbol => {
      const basePrice = this.getBasePriceForSymbol(symbol);
      const prices = exchangeNames.map(exchange => 
        this.generateExchangePrice(exchange, symbol, basePrice)
      );
      this.currentPrices.set(symbol, prices);
      
      // Find arbitrage opportunities
      const opportunities = this.findArbitrageOpportunities(symbol, prices);
      this.arbitrageOpportunities.push(...opportunities);
    });

    // Update prices periodically
    setInterval(() => {
      symbols.forEach(symbol => {
        const basePrice = this.getBasePriceForSymbol(symbol);
        const prices = exchangeNames.map(exchange => 
          this.generateExchangePrice(exchange, symbol, basePrice)
        );
        
        // Store in history
        const history = this.priceHistory.get(symbol) || [];
        history.push(...prices);
        this.priceHistory.set(symbol, history.slice(-1000)); // Keep last 1000 entries
        
        // Update current prices
        this.currentPrices.set(symbol, prices);
        
        // Update arbitrage opportunities
        const opportunities = this.findArbitrageOpportunities(symbol, prices);
        this.arbitrageOpportunities = [
          ...this.arbitrageOpportunities.filter(opp => opp.symbol !== symbol),
          ...opportunities
        ];
      });

      // Clean up old opportunities (older than 10 minutes)
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
      this.arbitrageOpportunities = this.arbitrageOpportunities.filter(
        opp => opp.timestamp.getTime() > tenMinutesAgo
      );

    }, 60000); // Update every minute
  }

  // Get base price for a symbol (in production, this would come from a primary data source)
  private getBasePriceForSymbol(symbol: string): number {
    const basePrices: Record<string, number> = {
      BTC: 118000,
      ETH: 3770,
      SOL: 187,
      XRP: 3.2,
      ADA: 0.83
    };
    return basePrices[symbol] || 100;
  }
}

// Export service instance
export const crossExchangeService = new CrossExchangeService();

// Register cross-exchange routes
export function registerCrossExchangeRoutes(app: Express) {
  // Get current prices across exchanges
  app.get('/api/exchanges/prices/:symbol', isAuthenticated, async (req, res) => {
    try {
      const { symbol } = req.params;
      const prices = crossExchangeService.getCurrentPrices(symbol.toUpperCase());
      res.json(prices);
    } catch (error) {
      console.error('Error fetching exchange prices:', error);
      res.status(500).json({ message: 'Failed to fetch exchange prices' });
    }
  });

  // Get arbitrage opportunities
  app.get('/api/exchanges/arbitrage/:symbol?', isAuthenticated, async (req, res) => {
    try {
      const { symbol } = req.params;
      const opportunities = crossExchangeService.getArbitrageOpportunities(symbol?.toUpperCase());
      res.json(opportunities);
    } catch (error) {
      console.error('Error fetching arbitrage opportunities:', error);
      res.status(500).json({ message: 'Failed to fetch arbitrage opportunities' });
    }
  });

  // Get exchange information
  app.get('/api/exchanges/info/:exchange?', isAuthenticated, async (req, res) => {
    try {
      const { exchange } = req.params;
      const info = crossExchangeService.getExchangeInfo(exchange);
      res.json(info);
    } catch (error) {
      console.error('Error fetching exchange info:', error);
      res.status(500).json({ message: 'Failed to fetch exchange info' });
    }
  });

  // Get price spread analysis
  app.get('/api/exchanges/spread/:symbol', isAuthenticated, async (req, res) => {
    try {
      const { symbol } = req.params;
      const analysis = crossExchangeService.getPriceSpreadAnalysis(symbol.toUpperCase());
      if (!analysis) {
        return res.status(404).json({ message: 'No price data found for symbol' });
      }
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing price spread:', error);
      res.status(500).json({ message: 'Failed to analyze price spread' });
    }
  });

  // Get price history
  app.get('/api/exchanges/history/:symbol', isAuthenticated, async (req, res) => {
    try {
      const { symbol } = req.params;
      const { exchange } = req.query;
      const history = crossExchangeService.getPriceHistory(
        symbol.toUpperCase(), 
        exchange as string
      );
      res.json(history);
    } catch (error) {
      console.error('Error fetching price history:', error);
      res.status(500).json({ message: 'Failed to fetch price history' });
    }
  });
}