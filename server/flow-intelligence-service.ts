import type { Express } from "express";
import { storage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import type { 
  WhaleTransaction, 
  InsertWhaleTransaction,
  ExchangeFlow,
  InsertExchangeFlow,
  SmartMoneyWallet,
  InsertSmartMoneyWallet,
  LiquidityEvent,
  InsertLiquidityEvent,
  CohortFlow,
  InsertCohortFlow
} from "@shared/schema";
import { cryptoDataService } from "./crypto-data-service";

interface WhaleThreshold {
  bitcoin: number;
  ethereum: number;
  default: number;
}

interface SmartMoneyAddress {
  address: string;
  label: string;
  type: 'institution' | 'whale' | 'smart_trader' | 'exchange';
  successRate?: number;
}

class FlowIntelligenceService {
  private whaleThresholds: WhaleThreshold = {
    bitcoin: 100, // BTC
    ethereum: 1000, // ETH
    default: 50000 // USD equivalent
  };

  private knownSmartMoney: SmartMoneyAddress[] = [
    // Exchange addresses (simplified for demo)
    { address: '0x28C6c06298d514Db089934071355E5743bf21d60', label: 'Binance Hot Wallet', type: 'exchange' },
    { address: '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549', label: 'Binance Cold Storage', type: 'exchange' },
    { address: '0x564286362092D8e7936f0549571a803B203aAceD', label: 'Binance US', type: 'exchange' },
    { address: '0xdfd5293d8e347dfe59e90efd55b2956a1343963d', label: 'Coinbase Pro', type: 'exchange' },
    { address: '0x503828976d22510aad0201ac7ec88293211d23da', label: 'Coinbase Commerce', type: 'exchange' },
    // Institutional wallets
    { address: '0x1151314c646ce4e0efd76d1af4760ae66a9fe30f', label: 'Institutional Whale', type: 'institution' },
    { address: '0x40b38765696e3d5d8d9d834d8aad4bb6e418e489', label: 'DeFi Whale', type: 'whale', successRate: 78 },
  ];

  private exchangeNames = {
    '0x28C6c06298d514Db089934071355E5743bf21d60': 'Binance',
    '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549': 'Binance',
    '0x564286362092D8e7936f0549571a803B203aAceD': 'Binance US',
    '0xdfd5293d8e347dfe59e90efd55b2956a1343963d': 'Coinbase',
    '0x503828976d22510aad0201ac7ec88293211d23da': 'Coinbase',
  };

  // Mock whale transactions for demonstration
  generateMockWhaleTransactions(): InsertWhaleTransaction[] {
    const assets = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'ADA', 'XRP', 'DOT', 'LINK', 'UNI'];
    const transactions: InsertWhaleTransaction[] = [];

    for (let i = 0; i < 25; i++) {
      const asset = assets[Math.floor(Math.random() * assets.length)];
      const amount = Math.random() * 1000 + 100; // 100-1100 tokens
      const price = Math.random() * 50000 + 1000; // $1000-$51000
      const amountUsd = amount * price;
      const isSmartMoney = Math.random() > 0.7;
      const transactionType = ['buy', 'sell', 'transfer'][Math.floor(Math.random() * 3)] as 'buy' | 'sell' | 'transfer';
      const fromAddress = this.knownSmartMoney[Math.floor(Math.random() * this.knownSmartMoney.length)];
      const toAddress = this.knownSmartMoney[Math.floor(Math.random() * this.knownSmartMoney.length)];

      transactions.push({
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        assetSymbol: asset,
        fromAddress: fromAddress.address,
        toAddress: toAddress.address,
        amount: amount,
        amountUsd: amountUsd,
        transactionType: transactionType,
        exchangeName: this.exchangeNames[fromAddress.address as keyof typeof this.exchangeNames] || null,
        blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
        blockTimestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
        gasUsed: Math.floor(Math.random() * 200000) + 21000,
        gasPriceGwei: Math.random() * 100 + 10,
        sssScoreAtTime: Math.random() * 1000,
        priceImpact: transactionType === 'transfer' ? 0 : Math.random() * 5,
        isSmartMoney: isSmartMoney,
        walletLabel: fromAddress.label,
      });
    }

    return transactions;
  }

  // Mock exchange flows for demonstration
  generateMockExchangeFlows(): InsertExchangeFlow[] {
    const exchanges = ['Binance', 'Coinbase', 'Kraken', 'Huobi', 'OKX', 'KuCoin'];
    const assets = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'ADA'];
    const timeframes = ['1h', '4h', '24h'];
    const flows: InsertExchangeFlow[] = [];

    exchanges.forEach(exchange => {
      assets.forEach(asset => {
        timeframes.forEach(timeframe => {
          const inflow = Math.random() * 10000000; // $0-10M
          const outflow = Math.random() * 10000000;
          const netFlow = inflow - outflow;
          const isAnomaly = Math.abs(netFlow) > 5000000; // $5M threshold

          flows.push({
            exchangeName: exchange,
            assetSymbol: asset,
            flowType: 'inflow',
            amount: inflow / (Math.random() * 50000 + 1000), // Convert to token amount
            amountUsd: inflow,
            avgTransactionSize: inflow / (Math.floor(Math.random() * 100) + 10),
            transactionCount: Math.floor(Math.random() * 100) + 10,
            timeframe: timeframe,
            netFlow: netFlow,
            flowVelocity: (Math.random() - 0.5) * 20, // -10% to +10% change
            isAnomaly: isAnomaly,
            anomalyScore: isAnomaly ? Math.random() * 100 + 50 : Math.random() * 50,
          });

          flows.push({
            exchangeName: exchange,
            assetSymbol: asset,
            flowType: 'outflow',
            amount: outflow / (Math.random() * 50000 + 1000),
            amountUsd: outflow,
            avgTransactionSize: outflow / (Math.floor(Math.random() * 100) + 10),
            transactionCount: Math.floor(Math.random() * 100) + 10,
            timeframe: timeframe,
            netFlow: -netFlow,
            flowVelocity: (Math.random() - 0.5) * 20,
            isAnomaly: isAnomaly,
            anomalyScore: isAnomaly ? Math.random() * 100 + 50 : Math.random() * 50,
          });
        });
      });
    });

    return flows;
  }

  // Mock smart money wallets
  generateMockSmartMoneyWallets(): InsertSmartMoneyWallet[] {
    const wallets: InsertSmartMoneyWallet[] = [];

    this.knownSmartMoney.forEach(wallet => {
      const totalBalance = Math.random() * 1000000000 + 1000000; // $1M-1B
      const successRate = wallet.successRate || (Math.random() * 40 + 60); // 60-100%
      const profitLoss = (Math.random() - 0.3) * totalBalance * 0.1; // -30% to +70% of 10% of balance

      wallets.push({
        walletAddress: wallet.address,
        walletLabel: wallet.label,
        walletType: wallet.type,
        totalBalance: totalBalance / 30000, // Convert to token units
        balanceUsd: totalBalance,
        successRate: successRate,
        avgHoldTime: Math.floor(Math.random() * 720) + 24, // 24-744 hours (1-31 days)
        riskScore: wallet.type === 'exchange' ? 20 : Math.random() * 60 + 20, // 20-80
        isActive: Math.random() > 0.1, // 90% active
        firstSeenAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Last year
        lastActivityAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last week
        totalTransactions: Math.floor(Math.random() * 10000) + 100,
        profitLoss: profitLoss,
      });
    });

    return wallets;
  }

  // Mock cohort flows
  generateMockCohortFlows(): InsertCohortFlow[] {
    const cohortTypes = ['whale', 'retail', 'institution', 'smart_money'];
    const assets = ['BTC', 'ETH', 'USDT', 'SOL', 'ADA'];
    const flowDirections = ['accumulating', 'distributing', 'holding'];
    const timeframes = ['1h', '4h', '24h'];
    const flows: InsertCohortFlow[] = [];

    cohortTypes.forEach(cohortType => {
      assets.forEach(asset => {
        timeframes.forEach(timeframe => {
          const flowDirection = flowDirections[Math.floor(Math.random() * flowDirections.length)] as 'accumulating' | 'distributing' | 'holding';
          const totalAmountUsd = Math.random() * 50000000 + 1000000; // $1M-50M
          const transactionCount = Math.floor(Math.random() * 1000) + 50;
          const uniqueWallets = Math.floor(transactionCount * (Math.random() * 0.3 + 0.1)); // 10-40% unique wallets

          flows.push({
            cohortType: cohortType,
            assetSymbol: asset,
            flowDirection: flowDirection,
            totalAmount: totalAmountUsd / (Math.random() * 50000 + 1000), // Convert to token amount
            totalAmountUsd: totalAmountUsd,
            transactionCount: transactionCount,
            uniqueWallets: uniqueWallets,
            avgTransactionSize: totalAmountUsd / transactionCount,
            flowStrength: Math.random() * 100,
            timeframe: timeframe,
            correlationWithSss: (Math.random() - 0.5) * 2, // -1 to +1 correlation
          });
        });
      });
    });

    return flows;
  }

  // Analyze flow correlation with SSS scores
  async analyzeFlowSssCorrelation(assetSymbol: string): Promise<{
    correlation: number;
    whaleActivity: number;
    exchangeNetFlow: number;
    smartMoneySignal: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
  }> {
    try {
      // Get current SSS score
      const asset = await storage.getAssetBySymbol(assetSymbol);
      if (!asset) {
        throw new Error(`Asset ${assetSymbol} not found`);
      }

      // In a real implementation, this would analyze actual flow data
      // For now, we'll generate realistic correlations
      const correlation = (Math.random() - 0.5) * 2; // -1 to +1
      const whaleActivity = Math.random() * 100;
      const exchangeNetFlow = (Math.random() - 0.5) * 10000000; // -5M to +5M
      
      let smartMoneySignal: 'bullish' | 'bearish' | 'neutral';
      if (correlation > 0.3 && exchangeNetFlow < -1000000) {
        smartMoneySignal = 'bullish'; // Positive correlation + outflow from exchanges
      } else if (correlation < -0.3 && exchangeNetFlow > 1000000) {
        smartMoneySignal = 'bearish'; // Negative correlation + inflow to exchanges
      } else {
        smartMoneySignal = 'neutral';
      }

      const confidence = Math.abs(correlation) * 100;

      return {
        correlation,
        whaleActivity,
        exchangeNetFlow,
        smartMoneySignal,
        confidence
      };
    } catch (error) {
      console.error('Error analyzing flow SSS correlation:', error);
      throw error;
    }
  }

  // Get flow intelligence summary
  async getFlowIntelligenceSummary(): Promise<{
    totalWhaleTransactions24h: number;
    totalVolumeUsd24h: number;
    topExchangeFlows: any[];
    smartMoneySignals: any[];
    anomalyCount: number;
  }> {
    try {
      // In production, this would query actual data
      // For now, generate realistic summary data
      const summary = {
        totalWhaleTransactions24h: Math.floor(Math.random() * 500) + 100,
        totalVolumeUsd24h: Math.random() * 1000000000 + 100000000, // $100M-1B
        topExchangeFlows: [
          { exchange: 'Binance', netFlow: -15600000, asset: 'BTC', trend: 'outflow' },
          { exchange: 'Coinbase', netFlow: 8200000, asset: 'ETH', trend: 'inflow' },
          { exchange: 'Kraken', netFlow: -3400000, asset: 'SOL', trend: 'outflow' },
        ],
        smartMoneySignals: [
          { asset: 'BTC', signal: 'bullish', confidence: 85, reason: 'Large whale accumulation' },
          { asset: 'ETH', signal: 'bearish', confidence: 72, reason: 'Exchange inflows increasing' },
          { asset: 'SOL', signal: 'bullish', confidence: 67, reason: 'Smart money accumulating' },
        ],
        anomalyCount: Math.floor(Math.random() * 20) + 5
      };

      return summary;
    } catch (error) {
      console.error('Error getting flow intelligence summary:', error);
      throw error;
    }
  }

  // Initialize mock data (in production, this would be real data fetching)
  async initializeFlowData(): Promise<void> {
    try {
      console.log('Initializing Flow Intelligence data...');
      
      // Note: In production, we would:
      // 1. Connect to blockchain APIs (Etherscan, Alchemy, etc.)
      // 2. Set up WebSocket connections for real-time data
      // 3. Implement proper data persistence
      // 4. Add caching and rate limiting
      
      // For demo purposes, we'll generate mock data
      const whaleTransactions = this.generateMockWhaleTransactions();
      const exchangeFlows = this.generateMockExchangeFlows();
      const smartMoneyWallets = this.generateMockSmartMoneyWallets();
      const cohortFlows = this.generateMockCohortFlows();

      console.log(`Generated ${whaleTransactions.length} whale transactions`);
      console.log(`Generated ${exchangeFlows.length} exchange flows`);
      console.log(`Generated ${smartMoneyWallets.length} smart money wallets`);
      console.log(`Generated ${cohortFlows.length} cohort flows`);

      console.log('✅ Flow Intelligence Service initialized successfully');
    } catch (error) {
      console.error('Error initializing flow intelligence data:', error);
    }
  }
}

