import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Settings, TrendingUp, Zap, Target, Shuffle } from "lucide-react";
import { QuickStatsGrid } from "@/components/ui/quick-stats";
import { AssetCardSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AssetCard from "./asset-card";
import SSSBreakdown from "./sss-breakdown";
import VelocityChart from "./velocity-chart";
import { CryptoAsset } from "@/types/crypto";
import { useToast } from "@/hooks/use-toast";

export default function AssetScanner() {
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const { toast } = useToast();

  const { data: assets, isLoading, error } = useQuery<CryptoAsset[]>({
    queryKey: ["/api/assets"],
    refetchInterval: 30000, // Refetch every 30 seconds
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

  // Calculate quick stats for the random sample
  const quickStats = assets ? [
    {
      title: "Random Sample",
      value: assets.length,
      icon: Shuffle,
      trend: 'neutral' as const,
      subtitle: "Crypto assets shown"
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
      value: assets.length > 0 ? (assets.reduce((acc, a) => acc + a.sssScore, 0) / assets.length).toFixed(1) : "0",
      icon: Zap,
      trend: 'neutral' as const,
      subtitle: "Sample average"
    },
    {
      title: "Top in Sample",
      value: assets.length > 0 ? `${assets.sort((a, b) => b.sssScore - a.sssScore)[0]?.symbol}` : "N/A",
      icon: TrendingUp,
      trend: 'up' as const,
      subtitle: assets.length > 0 ? `SSS: ${assets.sort((a, b) => b.sssScore - a.sssScore)[0]?.sssScore.toFixed(1)}` : "No data"
    }
  ] : [];



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
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Random Asset Sample</h2>
            <p className="text-sm md:text-base text-gray-400">Discover 40 random cryptocurrencies with real-time SSS scoring</p>
          </div>
          <div className="flex gap-2 self-start md:self-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="mobile-btn"
              onClick={() => window.location.reload()}
              data-testid="button-refresh-sample"
            >
              <Shuffle className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">New Sample</span>
            </Button>
            <Button variant="outline" size="sm" className="mobile-btn">
              <Download className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStatsGrid stats={quickStats} className="mb-4 md:mb-6" />
      </div>
      
      {/* Random Asset Cards Grid */}
      <div className="mb-6 md:mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Random Assets ({assets?.length || 0})
          </h3>
          <Badge variant="secondary">Random Sample</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="assets-grid">
          {assets?.map((asset) => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              onSelect={setSelectedAsset}
            />
          ))}
        </div>
      </div>
      
      {/* Detailed Analysis Panel - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
        <SSSBreakdown asset={selectedAsset || assets?.[0]} />
        <VelocityChart asset={selectedAsset || assets?.[0]} />
      </div>
    </div>
  );
}
