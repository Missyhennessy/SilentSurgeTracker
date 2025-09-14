import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  DollarSign,
  PieChart,
  BarChart3,
  Settings
} from 'lucide-react';

interface RiskMetrics {
  portfolioValue: number;
  maxDrawdown: number;
  sharpeRatio: number;
  volatility: number;
  betaToMarket: number;
  valueAtRisk: number;
  exposureByAsset: { [key: string]: number };
  riskScore: number;
}

interface RiskParameters {
  maxPositionSize: number;
  maxDrawdownLimit: number;
  correlationThreshold: number;
  diversificationMin: number;
  stopLossLevel: number;
  takeProfitLevel: number;
}

export default function RiskManagement() {
  const [riskParams, setRiskParams] = useState<RiskParameters>({
    maxPositionSize: 20,
    maxDrawdownLimit: 15,
    correlationThreshold: 0.7,
    diversificationMin: 5,
    stopLossLevel: 8,
    takeProfitLevel: 25
  });

  const mockRiskMetrics: RiskMetrics = {
    portfolioValue: 75420,
    maxDrawdown: 8.3,
    sharpeRatio: 1.42,
    volatility: 18.7,
    betaToMarket: 0.85,
    valueAtRisk: 3240,
    exposureByAsset: {
      'BTC': 35,
      'ETH': 25,
      'SOL': 20,
      'ADA': 12,
      'LINK': 8
    },
    riskScore: 72
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Risk Management</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Advanced portfolio risk analysis and protection
          </p>
        </div>
        <Badge className={`${getRiskColor(mockRiskMetrics.riskScore)} bg-transparent border-current`}>
          Risk Score: {mockRiskMetrics.riskScore}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exposure">Exposure</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Portfolio Value */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Portfolio Value</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      ${mockRiskMetrics.portfolioValue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-[var(--primary-blue)]" />
                </div>
              </CardContent>
            </Card>

            {/* Max Drawdown */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Max Drawdown</p>
                    <p className="text-2xl font-bold text-red-400">
                      -{mockRiskMetrics.maxDrawdown}%
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            {/* Sharpe Ratio */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Sharpe Ratio</p>
                    <p className="text-2xl font-bold text-green-400">
                      {mockRiskMetrics.sharpeRatio}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            {/* Value at Risk */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Value at Risk (95%)</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      ${mockRiskMetrics.valueAtRisk.toLocaleString()}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Beta */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Portfolio Beta</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {mockRiskMetrics.betaToMarket}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-[var(--primary-blue)]" />
                </div>
              </CardContent>
            </Card>

            {/* Volatility */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Volatility (30d)</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {mockRiskMetrics.volatility}%
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exposure">
          <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Asset Exposure</CardTitle>
              <CardDescription>Portfolio allocation breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(mockRiskMetrics.exposureByAsset).map(([asset, exposure]) => (
                  <div key={asset} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-primary)] font-medium">{asset}</span>
                      <span className="text-[var(--text-secondary)]">{exposure}%</span>
                    </div>
                    <Progress value={exposure} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Risk Parameters</CardTitle>
              <CardDescription>Configure portfolio risk limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Position Size (%)</Label>
                  <Input
                    type="number"
                    value={riskParams.maxPositionSize}
                    onChange={(e) => setRiskParams(prev => ({
                      ...prev,
                      maxPositionSize: parseFloat(e.target.value)
                    }))}
                    className="bg-[var(--dark-input)]"
                  />
                </div>
                <div>
                  <Label>Max Drawdown Limit (%)</Label>
                  <Input
                    type="number"
                    value={riskParams.maxDrawdownLimit}
                    onChange={(e) => setRiskParams(prev => ({
                      ...prev,
                      maxDrawdownLimit: parseFloat(e.target.value)
                    }))}
                    className="bg-[var(--dark-input)]"
                  />
                </div>
                <div>
                  <Label>Stop Loss Level (%)</Label>
                  <Input
                    type="number"
                    value={riskParams.stopLossLevel}
                    onChange={(e) => setRiskParams(prev => ({
                      ...prev,
                      stopLossLevel: parseFloat(e.target.value)
                    }))}
                    className="bg-[var(--dark-input)]"
                  />
                </div>
                <div>
                  <Label>Take Profit Level (%)</Label>
                  <Input
                    type="number"
                    value={riskParams.takeProfitLevel}
                    onChange={(e) => setRiskParams(prev => ({
                      ...prev,
                      takeProfitLevel: parseFloat(e.target.value)
                    }))}
                    className="bg-[var(--dark-input)]"
                  />
                </div>
              </div>
              <Button className="w-full mt-4">
                <Settings className="w-4 h-4 mr-2" />
                Update Risk Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Risk Alerts</CardTitle>
              <CardDescription>Active risk monitoring alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { type: 'warning', message: 'BTC position approaching max size limit (18/20%)', time: '2 min ago' },
                  { type: 'info', message: 'Portfolio correlation increased to 0.68', time: '15 min ago' },
                  { type: 'success', message: 'Risk score improved to 72 (was 78)', time: '1 hour ago' }
                ].map((alert, index) => (
                  <div key={index} className="flex items-center p-3 bg-[var(--dark-panel)] rounded-lg">
                    <div className={`h-2 w-2 rounded-full mr-3 ${
                      alert.type === 'warning' ? 'bg-yellow-400' :
                      alert.type === 'info' ? 'bg-blue-400' : 'bg-green-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-[var(--text-primary)] text-sm">{alert.message}</p>
                      <p className="text-[var(--text-secondary)] text-xs">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}