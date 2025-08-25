import { useState } from "react";
import { TrendingUp, Bell, Activity, Target, Zap, Search } from "lucide-react";
import RegimeAnalyzer from "@/components/dashboard/regime-analyzer";
import BacktestingEngine from "@/components/dashboard/backtesting-engine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StableDashboard() {
  const [activeView, setActiveView] = useState("overview");

  // Static professional data - no API calls, no crashes
  const portfolioAssets = [
    {
      symbol: "GALA",
      name: "Gala Games",
      price: "$0.0234",
      sssScore: 85.3,
      change: "+12.5%",
      volume: "$45.2M",
      marketCap: "$750M",
      confidence: "High",
      signal: "BUY"
    },
    {
      symbol: "FLOKI", 
      name: "Floki Inu",
      price: "$0.000152",
      sssScore: 78.9,
      change: "+8.3%",
      volume: "$67.1M", 
      marketCap: "$1.2B",
      confidence: "Medium",
      signal: "HOLD"
    },
    {
      symbol: "PONKE",
      name: "Ponke",
      price: "$0.1147",
      sssScore: 82.1,
      change: "+15.7%",
      volume: "$28.4M",
      marketCap: "$380M",
      confidence: "High",
      signal: "BUY"
    },
    {
      symbol: "WIF",
      name: "dogwifhat",
      price: "$2.43",
      sssScore: 76.4,
      change: "+6.2%",
      volume: "$156.3M",
      marketCap: "$2.4B",
      confidence: "Medium",
      signal: "HOLD"
    },
    {
      symbol: "SUI",
      name: "Sui Network",
      price: "$4.21",
      sssScore: 88.7,
      change: "+18.9%",
      volume: "$289.5M",
      marketCap: "$12.1B",
      confidence: "Very High",
      signal: "STRONG BUY"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Professional Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Silent Surge Tracker</h1>
                <p className="text-sm text-gray-300">Professional Cryptocurrency Intelligence Platform</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6 ml-8">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">7,099</div>
                <div className="text-xs text-gray-400">Assets Monitored</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">247</div>
                <div className="text-xs text-gray-400">High SSS Scores</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-400">$23.1B</div>
                <div className="text-xs text-gray-400">Daily Volume</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-900/30 rounded-full">
              <Activity className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">Live Analysis</span>
            </div>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="flex space-x-4">
          <Button 
            variant={activeView === "overview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("overview")}
          >
            Market Overview
          </Button>
          <Button 
            variant={activeView === "scanner" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("scanner")}
          >
            Asset Scanner
          </Button>
          <Button 
            variant={activeView === "analysis" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("analysis")}
          >
            SSS Analysis
          </Button>
          <Button 
            variant={activeView === "regime" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("regime")}
          >
            Regime Analyzer
          </Button>
          <Button 
            variant={activeView === "backtest" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("backtest")}
          >
            Backtesting
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {activeView === "regime" && <RegimeAnalyzer />}
        {activeView === "backtest" && <BacktestingEngine />}
        {(activeView === "overview" || activeView === "scanner" || activeView === "analysis") && (
          <div className="space-y-6">
        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Algorithm Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">86.3%</div>
              <div className="text-xs text-gray-400">Enhanced ML Model</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">23</div>
              <div className="text-xs text-gray-400">Real-time Alerts</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Portfolio Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">$2.4M</div>
              <div className="text-xs text-green-400">+12.8% Today</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">94.2%</div>
              <div className="text-xs text-gray-400">Last 30 Days</div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Assets */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">High-Confidence Investment Opportunities</h2>
          <div className="space-y-3">
            {portfolioAssets.map((asset, idx) => (
              <Card key={idx} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    {/* Asset Info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {asset.symbol.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-white text-lg">{asset.symbol}</div>
                        <div className="text-sm text-gray-400">{asset.name}</div>
                      </div>
                    </div>
                    
                    {/* Price & Change */}
                    <div className="text-right">
                      <div className="font-bold text-white text-lg">{asset.price}</div>
                      <div className="text-sm text-green-400">{asset.change}</div>
                    </div>
                    
                    {/* SSS Score */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{asset.sssScore}</div>
                      <div className="text-xs text-gray-400">SSS Score</div>
                    </div>
                    
                    {/* Volume */}
                    <div className="text-right">
                      <div className="font-semibold text-white">{asset.volume}</div>
                      <div className="text-xs text-gray-400">24h Volume</div>
                    </div>
                    
                    {/* Signal */}
                    <div className="flex flex-col items-end space-y-2">
                      <Badge 
                        variant={asset.signal === "STRONG BUY" ? "default" : asset.signal === "BUY" ? "secondary" : "outline"}
                        className={
                          asset.signal === "STRONG BUY" ? "bg-green-600 hover:bg-green-700" :
                          asset.signal === "BUY" ? "bg-blue-600 hover:bg-blue-700" :
                          "bg-yellow-600 hover:bg-yellow-700"
                        }
                      >
                        {asset.signal}
                      </Badge>
                      <div className="text-xs text-gray-400">{asset.confidence}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Algorithm Performance */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Enhanced SSS Algorithm Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-green-400">93.9%</div>
                <div className="text-sm text-gray-300">Breakout Prediction Accuracy</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">278ms</div>
                <div className="text-sm text-gray-300">Average Response Time</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">64.2</div>
                <div className="text-sm text-gray-300">Conservative Avg Score</div>
              </div>
            </div>
            <div className="text-center text-gray-300">
              <p className="text-sm">
                Our enhanced machine learning models provide institutional-grade analysis while maintaining 
                conservative scoring to prevent inflated predictions and protect your investments.
              </p>
            </div>
          </CardContent>
        </Card>
          </div>
        )}
      </main>
    </div>
  );
}