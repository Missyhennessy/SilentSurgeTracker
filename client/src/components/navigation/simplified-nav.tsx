import { useState } from "react";
import { 
  Search, 
  TrendingUp, 
  BarChart3, 
  Shield, 
  Bell, 
  Brain,
  ChevronDown,
  Star,
  Activity,
  Target,
  Settings,
  Users
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

interface SimplifiedNavProps {
  activeModule: DashboardModule;
  setActiveModule: (module: DashboardModule) => void;
  alertCount?: number;
}

interface NavSection {
  title: string;
  icon: React.ReactNode;
  modules: {
    key: DashboardModule;
    label: string;
    description: string;
  }[];
}

export function SimplifiedNav({ activeModule, setActiveModule, alertCount = 0 }: SimplifiedNavProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const navSections: NavSection[] = [
    {
      title: "Market Discovery",
      icon: <Search className="w-4 h-4" />,
      modules: [
        { key: "scanner", label: "Asset Scanner", description: "Discover trending cryptocurrencies" },
        { key: "watchlist", label: "My Watchlist", description: "Track your favorite assets" },
        { key: "search" as DashboardModule, label: "Crypto Search", description: "Search all cryptocurrencies" }
      ]
    },
    {
      title: "Analysis & Insights",
      icon: <BarChart3 className="w-4 h-4" />,
      modules: [
        { key: "heatmap", label: "Market Heatmap", description: "Behavioral patterns visualization" },
        { key: "velocity", label: "Velocity Tracking", description: "Token movement analysis" },
        { key: "cohesion", label: "Community Analysis", description: "Social cohesion metrics" },
        { key: "sentiment", label: "Market Sentiment", description: "Social media & news analysis" }
      ]
    },
    {
      title: "Portfolio & Trading",
      icon: <TrendingUp className="w-4 h-4" />,
      modules: [
        { key: "portfolio", label: "Portfolio Tracker", description: "Track your investments" },
        { key: "signals", label: "Trading Signals", description: "AI-powered recommendations" },
        { key: "backtest", label: "Strategy Testing", description: "Backtest trading strategies" },
        { key: "optimization", label: "Portfolio Optimizer", description: "Optimize asset allocation" }
      ]
    },
    {
      title: "Risk & Security",
      icon: <Shield className="w-4 h-4" />,
      modules: [
        { key: "risk", label: "Risk Management", description: "Monitor portfolio risks" },
        { key: "alerts", label: "Smart Alerts", description: "Custom price & metric alerts" }
      ]
    },
    {
      title: "Advanced Tools",
      icon: <Brain className="w-4 h-4" />,
      modules: [
        { key: "ml", label: "AI Models", description: "Machine learning insights" },
        { key: "analytics", label: "Historical Data", description: "Long-term trend analysis" },
        { key: "anchor", label: "Anchor Pressure", description: "Price support analysis" },
        { key: "composite", label: "Composite Rating", description: "Overall asset scoring" }
      ]
    }
  ];

  const getCurrentSection = () => {
    return navSections.find(section => 
      section.modules.some(module => module.key === activeModule)
    );
  };

  const currentSection = getCurrentSection();
  const currentModule = currentSection?.modules.find(module => module.key === activeModule);

  return (
    <div className="flex items-center space-x-4">
      {/* Main Navigation Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-gray-800 border-gray-600 hover:bg-gray-700"
          >
            {currentSection?.icon}
            <span className="hidden md:inline">
              {currentModule?.label || "Select Tool"}
            </span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 bg-gray-800 border-gray-600">
          {navSections.map((section) => (
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

      {/* Quick Access Buttons */}
      <div className="flex items-center space-x-2">
        <Button
          variant={activeModule === "scanner" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveModule("scanner")}
          className="hidden sm:flex"
        >
          <Search className="w-4 h-4" />
          <span className="ml-1 hidden lg:inline">Scanner</span>
        </Button>

        <Button
          variant={activeModule === "watchlist" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveModule("watchlist")}
          className="hidden sm:flex"
        >
          <Star className="w-4 h-4" />
          <span className="ml-1 hidden lg:inline">Watchlist</span>
        </Button>

        <Button
          variant={activeModule === "portfolio" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveModule("portfolio")}
          className="hidden sm:flex"
        >
          <TrendingUp className="w-4 h-4" />
          <span className="ml-1 hidden lg:inline">Portfolio</span>
        </Button>

        <Button
          variant={activeModule === "alerts" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveModule("alerts")}
          className="relative"
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
    </div>
  );
}