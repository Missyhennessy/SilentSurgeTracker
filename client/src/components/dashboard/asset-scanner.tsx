import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Download, Settings, TrendingUp, Zap, Target } from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";
import { QuickStatsGrid } from "@/components/ui/quick-stats";
import { AssetCardSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import AssetCard from "./asset-card";
import SSSBreakdown from "./sss-breakdown";
import VelocityChart from "./velocity-chart";
import { CryptoAsset } from "@/types/crypto";
import { useToast } from "@/hooks/use-toast";

export default function AssetScanner() {
  const [searchTerm, setSearchTerm] = useState("");
  const [marketFilter, setMarketFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();

  const { data: assets, isLoading, error } = useQuery<CryptoAsset[]>({
    queryKey: ["/api/assets"],
    refetchInterval: false, // Disabled to prevent refresh cycles
    staleTime: 300000, // 5 minutes to reduce polling
  });

  // Handle error toast in useEffect to avoid infinite re-renders
  useEffect(() => {
    if (error) {
      toast({
        title: "Error Loading Assets",
        description: "Failed to fetch cryptocurrency data. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Calculate quick stats
  const quickStats = assets ? [
    {
      title: "Total Assets",
      value: assets.length,
      icon: Target,
      trend: 'neutral' as const,
      subtitle: "Monitored assets"
    },
    {
      title: "High SSS (80+)",
      value: assets.filter(a => a.sssScore >= 80).length,
      icon: TrendingUp,
      trend: 'up' as const,
      subtitle: "Strong surge potential",
      badge: "HOT"
    },
    {
      title: "Avg SSS Score",
      value: (assets.reduce((acc, a) => acc + a.sssScore, 0) / assets.length).toFixed(1),
      icon: Zap,
      trend: 'neutral' as const,
      subtitle: "Market average"
    },
    {
      title: "Top Performer",
      value: `${assets.sort((a, b) => b.sssScore - a.sssScore)[0]?.symbol}`,
      icon: TrendingUp,
      trend: 'up' as const,
      subtitle: `SSS: ${assets.sort((a, b) => b.sssScore - a.sssScore)[0]?.sssScore.toFixed(1)}`
    }
  ] : [];

  const filteredAssets = assets?.filter(asset => {
    const matchesSearch = asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesScore = scoreFilter === "all" ||
                        (scoreFilter === "high" && asset.sssScore >= 80) ||
                        (scoreFilter === "medium" && asset.sssScore >= 60 && asset.sssScore < 80) ||
                        (scoreFilter === "low" && asset.sssScore < 60);
    
    return matchesSearch && matchesScore;
  }) || [];



  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-700 rounded w-1/4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
          <div className="h-16 bg-gray-700 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <AssetCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 lg:p-6">
      {/* Header - Mobile Optimized */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0 md:gap-4 mb-4 md:mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Asset Scanner</h2>
            <p className="text-sm md:text-base text-gray-400">Search and analyze crypto assets with real-time SSS scoring</p>
          </div>
          <div className="flex gap-2 self-start md:self-auto">
            <Button variant="outline" size="sm" className="mobile-btn">
              <Download className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button variant="outline" size="sm" className="mobile-btn">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStatsGrid stats={quickStats} className="mb-4 md:mb-6" />
      </div>
      
      {/* Search and Filters - Mobile Optimized */}
      <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-3 md:p-4 lg:p-6 mb-4 md:mb-6">
        <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search tokens (BTC, ETH, DOGE...)"
              onClear={() => setSearchTerm("")}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
            <Select value={marketFilter} onValueChange={setMarketFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-[var(--dark-bg)] border-[var(--dark-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                <SelectItem value="high-volume">High Volume</SelectItem>
                <SelectItem value="low-cap">Low Cap</SelectItem>
                <SelectItem value="new-listings">New Listings</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-[var(--dark-bg)] border-[var(--dark-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">SSS Score: All</SelectItem>
                <SelectItem value="high">SSS Score: 80+</SelectItem>
                <SelectItem value="medium">SSS Score: 60-80</SelectItem>
                <SelectItem value="low">SSS Score: 40-60</SelectItem>
              </SelectContent>
            </Select>
            
            <Button className="bg-[var(--primary-blue)] hover:bg-[var(--primary-blue)]/80 text-[var(--dark-bg)] mobile-btn">
              <Filter className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Asset Cards Grid - Mobile Optimized */}
      <div className="asset-grid mb-6 md:mb-8">
        {filteredAssets.map((asset) => (
          <AssetCard 
            key={asset.id} 
            asset={asset} 
            onSelect={setSelectedAsset}
          />
        ))}
      </div>
      
      {/* Detailed Analysis Panel - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
        <SSSBreakdown asset={selectedAsset || filteredAssets[0]} />
        <VelocityChart asset={selectedAsset || filteredAssets[0]} />
      </div>
    </div>
  );
}
