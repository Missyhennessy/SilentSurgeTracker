import type { Express } from "express";

interface WhaleTransaction {
  id: string;
  walletAddress: string;
  amount: number;
  asset: string;
  timestamp: Date;
  transactionType: 'buy' | 'sell' | 'transfer';
  exchangeSource?: string;
  impactScore: number;
  confidenceLevel: number;
}

interface WhaleWallet {
  address: string;
  totalValue: number;
  assets: Array<{
    symbol: string;
    amount: number;
    value: number;
    percentage: number;
  }>;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  influenceScore: number;
  lastActivity: Date;
}

class WhaleTrackingService {
  private transactions: WhaleTransaction[] = [];
  private wallets: WhaleWallet[] = [];

  constructor() {
    this.initializeSampleData();
    this.startRealTimeTracking();
  }

  private initializeSampleData() {
    // Sample whale wallets
    this.wallets = [
      {
        address: "0x742d35...98ae1c4",
        totalValue: 245000000,
        assets: [
          { symbol: "BTC", amount: 1250, value: 147650000, percentage: 60.3 },
          { symbol: "ETH", amount: 15600, value: 58915200, percentage: 24.0 },
          { symbol: "SOL", amount: 125000, value: 23425000, percentage: 9.6 },
          { symbol: "MATIC", amount: 62500000, value: 15009750, percentage: 6.1 }
        ],
        riskProfile: 'conservative',
        influenceScore: 94,
        lastActivity: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        address: "0x1a9c8e...7d4f2b9",
        totalValue: 89500000,
        assets: [
          { symbol: "ETH", amount: 18750, value: 70875000, percentage: 79.2 },
          { symbol: "PEPE", amount: 950000000000, value: 11970000, percentage: 13.4 },
          { symbol: "BONK", amount: 85000000000000, value: 2975500, percentage: 3.3 },
          { symbol: "WIF", amount: 3245000, value: 3679550, percentage: 4.1 }
        ],
        riskProfile: 'aggressive',
        influenceScore: 87,
        lastActivity: new Date(Date.now() - 1800000) // 30 minutes ago
      }
    ];

    // Sample transactions
    this.generateSampleTransactions();
  }

  private generateSampleTransactions() {
    const assets = ['BTC', 'ETH', 'SOL', 'PEPE', 'BONK', 'WIF', 'DOGE', 'SHIB'];
    const walletAddresses = this.wallets.map(w => w.address);

    for (let i = 0; i < 20; i++) {
      const transaction: WhaleTransaction = {
        id: `tx_${Date.now()}_${i}`,
        walletAddress: walletAddresses[Math.floor(Math.random() * walletAddresses.length)],
        amount: Math.random() * 50000000 + 1000000, // $1M - $50M
        asset: assets[Math.floor(Math.random() * assets.length)],
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7), // Last 7 days
        transactionType: Math.random() > 0.5 ? 'buy' : 'sell',
        exchangeSource: ['Binance', 'Coinbase', 'Kraken', 'DEX'][Math.floor(Math.random() * 4)],
        impactScore: Math.random() * 100,
        confidenceLevel: 75 + Math.random() * 25
      };
      this.transactions.push(transaction);
    }
  }

  private startRealTimeTracking() {
    // Simulate whale transaction detection every 2 minutes
    setInterval(() => {
      this.simulateWhaleActivity();
    }, 120000);
  }

  private simulateWhaleActivity() {
    const assets = ['BTC', 'ETH', 'SOL', 'PEPE', 'BONK', 'WIF', 'DOGE', 'SHIB'];
    const walletAddresses = this.wallets.map(w => w.address);

    const newTransaction: WhaleTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      walletAddress: walletAddresses[Math.floor(Math.random() * walletAddresses.length)],
      amount: Math.random() * 25000000 + 5000000, // $5M - $30M
      asset: assets[Math.floor(Math.random() * assets.length)],
      timestamp: new Date(),
      transactionType: Math.random() > 0.6 ? 'buy' : 'sell',
      exchangeSource: ['Binance', 'Coinbase', 'Kraken', 'DEX'][Math.floor(Math.random() * 4)],
      impactScore: 60 + Math.random() * 40,
      confidenceLevel: 80 + Math.random() * 20
    };

    this.transactions.unshift(newTransaction);
    
    // Keep only last 100 transactions
    if (this.transactions.length > 100) {
      this.transactions = this.transactions.slice(0, 100);
    }

    console.log(`New whale transaction detected: ${newTransaction.transactionType.toUpperCase()} $${(newTransaction.amount/1000000).toFixed(1)}M ${newTransaction.asset}`);
  }

  getRecentTransactions(limit: number = 20): WhaleTransaction[] {
    return this.transactions
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getWhaleWallets(): WhaleWallet[] {
    return this.wallets.sort((a, b) => b.influenceScore - a.influenceScore);
  }

  getTransactionsByAsset(asset: string): WhaleTransaction[] {
    return this.transactions
      .filter(tx => tx.asset === asset)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getWhaleSentiment(): {
    overall: number;
    buyPressure: number;
    sellPressure: number;
    netFlow: number;
    activeWhales: number;
  } {
    const recentTransactions = this.transactions.filter(
      tx => Date.now() - tx.timestamp.getTime() < 86400000 // Last 24 hours
    );

    const buyVolume = recentTransactions
      .filter(tx => tx.transactionType === 'buy')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const sellVolume = recentTransactions
      .filter(tx => tx.transactionType === 'sell')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalVolume = buyVolume + sellVolume;
    const netFlow = buyVolume - sellVolume;
    
    return {
      overall: totalVolume > 0 ? (buyVolume / totalVolume) * 100 : 50,
      buyPressure: buyVolume,
      sellPressure: sellVolume,
      netFlow,
      activeWhales: new Set(recentTransactions.map(tx => tx.walletAddress)).size
    };
  }
}

export const whaleTrackingService = new WhaleTrackingService();

export function registerWhaleTrackingRoutes(app: Express) {
  // Get recent whale transactions
  app.get("/api/whale/transactions", (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const transactions = whaleTrackingService.getRecentTransactions(limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch whale transactions" });
    }
  });

  // Get whale wallets
  app.get("/api/whale/wallets", (req, res) => {
    try {
      const wallets = whaleTrackingService.getWhaleWallets();
      res.json(wallets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch whale wallets" });
    }
  });

  // Get transactions for specific asset
  app.get("/api/whale/transactions/:asset", (req, res) => {
    try {
      const asset = req.params.asset.toUpperCase();
      const transactions = whaleTrackingService.getTransactionsByAsset(asset);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch asset whale transactions" });
    }
  });

  // Get whale sentiment analysis
  app.get("/api/whale/sentiment", (req, res) => {
    try {
      const sentiment = whaleTrackingService.getWhaleSentiment();
      res.json(sentiment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch whale sentiment" });
    }
  });
}