import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Download, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AssetCard from "./asset-card";
import SSSBreakdown from "./sss-breakdown";
import VelocityChart from "./velocity-chart";
import { CryptoAsset } from "@/types/crypto";

export default function AssetScanner() {
  const [searchTerm, setSearchTerm] = useState("");
  const [marketFilter, setMarketFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);

  const { data: assets, isLoading } = useQuery<CryptoAsset[]>({
    queryKey: ["/api/assets"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

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
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--dark-panel)] rounded w-1/4"></div>
          <div className="h-20 bg-[var(--dark-panel)] rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 bg-[var(--dark-panel)] rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Asset Scanner</h2>
        <p className="text-[var(--text-secondary)]">Search and analyze crypto assets with real-time NBSM scoring</p>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <Input
              type="text"
              placeholder="Search tokens (BTC, ETH, DOGE...)"
              className="pl-10 bg-[var(--dark-bg)] border-[var(--dark-border)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <Select value={marketFilter} onValueChange={setMarketFilter}>
              <SelectTrigger className="w-40 bg-[var(--dark-bg)] border-[var(--dark-border)]">
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
              <SelectTrigger className="w-40 bg-[var(--dark-bg)] border-[var(--dark-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">SSS Score: All</SelectItem>
                <SelectItem value="high">SSS Score: 80+</SelectItem>
                <SelectItem value="medium">SSS Score: 60-80</SelectItem>
                <SelectItem value="low">SSS Score: 40-60</SelectItem>
              </SelectContent>
            </Select>
            
            <Button className="bg-[var(--primary-blue)] hover:bg-[var(--primary-blue)]/80 text-[var(--dark-bg)]">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>
      
      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {filteredAssets.map((asset) => (
          <AssetCard 
            key={asset.id} 
            asset={asset} 
            onSelect={setSelectedAsset}
          />
        ))}
      </div>
      
      {/* Detailed Analysis Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SSSBreakdown asset={selectedAsset || filteredAssets[0]} />
        <VelocityChart asset={selectedAsset || filteredAssets[0]} />
      </div>
    </div>
  );
}
