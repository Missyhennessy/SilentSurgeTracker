import { useState } from "react";
import { 
  Search, 
  TrendingUp, 
  Eye, 
  BarChart3,
  Shield,
  Settings,
  Bell,
  ChevronDown,
  Sparkles,
  Target,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardModule } from "@/types/dashboard";

interface CleanNavProps {
  activeModule: DashboardModule;
  setActiveModule: (module: DashboardModule) => void;
  alertCount?: number;
}

export function CleanNav({ 
  activeModule, 
  setActiveModule, 
  alertCount = 0
}: CleanNavProps) {
  
  // Main navigation categories
  const navSections = [
    {
      id: "discover",
      title: "Market Discovery",
      icon: <Search className="w-4 h-4" />,
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      items: [
        { key: "scanner", label: "Asset Scanner", description: "Find crypto opportunities" },
        { key: "search", label: "Crypto Search", description: "Search 7,000+ cryptocurrencies" },
        { key: "market-scanner", label: "Market Scanner", description: "Real-time anomaly detection" }
      ]
    },
    {
      id: "analysis",
      title: "Analysis & Insights", 
      icon: <BarChart3 className="w-4 h-4" />,
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      items: [
        { key: "heatmap", label: "Behavioral Heatmap", description: "Visual market patterns" },
        { key: "velocity", label: "Velocity Tracking", description: "Token movement analysis" },
        { key: "sentiment", label: "Market Sentiment", description: "Social & news analysis" },
        { key: "analytics", label: "Historical Analysis", description: "Long-term trends" }
      ]
    },
    {
      id: "portfolio",
      title: "Portfolio & Trading",
      icon: <TrendingUp className="w-4 h-4" />,
      color: "bg-green-500/10 text-green-400 border-green-500/20",
      items: [
        { key: "watchlist", label: "Watchlist", description: "Track your favorites" },
        { key: "portfolio", label: "Portfolio", description: "Portfolio analytics" },
        { key: "signals", label: "Trading Signals", description: "AI recommendations" },
        { key: "backtest", label: "Backtesting", description: "Test strategies" }
      ]
    },
    {
      id: "advanced",
      title: "Advanced Tools",
      icon: <Sparkles className="w-4 h-4" />,
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      premium: true,
      items: [
        { key: "ml", label: "ML Analytics", description: "Machine learning insights" },
        { key: "risk", label: "Risk Management", description: "Portfolio risk analysis" },
        { key: "optimization", label: "Portfolio Optimizer", description: "AI asset allocation" },
        { key: "alerts", label: "Alert System", description: "Custom notifications" }
      ]
    }
  ];

  // Quick access buttons
  const quickActions = [
    { key: "scanner", label: "Scanner", icon: <Target className="w-4 h-4" /> },
    { key: "watchlist", label: "Watchlist", icon: <Eye className="w-4 h-4" /> },
    { key: "portfolio", label: "Portfolio", icon: <TrendingUp className="w-4 h-4" /> },
    { key: "alerts", label: "Alerts", icon: <Bell className="w-4 h-4" />, badge: alertCount }
  ];

  return (
    <div className="bg-gray-800/50 border-b border-gray-700">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Main Navigation */}
          <div className="flex items-center gap-2">
            {navSections.map((section) => (
              <DropdownMenu key={section.id}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`h-9 px-3 rounded-lg border ${section.color} hover:bg-opacity-20 transition-all`}
                  >
                    {section.icon}
                    <span className="ml-2 font-medium">{section.title}</span>
                    {section.premium && <Sparkles className="w-3 h-3 ml-1" />}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel className="text-xs font-medium text-gray-400">
                    {section.title}
                    {section.premium && (
                      <Badge variant="secondary" className="ml-2 text-xs">Premium</Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {section.items.map((item) => (
                    <DropdownMenuItem
                      key={item.key}
                      onClick={() => setActiveModule(item.key as DashboardModule)}
                      className={`cursor-pointer ${
                        activeModule === item.key ? 'bg-blue-500/10 text-blue-400' : ''
                      }`}
                    >
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-400">{item.description}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.key}
                variant={activeModule === action.key ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveModule(action.key as DashboardModule)}
                className="h-9 px-3 relative"
              >
                {action.icon}
                <span className="ml-1.5 hidden sm:inline">{action.label}</span>
                {action.badge && action.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                  >
                    {action.badge > 9 ? '9+' : action.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}