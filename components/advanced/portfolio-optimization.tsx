import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Zap,
  Shield,
  DollarSign,
  RefreshCw,
  Settings,
  Brain
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  expectedReturn: number;
  risk: number;
  sharpeRatio: number;
  allocation: { [key: string]: number };
}

interface PortfolioMetrics {
  currentValue: number;
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  diversificationScore: number;
}

export default function PortfolioOptimization() {
  const [optimizationGoal, setOptimizationGoal] = useState('balanced');
  const [riskTolerance, setRiskTolerance] = useState(50);
  const [investmentHorizon, setInvestmentHorizon] = useState('medium');
  const [rebalanceFrequency, setRebalanceFrequency] = useState('monthly');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizationStrategies: OptimizationStrategy[] = [
    {
      id: 'conservative',
      name: 'Conservative Growth',
      description: 'Low risk, steady returns',
      expectedReturn: 12.5,
      risk: 15.2,
      sharpeRatio: 0.82,
      allocation: { BTC: 40, ETH: 30, ADA: 15, LINK: 10, DOT: 5 }
    },
    {
      id: 'balanced',
      name: 'Balanced Portfolio',
      description: 'Optimal risk-return balance',
      expectedReturn: 18.7,
      risk: 22.3,
      sharpeRatio: 0.84,
      allocation: { BTC: 30, ETH: 25, SOL: 20, ADA: 12, LINK: 8, AVAX: 5 }
    },
    {
      id: 'aggressive',
      name: 'High Growth',
      description: 'Maximum returns, higher risk',
      expectedReturn: 28.4,
      risk: 35.7,
      sharpeRatio: 0.80,
      allocation: { SOL: 25, ETH: 25, NEAR: 20, AVAX: 15, LINK: 10, DOT: 5 }
    }
  ];

  const currentMetrics: PortfolioMetrics = {
    currentValue: 87420,
    expectedReturn: 22.3,
    volatility: 28.5,
    sharpeRatio: 0.78,
    maxDrawdown: 18.2,
    diversificationScore: 72
  };

  const performanceData = [
    { month: 'Jan', current: 100, optimized: 100 },
    { month: 'Feb', current: 108, optimized: 112 },
    { month: 'Mar', current: 98, optimized: 105 },
    { month: 'Apr', current: 115, optimized: 125 },
    { month: 'May', current: 122, optimized: 138 },
    { month: 'Jun', current: 118, optimized: 142 }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const runOptimization = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
    }, 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Portfolio Optimization</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            AI-powered portfolio allocation and rebalancing
          </p>
        </div>
        <Button onClick={runOptimization} disabled={isOptimizing} className="bg-[var(--primary-blue)]">
          {isOptimizing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Optimize Portfolio
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="strategies" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="strategies">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {optimizationStrategies.map((strategy) => (
              <Card key={strategy.id} className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[var(--text-primary)]">{strategy.name}</CardTitle>
                    <Badge className="bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]">
                      Sharpe: {strategy.sharpeRatio}
                    </Badge>
                  </div>
                  <CardDescription>{strategy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Expected Return */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">Expected Return</span>
                      <span className="text-lg font-semibold text-green-400">
                        +{strategy.expectedReturn}%
                      </span>
                    </div>

                    {/* Risk Level */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--text-secondary)]">Risk Level</span>
                        <span className="text-sm text-[var(--text-primary)]">{strategy.risk}%</span>
                      </div>
                      <Progress value={strategy.risk} className="h-2" />
                    </div>

                    {/* Top Allocations */}
                    <div className="space-y-2">
                      <p className="text-sm text-[var(--text-secondary)]">Top Allocations</p>
                      {Object.entries(strategy.allocation)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 3)
                        .map(([asset, percentage]) => (
                          <div key={asset} className="flex items-center justify-between text-sm">
                            <span className="text-[var(--text-primary)]">{asset}</span>
                            <span className="text-[var(--text-secondary)]">{percentage}%</span>
                          </div>
                        ))}
                    </div>

                    <Button 
                      className="w-full mt-4" 
                      variant={strategy.id === 'balanced' ? 'default' : 'outline'}
                    >
                      {strategy.id === 'balanced' ? 'Current Strategy' : 'Apply Strategy'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="current">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Metrics */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Portfolio Metrics</CardTitle>
                <CardDescription>Current portfolio performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-[var(--dark-panel)] rounded-lg">
                    <DollarSign className="h-6 w-6 text-[var(--primary-blue)] mx-auto mb-2" />
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      ${currentMetrics.currentValue.toLocaleString()}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">Portfolio Value</p>
                  </div>
                  
                  <div className="text-center p-4 bg-[var(--dark-panel)] rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-400">
                      +{currentMetrics.expectedReturn}%
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">Expected Return</p>
                  </div>
                  
                  <div className="text-center p-4 bg-[var(--dark-panel)] rounded-lg">
                    <Shield className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {currentMetrics.volatility}%
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">Volatility</p>
                  </div>
                  
                  <div className="text-center p-4 bg-[var(--dark-panel)] rounded-lg">
                    <Target className="h-6 w-6 text-[var(--primary-blue)] mx-auto mb-2" />
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {currentMetrics.sharpeRatio}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">Sharpe Ratio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Allocation */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Current Allocation</CardTitle>
                <CardDescription>Asset distribution breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={Object.entries(optimizationStrategies[1].allocation).map(([asset, value]) => ({
                        name: asset,
                        value
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {Object.entries(optimizationStrategies[1].allocation).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <div className="space-y-6">
            {/* Performance Comparison Chart */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Performance Comparison</CardTitle>
                <CardDescription>Current vs optimized portfolio performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="current" 
                      stroke="#9CA3AF" 
                      strokeWidth={2} 
                      name="Current Portfolio"
                      strokeDasharray="5 5"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="optimized" 
                      stroke="#3B82F6" 
                      strokeWidth={2} 
                      name="Optimized Portfolio"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Optimization Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardContent className="p-6">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-400">+4.2%</p>
                    <p className="text-sm text-[var(--text-secondary)]">Additional Return</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-400">-6.3%</p>
                    <p className="text-sm text-[var(--text-secondary)]">Risk Reduction</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-400">+0.06</p>
                    <p className="text-sm text-[var(--text-secondary)]">Sharpe Improvement</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Optimization Settings</CardTitle>
              <CardDescription>Configure optimization parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Optimization Goal</Label>
                    <select 
                      value={optimizationGoal}
                      onChange={(e) => setOptimizationGoal(e.target.value)}
                      className="w-full p-2 bg-[var(--dark-input)] border border-[var(--dark-border)] rounded-md text-[var(--text-primary)]"
                    >
                      <option value="conservative">Conservative Growth</option>
                      <option value="balanced">Balanced Portfolio</option>
                      <option value="aggressive">Aggressive Growth</option>
                      <option value="income">Income Focused</option>
                    </select>
                  </div>

                  <div>
                    <Label>Investment Horizon</Label>
                    <select 
                      value={investmentHorizon}
                      onChange={(e) => setInvestmentHorizon(e.target.value)}
                      className="w-full p-2 bg-[var(--dark-input)] border border-[var(--dark-border)] rounded-md text-[var(--text-primary)]"
                    >
                      <option value="short">Short Term (&lt; 1 year)</option>
                      <option value="medium">Medium Term (1-3 years)</option>
                      <option value="long">Long Term (&gt; 3 years)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Risk Tolerance: {riskTolerance}%</Label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={riskTolerance}
                      onChange={(e) => setRiskTolerance(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label>Rebalance Frequency</Label>
                    <select 
                      value={rebalanceFrequency}
                      onChange={(e) => setRebalanceFrequency(e.target.value)}
                      className="w-full p-2 bg-[var(--dark-input)] border border-[var(--dark-border)] rounded-md text-[var(--text-primary)]"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="manual">Manual Only</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-6">
                <Settings className="w-4 h-4 mr-2" />
                Save Optimization Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}