import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar,
  Settings,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { AssetCardSkeleton } from '@/components/ui/loading-skeleton';
import { useToast } from '@/hooks/use-toast';

interface BacktestStrategy {
  id: string;
  name: string;
  description: string;
  parameters: {
    sssThreshold: number;
    holdingPeriod: number; // days
    stopLoss: number; // percentage
    takeProfit: number; // percentage
    maxPositions: number;
    riskPerTrade: number; // percentage of portfolio
  };
}

interface BacktestResult {
  strategyId: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  profitFactor: number;
  trades: BacktestTrade[];
  dailyReturns: DailyReturn[];
}

interface BacktestTrade {
  id: string;
  asset: string;
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  return: number;
  sssAtEntry: number;
  reason: 'stop_loss' | 'take_profit' | 'time_exit' | 'manual';
}

interface DailyReturn {
  date: string;
  portfolioValue: number;
  dailyReturn: number;
  cumulativeReturn: number;
}

const predefinedStrategies: BacktestStrategy[] = [
  {
    id: 'high_sss_momentum',
    name: 'High SSS Momentum',
    description: 'Buy assets with SSS > 80, hold for 7 days',
    parameters: {
      sssThreshold: 80,
      holdingPeriod: 7,
      stopLoss: -15,
      takeProfit: 25,
      maxPositions: 5,
      riskPerTrade: 10
    }
  },
  {
    id: 'medium_sss_swing',
    name: 'Medium SSS Swing',
    description: 'Buy assets with SSS 60-80, swing trading approach',
    parameters: {
      sssThreshold: 60,
      holdingPeriod: 14,
      stopLoss: -12,
      takeProfit: 20,
      maxPositions: 8,
      riskPerTrade: 8
    }
  },
  {
    id: 'conservative_surge',
    name: 'Conservative Surge',
    description: 'Conservative approach with strict risk management',
    parameters: {
      sssThreshold: 75,
      holdingPeriod: 21,
      stopLoss: -10,
      takeProfit: 15,
      maxPositions: 3,
      riskPerTrade: 5
    }
  }
];

