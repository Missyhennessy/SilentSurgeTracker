import type { Express } from "express";

interface DeFiProtocol {
  id: string;
  name: string;
  tvl: number; // Total Value Locked
  apy: number;
  category: 'lending' | 'dex' | 'staking' | 'yield-farming' | 'derivatives';
  chain: string;
  riskScore: number;
  tokens: string[];
}

interface DeFiOpportunity {
  protocol: string;
  strategy: string;
  expectedAPY: number;
  risk: 'low' | 'medium' | 'high';
  minDeposit: number;
  asset: string;
  chain: string;
  description: string;
  tvl: number;
  confidence: number;
}

interface LiquidityPool {
  id: string;
  tokens: string[];
  totalLiquidity: number;
  apr: number;
  volume24h: number;
  fees24h: number;
  impermanentLossRisk: number;
  protocol: string;
}

class DeFiIntegrationService {
  private protocols: DeFiProtocol[] = [];
  private opportunities: DeFiOpportunity[] = [];
  private liquidityPools: LiquidityPool[] = [];

  constructor() {
    this.initializeProtocols();
    this.generateOpportunities();
    this.initializeLiquidityPools();
    // this.startDeFiMonitoring(); // DISABLED for development to prevent event loop stalls
  }

  private initializeProtocols() {
    this.protocols = [
      {
        id: 'aave',
        name: 'Aave',
        tvl: 12500000000,
        apy: 4.2,
        category: 'lending',
        chain: 'Ethereum',
        riskScore: 15,
        tokens: ['AAVE', 'ETH', 'USDC', 'USDT', 'DAI']
      },
      {
        id: 'uniswap',
        name: 'Uniswap V3',
        tvl: 8900000000,
        apy: 12.8,
        category: 'dex',
        chain: 'Ethereum',
        riskScore: 25,
        tokens: ['UNI', 'ETH', 'USDC', 'WBTC']
      },
      {
        id: 'compound',
        name: 'Compound',
        tvl: 3200000000,
        apy: 3.9,
        category: 'lending',
        chain: 'Ethereum',
        riskScore: 18,
        tokens: ['COMP', 'ETH', 'USDC', 'DAI']
      },
      {
        id: 'pancakeswap',
        name: 'PancakeSwap',
        tvl: 2800000000,
        apy: 28.5,
        category: 'dex',
        chain: 'BSC',
        riskScore: 35,
        tokens: ['CAKE', 'BNB', 'BUSD']
      },
      {
        id: 'raydium',
        name: 'Raydium',
        tvl: 1900000000,
        apy: 42.3,
        category: 'dex',
        chain: 'Solana',
        riskScore: 45,
        tokens: ['RAY', 'SOL', 'USDC']
      }
    ];
  }

  private generateOpportunities() {
    this.opportunities = [
      {
        protocol: 'Aave',
        strategy: 'ETH Lending',
        expectedAPY: 4.2,
        risk: 'low',
        minDeposit: 0.1,
        asset: 'ETH',
        chain: 'Ethereum',
        description: 'Earn yield by lending ETH on Aave with low liquidation risk',
        tvl: 2400000000,
        confidence: 92
      },
      {
        protocol: 'Uniswap V3',
        strategy: 'ETH/USDC LP',
        expectedAPY: 15.7,
        risk: 'medium',
        minDeposit: 1000,
        asset: 'ETH-USDC',
        chain: 'Ethereum',
        description: 'Provide liquidity to ETH/USDC pair with concentrated liquidity',
        tvl: 890000000,
        confidence: 87
      },
      {
        protocol: 'PancakeSwap',
        strategy: 'CAKE Staking',
        expectedAPY: 68.9,
        risk: 'high',
        minDeposit: 10,
        asset: 'CAKE',
        chain: 'BSC',
        description: 'Stake CAKE tokens for high yields with protocol rewards',
        tvl: 340000000,
        confidence: 73
      },
      {
        protocol: 'Raydium',
        strategy: 'SOL/USDC LP',
        expectedAPY: 42.1,
        risk: 'medium',
        minDeposit: 100,
        asset: 'SOL-USDC',
        chain: 'Solana',
        description: 'High-yield liquidity provision on Solana with lower fees',
        tvl: 156000000,
        confidence: 81
      }
    ];
  }

  private initializeLiquidityPools() {
    this.liquidityPools = [
      {
        id: 'eth-usdc-3000',
        tokens: ['ETH', 'USDC'],
        totalLiquidity: 890000000,
        apr: 15.7,
        volume24h: 125000000,
        fees24h: 375000,
        impermanentLossRisk: 12.5,
        protocol: 'Uniswap V3'
      },
      {
        id: 'sol-usdc-100',
        tokens: ['SOL', 'USDC'],
        totalLiquidity: 156000000,
        apr: 42.1,
        volume24h: 34000000,
        fees24h: 102000,
        impermanentLossRisk: 25.8,
        protocol: 'Raydium'
      },
      {
        id: 'cake-bnb-2500',
        tokens: ['CAKE', 'BNB'],
        totalLiquidity: 89000000,
        apr: 67.2,
        volume24h: 12000000,
        fees24h: 36000,
        impermanentLossRisk: 34.2,
        protocol: 'PancakeSwap'
      }
    ];
  }

