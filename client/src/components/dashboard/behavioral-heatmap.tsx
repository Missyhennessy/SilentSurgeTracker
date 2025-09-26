import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, TrendingUp, Activity, Users, Zap, BarChart3, Target, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CryptoAsset } from "@/types/crypto";

interface BehavioralHeatmapData {
  symbol: string;
  name: string;
  price: number;
  sssScore: number;
  confidence: number;
  deviation: number;
  influence: number;
  behavioralMetrics: {
    whaleMovements: number;
    retailActivity: number;
    institutionalFlow: number;
    hodlerBehavior: number;
    tradingVelocity: number;
    socialSentiment: number;
  };
  timeSlots: {
    hour: number;
    day: number;
    activity: number;
    whaleCount: number;
    volume: number;
    sentiment: number;
  }[][];
  lastUpdated: string;
}

export default function BehavioralHeatmap() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: assets } = useQuery<CryptoAsset[]>({
    queryKey: ["/api/assets"],
    refetchInterval: 30000,
  });

  // Fetch behavioral heatmap data for selected asset
  const { data: selectedAsset, isLoading: isLoadingHeatmap, error: heatmapError } = useQuery<BehavioralHeatmapData>({
    queryKey: ["/api/behavioral-heatmap", selectedSymbol],
    enabled: !!selectedSymbol,
    refetchInterval: 60000, // Refresh every minute
  });

  // Filter assets based on search term - using real asset data
  const filteredAssets = useMemo(() => {
    if (!searchTerm) return (assets || []).slice(0, 10); // Show top 10 by default
    return (assets || []).filter(asset => 
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 20); // Limit results
  }, [assets, searchTerm]);

  const getActivityIcon = (deviation: number) => {
    if (deviation > 15) return <Activity className="w-4 h-4 text-red-400" />;
    if (deviation > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (deviation > -15) return <Users className="w-4 h-4 text-blue-400" />;
    return <Zap className="w-4 h-4 text-gray-400" />;
  };

  const getActivityText = (deviation: number) => {
    if (deviation > 15) return "High Activity";
    if (deviation > 0) return "Accumulating";
    if (deviation > -15) return "Holding";
    return "Low Activity";
  };

  const getActivityColor = (deviation: number) => {
    if (deviation > 30) return "bg-red-600";
    if (deviation > 15) return "bg-orange-500";
    if (deviation > 0) return "bg-yellow-500";
    if (deviation > -15) return "bg-green-500";
    return "bg-blue-500";
  };

  const handleAssetSelect = (asset: CryptoAsset) => {
    setSelectedSymbol(asset.symbol);
    setSearchTerm(asset.symbol);
    setShowDropdown(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredAssets.length > 0) {
      handleAssetSelect(filteredAssets[0]);
    }
  };

  const getHeatmapColor = (value: number) => {
    if (value > 80) return 'bg-red-500';
    if (value > 60) return 'bg-orange-500';
    if (value > 40) return 'bg-yellow-500';
    if (value > 20) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const handleClickOutside = () => {
    setShowDropdown(false);
  };

  return (
    <div className="p-3 md:p-4 lg:p-6">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-2">Behavioral Heatmap</h2>
        <p className="text-sm md:text-base text-[var(--text-secondary)]">Search and visualize behavioral patterns for any cryptocurrency</p>
      </div>

      {/* Search Interface */}
      <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-6 mb-6">
        <div className="relative max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4" />
            <Input
              placeholder="Search cryptocurrency (e.g., BTC, ETH, DOGE)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowDropdown(true)}
              className="pl-10 bg-[var(--dark-bg)] border-[var(--dark-border)] text-[var(--text-primary)]"
              data-testid="crypto-search-input"
            />
          </div>
          
          {/* Search Dropdown */}
          {showDropdown && searchTerm && filteredAssets.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--dark-panel)] border border-[var(--dark-border)] rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => handleAssetSelect(asset)}
                  className="w-full px-4 py-3 text-left hover:bg-[var(--dark-bg)] transition-colors border-b border-[var(--dark-border)] last:border-b-0"
                  data-testid={`search-result-${asset.symbol}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[var(--text-primary)] font-semibold">{asset.symbol}</div>
                      <div className="text-[var(--text-secondary)] text-sm truncate">{asset.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-secondary)]">SSS: {asset.sssScore}</span>
                      <div className={`w-3 h-3 ${getActivityColor(asset.change24h || 0)} rounded-full`}></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Visual Behavioral Heatmap for Selected Asset */}
      {selectedSymbol && (
        <div className="space-y-6">
          {isLoadingHeatmap ? (
            <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-blue)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Loading Behavioral Data</h3>
              <p className="text-[var(--text-secondary)]">Analyzing behavioral patterns for {selectedSymbol}...</p>
            </div>
          ) : heatmapError ? (
            <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-12 text-center">
              <Activity className="w-16 h-16 text-[var(--danger-red)] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Data Not Available</h3>
              <p className="text-[var(--text-secondary)] mb-4">Unable to load behavioral data for {selectedSymbol}</p>
              <Button onClick={() => setSelectedSymbol("")} variant="outline">
                Try Another Asset
              </Button>
            </div>
          ) : selectedAsset ? (
            <>
              {/* Asset Header */}
              <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-8 h-8 ${getActivityColor(selectedAsset.deviation)} rounded-full`}></div>
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">{selectedAsset.symbol}</h3>
                    <p className="text-[var(--text-secondary)]">{selectedAsset.name}</p>
                    <p className="text-lg font-semibold text-[var(--primary-blue)]">${selectedAsset.price.toFixed(4)}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {getActivityIcon(selectedAsset.deviation)}
                    <span className="text-[var(--text-primary)] font-semibold">{getActivityText(selectedAsset.deviation)}</span>
                  </div>
                </div>
            
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--primary-blue)]">{selectedAsset.sssScore}</div>
                    <div className="text-sm text-[var(--text-secondary)]">SSS Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--primary-blue)]">{selectedAsset.confidence}%</div>
                    <div className="text-sm text-[var(--text-secondary)]">Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      selectedAsset.deviation > 15 ? 'text-[var(--danger-red)]' :
                      selectedAsset.deviation > 0 ? 'text-[var(--warning-amber)]' :
                      'text-[var(--success-green)]'
                    }`}>
                      {selectedAsset.deviation > 0 ? '+' : ''}{selectedAsset.deviation}%
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">Price Change</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{selectedAsset.influence}/100</div>
                    <div className="text-sm text-[var(--text-secondary)]">Market Influence</div>
                  </div>
                </div>
              </div>

          {/* Behavioral Metrics Grid */}
          <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[var(--primary-blue)]" />
                Behavioral Intensity Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(selectedAsset.behavioralMetrics).map(([key, value]) => {
                  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  return (
                    <div key={key} className="bg-[var(--dark-bg)] rounded-lg p-4 border border-[var(--dark-border)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
                        <Badge 
                          variant={value > 70 ? "destructive" : value > 40 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {value}%
                        </Badge>
                      </div>
                      <Progress value={value} className="h-2" />
                      <div className="mt-2 text-xs text-[var(--text-secondary)]">
                        {value > 80 ? 'Extreme Activity' :
                         value > 60 ? 'High Activity' :
                         value > 40 ? 'Moderate Activity' :
                         value > 20 ? 'Low Activity' : 'Minimal Activity'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Visual Heatmap Grid */}
          <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">24-Hour Activity Heatmap</CardTitle>
              <p className="text-sm text-[var(--text-secondary)]">Behavioral intensity patterns over the last 7 days (rows = hours, columns = days)</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Hour labels */}
                <div className="flex">
                  <div className="w-12"></div>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={index} className="flex-1 text-center text-xs text-[var(--text-secondary)] font-medium">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Heatmap grid */}
                {selectedAsset.timeSlots.map((hourRow, hourIndex) => (
                  <div key={hourIndex} className="flex items-center gap-1">
                    <div className="w-10 text-right text-xs text-[var(--text-secondary)]">
                      {hourIndex.toString().padStart(2, '0')}:00
                    </div>
                    {hourRow.map((timeSlot, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`flex-1 h-6 rounded-sm ${getHeatmapColor(timeSlot.activity)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                        title={`${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIndex]} ${hourIndex}:00 - Activity: ${timeSlot.activity}% | Whales: ${timeSlot.whaleCount} | Volume: $${(timeSlot.volume / 1000).toFixed(0)}K | Sentiment: ${timeSlot.sentiment}%`}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>
              
              {/* Legend */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                <span className="text-[var(--text-secondary)]">Activity Level:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                  <span className="text-[var(--text-secondary)]">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                  <span className="text-[var(--text-secondary)]">Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
                  <span className="text-[var(--text-secondary)]">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-sm"></div>
                  <span className="text-[var(--text-secondary)]">Very High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                  <span className="text-[var(--text-secondary)]">Extreme</span>
                </div>
              </div>
            </CardContent>
          </Card>
            </>
          ) : null
        }
        </div>
      )}

      {/* No Selection State */}
      {!selectedSymbol && (
        /* No Selection State */
        <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-12 text-center">
          <Target className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Select a Cryptocurrency</h3>
          <p className="text-[var(--text-secondary)] mb-6">Use the search bar above to find and select a cryptocurrency to view its behavioral heatmap visualization</p>
          <div className="flex flex-wrap justify-center gap-2">
            {(assets || []).slice(0, 6).map((asset) => (
              <Button
                key={asset.symbol}
                variant="outline"
                size="sm"
                onClick={() => handleAssetSelect(asset)}
                className="bg-[var(--dark-bg)] border-[var(--dark-border)] hover:border-[var(--primary-blue)]/40"
                data-testid={`quick-select-${asset.symbol}`}
              >
                {asset.symbol}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside handler */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={handleClickOutside}
        ></div>
      )}
    </div>
  );
}