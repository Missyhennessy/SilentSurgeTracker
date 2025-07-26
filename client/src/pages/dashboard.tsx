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
      
      <div className="flex">
        {/* Mobile overlay */}
        <div className="lg:hidden">
          <Sidebar 
            activeModule={activeModule}
            onModuleChange={setActiveModule}
            isConnected={isConnected}
          />
        </div>
        
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar 
            activeModule={activeModule}
            onModuleChange={setActiveModule}
            isConnected={isConnected}
          />
        </div>
        
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {renderModule()}
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
