import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { EnhancedHeader } from "@/components/enhanced-header";
import { FloatingActionButton, defaultFABActions } from "@/components/ui/floating-action-button";
import Sidebar from "@/components/dashboard/sidebar";
import AssetScanner from "@/components/dashboard/asset-scanner";
import Watchlist from "@/components/dashboard/watchlist";
import BehavioralHeatmap from "@/components/dashboard/behavioral-heatmap";
import VelocityTracking from "@/components/dashboard/velocity-tracking";
import CohesionAnalyzer from "@/components/dashboard/cohesion-analyzer";
import AnchorPressure from "@/components/dashboard/anchor-pressure";
import HHRComparator from "@/components/dashboard/hhr-comparator";
import CompositeRating from "@/components/dashboard/composite-rating";
import { RealTimeIndicator } from "@/components/real-time-indicator";
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  const renderModule = () => {
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
      case "marketscan":
        return <MarketScanner />;
      case "cryptosearch":
        return <CryptoSearch />;
      default:
        return <AssetScanner />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <EnhancedHeader 
        isConnected={isConnected} 
        totalAssets={totalAssets}
        activeAlerts={alertCount}
      />
      
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - responsive design */}
        <div className="w-64 flex-shrink-0 hidden md:block">
          <Sidebar 
            activeModule={activeModule}
            onModuleChange={setActiveModule}
            isConnected={isConnected}
          />
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-20 left-4 z-50">
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700 hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {showMobileMenu && (
          <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)}>
            <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out" onClick={(e) => e.stopPropagation()}>
              <div className="pt-20">
                <Sidebar 
                  activeModule={activeModule}
                  onModuleChange={(module) => {
                    setActiveModule(module);
                    setShowMobileMenu(false);
                  }}
                  isConnected={isConnected}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-4 md:p-6 min-h-0">
          <div className="w-full h-full">
            {renderModule()}
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
