import { useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import AssetScanner from "@/components/dashboard/asset-scanner";
import Watchlist from "@/components/dashboard/watchlist";
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
        return <div className="p-6">Behavioral Heatmap - Coming Soon</div>;
      case "velocity":
        return <div className="p-6">Velocity Tracking - Coming Soon</div>;
      case "cohesion":
        return <div className="p-6">Cohesion Analyzer - Coming Soon</div>;
      case "anchor":
        return <div className="p-6">Anchor Pressure - Coming Soon</div>;
      case "hhr":
        return <div className="p-6">HHR Comparator - Coming Soon</div>;
      case "composite":
        return <div className="p-6">Composite Rating - Coming Soon</div>;
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
