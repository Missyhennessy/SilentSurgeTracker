import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, TrendingUp, Activity, Users, Zap, BarChart3, Target, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie, BarChart, Bar } from "recharts";
import { CryptoAsset } from "@/types/crypto";
import { generateWhaleActivity } from "@/lib/mock-data";

interface BehavioralData {
  symbol: string;
  name: string;
  activity: string;
  confidence: number;
  deviation: number;
  influence: number;
  color: string;
  heatmapData: {
    timeframe: string;
    walletActivity: number;
    txVolume: number;
    sentiment: number;
    concentration: number;
  }[];
  behavioralMetrics: {
    whaleMovements: number;
    retailActivity: number;
    institutionalFlow: number;
    hodlerBehavior: number;
    tradingVelocity: number;
    socialSentiment: number;
  };
}

export default function BehavioralHeatmap() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<BehavioralData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: assets } = useQuery<CryptoAsset[]>({
    queryKey: ["/api/assets"],
    refetchInterval: 30000,
  });

  // Generate behavioral data for search
  const behavioralAssets: BehavioralData[] = useMemo(() => {
    return (assets || []).map(asset => {
      const whaleActivity = generateWhaleActivity();
      const deviation = (Math.random() - 0.5) * 60 + 20;
      const influence = Math.random() * 100;
      
      // Generate heatmap time series data
      const heatmapData = Array.from({ length: 24 }, (_, i) => ({
        timeframe: `${23 - i}h ago`,
        walletActivity: Math.floor(Math.random() * 100),
        txVolume: Math.floor(Math.random() * 100),
        sentiment: Math.floor(Math.random() * 100),
        concentration: Math.floor(Math.random() * 100),
      }));

      // Generate behavioral metrics
      const behavioralMetrics = {
        whaleMovements: Math.floor(Math.random() * 100),
        retailActivity: Math.floor(Math.random() * 100),
        institutionalFlow: Math.floor(Math.random() * 100),
        hodlerBehavior: Math.floor(Math.random() * 100),
        tradingVelocity: Math.floor(Math.random() * 100),
        socialSentiment: Math.floor(Math.random() * 100),
      };

      let color = "bg-gray-600";
      if (deviation > 30) color = "bg-red-600";
      else if (deviation > 15) color = "bg-orange-500";
      else if (deviation > 0) color = "bg-yellow-500";
      else if (deviation > -15) color = "bg-green-500";
      else color = "bg-blue-500";

      return {
        symbol: asset.symbol,
        name: asset.name,
        activity: whaleActivity.activity,
        confidence: whaleActivity.confidence,
        deviation: Math.round(deviation),
        influence: Math.round(influence),
        color,
        heatmapData,
        behavioralMetrics,
      };
    });
  }, [assets]);

  // Filter assets based on search term
  const filteredAssets = useMemo(() => {
    if (!searchTerm) return behavioralAssets.slice(0, 10); // Show top 10 by default
    return behavioralAssets.filter(asset => 
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 20); // Limit results
  }, [behavioralAssets, searchTerm]);

  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case 'accumulating': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'distributing': return <Activity className="w-4 h-4 text-red-400" />;
      case 'holding': return <Users className="w-4 h-4 text-blue-400" />;
      default: return <Zap className="w-4 h-4 text-gray-400" />;
    }
  };

  const getIntensityLabel = (deviation: number) => {
    if (deviation > 30) return "Extreme";
    if (deviation > 15) return "High";
    if (deviation > 0) return "Moderate";
    if (deviation > -15) return "Low";
    return "Minimal";
  };

  const handleAssetSelect = (asset: BehavioralData) => {
    setSelectedAsset(asset);
    setSearchTerm(asset.symbol);
    setShowDropdown(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredAssets.length > 0) {
      handleAssetSelect(filteredAssets[0]);
    }
  };

  const generateHeatmapColors = (value: number) => {
    if (value > 80) return '#dc2626'; // Red
    if (value > 60) return '#ea580c'; // Orange
    if (value > 40) return '#eab308'; // Yellow
    if (value > 20) return '#16a34a'; // Green
    return '#2563eb'; // Blue
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
                    <div className={`w-3 h-3 ${asset.color} rounded-full`}></div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Visual Behavioral Heatmap for Selected Asset */}
      {selectedAsset ? (
        <div className="space-y-6">
          {/* Asset Header */}
          <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-8 h-8 ${selectedAsset.color} rounded-full`}></div>
              <div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">{selectedAsset.symbol}</h3>
                <p className="text-[var(--text-secondary)]">{selectedAsset.name}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {getActivityIcon(selectedAsset.activity)}
                <span className="text-[var(--text-primary)] font-semibold capitalize">{selectedAsset.activity}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="text-sm text-[var(--text-secondary)]">Deviation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--text-primary)]">{selectedAsset.influence}/100</div>
                <div className="text-sm text-[var(--text-secondary)]">Influence</div>
              </div>
            </div>
          </div>

          {/* Behavioral Metrics Heatmap */}
          <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[var(--primary-blue)]" />
                Behavioral Intensity Heatmap
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
                        <span 
                          className="px-2 py-1 rounded text-xs font-semibold text-white"
                          style={{ backgroundColor: generateHeatmapColors(value) }}
                        >
                          {value}%
                        </span>
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

          {/* Time-based Activity Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wallet Activity Over Time */}
            <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">Wallet Activity (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={selectedAsset.heatmapData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="timeframe" 
                      tick={{ fontSize: 10, fill: '#9CA3AF' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="walletActivity" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Transaction Volume Heatmap */}
            <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">Transaction Volume (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={selectedAsset.heatmapData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="timeframe" 
                      tick={{ fontSize: 10, fill: '#9CA3AF' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="txVolume" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sentiment & Concentration Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">Sentiment Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={selectedAsset.heatmapData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="timeframe" 
                      tick={{ fontSize: 10, fill: '#9CA3AF' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sentiment" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">Whale Concentration</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={selectedAsset.heatmapData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="timeframe" 
                      tick={{ fontSize: 10, fill: '#9CA3AF' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="concentration" 
                      stroke="#F59E0B" 
                      fill="#F59E0B" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* No Selection State */
        <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-12 text-center">
          <Target className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Select a Cryptocurrency</h3>
          <p className="text-[var(--text-secondary)] mb-6">Use the search bar above to find and select a cryptocurrency to view its behavioral heatmap visualization</p>
          <div className="flex flex-wrap justify-center gap-2">
            {behavioralAssets.slice(0, 6).map((asset) => (
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


    </div>
  );
}