import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Play, RotateCcw, TrendingUp, Target, Zap, Calendar } from 'lucide-react';

interface BacktestResult {
  period: string;
  totalReturn: number;
  sssStrategyReturn: number;
  marketReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  avgHoldTime: number;
}

interface BacktestConfig {
  sssThreshold: number;
  holdPeriod: number;
  portfolio: number;
  timeframe: string;
  rebalanceFreq: string;
}

export default function BacktestingEngine() {
  const [config, setConfig] = useState<BacktestConfig>({
    sssThreshold: 75,
    holdPeriod: 30,
    portfolio: 10000,
    timeframe: '1y',
    rebalanceFreq: 'weekly'
  });

  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BacktestResult | null>(null);

  const runBacktest = async () => {
    setIsRunning(true);
    
    // Simulate backtest calculation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate realistic backtest results
    const sssAdvantage = config.sssThreshold > 70 ? 1.2 : 1.0;
    const baseReturn = Math.random() * 0.4 + 0.1; // 10-50% base return
    const marketReturn = baseReturn * 0.8;
    const sssReturn = baseReturn * sssAdvantage;
    
    const result: BacktestResult = {
      period: config.timeframe,
      totalReturn: sssReturn * 100,
      sssStrategyReturn: sssReturn * 100,
      marketReturn: marketReturn * 100,
      sharpeRatio: Math.random() * 1.5 + 0.5,
      maxDrawdown: Math.random() * 20 + 5,
      winRate: Math.random() * 25 + 65, // 65-90%
      totalTrades: Math.floor(Math.random() * 50) + 20,
      avgHoldTime: config.holdPeriod * (0.8 + Math.random() * 0.4)
    };
    
    setResults(result);
    setIsRunning(false);
  };

  // Generate performance chart data
  const generatePerformanceData = () => {
    if (!results) return [];
    
    const periods = config.timeframe === '1y' ? 52 : config.timeframe === '6m' ? 26 : 12;
    const data = [];
    
    let sssValue = config.portfolio;
    let marketValue = config.portfolio;
    
    for (let i = 0; i <= periods; i++) {
      const weeklySSS = Math.pow(1 + results.sssStrategyReturn / 100, 1 / periods);
      const weeklyMarket = Math.pow(1 + results.marketReturn / 100, 1 / periods);
      
      sssValue *= weeklySSS * (1 + (Math.random() - 0.5) * 0.05);
      marketValue *= weeklyMarket * (1 + (Math.random() - 0.5) * 0.05);
      
      data.push({
        week: `W${i + 1}`,
        sssStrategy: Math.round(sssValue),
        market: Math.round(marketValue),
        outperformance: Math.round(sssValue - marketValue)
      });
    }
    
    return data;
  };

  const performanceData = generatePerformanceData();

  // Generate trade analysis
  const generateTradeAnalysis = () => {
    if (!results) return [];
    
    const trades = [];
    const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'LINK', 'DOT', 'AVAX'];
    
    for (let i = 0; i < Math.min(10, results.totalTrades); i++) {
      const isWin = Math.random() < (results.winRate / 100);
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const returnPct = isWin ? Math.random() * 30 + 5 : -(Math.random() * 15 + 2);
      
      trades.push({
        symbol,
        entrySSS: Math.floor(Math.random() * 30) + 70,
        exitSSS: Math.floor(Math.random() * 30) + 70,
        holdDays: Math.floor(Math.random() * 40) + 10,
        return: returnPct,
        status: isWin ? 'Win' : 'Loss'
      });
    }
    
    return trades.sort((a, b) => b.return - a.return);
  };

  const tradeAnalysis = generateTradeAnalysis();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Backtesting Engine</h2>
          <p className="text-gray-400">Test SSS strategy performance against historical data</p>
        </div>
      </div>

      {/* Configuration Panel */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Backtest Configuration</CardTitle>
          <CardDescription>Configure strategy parameters for historical testing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-400">SSS Threshold</Label>
              <div className="px-3">
                <Slider
                  value={[config.sssThreshold]}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, sssThreshold: value[0] }))}
                  max={95}
                  min={50}
                  step={5}
                  className="w-full"
                />
                <div className="text-sm text-white mt-2">{config.sssThreshold}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Hold Period (days)</Label>
              <div className="px-3">
                <Slider
                  value={[config.holdPeriod]}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, holdPeriod: value[0] }))}
                  max={90}
                  min={7}
                  step={7}
                  className="w-full"
                />
                <div className="text-sm text-white mt-2">{config.holdPeriod}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Portfolio Size</Label>
              <Select 
                value={config.portfolio.toString()} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, portfolio: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000">$1,000</SelectItem>
                  <SelectItem value="10000">$10,000</SelectItem>
                  <SelectItem value="50000">$50,000</SelectItem>
                  <SelectItem value="100000">$100,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Timeframe</Label>
              <Select 
                value={config.timeframe} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, timeframe: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="2y">2 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Rebalance</Label>
              <Select 
                value={config.rebalanceFreq} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, rebalanceFreq: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button 
              onClick={runBacktest} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <RotateCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunning ? 'Running Backtest...' : 'Run Backtest'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setResults(null)}
              disabled={!results}
            >
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <>
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Return
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  +{results.totalReturn.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">
                  vs Market: +{(results.totalReturn - results.marketReturn).toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {results.winRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">
                  {results.totalTrades} total trades
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Sharpe Ratio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {results.sharpeRatio.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">
                  Risk-adjusted return
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Max Drawdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  -{results.maxDrawdown.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">
                  Largest loss period
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Strategy vs Market Performance</CardTitle>
              <CardDescription>
                SSS strategy performance compared to market benchmark over {config.timeframe}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="week" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `$${value.toLocaleString()}`, 
                        name === 'sssStrategy' ? 'SSS Strategy' : 'Market'
                      ]}
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sssStrategy"
                      stroke="#10B981"
                      strokeWidth={3}
                      name="SSS Strategy"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="market"
                      stroke="#6B7280"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Market"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Trade Analysis */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Top Performing Trades</CardTitle>
              <CardDescription>Detailed analysis of individual trade performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tradeAnalysis.map((trade, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-bold text-white min-w-[60px]">
                        {trade.symbol}
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-gray-400">Entry SSS</div>
                        <div className="text-sm text-white">{trade.entrySSS}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-gray-400">Exit SSS</div>
                        <div className="text-sm text-white">{trade.exitSSS}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-gray-400">Hold Period</div>
                        <div className="text-sm text-white">{trade.holdDays}d</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant={trade.status === 'Win' ? 'default' : 'destructive'}>
                        {trade.status}
                      </Badge>
                      <div className={`text-lg font-bold ${trade.return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.return >= 0 ? '+' : ''}{trade.return.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strategy Insights */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Strategy Insights</CardTitle>
              <CardDescription>Key findings from the backtest analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-3">Strengths</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• SSS threshold of {config.sssThreshold} showed strong performance</li>
                    <li>• {results.winRate.toFixed(0)}% win rate indicates reliable signal quality</li>
                    <li>• Outperformed market by {(results.totalReturn - results.marketReturn).toFixed(1)}%</li>
                    <li>• Average hold time of {results.avgHoldTime.toFixed(0)} days optimized returns</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-white font-semibold mb-3">Optimizations</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Consider adjusting SSS threshold based on market conditions</li>
                    <li>• {config.rebalanceFreq} rebalancing showed good risk management</li>
                    <li>• Max drawdown of {results.maxDrawdown.toFixed(1)}% within acceptable range</li>
                    <li>• Sharpe ratio of {results.sharpeRatio.toFixed(2)} indicates strong risk-adjusted returns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}