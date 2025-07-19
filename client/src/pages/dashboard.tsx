import { useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import AssetScanner from "@/components/dashboard/asset-scanner";
import Watchlist from "@/components/dashboard/watchlist";
import BehavioralHeatmap from "@/components/dashboard/behavioral-heatmap";
import VelocityTracking from "@/components/dashboard/velocity-tracking";
import CohesionAnalyzer from "@/components/dashboard/cohesion-analyzer";
import AnchorPressure from "@/components/dashboard/anchor-pressure";
import HHRComparator from "@/components/dashboard/hhr-comparator";
import CompositeRating from "@/components/dashboard/composite-rating";
import { useWebSocket } from "@/hooks/use-websocket";

type DashboardModule = 
  | "scanner"
  | "watchlist" 
  | "heatmap"
  | "velocity"
  | "cohesion"
  | "anchor"
  | "hhr"
  | "composite";

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState<DashboardModule>("scanner");
  const [alertCount] = useState(3);
  const { isConnected } = useWebSocket("/ws");

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
      default:
        return <AssetScanner />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--dark-bg)] text-[var(--text-primary)]">
      <Header alertCount={alertCount} />
      
      <div className="flex pt-16">
        <Sidebar 
          activeModule={activeModule}
          onModuleChange={setActiveModule}
          isConnected={isConnected}
        />
        
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}
