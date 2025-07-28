import { 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Users, 
  Anchor, 
  Scale, 
  Star,
  Wifi,
  WifiOff,
  PieChart,
  Target,
  BarChart3,
  Brain,
  Shield,
  Bell,
  Zap
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashboardModule } from "@/types/dashboard";

interface SidebarProps {
  activeModule: DashboardModule;
  onModuleChange: (module: DashboardModule) => void;
  isConnected: boolean;
}

const modules = [
  { id: "scanner" as const, name: "Asset Scanner", icon: Search },
  { id: "watchlist" as const, name: "Spike Watchlist", icon: AlertTriangle },
  { id: "heatmap" as const, name: "Behavioral Heatmap", icon: TrendingUp },
  { id: "velocity" as const, name: "Velocity Tracking", icon: Activity },
  { id: "cohesion" as const, name: "Cohesion Analyzer", icon: Users },
  { id: "anchor" as const, name: "Anchor Pressure", icon: Anchor },
  { id: "hhr" as const, name: "HHR Comparator", icon: Scale },
  { id: "composite" as const, name: "Composite Rating", icon: Star },
];

const analyticsModules = [
  { id: "analytics" as const, name: "Historical SSS", icon: BarChart3 },
  { id: "portfolio" as const, name: "Portfolio Tracker", icon: PieChart },
  { id: "backtest" as const, name: "Backtesting", icon: Target },
  { id: "ml" as const, name: "ML Optimization", icon: Brain },
];

const advancedModules = [
  { id: "risk" as const, name: "Risk Management", icon: Shield },
  { id: "sentiment" as const, name: "Market Sentiment", icon: TrendingUp },
  { id: "optimization" as const, name: "Portfolio Optimizer", icon: Target },
  { id: "alerts" as const, name: "Alert Management", icon: Bell },
  { id: "signals" as const, name: "Trading Signals", icon: Zap },
  { id: "marketscan" as const, name: "Market Scanner", icon: Search },
  { id: "cryptosearch" as const, name: "Crypto Search", icon: Search },
];

export default function Sidebar({ activeModule, onModuleChange, isConnected }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <aside className="w-full h-full bg-gray-800 border-r border-gray-700 overflow-y-auto scrollbar-thin">
      <div className="p-4 space-y-2">
        <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
          Analysis Modules
        </div>
        
        {modules.map((module) => {
          const IconComponent = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <Button
              key={module.id}
              variant="ghost"
              className={cn(
                "w-full justify-start space-x-3 px-3 py-3 rounded-lg font-medium transition-all",
                isActive 
                  ? "bg-[var(--primary-blue)]/10 border border-[var(--primary-blue)]/20 text-[var(--primary-blue)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--dark-border)]/50"
              )}
              onClick={() => onModuleChange(module.id)}
            >
              <IconComponent className="w-4 h-4" />
              <span>{module.name}</span>
            </Button>
          );
        })}
        
        <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4 mt-6">
          Enhanced Analytics
        </div>
        
        {analyticsModules.map((module) => {
          const IconComponent = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <Button
              key={module.id}
              variant="ghost"
              className={cn(
                "w-full justify-start space-x-3 px-3 py-3 rounded-lg font-medium transition-all",
                isActive 
                  ? "bg-[var(--primary-blue)]/10 border border-[var(--primary-blue)]/20 text-[var(--primary-blue)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--dark-border)]/50"
              )}
              onClick={() => onModuleChange(module.id)}
            >
              <IconComponent className="w-4 h-4" />
              <span>{module.name}</span>
            </Button>
          );
        })}

        <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4 mt-6">
          Advanced Tools
        </div>
        
        {advancedModules.map((module) => {
          const IconComponent = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <Button
              key={module.id}
              variant="ghost"
              className={cn(
                "w-full justify-start space-x-3 px-3 py-3 rounded-lg font-medium transition-all",
                isActive 
                  ? "bg-[var(--primary-blue)]/10 border border-[var(--primary-blue)]/20 text-[var(--primary-blue)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--dark-border)]/50"
              )}
              onClick={() => onModuleChange(module.id)}
            >
              <IconComponent className="w-4 h-4" />
              <span>{module.name}</span>
            </Button>
          );
        })}
      </div>
      
      <div className="border-t border-[var(--dark-border)] p-4 mt-4">
        <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
          System Status
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">API Status</span>
            <span className="text-[var(--success-green)] flex items-center">
              {isConnected ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Data Feed</span>
            <span className="text-[var(--success-green)]">Live</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Last Update</span>
            <span className="text-[var(--text-secondary)]">2s ago</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
