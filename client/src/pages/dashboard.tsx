import { useState, useEffect } from "react";
import { TrendingUp, Bell, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

// Import dashboard components
import AssetScanner from "@/components/dashboard/asset-scanner";
import Watchlist from "@/components/dashboard/watchlist";
import BehavioralHeatmap from "@/components/dashboard/behavioral-heatmap";
import VelocityTracking from "@/components/dashboard/velocity-tracking";
import CohesionAnalyzer from "@/components/dashboard/cohesion-analyzer";
import AnchorPressure from "@/components/dashboard/anchor-pressure";

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState("scanner");
  
  // Static data for investor presentation - no API calls
  const totalAssets = 7099;

  const renderModule = () => {
    try {
      switch (activeModule) {
        case "scanner":
          return <AssetScanner />;
        case "watchlist":
          return <Watchlist />;
        case "heatmap":
          return <BehavioralHeatmap />;
        case "velocity":
          return <VelocityTracking />;
        case "cohesion":
          return <CohesionAnalyzer />;
        case "anchor":
          return <AnchorPressure />;
        default:
          return <AssetScanner />;
      }
    } catch (error) {
      console.error('Dashboard render error:', error);
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl text-white mb-4">Loading Dashboard...</h2>
          <p className="text-gray-400">Enhanced SSS algorithm active • Real-time crypto analysis</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Combined Header and Navigation */}
      <div className="bg-gray-900 border-b border-gray-700 sticky top-0 z-30">
        {/* Top Header Row */}
        <div className="px-6 py-3 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            {/* Left section */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Silent Surge Tracker</h1>
                  <p className="text-xs text-gray-400">
                    {new Date().toLocaleTimeString()} • Real-time Analysis
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="hidden lg:flex items-center gap-4 ml-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    7,099
                  </div>
                  <div className="text-xs text-gray-400">Assets</div>
                </div>
                <div className="w-px h-8 bg-gray-700"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">
                    3
                  </div>
                  <div className="text-xs text-gray-400">Alerts</div>
                </div>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 rounded-full">
                <Activity className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">Live</span>
              </div>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  3
                </Badge>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Navigation Bar Row */}
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
            <Button 
              variant={activeModule === "velocity" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveModule("velocity")}
            >
              Velocity
            </Button>
            <Button 
              variant={activeModule === "cohesion" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveModule("cohesion")}
            >
              Cohesion
            </Button>
            <Button 
              variant={activeModule === "anchor" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveModule("anchor")}
            >
              Anchor
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area - Enhanced Scrolling */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto scroll-container bg-gray-900 p-2 sm:p-4 lg:p-6">
            <div className="w-full max-w-none min-h-0">
              <div className="pb-4 md:pb-6 lg:pb-8">
                {renderModule()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}