import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { EnhancedHeader } from "@/components/enhanced-header";
import { SimplifiedNav } from "@/components/navigation/simplified-nav";
import { FloatingActionButton, defaultFABActions } from "@/components/ui/floating-action-button";
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
        case "market-scanner":
          console.log('Loading MarketScanner');
          return <MarketScanner />;
        case "search":
          console.log('Loading CryptoSearch');
          return <CryptoSearch />;
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
      
      {/* Navigation Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <SimplifiedNav 
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          alertCount={alertCount}
        />
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
