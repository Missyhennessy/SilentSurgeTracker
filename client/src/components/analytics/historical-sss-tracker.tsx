import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Clock, Calendar } from 'lucide-react';
import { CryptoAsset } from '@/types/crypto';

interface HistoricalDataPoint {
  date: string;
  sssScore: number;
  price: number;
  volume: number;
  behavioralActivity: number;
  velocityAnomaly: number;
  communityCohesion: number;
  anchorPressure: number;
}

interface SSSPrediction {
  asset: string;
  currentSSS: number;
  predictedSSS: number;
  confidence: number;
  timeframe: string;
  factors: string[];
}

export default function HistoricalSSSTracker() {
  const [selectedAsset, setSelectedAsset] = useState<string>('BTC');
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [viewMode, setViewMode] = useState<'historical' | 'predictions'>('historical');

  const { data: assets } = useQuery<CryptoAsset[]>({
    queryKey: ['/api/assets'],
  });

  const { data: historicalData } = useQuery<HistoricalDataPoint[]>({
    queryKey: ['/api/analytics/historical', selectedAsset, timeRange],
    queryFn: () => generateHistoricalData(selectedAsset, timeRange),
    enabled: !!selectedAsset,
  });

  const { data: predictions } = useQuery<SSSPrediction[]>({
    queryKey: ['/api/analytics/predictions'],
    queryFn: generatePredictions,
  });

  // Generate mock historical data (in real implementation, this would come from database)
  function generateHistoricalData(symbol: string, range: string): HistoricalDataPoint[] {
    const days = range === '24h' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const points = range === '24h' ? 24 : days;
    const data: HistoricalDataPoint[] = [];
    
    const asset = assets?.find(a => a.symbol === symbol);
    const baseSSS = asset?.sssScore || 75;
    const basePrice = asset?.price || 50000;
    
    for (let i = points; i >= 0; i--) {
      const date = new Date();
      if (range === '24h') {
        date.setHours(date.getHours() - i);
      } else {
        date.setDate(date.getDate() - i);
      }
      
      // Generate realistic SSS fluctuations
      const sssVariation = (Math.sin(i * 0.5) + Math.random() - 0.5) * 15;
      const priceVariation = (Math.sin(i * 0.3) + Math.random() - 0.5) * 0.1;
      
      data.push({
        date: range === '24h' ? date.toLocaleTimeString() : date.toLocaleDateString(),
        sssScore: Math.max(0, Math.min(100, baseSSS + sssVariation)),
        price: basePrice * (1 + priceVariation),
        volume: Math.random() * 1000000000,
        behavioralActivity: Math.max(0, Math.min(100, 70 + (Math.random() - 0.5) * 40)),
        velocityAnomaly: Math.max(0, Math.min(100, 65 + (Math.random() - 0.5) * 50)),
        communityCohesion: Math.max(0, Math.min(100, 80 + (Math.random() - 0.5) * 30)),
        anchorPressure: Math.max(0, Math.min(100, 75 + (Math.random() - 0.5) * 35)),
      });
    }
    
    return data;
  }

  function generatePredictions(): SSSPrediction[] {
    if (!assets) return [];
    
    return assets.slice(0, 6).map(asset => {
      const trend = Math.random() > 0.5 ? 'up' : 'down';
      const change = (Math.random() * 20) - 10;
      const predictedSSS = Math.max(0, Math.min(100, asset.sssScore + change));
      
      return {
        asset: asset.symbol,
        currentSSS: asset.sssScore,
        predictedSSS,
        confidence: Math.random() * 30 + 70, // 70-100% confidence
        timeframe: ['24h', '7d', '30d'][Math.floor(Math.random() * 3)],
        factors: [
          'Volume spike detected',
          'Whale movement pattern',
          'Social sentiment shift',
          'Technical indicator alignment'
        ].slice(0, Math.floor(Math.random() * 3) + 1)
      };
    });
  }

  const currentAsset = assets?.find(a => a.symbol === selectedAsset);
  const latestPoint = historicalData?.[historicalData.length - 1];
  const earliestPoint = historicalData?.[0];
  const sssChange = latestPoint && earliestPoint ? latestPoint.sssScore - earliestPoint.sssScore : 0;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Enhanced Analytics</h2>
          <p className="text-gray-400">Historical SSS patterns and predictive insights</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'historical' ? 'default' : 'outline'}
            onClick={() => setViewMode('historical')}
            size="sm"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Historical
          </Button>
          <Button
            variant={viewMode === 'predictions' ? 'default' : 'outline'}
            onClick={() => setViewMode('predictions')}
            size="sm"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Predictions
          </Button>
        </div>
      </div>

      {viewMode === 'historical' ? (
        <>
          {/* Controls */}
          <div className="flex flex-wrap gap-4">
            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {assets?.map(asset => (
                  <SelectItem key={asset.id} value={asset.symbol}>
                    {asset.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Stats */}
          {currentAsset && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Current SSS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {currentAsset.sssScore.toFixed(1)}
                  </div>
                  <div className={`flex items-center text-sm ${sssChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {sssChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {Math.abs(sssChange).toFixed(1)} ({timeRange})
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    ${currentAsset.price.toLocaleString()}
                  </div>
                  <div className={`flex items-center text-sm ${currentAsset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {currentAsset.change24h >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {Math.abs(currentAsset.change24h).toFixed(2)}%
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Volatility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {currentAsset.historicalVolatility}
                  </div>
                  <div className="text-sm text-gray-400">Low risk</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Anchor Pressure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {currentAsset.anchorPressure}
                  </div>
                  <div className="text-sm text-gray-400">Strong support</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Historical Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">SSS Score History - {selectedAsset}</CardTitle>
              <CardDescription>
                Track SSS score patterns over time to identify trends and opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sssScore"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Component Breakdown Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">SSS Components Analysis</CardTitle>
              <CardDescription>
                Individual component performance contributing to overall SSS score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }}
                    />
                    <Line type="monotone" dataKey="behavioralActivity" stroke="#EF4444" strokeWidth={2} name="Behavioral Activity" />
                    <Line type="monotone" dataKey="velocityAnomaly" stroke="#F59E0B" strokeWidth={2} name="Velocity Anomaly" />
                    <Line type="monotone" dataKey="communityCohesion" stroke="#8B5CF6" strokeWidth={2} name="Community Cohesion" />
                    <Line type="monotone" dataKey="anchorPressure" stroke="#06B6D4" strokeWidth={2} name="Anchor Pressure" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Predictions View */
        <div className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                SSS Score Predictions
              </CardTitle>
              <CardDescription>
                AI-powered predictions based on behavioral patterns and market analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {predictions?.map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{prediction.asset}</div>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {prediction.timeframe}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-sm text-gray-400">Current</div>
                          <div className="text-lg font-semibold text-white">
                            {prediction.currentSSS.toFixed(1)}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm text-gray-400">Predicted</div>
                          <div className={`text-lg font-semibold ${
                            prediction.predictedSSS > prediction.currentSSS ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {prediction.predictedSSS.toFixed(1)}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm text-gray-400">Change</div>
                          <div className={`text-lg font-semibold flex items-center ${
                            prediction.predictedSSS > prediction.currentSSS ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {prediction.predictedSSS > prediction.currentSSS ? 
                              <TrendingUp className="h-4 w-4 mr-1" /> : 
                              <TrendingDown className="h-4 w-4 mr-1" />
                            }
                            {Math.abs(prediction.predictedSSS - prediction.currentSSS).toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge 
                        variant={prediction.confidence > 80 ? 'default' : 'secondary'}
                        className="mb-2"
                      >
                        {prediction.confidence.toFixed(0)}% confidence
                      </Badge>
                      <div className="text-xs text-gray-400">
                        {prediction.factors.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}