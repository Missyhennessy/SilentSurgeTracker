import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Download, Settings, BarChart3, TrendingUp, Target, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BacktestResult {
  date: string;
  asset: string;
  hybrid_score: number;
  momentum_score: number;
  volatility_score: number;
  confidence: number;
  dominant_regime: string;
  signal_strength: string;
  actual_price: number;
  volume: number;
}

interface BacktestPerformance {
  total_signals: number;
  strong_signals: number;
  strong_signal_ratio: number;
  regime_distribution: Record<string, number>;
  average_scores: {
    overall: number;
    momentum_regime: number;
    volatility_regime: number;
  };
  confidence_stats: {
    mean: number;
    median: number;
    std: number;
  };
}

export default function BacktestingEngine() {
  const [strategy, setStrategy] = useState("hybrid_regime");
  const [dateRange, setDateRange] = useState("30d");
  const [selectedAssets, setSelectedAssets] = useState(["GALA", "FLOKI", "PONKE"]);
  const [riskProfile, setRiskProfile] = useState("moderate");
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Demo backtest results
  const demoResults: BacktestResult[] = [
    {
      date: "2024-01-15",
      asset: "GALA",
      hybrid_score: 78.5,
      momentum_score: 82.3,
      volatility_score: 74.7,
      confidence: 0.73,
      dominant_regime: "momentum",
      signal_strength: "Strong",
      actual_price: 0.024,
      volume: 45200000
    },
    {
      date: "2024-01-16",
      asset: "FLOKI",
      hybrid_score: 71.2,
      momentum_score: 68.9,
      volatility_score: 73.5,
      confidence: 0.65,
      dominant_regime: "volatility",
      signal_strength: "Medium",
      actual_price: 0.000152,
      volume: 67100000
    }
  ];

  const demoPerformance: BacktestPerformance = {
    total_signals: 150,
    strong_signals: 89,
    strong_signal_ratio: 0.593,
    regime_distribution: {
      momentum: 92,
      volatility: 58
    },
    average_scores: {
      overall: 72.4,
      momentum_regime: 78.9,
      volatility_regime: 65.1
    },
    confidence_stats: {
      mean: 0.695,
      median: 0.72,
      std: 0.158
    }
  };

  const runBacktest = useMutation({
    mutationFn: async (params: any) => {
      // Simulate API call
      setIsRunning(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsRunning(false);
      return { results: demoResults, performance: demoPerformance };
    },
    onSuccess: () => {
      toast({
        title: "Backtest Complete",
        description: "Regime-aware strategy analysis finished successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Backtest Failed",
        description: "Error running backtest analysis",
        variant: "destructive",
      });
    }
  });

  const downloadResults = () => {
    const csvContent = [
      "Date,Asset,Hybrid_Score,Momentum_Score,Volatility_Score,Confidence,Regime,Signal",
      ...demoResults.map(r => 
        `${r.date},${r.asset},${r.hybrid_score},${r.momentum_score},${r.volatility_score},${r.confidence},${r.dominant_regime},${r.signal_strength}`
      )
    ].join("\\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'regime_backtest_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Advanced Backtesting Engine</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-900/30 rounded-full">
          <BarChart3 className="h-4 w-4 text-blue-400" />
          <span className="text-sm text-blue-400">Regime-Aware Testing</span>
        </div>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Strategy Setup</TabsTrigger>
          <TabsTrigger value="results">Backtest Results</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strategy">Strategy Type</Label>
              <Select value={strategy} onValueChange={setStrategy}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select Strategy" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="hybrid_regime" className="text-white">Hybrid Regime</SelectItem>
                  <SelectItem value="momentum_only" className="text-white">Momentum Only</SelectItem>
                  <SelectItem value="volatility_only" className="text-white">Volatility Only</SelectItem>
                  <SelectItem value="adaptive" className="text-white">Adaptive Mix</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select Range" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="7d" className="text-white">7 Days</SelectItem>
                  <SelectItem value="30d" className="text-white">30 Days</SelectItem>
                  <SelectItem value="90d" className="text-white">90 Days</SelectItem>
                  <SelectItem value="1y" className="text-white">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskProfile">Risk Profile</Label>
              <Select value={riskProfile} onValueChange={setRiskProfile}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select Risk" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="conservative" className="text-white">Conservative</SelectItem>
                  <SelectItem value="moderate" className="text-white">Moderate</SelectItem>
                  <SelectItem value="aggressive" className="text-white">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assets">Selected Assets</Label>
              <div className="text-sm text-gray-400">{selectedAssets.length} assets selected</div>
            </div>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Strategy Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="threshold">Signal Threshold</Label>
                  <Input 
                    id="threshold"
                    type="number" 
                    defaultValue="65" 
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confidence">Min Confidence</Label>
                  <Input 
                    id="confidence"
                    type="number" 
                    defaultValue="0.6" 
                    step="0.1"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">Position Size %</Label>
                  <Input 
                    id="position"
                    type="number" 
                    defaultValue="5" 
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button 
                  onClick={() => runBacktest.mutate({})}
                  disabled={isRunning}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {isRunning ? "Running Backtest..." : "Run Backtest"}
                </Button>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Advanced Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Backtest Results</h3>
            <Button 
              variant="outline" 
              onClick={downloadResults}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="text-left p-4 text-gray-300">Date</th>
                      <th className="text-left p-4 text-gray-300">Asset</th>
                      <th className="text-right p-4 text-gray-300">Hybrid Score</th>
                      <th className="text-right p-4 text-gray-300">Confidence</th>
                      <th className="text-center p-4 text-gray-300">Regime</th>
                      <th className="text-center p-4 text-gray-300">Signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoResults.map((result, idx) => (
                      <tr key={idx} className="border-t border-gray-700">
                        <td className="p-4 text-gray-300">{result.date}</td>
                        <td className="p-4 text-white font-semibold">{result.asset}</td>
                        <td className="p-4 text-right text-yellow-400 font-bold">{result.hybrid_score}</td>
                        <td className="p-4 text-right text-green-400">{(result.confidence * 100).toFixed(0)}%</td>
                        <td className="p-4 text-center">
                          <Badge variant={result.dominant_regime === "momentum" ? "default" : "secondary"}>
                            {result.dominant_regime}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant={result.signal_strength === "Strong" ? "default" : "outline"}>
                            {result.signal_strength}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{demoPerformance.total_signals}</div>
                <div className="text-xs text-gray-400">Signals Generated</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Strong Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{demoPerformance.strong_signals}</div>
                <div className="text-xs text-gray-400">{(demoPerformance.strong_signal_ratio * 100).toFixed(1)}% of total</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Avg Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{demoPerformance.average_scores.overall}</div>
                <div className="text-xs text-gray-400">Overall Average</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">{(demoPerformance.confidence_stats.mean * 100).toFixed(0)}%</div>
                <div className="text-xs text-gray-400">Mean Confidence</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Regime Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Momentum Regime</span>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold">{demoPerformance.regime_distribution.momentum}</span>
                      <Progress value={(demoPerformance.regime_distribution.momentum / demoPerformance.total_signals) * 100} className="w-20" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Volatility Regime</span>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold">{demoPerformance.regime_distribution.volatility}</span>
                      <Progress value={(demoPerformance.regime_distribution.volatility / demoPerformance.total_signals) * 100} className="w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Score Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Overall Average</span>
                    <span className="text-yellow-400 font-bold">{demoPerformance.average_scores.overall}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Momentum Avg</span>
                    <span className="text-blue-400 font-bold">{demoPerformance.average_scores.momentum_regime}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Volatility Avg</span>
                    <span className="text-purple-400 font-bold">{demoPerformance.average_scores.volatility_regime}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    Momentum regime shows {(demoPerformance.average_scores.momentum_regime - demoPerformance.average_scores.volatility_regime).toFixed(1)} points higher average score
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {isRunning && (
        <Card className="bg-blue-900/20 border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
              <span className="text-blue-400">Running regime-aware backtest analysis...</span>
            </div>
            <Progress value={66} className="mt-2" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}