  private startDeFiMonitoring() {
    // Update DeFi data every 10 minutes
    setInterval(() => {
      this.updateDeFiMetrics();
    }, 600000);
  }

  private updateDeFiMetrics() {
    // Simulate real-time updates to APYs and TVLs
    this.protocols.forEach(protocol => {
      protocol.apy = protocol.apy * (0.95 + Math.random() * 0.1); // ±5% variance
      protocol.tvl = protocol.tvl * (0.98 + Math.random() * 0.04); // ±2% variance
    });

    this.opportunities.forEach(opportunity => {
      opportunity.expectedAPY = opportunity.expectedAPY * (0.9 + Math.random() * 0.2); // ±10% variance
      opportunity.confidence = Math.max(60, Math.min(95, opportunity.confidence + (Math.random() - 0.5) * 10));
    });

    this.liquidityPools.forEach(pool => {
      pool.apr = pool.apr * (0.85 + Math.random() * 0.3); // ±15% variance
      pool.volume24h = pool.volume24h * (0.7 + Math.random() * 0.6); // ±30% variance
      pool.fees24h = pool.volume24h * 0.003; // 0.3% fee
    });

    console.log('DeFi metrics updated - protocols, opportunities, and pools refreshed');
  }

  getProtocols(category?: string): DeFiProtocol[] {
    if (category) {
      return this.protocols.filter(p => p.category === category);
    }
    return this.protocols.sort((a, b) => b.tvl - a.tvl);
  }

  getOpportunities(riskLevel?: string, minAPY?: number): DeFiOpportunity[] {
    let filtered = this.opportunities;
    
    if (riskLevel) {
      filtered = filtered.filter(o => o.risk === riskLevel);
    }
    
    if (minAPY) {
      filtered = filtered.filter(o => o.expectedAPY >= minAPY);
    }
    
    return filtered.sort((a, b) => b.expectedAPY - a.expectedAPY);
  }

  getLiquidityPools(protocol?: string): LiquidityPool[] {
    if (protocol) {
      return this.liquidityPools.filter(p => p.protocol === protocol);
    }
    return this.liquidityPools.sort((a, b) => b.apr - a.apr);
  }

  getYieldComparison(): {
    protocol: string;
    avgAPY: number;
    totalTVL: number;
    riskScore: number;
  }[] {
    const protocolGroups = new Map<string, DeFiProtocol[]>();
    
    this.protocols.forEach(protocol => {
      if (!protocolGroups.has(protocol.name)) {
        protocolGroups.set(protocol.name, []);
      }
      protocolGroups.get(protocol.name)!.push(protocol);
    });

    return Array.from(protocolGroups.entries()).map(([name, protocols]) => ({
      protocol: name,
      avgAPY: protocols.reduce((sum, p) => sum + p.apy, 0) / protocols.length,
      totalTVL: protocols.reduce((sum, p) => sum + p.tvl, 0),
      riskScore: protocols.reduce((sum, p) => sum + p.riskScore, 0) / protocols.length
    })).sort((a, b) => b.avgAPY - a.avgAPY);
  }

  getAssetOpportunities(asset: string): DeFiOpportunity[] {
    return this.opportunities.filter(o => 
      o.asset === asset || o.asset.includes(asset)
    ).sort((a, b) => b.expectedAPY - a.expectedAPY);
  }
}

export const defiIntegrationService = new DeFiIntegrationService();

export function registerDeFiRoutes(app: Express) {
  // Get DeFi protocols
  app.get("/api/defi/protocols", (req, res) => {
    try {
      const category = req.query.category as string;
      const protocols = defiIntegrationService.getProtocols(category);
      res.json(protocols);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch DeFi protocols" });
    }
  });

  // Get yield opportunities
  app.get("/api/defi/opportunities", (req, res) => {
    try {
      const riskLevel = req.query.risk as string;
      const minAPY = req.query.minAPY ? parseFloat(req.query.minAPY as string) : undefined;
      const opportunities = defiIntegrationService.getOpportunities(riskLevel, minAPY);
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch DeFi opportunities" });
    }
  });

  // Get liquidity pools
  app.get("/api/defi/pools", (req, res) => {
    try {
      const protocol = req.query.protocol as string;
      const pools = defiIntegrationService.getLiquidityPools(protocol);
      res.json(pools);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch liquidity pools" });
    }
  });

  // Get yield comparison
  app.get("/api/defi/comparison", (req, res) => {
    try {
      const comparison = defiIntegrationService.getYieldComparison();
      res.json(comparison);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch yield comparison" });
    }
  });

  // Get opportunities for specific asset
  app.get("/api/defi/opportunities/:asset", (req, res) => {
    try {
      const asset = req.params.asset.toUpperCase();
      const opportunities = defiIntegrationService.getAssetOpportunities(asset);
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch asset opportunities" });
    }
  });
}