export default function AdvancedBacktesting() {
  const [selectedStrategy, setSelectedStrategy] = useState<BacktestStrategy>(predefinedStrategies[0]);
  const [customStrategy, setCustomStrategy] = useState<BacktestStrategy>({
    id: 'custom',
    name: 'Custom Strategy',
    description: 'User-defined parameters',
    parameters: {
      sssThreshold: 70,
      holdingPeriod: 10,
      stopLoss: -12,
      takeProfit: 20,
      maxPositions: 5,
      riskPerTrade: 8
    }
  });
  const [backtestPeriod, setBacktestPeriod] = useState('6m');
  const [initialCapital, setInitialCapital] = useState(10000);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('strategy');
  const { toast } = useToast();

  // Fetch historical backtest results
  const { data: backtestResults, isLoading } = useQuery<BacktestResult[]>({
    queryKey: ['/api/backtest/results'],
    enabled: true
  });

  // Run backtest mutation
  const runBacktestMutation = useMutation({
    mutationFn: async (params: any) => {
      const response = await fetch('/api/backtest/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!response.ok) throw new Error('Backtest failed');
      return response.json();
    },
    onSuccess: (result) => {
      setIsRunning(false);
      toast({
        title: "Backtest Complete",
        description: `Strategy returned ${result.totalReturn.toFixed(2)}% with ${result.winRate.toFixed(1)}% win rate`,
      });
    },
    onError: () => {
      setIsRunning(false);
      toast({
        title: "Backtest Failed",
        description: "Failed to run backtest. Please try again.",
        variant: "destructive"
      });
    }
  });

  const runBacktest = () => {
    const strategy = selectedStrategy.id === 'custom' ? customStrategy : selectedStrategy;
    setIsRunning(true);
    
    runBacktestMutation.mutate({
      strategy,
      period: backtestPeriod,
      initialCapital
    });
  };

  const latestResult = backtestResults?.[0];

  const performanceMetrics = useMemo(() => {
    if (!latestResult) return [];
    
    return [
      { 
        label: 'Total Return', 
        value: `${latestResult.totalReturn.toFixed(2)}%`, 
        trend: latestResult.totalReturn >= 0 ? 'up' : 'down',
        icon: latestResult.totalReturn >= 0 ? TrendingUp : TrendingDown
      },
      { 
        label: 'Win Rate', 
        value: `${latestResult.winRate.toFixed(1)}%`, 
        trend: latestResult.winRate >= 60 ? 'up' : 'neutral',
        icon: Target
      },
      { 
        label: 'Sharpe Ratio', 
        value: latestResult.sharpeRatio.toFixed(2), 
        trend: latestResult.sharpeRatio >= 1 ? 'up' : 'neutral',
        icon: BarChart3
      },
      { 
        label: 'Max Drawdown', 
        value: `${latestResult.maxDrawdown.toFixed(2)}%`, 
        trend: latestResult.maxDrawdown <= -20 ? 'down' : 'neutral',
        icon: TrendingDown
      }
    ];
  }, [latestResult]);

  if (isLoading) {
    return (
      <div className="h-96">
        <AssetCardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Advanced Backtesting</h2>
          <p className="text-[var(--text-secondary)]">Test trading strategies against historical SSS data</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={runBacktest}
            disabled={isRunning}
            className="bg-[var(--primary-blue)] hover:bg-[var(--primary-blue)]/90"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Backtest
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {isRunning && (
        <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-blue)]"></div>
              <div>
                <p className="font-medium text-[var(--text-primary)]">Running Backtest...</p>
                <p className="text-sm text-[var(--text-secondary)]">Analyzing historical data and executing strategy</p>
              </div>
            </div>
            <Progress value={65} className="mt-4" />
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="strategy">Strategy Setup</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trades">Trade Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="strategy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategy Selection */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Strategy Selection</CardTitle>
                <CardDescription>Choose a predefined strategy or create custom parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {predefinedStrategies.map((strategy) => (
                    <div
                      key={strategy.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedStrategy.id === strategy.id
                          ? 'border-[var(--primary-blue)] bg-[var(--primary-blue)]/5'
                          : 'border-[var(--dark-border)] hover:border-[var(--primary-blue)]/50'
                      }`}
                      onClick={() => setSelectedStrategy(strategy)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-[var(--text-primary)]">{strategy.name}</h4>
                          <p className="text-sm text-[var(--text-secondary)] mt-1">{strategy.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              SSS ≥ {strategy.parameters.sssThreshold}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {strategy.parameters.holdingPeriod}d hold
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custom Strategy Toggle */}
                <div
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedStrategy.id === 'custom'
                      ? 'border-[var(--primary-blue)] bg-[var(--primary-blue)]/5'
                      : 'border-[var(--dark-border)] hover:border-[var(--primary-blue)]/50'
                  }`}
                  onClick={() => setSelectedStrategy(customStrategy)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[var(--text-primary)]">Custom Strategy</h4>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">Define your own parameters</p>
                    </div>
                    <Settings className="w-4 h-4 text-[var(--text-secondary)]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategy Parameters */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Strategy Parameters</CardTitle>
                <CardDescription>Configure strategy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>SSS Threshold</Label>
                    <Input
                      type="number"
                      value={selectedStrategy.parameters.sssThreshold}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (selectedStrategy.id === 'custom') {
                          setCustomStrategy(prev => ({
                            ...prev,
                            parameters: { ...prev.parameters, sssThreshold: value }
                          }));
                        }
                      }}
                      disabled={selectedStrategy.id !== 'custom'}
                      className="bg-[var(--dark-input)]"
                    />
                  </div>
                  <div>
                    <Label>Holding Period (days)</Label>
                    <Input
                      type="number"
                      value={selectedStrategy.parameters.holdingPeriod}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (selectedStrategy.id === 'custom') {
                          setCustomStrategy(prev => ({
                            ...prev,
                            parameters: { ...prev.parameters, holdingPeriod: value }
                          }));
                        }
                      }}
                      disabled={selectedStrategy.id !== 'custom'}
                      className="bg-[var(--dark-input)]"
                    />
                  </div>
                  <div>
                    <Label>Stop Loss (%)</Label>
                    <Input
                      type="number"
                      value={selectedStrategy.parameters.stopLoss}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (selectedStrategy.id === 'custom') {
                          setCustomStrategy(prev => ({
                            ...prev,
                            parameters: { ...prev.parameters, stopLoss: value }
                          }));
                        }
                      }}
                      disabled={selectedStrategy.id !== 'custom'}
                      className="bg-[var(--dark-input)]"
                    />
                  </div>
                  <div>
                    <Label>Take Profit (%)</Label>
                    <Input
                      type="number"
                      value={selectedStrategy.parameters.takeProfit}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (selectedStrategy.id === 'custom') {
                          setCustomStrategy(prev => ({
                            ...prev,
                            parameters: { ...prev.parameters, takeProfit: value }
                          }));
                        }
                      }}
                      disabled={selectedStrategy.id !== 'custom'}
                      className="bg-[var(--dark-input)]"
                    />
                  </div>
                  <div>
                    <Label>Max Positions</Label>
                    <Input
                      type="number"
                      value={selectedStrategy.parameters.maxPositions}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (selectedStrategy.id === 'custom') {
                          setCustomStrategy(prev => ({
                            ...prev,
                            parameters: { ...prev.parameters, maxPositions: value }
                          }));
                        }
                      }}
                      disabled={selectedStrategy.id !== 'custom'}
                      className="bg-[var(--dark-input)]"
                    />
                  </div>
                  <div>
                    <Label>Risk per Trade (%)</Label>
                    <Input
                      type="number"
                      value={selectedStrategy.parameters.riskPerTrade}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (selectedStrategy.id === 'custom') {
                          setCustomStrategy(prev => ({
                            ...prev,
                            parameters: { ...prev.parameters, riskPerTrade: value }
                          }));
                        }
                      }}
                      disabled={selectedStrategy.id !== 'custom'}
                      className="bg-[var(--dark-input)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Backtest Period</Label>
                  <Select value={backtestPeriod} onValueChange={setBacktestPeriod}>
                    <SelectTrigger className="bg-[var(--dark-input)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 Month</SelectItem>
                      <SelectItem value="3m">3 Months</SelectItem>
                      <SelectItem value="6m">6 Months</SelectItem>
                      <SelectItem value="1y">1 Year</SelectItem>
                      <SelectItem value="2y">2 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Initial Capital ($)</Label>
                  <Input
                    type="number"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(parseFloat(e.target.value))}
                    className="bg-[var(--dark-input)]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {latestResult ? (
            <>
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {performanceMetrics.map((metric, index) => {
                  const IconComponent = metric.icon;
                  return (
                    <Card key={index} className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-[var(--text-secondary)]">{metric.label}</p>
                            <p className={`text-2xl font-bold ${
                              metric.trend === 'up' ? 'text-green-400' : 
                              metric.trend === 'down' ? 'text-red-400' : 
                              'text-[var(--text-primary)]'
                            }`}>
                              {metric.value}
                            </p>
                          </div>
                          <IconComponent className={`w-8 h-8 ${
                            metric.trend === 'up' ? 'text-green-400' : 
                            metric.trend === 'down' ? 'text-red-400' : 
                            'text-[var(--text-secondary)]'
                          }`} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Portfolio Performance Chart */}
              <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardHeader>
                  <CardTitle className="text-[var(--text-primary)]">Portfolio Performance</CardTitle>
                  <CardDescription>Cumulative returns over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={latestResult.dailyReturns}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="var(--text-secondary)"
                        tick={{ fill: 'var(--text-secondary)' }}
                      />
                      <YAxis 
                        stroke="var(--text-secondary)"
                        tick={{ fill: 'var(--text-secondary)' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'var(--dark-card)',
                          border: '1px solid var(--dark-border)',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="cumulativeReturn" 
                        stroke="var(--primary-blue)" 
                        strokeWidth={2}
                        name="Cumulative Return (%)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="portfolioValue" 
                        stroke="var(--accent-green)" 
                        strokeWidth={2}
                        name="Portfolio Value ($)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-4" />
                  <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No Backtest Results</h3>
                  <p className="text-[var(--text-secondary)]">Run a backtest to see performance results</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {latestResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trade Distribution */}
              <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardHeader>
                  <CardTitle className="text-[var(--text-primary)]">Trade Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Winning Trades', value: latestResult.winningTrades, fill: 'var(--accent-green)' },
                          { name: 'Losing Trades', value: latestResult.losingTrades, fill: 'var(--accent-red)' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Returns */}
              <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardHeader>
                  <CardTitle className="text-[var(--text-primary)]">Monthly Returns</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={latestResult.dailyReturns.slice(0, 12)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="var(--text-secondary)"
                        tick={{ fill: 'var(--text-secondary)' }}
                      />
                      <YAxis 
                        stroke="var(--text-secondary)"
                        tick={{ fill: 'var(--text-secondary)' }}
                      />
                      <Tooltip />
                      <Bar dataKey="dailyReturn" fill="var(--primary-blue)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <PieChartIcon className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-4" />
                  <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No Performance Data</h3>
                  <p className="text-[var(--text-secondary)]">Run a backtest to see detailed performance analysis</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trades" className="space-y-6">
          {latestResult?.trades ? (
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Trade History</CardTitle>
                <CardDescription>Detailed breakdown of all trades executed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--dark-border)]">
                          <th className="text-left py-2 text-[var(--text-secondary)]">Asset</th>
                          <th className="text-left py-2 text-[var(--text-secondary)]">Entry Date</th>
                          <th className="text-left py-2 text-[var(--text-secondary)]">Exit Date</th>
                          <th className="text-right py-2 text-[var(--text-secondary)]">Entry Price</th>
                          <th className="text-right py-2 text-[var(--text-secondary)]">Exit Price</th>
                          <th className="text-right py-2 text-[var(--text-secondary)]">Return</th>
                          <th className="text-right py-2 text-[var(--text-secondary)]">SSS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {latestResult.trades.slice(0, 10).map((trade) => (
                          <tr key={trade.id} className="border-b border-[var(--dark-border)]/50">
                            <td className="py-3 font-medium text-[var(--text-primary)]">{trade.asset}</td>
                            <td className="py-3 text-[var(--text-secondary)]">{new Date(trade.entryDate).toLocaleDateString()}</td>
                            <td className="py-3 text-[var(--text-secondary)]">{new Date(trade.exitDate).toLocaleDateString()}</td>
                            <td className="py-3 text-right text-[var(--text-secondary)]">${trade.entryPrice.toFixed(4)}</td>
                            <td className="py-3 text-right text-[var(--text-secondary)]">${trade.exitPrice.toFixed(4)}</td>
                            <td className={`py-3 text-right font-medium ${
                              trade.return >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {trade.return >= 0 ? '+' : ''}{trade.return.toFixed(2)}%
                            </td>
                            <td className="py-3 text-right text-[var(--text-secondary)]">{trade.sssAtEntry.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-4" />
                  <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No Trade Data</h3>
                  <p className="text-[var(--text-secondary)]">Run a backtest to see individual trade details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}