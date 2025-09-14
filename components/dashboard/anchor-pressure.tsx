import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Anchor, Timer, TrendingUp, Shield } from "lucide-react";
import { CryptoAsset } from "@/types/crypto";
import { generateAnchorPressureData } from "@/lib/mock-data";

interface AnchorData {
  symbol: string;
  name: string;
  supply90Days: number;
  supply180Days: number;
  supply365Days: number;
  avgHoldTime: number;
  pressureScore: number;
  stabilityLevel: string;
  trend: string;
}

export default function AnchorPressure() {
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");
  const [timeframe, setTimeframe] = useState("90d");
  const [viewMode, setViewMode] = useState("overview");

  const { data: assets } = useQuery<CryptoAsset[]>({
    queryKey: ["/api/assets"],
    refetchInterval: 30000,
  });

  const selectedAssetData = assets?.find(asset => asset.symbol === selectedAsset) || assets?.[0];

  // Auto-select first asset when assets load
  React.useEffect(() => {
    if (assets && assets.length > 0 && !selectedAsset) {
      setSelectedAsset(assets[0].symbol);
    }
  }, [assets, selectedAsset]);

  // Generate anchor pressure data for all assets
  const anchorData: AnchorData[] = (assets || []).map(asset => {
    const pressureData = generateAnchorPressureData();
    const pressureScore = Math.round(
      (pressureData.supply90Days * 0.4) + 
      (pressureData.supply180Days * 0.3) + 
      (pressureData.supply365Days * 0.3)
    );
    
    let stabilityLevel = "Low";
    if (pressureScore > 75) stabilityLevel = "High";
    else if (pressureScore > 50) stabilityLevel = "Moderate";

    const trends = ["Increasing", "Stable", "Decreasing"];
    const trend = trends[Math.floor(Math.random() * trends.length)];

    return {
      symbol: asset.symbol,
      name: asset.name,
      supply90Days: pressureData.supply90Days,
      supply180Days: pressureData.supply180Days,
      supply365Days: pressureData.supply365Days,
      avgHoldTime: pressureData.avgHoldTime,
      pressureScore,
      stabilityLevel,
      trend,
    };
  });

  const selectedAnchorData = anchorData.find(data => data.symbol === selectedAsset) || anchorData[0];

  // Chart data for holding periods
  const holdingPeriodsData = selectedAnchorData ? [
    {
      period: '90+ Days',
      supply: selectedAnchorData.supply90Days,
      color: '#00C49F'
    },
    {
      period: '180+ Days', 
      supply: selectedAnchorData.supply180Days,
      color: '#FFBB28'
    },
    {
      period: '365+ Days',
      supply: selectedAnchorData.supply365Days,
      color: '#FF8042'
    }
  ] : [];

  // Time series data for anchor pressure evolution
  const timeSeriesData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const baseScore = selectedAnchorData?.pressureScore || 70;
    const variation = (Math.random() - 0.5) * 10;
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pressure: Math.max(0, Math.min(100, baseScore + variation)),
      volume: Math.random() * 1000000000 + 500000000, // Random volume for correlation
    };
  });

  // Comparative data - sorted by pressure score
  const comparativeData = anchorData
    .sort((a, b) => b.pressureScore - a.pressureScore)
    .slice(0, 8);

  const getStabilityColor = (level: string) => {
    switch (level) {
      case "High": return "text-[var(--success-green)]";
      case "Moderate": return "text-[var(--warning-amber)]";
      default: return "text-[var(--danger-red)]";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "Increasing": return "text-[var(--success-green)]";
      case "Stable": return "text-[var(--primary-blue)]";
      default: return "text-[var(--danger-red)]";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Anchor Pressure Analysis</h2>
        <p className="text-[var(--text-secondary)]">Long-term holder influence and token stability metrics</p>
      </div>

      {/* Controls */}
      <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <Select value={selectedAsset || assets?.[0]?.symbol || "BTC"} onValueChange={setSelectedAsset}>
            <SelectTrigger className="w-40 bg-[var(--dark-bg)] border-[var(--dark-border)]">
              <SelectValue placeholder="Select Asset" />
            </SelectTrigger>
            <SelectContent>
              {assets?.filter(asset => asset.symbol && asset.symbol.trim()).map(asset => (
                <SelectItem key={asset.symbol} value={asset.symbol}>
                  {asset.symbol} - {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32 bg-[var(--dark-bg)] border-[var(--dark-border)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="180d">180 Days</SelectItem>
              <SelectItem value="365d">1 Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-40 bg-[var(--dark-bg)] border-[var(--dark-border)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="trends">Historical Trends</SelectItem>
              <SelectItem value="comparative">Comparative</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {viewMode === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <Anchor className="w-4 h-4" />
                  Pressure Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--text-primary)]">
                  {selectedAnchorData?.pressureScore || 0}/100
                </div>
                <Progress value={selectedAnchorData?.pressureScore || 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Stability Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getStabilityColor(selectedAnchorData?.stabilityLevel || "Low")}`}>
                  {selectedAnchorData?.stabilityLevel || "Low"}
                </div>
                <p className="text-xs text-[var(--text-secondary)]">Long-term outlook</p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  Avg Hold Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--text-primary)]">
                  {selectedAnchorData?.avgHoldTime || 0}
                </div>
                <p className="text-xs text-[var(--text-secondary)]">days</p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getTrendColor(selectedAnchorData?.trend || "Stable")}`}>
                  {selectedAnchorData?.trend || "Stable"}
                </div>
                <p className="text-xs text-[var(--text-secondary)]">30-day trend</p>
              </CardContent>
            </Card>
          </div>

          {/* Holding Periods Distribution */}
          <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">
                Supply Distribution by Holding Period - {selectedAnchorData?.symbol}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={holdingPeriodsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
                    <XAxis 
                      dataKey="period" 
                      stroke="var(--text-secondary)"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="var(--text-secondary)"
                      fontSize={12}
                      label={{ value: '% of Supply', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--dark-panel)',
                        border: '1px solid var(--dark-border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)'
                      }}
                      formatter={(value) => [`${value}%`, 'Supply Held']}
                    />
                    <Bar 
                      dataKey="supply" 
                      fill="var(--primary-blue)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === "trends" && (
        <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)]">
              Anchor Pressure Evolution - {selectedAnchorData?.symbol}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--dark-panel)',
                      border: '1px solid var(--dark-border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pressure"
                    stroke="var(--success-green)"
                    fill="var(--success-green)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "comparative" && (
        <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)]">Anchor Pressure Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comparativeData.map((item, index) => (
                <div key={item.symbol} className="flex items-center justify-between p-4 bg-[var(--dark-bg)] rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--text-primary)]">{item.symbol}</div>
                      <div className="text-sm text-[var(--text-secondary)]">{item.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-[var(--text-primary)]">{item.pressureScore}</div>
                      <div className="text-xs text-[var(--text-secondary)]">Score</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-semibold text-[var(--primary-blue)]">{item.supply365Days}%</div>
                      <div className="text-xs text-[var(--text-secondary)]">1Y+ Holders</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-semibold text-[var(--warning-amber)]">{item.avgHoldTime}d</div>
                      <div className="text-xs text-[var(--text-secondary)]">Avg Hold</div>
                    </div>

                    <div className="text-center">
                      <div className={`text-sm font-semibold ${getStabilityColor(item.stabilityLevel)}`}>
                        {item.stabilityLevel}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">Stability</div>
                    </div>

                    <Badge 
                      variant="outline"
                      className={`${getTrendColor(item.trend).includes('success') ? 'bg-[var(--success-green)]/20 text-[var(--success-green)] border-[var(--success-green)]/20' : 
                                 getTrendColor(item.trend).includes('primary') ? 'bg-[var(--primary-blue)]/20 text-[var(--primary-blue)] border-[var(--primary-blue)]/20' :
                                 'bg-[var(--danger-red)]/20 text-[var(--danger-red)] border-[var(--danger-red)]/20'}`}
                    >
                      {item.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}