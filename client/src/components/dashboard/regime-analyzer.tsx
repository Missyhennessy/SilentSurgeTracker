import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Activity, Target, Brain, Zap, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RegimeData {
  asset: string;
  hybrid_score: number;
  momentum_score: number;
  volatility_score: number;
  confidence: number;
  dominant_regime: 'momentum' | 'volatility';
  signal_strength: 'Strong' | 'Medium' | 'Weak';
}

export default function RegimeAnalyzer() {
  const [selectedAsset, setSelectedAsset] = useState<string>("GALA");
  const [timeframe, setTimeframe] = useState<string>("1d");

  // Demo data for regime analysis
  const regimeData: RegimeData[] = [
    {
      asset: "GALA",
      hybrid_score: 78.5,
      momentum_score: 82.3,
      volatility_score: 74.7,
      confidence: 0.73,
      dominant_regime: "momentum",
      signal_strength: "Strong"
    },
    {
      asset: "FLOKI",
      hybrid_score: 71.2,
      momentum_score: 68.9,
      volatility_score: 73.5,
      confidence: 0.65,
      dominant_regime: "volatility",
      signal_strength: "Medium"
    },
    {
      asset: "PONKE",
      hybrid_score: 84.1,
      momentum_score: 89.2,
      volatility_score: 79.0,
      confidence: 0.81,
      dominant_regime: "momentum",
      signal_strength: "Strong"
    },
    {
      asset: "WIF",
      hybrid_score: 66.8,
      momentum_score: 64.5,
      volatility_score: 69.1,
      confidence: 0.58,
      dominant_regime: "volatility",
      signal_strength: "Medium"
    },
    {
      asset: "SUI",
      hybrid_score: 91.3,
      momentum_score: 94.7,
      volatility_score: 87.9,
      confidence: 0.87,
      dominant_regime: "momentum",
      signal_strength: "Strong"
    }
  ];

  const selectedData = regimeData.find(d => d.asset === selectedAsset) || regimeData[0];

  const getRegimeColor = (regime: string) => {
    return regime === "momentum" ? "text-blue-400" : "text-purple-400";
  };

  const getSignalColor = (strength: string) => {
    switch (strength) {
      case "Strong": return "text-green-400";
      case "Medium": return "text-yellow-400";
      case "Weak": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Advanced Regime Analyzer</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-purple-900/30 rounded-full">
          <Brain className="h-4 w-4 text-purple-400" />
          <span className="text-sm text-purple-400">ML Enhanced</span>
        </div>
      </div>

      {/* Asset Selection */}
      <div className="flex items-center gap-4">
        <Select value={selectedAsset} onValueChange={setSelectedAsset}>
          <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select Asset" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {regimeData.map((asset) => (
              <SelectItem key={asset.asset} value={asset.asset} className="text-white">
                {asset.asset}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="1h" className="text-white">1H</SelectItem>
            <SelectItem value="4h" className="text-white">4H</SelectItem>
            <SelectItem value="1d" className="text-white">1D</SelectItem>
            <SelectItem value="1w" className="text-white">1W</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Regime Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Hybrid Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{selectedData.hybrid_score}</div>
            <Progress value={selectedData.hybrid_score} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Dominant Regime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold capitalize ${getRegimeColor(selectedData.dominant_regime)}`}>
              {selectedData.dominant_regime}
            </div>
            <div className="text-xs text-gray-400 mt-1">{(selectedData.confidence * 100).toFixed(0)}% confidence</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Signal Strength</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSignalColor(selectedData.signal_strength)}`}>
              {selectedData.signal_strength}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {selectedData.signal_strength === "Strong" && <Zap className="h-3 w-3 text-green-400" />}
              {selectedData.signal_strength === "Medium" && <Target className="h-3 w-3 text-yellow-400" />}
              {selectedData.signal_strength === "Weak" && <AlertTriangle className="h-3 w-3 text-red-400" />}
              <span className="text-xs text-gray-400">AI Verified</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {(selectedData.confidence * 100).toFixed(0)}%
            </div>
            <Progress value={selectedData.confidence * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regime Breakdown */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Regime Score Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Momentum Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">{selectedData.momentum_score}</span>
                  <Progress value={selectedData.momentum_score} className="w-20" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Volatility Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">{selectedData.volatility_score}</span>
                  <Progress value={selectedData.volatility_score} className="w-20" />
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-semibold">Hybrid Score</span>
                  <span className="text-yellow-400 font-bold text-lg">{selectedData.hybrid_score}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Context */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Market Context Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="text-sm font-medium text-gray-300 mb-1">Current State</div>
                <div className="text-white">
                  {selectedData.dominant_regime === "momentum" 
                    ? "Market showing strong directional momentum with sustained buying pressure"
                    : "Market experiencing elevated volatility with mixed signals and uncertainty"
                  }
                </div>
              </div>
              
              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="text-sm font-medium text-gray-300 mb-1">Trading Strategy</div>
                <div className="text-white">
                  {selectedData.dominant_regime === "momentum"
                    ? "Consider trend-following strategies with momentum indicators"
                    : "Focus on volatility trading and range-bound strategies"
                  }
                </div>
              </div>
              
              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="text-sm font-medium text-gray-300 mb-1">Risk Assessment</div>
                <Badge variant={selectedData.signal_strength === "Strong" ? "default" : 
                              selectedData.signal_strength === "Medium" ? "secondary" : "destructive"}>
                  {selectedData.signal_strength} Signal
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Assets Overview */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">All Assets Regime Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {regimeData.map((asset) => (
              <div key={asset.asset} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{asset.asset.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-bold text-white">{asset.asset}</div>
                    <div className={`text-sm capitalize ${getRegimeColor(asset.dominant_regime)}`}>
                      {asset.dominant_regime} Regime
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-yellow-400">{asset.hybrid_score}</div>
                  <div className={`text-sm ${getSignalColor(asset.signal_strength)}`}>
                    {asset.signal_strength}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-300">{(asset.confidence * 100).toFixed(0)}%</div>
                  <div className="text-xs text-gray-400">Confidence</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}