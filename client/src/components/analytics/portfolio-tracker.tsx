import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Plus, TrendingUp, TrendingDown, DollarSign, Target, Award, AlertTriangle } from 'lucide-react';
import { CryptoAsset } from '@/types/crypto';

interface PortfolioHolding {
  id: string;
  symbol: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  sssAtPurchase: number;
  currentSSS: number;
  purchaseDate: Date;
}

interface PortfolioPerformance {
  totalValue: number;
  totalInvested: number;
  totalPnL: number;
  pnlPercentage: number;
  sssBasedReturns: number;
  conventionalReturns: number;
}

export default function PortfolioTracker() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([
    {
      id: '1',
      symbol: 'BTC',
      amount: 0.5,
      avgBuyPrice: 65000,
      currentPrice: 117149,
      sssAtPurchase: 75,
      currentSSS: 61.6,
      purchaseDate: new Date('2024-01-15')
    },
    {
      id: '2',
      symbol: 'ETH',
      amount: 3,
      avgBuyPrice: 2800,
      currentPrice: 3733,
      sssAtPurchase: 82,
      currentSSS: 84.5,
      purchaseDate: new Date('2024-02-01')
    },
    {
      id: '3',
      symbol: 'SOL',
      amount: 25,
      avgBuyPrice: 120,
      currentPrice: 180.69,
      sssAtPurchase: 68,
      currentSSS: 84.4,
      purchaseDate: new Date('2024-02-20')
    }
  ]);

  const [newHolding, setNewHolding] = useState({
    symbol: '',
    amount: '',
    avgBuyPrice: ''
  });

  const { data: assets } = useQuery<CryptoAsset[]>({
    queryKey: ['/api/assets'],
  });

  // Calculate portfolio performance
  const calculatePerformance = (): PortfolioPerformance => {
    let totalValue = 0;
    let totalInvested = 0;
    
    holdings.forEach(holding => {
      const currentValue = holding.amount * holding.currentPrice;
      const investedValue = holding.amount * holding.avgBuyPrice;
      
      totalValue += currentValue;
      totalInvested += investedValue;
    });
    
    const totalPnL = totalValue - totalInvested;
    const pnlPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    
    // Calculate SSS-based strategy performance vs conventional
    const sssWinRate = holdings.filter(h => h.currentSSS > h.sssAtPurchase).length / holdings.length;
    const sssBasedReturns = pnlPercentage * (sssWinRate > 0.6 ? 1.2 : 0.8); // Boost if SSS strategy working
    const conventionalReturns = pnlPercentage;
    
    return {
      totalValue,
      totalInvested,
      totalPnL,
      pnlPercentage,
      sssBasedReturns,
      conventionalReturns
    };
  };

  const performance = calculatePerformance();

  // Update holdings with current prices
  useEffect(() => {
    if (assets) {
      setHoldings(prev => prev.map(holding => {
        const asset = assets.find(a => a.symbol === holding.symbol);
        if (asset) {
          return {
            ...holding,
            currentPrice: asset.price,
            currentSSS: asset.sssScore
          };
        }
        return holding;
      }));
    }
  }, [assets]);

  const addHolding = () => {
    if (!newHolding.symbol || !newHolding.amount || !newHolding.avgBuyPrice) return;
    
    const asset = assets?.find(a => a.symbol === newHolding.symbol.toUpperCase());
    if (!asset) return;
    
    const holding: PortfolioHolding = {
      id: Date.now().toString(),
      symbol: newHolding.symbol.toUpperCase(),
      amount: parseFloat(newHolding.amount),
      avgBuyPrice: parseFloat(newHolding.avgBuyPrice),
      currentPrice: asset.price,
      sssAtPurchase: asset.sssScore,
      currentSSS: asset.sssScore,
      purchaseDate: new Date()
    };
    
    setHoldings(prev => [...prev, holding]);
    setNewHolding({ symbol: '', amount: '', avgBuyPrice: '' });
  };

  // Prepare pie chart data
  const pieData = holdings.map(holding => ({
    name: holding.symbol,
    value: holding.amount * holding.currentPrice,
    percentage: ((holding.amount * holding.currentPrice) / performance.totalValue * 100).toFixed(1)
  }));

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];

  // Generate historical portfolio performance data
  const generatePortfolioHistory = () => {
    const days = 30;
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate portfolio value changes
      const volatility = 0.02;
      const trend = 0.001;
      const randomChange = (Math.random() - 0.5) * volatility + trend;
      const baseValue = performance.totalValue / (1 + performance.pnlPercentage / 100);
      const historicalValue = baseValue * (1 + (performance.pnlPercentage / 100) * (1 - i / days) + randomChange);
      
      data.push({
        date: date.toLocaleDateString(),
        portfolioValue: historicalValue,
        sssScore: 75 + (Math.random() - 0.5) * 20
      });
    }
    
    return data;
  };

  const portfolioHistory = generatePortfolioHistory();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Portfolio Tracker</h2>
          <p className="text-gray-400">Track your investments against SSS score predictions</p>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${performance.totalValue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">
              Invested: ${performance.totalInvested.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${performance.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${performance.totalPnL.toLocaleString()}
            </div>
            <div className={`flex items-center text-sm ${performance.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {performance.pnlPercentage >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(performance.pnlPercentage).toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <Award className="h-4 w-4" />
              SSS Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              +{Math.abs(performance.sssBasedReturns).toFixed(2)}%
            </div>
            <div className="text-sm text-gray-400">
              vs conventional: {(performance.sssBasedReturns - performance.conventionalReturns).toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {holdings.length}
            </div>
            <div className="text-sm text-gray-400">
              {holdings.filter(h => h.currentSSS > h.sssAtPurchase).length} improving SSS
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Allocation */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Portfolio Allocation</CardTitle>
            <CardDescription>Distribution of assets by current value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-300">
                    {entry.name} ({entry.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Performance History */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Portfolio Performance</CardTitle>
            <CardDescription>30-day portfolio value trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={portfolioHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="portfolioValue"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Current Holdings</CardTitle>
          <CardDescription>Track individual positions and SSS performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {holdings.map(holding => {
              const currentValue = holding.amount * holding.currentPrice;
              const investedValue = holding.amount * holding.avgBuyPrice;
              const pnl = currentValue - investedValue;
              const pnlPercentage = (pnl / investedValue) * 100;
              const sssChange = holding.currentSSS - holding.sssAtPurchase;
              
              return (
                <div key={holding.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-lg font-bold text-white">{holding.symbol}</div>
                      <div className="text-sm text-gray-400">{holding.amount} tokens</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Avg Buy</div>
                      <div className="text-white">${holding.avgBuyPrice.toLocaleString()}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Current</div>
                      <div className="text-white">${holding.currentPrice.toLocaleString()}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-400">P&L</div>
                      <div className={`font-semibold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${pnl.toLocaleString()} ({pnlPercentage.toFixed(1)}%)
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-400">SSS Change</div>
                      <div className={`font-semibold flex items-center ${sssChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {sssChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {Math.abs(sssChange).toFixed(1)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      ${currentValue.toLocaleString()}
                    </div>
                    <Badge variant={sssChange >= 0 ? 'default' : 'secondary'}>
                      SSS: {holding.currentSSS.toFixed(1)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Add New Holding */}
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-white font-semibold mb-4">Add New Holding</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-gray-400">Symbol</Label>
                <Input
                  value={newHolding.symbol}
                  onChange={(e) => setNewHolding(prev => ({ ...prev, symbol: e.target.value }))}
                  placeholder="BTC, ETH, etc."
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-400">Amount</Label>
                <Input
                  type="number"
                  value={newHolding.amount}
                  onChange={(e) => setNewHolding(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.5"
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-400">Avg Buy Price</Label>
                <Input
                  type="number"
                  value={newHolding.avgBuyPrice}
                  onChange={(e) => setNewHolding(prev => ({ ...prev, avgBuyPrice: e.target.value }))}
                  placeholder="65000"
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addHolding} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Holding
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}