import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { EnhancedHeader } from "@/components/enhanced-header";
import { FloatingActionButton, defaultFABActions } from "@/components/ui/floating-action-button";
import SidebarDebug from "@/components/dashboard/sidebar-debug";
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
import LayoutOptimizer from "@/components/layout/layout-optimizer";

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
    console.log('Rendering module:', activeModule);
    
    try {
      switch (activeModule) {
        case "scanner":
          console.log('Loading AssetScanner');
          return <AssetScanner />;
        case "watchlist":
          console.log('Loading Watchlist');
          return <Watchlist />;
        case "heatmap":
          console.log('Loading BehavioralHeatmap');
          return <BehavioralHeatmap />;
        case "velocity":
          console.log('Loading VelocityTracking');
          return <VelocityTracking />;
        case "cohesion":
          console.log('Loading CohesionAnalyzer');
          return <CohesionAnalyzer />;
        case "anchor":
          console.log('Loading AnchorPressure');
          return <AnchorPressure />;
        case "hhr":
          console.log('Loading HHRComparator');
          return <HHRComparator />;
        case "composite":
          console.log('Loading CompositeRating');
          return <CompositeRating />;
        case "analytics":
          console.log('Loading HistoricalSSSTracker');
          return <HistoricalSSSTracker />;
        case "portfolio":
          console.log('Loading PortfolioTracker');
          return <PortfolioTracker />;
        case "backtest":
          console.log('Loading BacktestingEngine');
          return <BacktestingEngine />;
        case "ml":
          console.log('Loading ModelPerformance');
          return <ModelPerformance />;
        case "risk":
          console.log('Loading RiskManagement');
          return <RiskManagement />;
        case "sentiment":
          console.log('Loading MarketSentiment');
          return <MarketSentiment />;
        case "optimization":
          console.log('Loading PortfolioOptimization');
          return <PortfolioOptimization />;
        case "alerts":
          console.log('Loading AlertsManagement');
          return <AlertsManagement />;
        case "signals":
          console.log('Loading TradingSignals');
          return <TradingSignals />;
        case "marketscan":
          console.log('Loading MarketScanner');
          return <MarketScanner />;
        case "cryptosearch":
          console.log('Loading CryptoSearch');
          return <CryptoSearch />;
        case "layoutopt":
          console.log('Loading LayoutOptimizer');
          return <LayoutOptimizer 
            onLayoutChange={(layout) => console.log('Layout changed:', layout)}
            onFullscreenToggle={(isFullscreen) => console.log('Fullscreen:', isFullscreen)}
            onSidebarToggle={(isVisible) => console.log('Sidebar:', isVisible)}
          />;
        default:
          console.log('Loading default AssetScanner');
          return <AssetScanner />;
      }
    } catch (error) {
      console.error('Error rendering module:', activeModule, error);
      return <div className="p-6 text-red-500">Error loading module: {activeModule}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <EnhancedHeader 
        isConnected={isConnected} 
        totalAssets={totalAssets}
        activeAlerts={alertCount}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="w-64 flex-shrink-0 hidden md:block border-r border-gray-700">
          <div className="h-full overflow-y-auto">
            <SidebarDebug 
              activeModule={activeModule}
              onModuleChange={setActiveModule}
              isConnected={isConnected}
            />
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-20 left-4 z-50">
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="bg-gray-800 text-white p-3 rounded-lg border border-gray-600 hover:bg-gray-700 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Sidebar Overlay - Enhanced */}
        {showMobileMenu && (
          <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-60" onClick={() => setShowMobileMenu(false)}>
            <div className="fixed left-0 top-0 h-full w-80 bg-gray-900 transform transition-transform duration-300 ease-in-out shadow-2xl border-r border-gray-700" 
                 onClick={(e) => e.stopPropagation()}>
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">Navigation</h2>
                <button 
                  onClick={() => setShowMobileMenu(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Mobile Navigation Content */}
              <div className="h-full overflow-y-auto pb-20">
                <SidebarDebug 
                  activeModule={activeModule}
                  onModuleChange={(module: DashboardModule) => {
                    setActiveModule(module);
                    setShowMobileMenu(false);
                  }}
                  isConnected={isConnected}
                />
              </div>
            </div>
          </div>
        )}
        
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
