'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Eye,
  Star,
  AlertTriangle,
  BarChart3,
  Activity,
  Target,
  Radar
} from 'lucide-react';

interface ScanResult {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  sssScore: number;
  scanReason: string;
  anomalyType: string;
  strength: number;
  timeDetected: string;
}

interface ScanFilter {
  minSSS: number;
  maxSSS: number;
  minMarketCap: number;
  maxMarketCap: number;
  volumeThreshold: number;
  anomalyTypes: string[];
  timeframes: string[];
}

export default function MarketScanner() {
  const [scanResults, setScanResults] = useState<ScanResult[]>([
    {
      id: '1',
      symbol: 'LUNA',
      name: 'Terra Luna Classic',
      price: 0.000089,
      change24h: 45.2,
      volume24h: 2580000,
      marketCap: 5200000,
      sssScore: 91.5,
      scanReason: 'Extreme behavioral anomaly detected',
      anomalyType: 'Volume Surge',
      strength: 94,
      timeDetected: '3 min ago'
    },
    {
      id: '2',
      symbol: 'PEPE',
      name: 'Pepe Coin',
      price: 0.00001847,
      change24h: 28.7,
      volume24h: 1420000,
      marketCap: 7800000,
      sssScore: 87.3,
      scanReason: 'Silent accumulation + social spike',
      anomalyType: 'Silent Accumulation',
      strength: 89,
      timeDetected: '8 min ago'
    },
    {
      id: '3',
      symbol: 'SHIB',
      name: 'Shiba Inu',
      price: 0.00002241,
      change24h: 18.4,
      volume24h: 89000000,
      marketCap: 13200000000,
      sssScore: 82.7,
      scanReason: 'Whale accumulation pattern',
      anomalyType: 'Whale Activity',
      strength: 85,
      timeDetected: '15 min ago'
    },
    {
      id: '4',
      symbol: 'FLOKI',
      name: 'Floki Inu',
      price: 0.000198,
      change24h: 22.1,
      volume24h: 15600000,
      marketCap: 1890000000,
      sssScore: 79.2,
      scanReason: 'Community cohesion breakout',
      anomalyType: 'Social Momentum',
      strength: 82,
      timeDetected: '22 min ago'
    }
  ]);

  const [filters, setFilters] = useState<ScanFilter>({
    minSSS: 70,
    maxSSS: 100,
    minMarketCap: 1000000,
    maxMarketCap: 50000000000,
    volumeThreshold: 1000000,
    anomalyTypes: ['Volume Surge', 'Silent Accumulation', 'Whale Activity'],
    timeframes: ['5m', '15m', '1h']
  });

  const [isScanning, setIsScanning] = useState(false);

  const runScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Simulate finding new results
    }, 3000);
  };

  const getAnomalyColor = (type: string) => {
    switch (type) {
      case 'Volume Surge': return 'bg-red-100 text-red-800';
      case 'Silent Accumulation': return 'bg-blue-100 text-blue-800';
      case 'Whale Activity': return 'bg-purple-100 text-purple-800';
      case 'Social Momentum': return 'bg-green-100 text-green-800';
      case 'Price Breakout': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case 'Volume Surge': return <BarChart3 className="w-4 h-4" />;
      case 'Silent Accumulation': return <Eye className="w-4 h-4" />;
      case 'Whale Activity': return <TrendingUp className="w-4 h-4" />;
      case 'Social Momentum': return <Activity className="w-4 h-4" />;
      case 'Price Breakout': return <Zap className="w-4 h-4" />;
      default: return <Radar className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Market Scanner</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Real-time detection of market anomalies and opportunities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={runScan} disabled={isScanning} className="bg-[var(--primary-blue)]">
            {isScanning ? (
              <>
                <Radar className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Run Scan
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="results">Scan Results</TabsTrigger>
          <TabsTrigger value="filters">Scan Filters</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Assets Scanned</p>
                      <p className="text-2xl font-bold text-[var(--text-primary)]">2,847</p>
                    </div>
                    <Radar className="h-8 w-8 text-[var(--primary-blue)]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Anomalies Found</p>
                      <p className="text-2xl font-bold text-yellow-400">{scanResults.length}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">High SSS</p>
                      <p className="text-2xl font-bold text-green-400">
                        {scanResults.filter(r => r.sssScore >= 85).length}
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Last Scan</p>
                      <p className="text-2xl font-bold text-[var(--text-primary)]">2m ago</p>
                    </div>
                    <Activity className="h-8 w-8 text-[var(--primary-blue)]" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scan Results */}
            {scanResults.map((result) => (
              <Card key={result.id} className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getAnomalyIcon(result.anomalyType)}
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                            {result.symbol} - {result.name}
                          </h3>
                          <p className="text-sm text-[var(--text-secondary)]">
                            Detected {result.timeDetected}
                          </p>
                        </div>
                        <Badge className={`${getAnomalyColor(result.anomalyType)} border-0`}>
                          {result.anomalyType}
                        </Badge>
                        <Badge className="bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]">
                          SSS: {result.sssScore}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-[var(--text-secondary)]">Price</p>
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            ${result.price.toFixed(result.price < 1 ? 8 : 2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-secondary)]">24h Change</p>
                          <p className={`text-sm font-medium ${result.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {result.change24h >= 0 ? '+' : ''}{result.change24h.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-secondary)]">Volume</p>
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            ${(result.volume24h / 1000000).toFixed(1)}M
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-secondary)]">Market Cap</p>
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            ${(result.marketCap / 1000000).toFixed(1)}M
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-secondary)]">Strength</p>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{result.strength}%</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[var(--text-secondary)]">Anomaly Strength</span>
                          <span className="text-sm text-[var(--text-primary)]">{result.strength}%</span>
                        </div>
                        <Progress value={result.strength} className="h-2" />
                      </div>

                      <p className="text-sm text-[var(--text-secondary)] bg-[var(--dark-panel)] p-3 rounded-lg">
                        <strong>Detection Reason:</strong> {result.scanReason}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" className="bg-[var(--primary-blue)]">
                        <Target className="w-4 h-4 mr-1" />
                        Track
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Analyze
                      </Button>
                      <Button size="sm" variant="outline">
                        <Star className="w-4 h-4 mr-1" />
                        Watch
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="filters">
          <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Scan Configuration</CardTitle>
              <CardDescription>Configure detection parameters and filters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--text-primary)]">SSS Score Range</label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="number"
                        placeholder="Min SSS"
                        value={filters.minSSS}
                        onChange={(e) => setFilters(prev => ({ ...prev, minSSS: parseFloat(e.target.value) }))}
                        className="bg-[var(--dark-input)]"
                      />
                      <Input
                        type="number"
                        placeholder="Max SSS"
                        value={filters.maxSSS}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxSSS: parseFloat(e.target.value) }))}
                        className="bg-[var(--dark-input)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[var(--text-primary)]">Market Cap Range ($)</label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="number"
                        placeholder="Min Market Cap"
                        value={filters.minMarketCap}
                        onChange={(e) => setFilters(prev => ({ ...prev, minMarketCap: parseFloat(e.target.value) }))}
                        className="bg-[var(--dark-input)]"
                      />
                      <Input
                        type="number"
                        placeholder="Max Market Cap"
                        value={filters.maxMarketCap}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxMarketCap: parseFloat(e.target.value) }))}
                        className="bg-[var(--dark-input)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[var(--text-primary)]">Minimum Volume Threshold</label>
                    <Input
                      type="number"
                      placeholder="Min 24h Volume"
                      value={filters.volumeThreshold}
                      onChange={(e) => setFilters(prev => ({ ...prev, volumeThreshold: parseFloat(e.target.value) }))}
                      className="bg-[var(--dark-input)] mt-2"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--text-primary)]">Anomaly Types</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['Volume Surge', 'Silent Accumulation', 'Whale Activity', 'Social Momentum', 'Price Breakout', 'Pattern Recognition'].map((type) => (
                        <label key={type} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={filters.anomalyTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(prev => ({ ...prev, anomalyTypes: [...prev.anomalyTypes, type] }));
                              } else {
                                setFilters(prev => ({ ...prev, anomalyTypes: prev.anomalyTypes.filter(t => t !== type) }));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm text-[var(--text-secondary)]">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[var(--text-primary)]">Scan Timeframes</label>
                    <div className="flex gap-2 mt-2">
                      {['1m', '5m', '15m', '1h', '4h', '1d'].map((timeframe) => (
                        <Button
                          key={timeframe}
                          size="sm"
                          variant={filters.timeframes.includes(timeframe) ? "default" : "outline"}
                          onClick={() => {
                            if (filters.timeframes.includes(timeframe)) {
                              setFilters(prev => ({ ...prev, timeframes: prev.timeframes.filter(t => t !== timeframe) }));
                            } else {
                              setFilters(prev => ({ ...prev, timeframes: [...prev.timeframes, timeframe] }));
                            }
                          }}
                        >
                          {timeframe}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-6">
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters & Run Scan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Anomaly Distribution</CardTitle>
                <CardDescription>Types of market anomalies detected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Volume Surge', count: 12, percentage: 35.3 },
                    { type: 'Silent Accumulation', count: 8, percentage: 23.5 },
                    { type: 'Whale Activity', count: 7, percentage: 20.6 },
                    { type: 'Social Momentum', count: 4, percentage: 11.8 },
                    { type: 'Price Breakout', count: 3, percentage: 8.8 }
                  ].map((item) => (
                    <div key={item.type} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-primary)] font-medium">{item.type}</span>
                        <span className="text-[var(--text-secondary)]">{item.count} ({item.percentage}%)</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Scanner Performance</CardTitle>
                <CardDescription>Detection accuracy and success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-400">87.3%</p>
                    <p className="text-sm text-[var(--text-secondary)]">Overall Accuracy</p>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { metric: 'True Positives', value: '89.2%', color: 'text-green-400' },
                      { metric: 'False Positives', value: '10.8%', color: 'text-red-400' },
                      { metric: 'Avg Detection Time', value: '3.2 min', color: 'text-[var(--text-primary)]' },
                      { metric: 'Success Rate', value: '84.7%', color: 'text-[var(--primary-blue)]' }
                    ].map((item) => (
                      <div key={item.metric} className="flex items-center justify-between">
                        <span className="text-[var(--text-secondary)]">{item.metric}</span>
                        <span className={`font-medium ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}