export const flowIntelligenceService = new FlowIntelligenceService();

// Register Flow Intelligence API routes
export function registerFlowIntelligenceRoutes(app: Express): void {
  // Whale Transactions endpoint
  app.get("/api/flow/whale-transactions", isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const asset = req.query.asset as string;
      const timeframe = req.query.timeframe as string || '24h';
      
      const transactions = flowIntelligenceService.generateMockWhaleTransactions()
        .filter(tx => !asset || tx.assetSymbol === asset)
        .sort((a, b) => new Date(b.blockTimestamp).getTime() - new Date(a.blockTimestamp).getTime())
        .slice(0, limit);

      res.json({
        transactions,
        total: transactions.length,
        timeframe
      });
    } catch (error) {
      console.error('Error fetching whale transactions:', error);
      res.status(500).json({ error: 'Failed to fetch whale transactions' });
    }
  });

  // Exchange Flows endpoint
  app.get("/api/flow/exchange-flows", isAuthenticated, async (req, res) => {
    try {
      const exchange = req.query.exchange as string;
      const asset = req.query.asset as string;
      const timeframe = req.query.timeframe as string || '24h';
      
      const flows = flowIntelligenceService.generateMockExchangeFlows()
        .filter(flow => (!exchange || flow.exchangeName === exchange) && 
                       (!asset || flow.assetSymbol === asset) &&
                       flow.timeframe === timeframe);

      res.json({
        flows,
        total: flows.length
      });
    } catch (error) {
      console.error('Error fetching exchange flows:', error);
      res.status(500).json({ error: 'Failed to fetch exchange flows' });
    }
  });

  // Smart Money Wallets endpoint
  app.get("/api/flow/smart-money", isAuthenticated, async (req, res) => {
    try {
      const walletType = req.query.type as string;
      
      const wallets = flowIntelligenceService.generateMockSmartMoneyWallets()
        .filter(wallet => !walletType || wallet.walletType === walletType)
        .sort((a, b) => (b.balanceUsd || 0) - (a.balanceUsd || 0));

      res.json({
        wallets,
        total: wallets.length
      });
    } catch (error) {
      console.error('Error fetching smart money wallets:', error);
      res.status(500).json({ error: 'Failed to fetch smart money wallets' });
    }
  });

  // Cohort Flow Analysis endpoint
  app.get("/api/flow/cohort-analysis", isAuthenticated, async (req, res) => {
    try {
      const cohortType = req.query.cohortType as string;
      const asset = req.query.asset as string;
      const timeframe = req.query.timeframe as string || '24h';
      
      const flows = flowIntelligenceService.generateMockCohortFlows()
        .filter(flow => (!cohortType || flow.cohortType === cohortType) &&
                       (!asset || flow.assetSymbol === asset) &&
                       flow.timeframe === timeframe);

      res.json({
        flows,
        total: flows.length
      });
    } catch (error) {
      console.error('Error fetching cohort flows:', error);
      res.status(500).json({ error: 'Failed to fetch cohort flows' });
    }
  });

  // Flow Intelligence Summary endpoint
  app.get("/api/flow/summary", isAuthenticated, async (req, res) => {
    try {
      const summary = await flowIntelligenceService.getFlowIntelligenceSummary();
      res.json(summary);
    } catch (error) {
      console.error('Error fetching flow summary:', error);
      res.status(500).json({ error: 'Failed to fetch flow summary' });
    }
  });

  // SSS Flow Correlation endpoint
  app.get("/api/flow/sss-correlation/:symbol", isAuthenticated, async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const correlation = await flowIntelligenceService.analyzeFlowSssCorrelation(symbol);
      res.json(correlation);
    } catch (error) {
      console.error('Error analyzing SSS correlation:', error);
      res.status(500).json({ error: 'Failed to analyze SSS correlation' });
    }
  });
}

// Initialize the service
flowIntelligenceService.initializeFlowData();