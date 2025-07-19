import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, TrendingUp, Users, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CryptoAsset } from "@/types/crypto";
import { generateWhaleActivity, generateSentimentData } from "@/lib/mock-data";

interface BehavioralCell {
  symbol: string;
  name: string;
  activity: string;
  confidence: number;
  deviation: number;
  influence: number;
  color: string;
}

export default function BehavioralHeatmap() {
  const [timeframe, setTimeframe] = useState("24h");
  const [filterType, setFilterType] = useState("all");

  const { data: assets } = useQuery<CryptoAsset[]>({
    queryKey: ["/api/assets"],
    refetchInterval: 30000,
  });

  // Generate behavioral activity data for each asset
  const behavioralData: BehavioralCell[] = (assets || []).map(asset => {
    const whaleActivity = generateWhaleActivity();
    const deviation = (Math.random() - 0.5) * 60 + 20; // -10 to +50 deviation
    const influence = Math.random() * 100;
    
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
    };
  });

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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Behavioral Heatmap</h2>
        <p className="text-[var(--text-secondary)]">Micro-influencer wallet activity and behavioral deviations</p>
      </div>

      {/* Controls */}
      <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32 bg-[var(--dark-bg)] border-[var(--dark-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 bg-[var(--dark-bg)] border-[var(--dark-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activity</SelectItem>
                <SelectItem value="accumulating">Accumulating</SelectItem>
                <SelectItem value="distributing">Distributing</SelectItem>
                <SelectItem value="holding">Holding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[var(--text-secondary)]">Intensity:</span>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-[var(--text-secondary)]">Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-[var(--text-secondary)]">Moderate</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-[var(--text-secondary)]">High</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-600 rounded"></div>
                <span className="text-[var(--text-secondary)]">Extreme</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {behavioralData
          .filter(item => filterType === "all" || item.activity === filterType)
          .map((item) => (
            <Card key={item.symbol} className="bg-[var(--dark-panel)] border-[var(--dark-border)] hover:border-[var(--primary-blue)]/40 transition-all cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
                    {item.symbol}
                  </CardTitle>
                  <div className={`w-4 h-4 ${item.color} rounded-full`}></div>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{item.name}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getActivityIcon(item.activity)}
                    <span className="text-sm text-[var(--text-secondary)] capitalize">
                      {item.activity}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.confidence}%
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-secondary)]">Deviation</span>
                    <span className={`font-semibold ${
                      item.deviation > 15 ? 'text-[var(--danger-red)]' :
                      item.deviation > 0 ? 'text-[var(--warning-amber)]' :
                      'text-[var(--success-green)]'
                    }`}>
                      {item.deviation > 0 ? '+' : ''}{item.deviation}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-secondary)]">Influence</span>
                    <span className="text-[var(--primary-blue)] font-semibold">
                      {item.influence}/100
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-secondary)]">Intensity</span>
                    <span className="text-[var(--text-primary)] font-semibold">
                      {getIntensityLabel(item.deviation)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[var(--text-secondary)]">Active Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {behavioralData.filter(item => item.activity !== 'inactive').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[var(--text-secondary)]">High Deviation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--danger-red)]">
              {behavioralData.filter(item => item.deviation > 15).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[var(--text-secondary)]">Accumulating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--success-green)]">
              {behavioralData.filter(item => item.activity === 'accumulating').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[var(--text-secondary)]">Avg Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--primary-blue)]">
              {Math.round(behavioralData.reduce((acc, item) => acc + item.confidence, 0) / behavioralData.length)}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}