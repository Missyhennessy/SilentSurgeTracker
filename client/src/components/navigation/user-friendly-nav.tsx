import { useState } from "react";
import { 
  Search, 
  TrendingUp, 
  Eye, 
  Bell, 
  Settings,
  BarChart3,
  Brain,
  Shield,
  ChevronDown,
  User
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

interface UserFriendlyNavProps {
  activeModule: DashboardModule;
  setActiveModule: (module: DashboardModule) => void;
  alertCount?: number;
  userLevel?: "beginner" | "advanced";
  onUserLevelChange?: (level: "beginner" | "advanced") => void;
}

export function UserFriendlyNav({ 
  activeModule, 
  setActiveModule, 
  alertCount = 0, 
  userLevel = "beginner",
  onUserLevelChange 
}: UserFriendlyNavProps) {
  
  // Beginner-friendly modules
  const beginnerModules = [
    { key: "scanner", label: "Find Crypto", description: "Discover new cryptocurrencies", icon: <Search className="w-4 h-4" /> },
    { key: "watchlist", label: "My Favorites", description: "Track cryptocurrencies you like", icon: <Eye className="w-4 h-4" /> },
    { key: "portfolio", label: "My Portfolio", description: "See how your investments are doing", icon: <TrendingUp className="w-4 h-4" /> },
    { key: "alerts", label: "Price Alerts", description: "Get notified when prices change", icon: <Bell className="w-4 h-4" /> }
  ];

  // Advanced trader modules grouped by category
  const advancedSections = [
    {
      title: "Market Discovery",
      icon: <Search className="w-4 h-4" />,
      modules: [
        { key: "scanner", label: "Asset Scanner", description: "AI-powered crypto discovery" },
        { key: "search" as DashboardModule, label: "Advanced Search", description: "Search 1,886+ cryptocurrencies" },
        { key: "scanner" as DashboardModule, label: "Market Scanner", description: "Real-time market anomaly detection" }
      ]
    },
    {
      title: "Analysis & Insights",
      icon: <BarChart3 className="w-4 h-4" />,
      modules: [
        { key: "heatmap", label: "Market Heatmap", description: "Behavioral pattern visualization" },
        { key: "velocity", label: "Velocity Tracking", description: "Token movement analysis" },
        { key: "sentiment", label: "Market Sentiment", description: "Social media & news analysis" },
        { key: "analytics", label: "Historical Analysis", description: "Long-term trend analysis" }
      ]
    },
    {
      title: "Portfolio & Trading",
      icon: <TrendingUp className="w-4 h-4" />,
      modules: [
        { key: "portfolio", label: "Portfolio Tracker", description: "Advanced portfolio analytics" },
        { key: "signals", label: "AI Trading Signals", description: "Machine learning recommendations" },
        { key: "backtest", label: "Strategy Testing", description: "Backtest trading strategies" },
        { key: "optimization", label: "Portfolio Optimizer", description: "AI-powered asset allocation" }
      ]
    },
    {
      title: "Risk Management",
      icon: <Shield className="w-4 h-4" />,
      modules: [
        { key: "risk", label: "Risk Analysis", description: "Portfolio risk monitoring" },
        { key: "alerts", label: "Smart Alerts", description: "Multi-parameter alert system" },
        { key: "api-keys", label: "API Keys", description: "Manage API access & authentication" }
      ]
    },
    {
      title: "Professional Tools",
      icon: <Brain className="w-4 h-4" />,
      modules: [
        { key: "ml", label: "AI Models", description: "Machine learning insights" },
        { key: "anchor", label: "Anchor Pressure", description: "Price support analysis" },
        { key: "composite", label: "SSS Rating", description: "Silent Surge Score analysis" },
        { key: "api-status", label: "System Status", description: "Monitor data sources" }
      ]
    }
  ];

  const currentBeginnerModule = beginnerModules.find(m => m.key === activeModule);
  const currentAdvancedSection = advancedSections.find(section => 
    section.modules.some(module => module.key === activeModule)
  );
  const currentAdvancedModule = currentAdvancedSection?.modules.find(m => m.key === activeModule);

  return (
    <div className="flex items-center justify-between w-full">
      {/* User Level Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-gray-800 rounded-lg p-1">
          <Button
            size="sm"
            variant={userLevel === "beginner" ? "default" : "ghost"}
            onClick={() => onUserLevelChange?.("beginner")}
            className="px-3 py-1 text-xs"
            data-testid="beginner-mode"
          >
            <User className="w-3 h-3 mr-1" />
            Simple
          </Button>
          <Button
            size="sm"
            variant={userLevel === "advanced" ? "default" : "ghost"}
            onClick={() => onUserLevelChange?.("advanced")}
            className="px-3 py-1 text-xs"
            data-testid="advanced-mode"
          >
            <Brain className="w-3 h-3 mr-1" />
            Pro
          </Button>
        </div>

        {/* Navigation Menu */}
        {userLevel === "beginner" ? (
          // Simple horizontal menu for beginners
          <div className="flex items-center space-x-2">
            {beginnerModules.map((module) => (
              <Button
                key={module.key}
                variant={activeModule === module.key ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveModule(module.key)}
                className="flex items-center gap-2"
                data-testid={`nav-${module.key}`}
              >
                {module.icon}
                <span className="hidden md:inline">{module.label}</span>
                {module.key === "alerts" && alertCount > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {alertCount}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        ) : (
          // Advanced dropdown menu for pros
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 bg-gray-800 border-gray-600 hover:bg-gray-700"
                data-testid="advanced-nav-dropdown"
              >
                {currentAdvancedSection?.icon}
                <span className="hidden md:inline">
                  {currentAdvancedModule?.label || "Select Tool"}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 bg-gray-800 border-gray-600">
              {advancedSections.map((section) => (
                <div key={section.title}>
                  <DropdownMenuLabel className="flex items-center gap-2 text-gray-300">
                    {section.icon}
                    {section.title}
                  </DropdownMenuLabel>
                  {section.modules.map((module) => (
                    <DropdownMenuItem
                      key={module.key}
                      onClick={() => setActiveModule(module.key)}
                      className={`cursor-pointer hover:bg-gray-700 ${
                        activeModule === module.key ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300'
                      }`}
                      data-testid={`nav-advanced-${module.key}`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{module.label}</span>
                        <span className="text-xs text-gray-400">{module.description}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-gray-600" />
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center space-x-2">
        {userLevel === "beginner" && (
          <div className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
            Tracking {(1886).toLocaleString()} cryptos
          </div>
        )}
        
        {userLevel === "advanced" && (
          <div className="flex items-center space-x-2">
            <Button
              variant={activeModule === "portfolio" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveModule("portfolio")}
              className="hidden sm:flex"
              data-testid="quick-portfolio"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="ml-1 hidden lg:inline">Portfolio</span>
            </Button>

            <Button
              variant={activeModule === "alerts" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveModule("alerts")}
              className="relative"
              data-testid="quick-alerts"
            >
              <Bell className="w-4 h-4" />
              {alertCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {alertCount}
                </Badge>
              )}
              <span className="ml-1 hidden lg:inline">Alerts</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}