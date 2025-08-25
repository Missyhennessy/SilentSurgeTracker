import { useState } from "react";
import { TrendingUp, Bell, Activity, Search, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InvestorDashboard() {
  const [activeModule, setActiveModule] = useState("scanner");
  
  // Static professional demo data
  const demoAssets = [
    {
      symbol: "GALA",
      name: "Gala",
      price: "$0.0234",
      sssScore: 85.3,
      change: "+12.5%",
      volume: "$45M",
      marketCap: "$750M"
    },
    {
      symbol: "FLOKI", 
      name: "Floki Inu",
      price: "$0.00015",
      sssScore: 78.9,
      change: "+8.3%",
      volume: "$67M", 
      marketCap: "$1.2B"
    },
    {
      symbol: "PONKE",
      name: "Ponke",
      price: "$0.1147",
      sssScore: 82.1,
      change: "+15.7%",
      volume: "$28M",
      marketCap: "$380M"
    },
    {
      symbol: "WIF",
      name: "dogwifhat",
      price: "$2.43",
      sssScore: 76.4,
      change: "+6.2%",
      volume: "$156M",
      marketCap: "$2.4B"
    }
  ];

  const renderAssetScanner = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Asset Scanner</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 rounded-full">
          <Activity className="h-4 w-4 text-green-400" />
          <span className="text-sm text-green-400">Live Analysis</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">7,099</div>
            <div className="text-sm text-gray-400">Total Assets</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">247</div>
            <div className="text-sm text-gray-400">High SSS (80+)</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">64.2</div>
            <div className="text-sm text-gray-400">Avg SSS Score</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">$23.1B</div>
            <div className="text-sm text-gray-400">Total Volume</div>
          </CardContent>
        </Card>
      </div>

      {/* Asset List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Top Performing Assets</h3>
        {demoAssets.map((asset, idx) => (
          <Card key={idx} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {asset.symbol.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{asset.symbol}</div>
                    <div className="text-sm text-gray-400">{asset.name}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-white">{asset.price}</div>
                  <div className="text-sm text-green-400">{asset.change}</div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-yellow-400">SSS: {asset.sssScore}</div>
                  <div className="text-sm text-gray-400">Volume: {asset.volume}</div>
                </div>
                
                <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-400">
                  Strong Signal
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderModule = () => {
    switch (activeModule) {
      case "scanner":
        return renderAssetScanner();
      case "watchlist":
        return (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Spike Watchlist</h2>
            <p className="text-gray-400">Advanced monitoring for high-potential surge opportunities</p>
          </div>
        );
      case "heatmap":
        return (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Behavioral Heatmap</h2>
            <p className="text-gray-400">Visual representation of market behavioral patterns</p>
          </div>
        );
      default:
        return renderAssetScanner();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 sticky top-0 z-30">
        <div className="px-6 py-3 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Silent Surge Tracker</h1>
                  <p className="text-xs text-gray-400">Professional Cryptocurrency Intelligence Platform</p>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-4 ml-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">7,099</div>
                  <div className="text-xs text-gray-400">Assets</div>
                </div>
                <div className="w-px h-8 bg-gray-700"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">3</div>
                  <div className="text-xs text-gray-400">Alerts</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 rounded-full">
                <Activity className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">Live</span>
              </div>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="px-6 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <Button 
              variant={activeModule === "scanner" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveModule("scanner")}
            >
              Asset Scanner
            </Button>
            <Button 
              variant={activeModule === "watchlist" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveModule("watchlist")}
            >
              Watchlist
            </Button>
            <Button 
              variant={activeModule === "heatmap" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveModule("heatmap")}
            >
              Heatmap
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderModule()}
      </div>
    </div>
  );
}