import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface TradingSignal {
  id: string;
  asset: string;
  type: 'buy' | 'sell' | 'hold';
  strength: number;
  confidence: number;
  price: number;
  targetPrice: number;
  stopLoss: number;
  timeframe: string;
  reason: string;
  sssScore: number;
  timestamp: string;
  status: 'active' | 'executed' | 'expired';
}

interface SignalPerformance {
  accuracy: number;
  profitability: number;
  avgReturn: number;
  winRate: number;
  totalSignals: number;
}

export default function TradingSignals() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');

  const mockSignals: TradingSignal[] = [
    {
      id: '1',
      asset: 'SOL',
      type: 'buy',
      strength: 92,
      confidence: 88,
      price: 186.83,
      targetPrice: 215.00,
      stopLoss: 170.00,
      timeframe: '4h',
      reason: 'SSS breakout above 80 + volume surge',
      sssScore: 82.6,
      timestamp: '10 min ago',
      status: 'active'
    },
    {
      id: '2',
      asset: 'ETH',
      type: 'buy',
      strength: 78,
      confidence: 82,
      price: 3758.13,
      targetPrice: 4200.00,
      stopLoss: 3500.00,
      timeframe: '1d',
      reason: 'Strong anchor pressure + bullish sentiment',
      sssScore: 76.7,
      timestamp: '25 min ago',
      status: 'active'
    },
    {
      id: '3',
      asset: 'BTC',
      type: 'hold',
      strength: 65,
      confidence: 70,
      price: 117491.00,
      targetPrice: 125000.00,
      stopLoss: 110000.00,
      timeframe: '1w',
      reason: 'Consolidation phase, await breakout',
      sssScore: 63.1,
      timestamp: '1 hour ago',
      status: 'active'
    },
    {
      id: '4',
      asset: 'ADA',
      type: 'sell',
      strength: 71,
      confidence: 75,
      price: 0.82,
      targetPrice: 0.75,
      stopLoss: 0.85,
      timeframe: '2h',
      reason: 'Weakening momentum indicators',
      sssScore: 61.3,
      timestamp: '2 hours ago',
      status: 'executed'
    }
  ];

  const signalPerformance: SignalPerformance = {
    accuracy: 84.2,
    profitability: 76.8,
    avgReturn: 12.4,
    winRate: 78.5,
    totalSignals: 247
  };

  const performanceData = [
    { date: 'Jan', accuracy: 82, signals: 28 },
    { date: 'Feb', accuracy: 85, signals: 32 },
    { date: 'Mar', accuracy: 78, signals: 41 },
    { date: 'Apr', accuracy: 89, signals: 35 },
    { date: 'May', accuracy: 84, signals: 38 },
    { date: 'Jun', accuracy: 87, signals: 42 }
  ];

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'buy': return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'sell': return <TrendingDown className="w-5 h-5 text-red-400" />;
      case 'hold': return <Target className="w-5 h-5 text-yellow-400" />;
      default: return <Activity className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'buy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'sell': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'hold': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertCircle className="w-4 h-4 text-blue-400" />;
      case 'executed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'expired': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Trading Signals</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            AI-powered trading signals based on Silent Surge Score analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-400/10 text-green-400 border-green-400/20">
            {signalPerformance.accuracy}% Accuracy
          </Badge>
          <Badge className="bg-blue-400/10 text-blue-400 border-blue-400/20">
            {signalPerformance.totalSignals} Total Signals
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="signals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="signals">Active Signals</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="history">Signal History</TabsTrigger>
        </TabsList>

        <TabsContent value="signals">
          <div className="space-y-4">
            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Win Rate</p>
                      <p className="text-2xl font-bold text-green-400">{signalPerformance.winRate}%</p>
                    </div>
                    <Star className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Avg Return</p>
                      <p className="text-2xl font-bold text-[var(--text-primary)]">+{signalPerformance.avgReturn}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-[var(--primary-blue)]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Profitability</p>
                      <p className="text-2xl font-bold text-yellow-400">{signalPerformance.profitability}%</p>
                    </div>
                    <Zap className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Active Signals</p>
                      <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {mockSignals.filter(s => s.status === 'active').length}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-[var(--primary-blue)]" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Signals List */}
            {mockSignals.map((signal) => (
              <Card key={signal.id} className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getSignalIcon(signal.type)}
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                            {signal.asset} {signal.type.toUpperCase()}
                          </h3>
                          <p className="text-sm text-[var(--text-secondary)]">{signal.timeframe} • {signal.timestamp}</p>
                        </div>
                        <Badge className={getSignalColor(signal.type)}>
                          {signal.type.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(signal.status)}
                          <span className="text-xs text-[var(--text-secondary)] capitalize">{signal.status}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-[var(--text-secondary)]">Current Price</p>
                          <p className="text-sm font-medium text-[var(--text-primary)]">${signal.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-secondary)]">Target</p>
                          <p className="text-sm font-medium text-green-400">${signal.targetPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-secondary)]">Stop Loss</p>
                          <p className="text-sm font-medium text-red-400">${signal.stopLoss.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-secondary)]">SSS Score</p>
                          <p className="text-sm font-medium text-[var(--primary-blue)]">{signal.sssScore}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[var(--text-secondary)]">Signal Strength</span>
                          <span className="text-sm text-[var(--text-primary)]">{signal.strength}%</span>
                        </div>
                        <Progress value={signal.strength} className="h-2" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[var(--text-secondary)]">Confidence</span>
                          <span className="text-sm text-[var(--text-primary)]">{signal.confidence}%</span>
                        </div>
                        <Progress value={signal.confidence} className="h-2" />
                      </div>

                      <p className="text-sm text-[var(--text-secondary)] bg-[var(--dark-panel)] p-3 rounded-lg">
                        <strong>Reason:</strong> {signal.reason}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" className="bg-[var(--primary-blue)]">
                        Execute
                      </Button>
                      <Button size="sm" variant="outline">
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="space-y-6">
            {/* Performance Chart */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Signal Accuracy Over Time</CardTitle>
                <CardDescription>Monthly performance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#3B82F6" 
                      fill="url(#accuracyGradient)" 
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardHeader>
                  <CardTitle className="text-[var(--text-primary)]">Signal Types Performance</CardTitle>
                  <CardDescription>Accuracy by signal type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: 'Buy Signals', accuracy: 86, count: 145, color: 'text-green-400' },
                      { type: 'Sell Signals', accuracy: 82, count: 78, color: 'text-red-400' },
                      { type: 'Hold Signals', accuracy: 84, count: 24, color: 'text-yellow-400' }
                    ].map((item) => (
                      <div key={item.type} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-primary)] font-medium">{item.type}</span>
                          <span className={item.color}>{item.accuracy}% ({item.count} signals)</span>
                        </div>
                        <Progress value={item.accuracy} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardHeader>
                  <CardTitle className="text-[var(--text-primary)]">Risk-Adjusted Returns</CardTitle>
                  <CardDescription>Performance metrics breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { metric: 'Sharpe Ratio', value: '1.42', trend: '+0.08' },
                      { metric: 'Max Drawdown', value: '-12.3%', trend: '+2.1%' },
                      { metric: 'Profit Factor', value: '2.15', trend: '+0.22' },
                      { metric: 'Avg Trade Duration', value: '3.2 days', trend: '-0.5d' }
                    ].map((item) => (
                      <div key={item.metric} className="flex items-center justify-between p-3 bg-[var(--dark-panel)] rounded-lg">
                        <div>
                          <p className="text-[var(--text-primary)] font-medium">{item.metric}</p>
                          <p className="text-sm text-[var(--text-secondary)]">{item.value}</p>
                        </div>
                        <span className={`text-sm ${item.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {item.trend}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Signal History</CardTitle>
              <CardDescription>Recent signal outcomes and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { asset: 'SOL', type: 'buy', entry: 165.50, exit: 186.80, return: '+12.9%', date: '3 days ago', status: 'closed' },
                  { asset: 'ETH', type: 'buy', entry: 3420.00, exit: 3758.00, return: '+9.9%', date: '5 days ago', status: 'closed' },
                  { asset: 'BTC', type: 'sell', entry: 120500.00, exit: 117400.00, return: '+2.6%', date: '1 week ago', status: 'closed' },
                  { asset: 'ADA', type: 'buy', entry: 0.75, exit: 0.72, return: '-4.0%', date: '1 week ago', status: 'stopped' }
                ].map((trade, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[var(--dark-panel)] rounded-lg">
                    <div className="flex items-center gap-4">
                      {getSignalIcon(trade.type)}
                      <div>
                        <p className="text-[var(--text-primary)] font-medium">
                          {trade.asset} {trade.type.toUpperCase()}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Entry: ${trade.entry.toLocaleString()} → Exit: ${trade.exit.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${trade.return.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.return}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">{trade.date}</p>
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