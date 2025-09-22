import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
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
  Settings,
  Loader2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface RiskMetrics {
  id: number;
  portfolioId: number;
  var95: number;
  var99: number;
  expectedShortfall: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  beta: number;
  correlation: number;
  concentration: number;
  liquidityRisk: number;
  riskScore: number;
  timestamp: Date;
}

interface Portfolio {
  id: number;
  name: string;
  totalValue: number;
  performance: number;
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
  const { toast } = useToast();
  const [riskParams, setRiskParams] = useState<RiskParameters>({
    maxPositionSize: 20,
    maxDrawdownLimit: 15,
    correlationThreshold: 0.7,
    diversificationMin: 5,
    stopLossLevel: 8,
    takeProfitLevel: 25
  });

  // Fetch risk metrics from real API
  const { data: riskMetrics, isLoading: riskLoading, error: riskError } = useQuery<RiskMetrics>({
    queryKey: ['/api/risk-metrics'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Use default values if data is not yet loaded
  const currentRiskMetrics = riskMetrics || {
    id: 0,
    portfolioId: 0,
    var95: 0,
    var99: 0,
    expectedShortfall: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    volatility: 0,
    beta: 0,
    correlation: 0,
    concentration: 0,
    liquidityRisk: 0,
    riskScore: 0,
    timestamp: new Date()
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  // Handle loading states
  if (riskLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Risk Management</h2>
            <p className="text-[var(--text-secondary)] mt-1">
              Advanced portfolio risk analysis and protection
            </p>
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Handle error states
  if (riskError) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Risk Management</h2>
            <p className="text-[var(--text-secondary)] mt-1">
              Advanced portfolio risk analysis and protection
            </p>
          </div>
        </div>
        <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-400 font-medium">Failed to load risk metrics</span>
          </div>
          <p className="text-[var(--text-secondary)] mt-2">
            Unable to fetch risk data. Please check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Risk Management</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Advanced portfolio risk analysis and protection
          </p>
        </div>
        <Badge className={`${getRiskColor(currentRiskMetrics.riskScore)} bg-transparent border-current`} data-testid="badge-risk-score">
          Risk Score: {currentRiskMetrics.riskScore}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4" data-testid="tabs-list-risk">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="exposure" data-testid="tab-exposure">Exposure</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">Alerts</TabsTrigger>
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
                      ${currentRiskMetrics.portfolioValue.toLocaleString()}
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
                      -{currentRiskMetrics.maxDrawdown}%
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
                      {currentRiskMetrics.sharpeRatio}
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
                      ${currentRiskMetrics.valueAtRisk.toLocaleString()}
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
                      {currentRiskMetrics.betaToMarket}
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
                      {currentRiskMetrics.volatility}%
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
                {Object.entries(currentRiskMetrics.exposureByAsset).map(([asset, exposure]) => (
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
              <Button className="w-full mt-4" data-testid="button-update-risk-settings">
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