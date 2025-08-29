import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, TrendingUp, AlertTriangle, Zap } from "lucide-react";
import { CryptoAsset } from "@/types/crypto";
import { generateVelocityData, generateMetricTimeSeries } from "@/lib/mock-data";
import { calculateVelocityAnomaly } from "@/lib/sss-calculator";

export default function VelocityTracking() {
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");
  const [timeframe, setTimeframe] = useState("24h");
  const [viewMode, setViewMode] = useState("overview");

  const { data: assets } = useQuery<CryptoAsset[]>({
    queryKey: ["/api/assets"],
    refetchInterval: false, // Disabled to prevent refresh cycles
  });

  const selectedAssetData = assets?.find(asset => asset.symbol === selectedAsset) || assets?.[0];
  
  // Generate velocity data for charts
  const velocityData = selectedAssetData 
    ? generateVelocityData(selectedAssetData.id, timeframe === "24h" ? 24 : timeframe === "7d" ? 168 : 720)
    : [];

  const chartData = velocityData.map((point, index) => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      ...(timeframe !== "24h" && { month: 'short', day: 'numeric' })
    }),
    velocity: point.velocity,
    historical: point.historicalAverage,
    anomaly: point.anomalyScore,
    threshold: 2.0, // 2-sigma threshold
  }));

  // Anomaly detection summary
  const anomalies = velocityData.filter(point => point.anomalyScore > 2.0);
  const avgVelocity = velocityData.reduce((acc, point) => acc + point.velocity, 0) / velocityData.length;
  const maxAnomaly = Math.max(...velocityData.map(point => point.anomalyScore));

  // Generate comparative data for all assets
  const comparativeData = (assets || []).map(asset => {
    const recentVelocity = Math.random() * 3 + 0.5;
    const historicalAvg = 1.0;
    const anomalyCalc = calculateVelocityAnomaly(recentVelocity, historicalAvg);
    
    return {
      symbol: asset.symbol,
      name: asset.name,
      velocity: recentVelocity,
      anomalyScore: anomalyCalc.anomalyScore,
      isAnomalous: anomalyCalc.isAnomalous,
      zScore: anomalyCalc.zScore,
      trend: asset.velocityAnomaly > asset.behavioralActivity ? 'up' : 'down',
    };
  }).sort((a, b) => b.anomalyScore - a.anomalyScore);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Velocity Tracking</h2>
        <p className="text-[var(--text-secondary)]">Token velocity anomaly detection and historical analysis</p>
      </div>

      {/* Controls */}
      <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4">
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
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-40 bg-[var(--dark-bg)] border-[var(--dark-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="detailed">Detailed View</SelectItem>
                <SelectItem value="comparative">Comparative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-[var(--primary-blue)]/10 text-[var(--primary-blue)] border-[var(--primary-blue)]/20">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {anomalies.length} Anomalies
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "overview" && (
        <div className="space-y-6">
          {/* Main Velocity Chart */}
          <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">
                Velocity Pattern - {selectedAssetData?.symbol}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
                    <XAxis 
                      dataKey="time" 
                      stroke="var(--text-secondary)"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="var(--text-secondary)"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--dark-panel)',
                        border: '1px solid var(--dark-border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="velocity"
                      stroke="var(--primary-blue)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--primary-blue)', strokeWidth: 2, r: 3 }}
                      name="Current Velocity"
                    />
                    <Line
                      type="monotone"
                      dataKey="historical"
                      stroke="var(--text-secondary)"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Historical Average"
                    />
                    <Line
                      type="monotone"
                      dataKey="threshold"
                      stroke="var(--danger-red)"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                      name="Anomaly Threshold"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Avg Velocity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--text-primary)]">
                  {avgVelocity.toFixed(2)}
                </div>
                <p className="text-xs text-[var(--text-secondary)]">tokens/hour</p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Anomalies Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--danger-red)]">
                  {anomalies.length}
                </div>
                <p className="text-xs text-[var(--text-secondary)]">in {timeframe}</p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Max Anomaly
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--warning-amber)]">
                  {maxAnomaly.toFixed(1)}σ
                </div>
                <p className="text-xs text-[var(--text-secondary)]">standard deviations</p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Signal Strength
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--success-green)]">
                  {maxAnomaly > 3 ? "Strong" : maxAnomaly > 2 ? "Moderate" : "Weak"}
                </div>
                <p className="text-xs text-[var(--text-secondary)]">breakout signal</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {viewMode === "comparative" && (
        <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)]">Velocity Anomaly Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comparativeData.slice(0, 10).map((item, index) => (
                <div key={item.symbol} className="flex items-center justify-between p-3 bg-[var(--dark-bg)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--text-primary)]">{item.symbol}</div>
                      <div className="text-sm text-[var(--text-secondary)]">{item.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">
                        {item.velocity.toFixed(2)}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">velocity</div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${item.anomalyScore > 2 ? 'text-[var(--danger-red)]' : 'text-[var(--warning-amber)]'}`}>
                        {item.anomalyScore.toFixed(1)}σ
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">anomaly</div>
                    </div>

                    <Badge 
                      variant="outline"
                      className={item.isAnomalous 
                        ? "bg-[var(--danger-red)]/20 text-[var(--danger-red)] border-[var(--danger-red)]/20"
                        : "bg-[var(--text-secondary)]/20 text-[var(--text-secondary)] border-[var(--text-secondary)]/20"
                      }
                    >
                      {item.isAnomalous ? "ALERT" : "Normal"}
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