import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserFriendlyNav } from "@/components/navigation/user-friendly-nav";
import { RealTimeIndicator } from "@/components/real-time-indicator";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TrendingUp, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingActionButton, defaultFABActions } from "@/components/ui/floating-action-button";
import AssetScanner from "@/components/dashboard/asset-scanner";
import Watchlist from "@/components/dashboard/watchlist";
import BehavioralHeatmap from "@/components/dashboard/behavioral-heatmap";
import VelocityTracking from "@/components/dashboard/velocity-tracking";
import CohesionAnalyzer from "@/components/dashboard/cohesion-analyzer";
import AnchorPressure from "@/components/dashboard/anchor-pressure";
import HHRComparator from "@/components/dashboard/hhr-comparator";
import CompositeRating from "@/components/dashboard/composite-rating";
import HistoricalSSSTracker from "@/components/analytics/historical-sss-tracker";
import PortfolioTracker from "@/components/analytics/portfolio-tracker";
import BacktestingEngine from "@/components/analytics/backtesting-engine";
import { ModelPerformance } from "@/components/ml/model-performance";
import RiskManagement from "@/components/advanced/risk-management";
import MarketSentiment from "@/components/advanced/market-sentiment";
import PortfolioOptimization from "@/components/advanced/portfolio-optimization";
import AlertsManagement from "@/components/advanced/alerts-management";
import TradingSignals from "@/components/advanced/trading-signals";
import MarketScanner from "@/components/advanced/market-scanner";
import CryptoSearch from "@/components/advanced/crypto-search";
import { useWebSocket } from "@/hooks/use-websocket";
import { DashboardModule } from "@/types/dashboard";
import { TourOverlay } from "@/components/onboarding/tour-overlay";


export default function Dashboard() {
  const [activeModule, setActiveModule] = useState<DashboardModule>("scanner");
  const [alertCount] = useState(3);
  const [showTour, setShowTour] = useState(false);
  const [userLevel, setUserLevel] = useState<"beginner" | "advanced">("beginner");

  const { isConnected } = useWebSocket("/ws");

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('sst-tour-completed');
    if (!hasSeenTour) {
      setShowTour(true);
    }
  }, []);

  // Get total assets for header
  const { data: assets } = useQuery<any[]>({
    queryKey: ["/api/assets"],
    refetchInterval: 30000,
  });

  const totalAssets = Array.isArray(assets) ? assets.length : 0;

  const renderModule = useMemo(() => {
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
        case "hhr":
          return <HHRComparator />;
        case "composite":
          return <CompositeRating />;
        case "analytics":
          return <HistoricalSSSTracker />;
        case "portfolio":
          return <PortfolioTracker />;
        case "backtest":
          return <BacktestingEngine />;
        case "ml":
          return <ModelPerformance />;
        case "risk":
          return <RiskManagement />;
        case "sentiment":
          return <MarketSentiment />;
        case "optimization":
          return <PortfolioOptimization />;
        case "alerts":
          return <AlertsManagement />;
        case "signals":
          return <TradingSignals />;
        case "market-scanner":
          return <MarketScanner />;
        case "search":
          return <CryptoSearch />;
        case "python-engine":
          window.location.href = '/python-engine';
          break;
        case "ml-dashboard":
          window.location.href = '/ml-dashboard';
          return <div className="p-6">Redirecting to ML Dashboard...</div>;
        case "api-status":
          window.location.href = '/api-status';
          return <div className="p-6">Redirecting to API Status Dashboard...</div>;
        default:
          return <AssetScanner />;
      }
    } catch (error) {
      console.error('Error rendering module:', activeModule, error);
      return <div className="p-6 text-red-500">Error loading module: {activeModule}</div>;
    }
  }, [activeModule]);

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
                    <AnimatedCounter value={totalAssets} />
                  </div>
                  <div className="text-xs text-gray-400">Assets</div>
                </div>
                <div className="w-px h-8 bg-gray-700"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">
                    <AnimatedCounter value={alertCount} />
                  </div>
                  <div className="text-xs text-gray-400">Alerts</div>
                </div>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
              <RealTimeIndicator />
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {alertCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {alertCount > 9 ? '9+' : alertCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Navigation Bar Row */}
        <div className="px-6 py-3">
          <UserFriendlyNav 
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            alertCount={alertCount}
            userLevel={userLevel}
            onUserLevelChange={setUserLevel}
          />
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">


        
        {/* Main Content Area - Enhanced Scrolling */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto scroll-container bg-gray-900 p-2 sm:p-4 lg:p-6">
            <div className="w-full max-w-none min-h-0">
              <div className="pb-4 md:pb-6 lg:pb-8">
                {renderModule}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Floating Action Button */}
      <FloatingActionButton actions={defaultFABActions} />
      
      <TourOverlay 
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onComplete={() => setShowTour(false)}
      />
    </div>
  );
}
