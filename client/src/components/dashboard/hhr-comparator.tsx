import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Scale, TrendingUp, MessageCircle, Heart } from "lucide-react";
import { CryptoAsset } from "@/types/crypto";

interface HHRData {
  symbol: string;
  name: string;
  hypeMetrics: {
    mentions: number;
    memes: number;
    socialBuzz: number;
  };
  holdMetrics: {
    retention: number;
    avgHoldTime: number;
    conviction: number;
  };
  hhrRatio: number;
  convictionLevel: string;
  opportunityZone: boolean;
}

export default function HHRComparator() {
  const [timeframe, setTimeframe] = useState("24h");
  const [sortBy, setSortBy] = useState("hhr");
  const [filterZone, setFilterZone] = useState("all");

  const { data: assets } = useQuery<CryptoAsset[]>({
    queryKey: ["/api/assets"],
    refetchInterval: 30000,
  });

  // Generate HHR data for all assets
  const hhrData: HHRData[] = (assets || []).map(asset => {
    // Generate mock social metrics
    const mentions = Math.floor(Math.random() * 10000 + 1000);
    const memes = Math.floor(Math.random() * 500 + 50);
    const socialBuzz = Math.floor(Math.random() * 100 + 20);
    
    // Generate mock holding metrics
    const retention = Math.floor(Math.random() * 40 + 60); // 60-100%
    const avgHoldTime = Math.floor(Math.random() * 200 + 50); // 50-250 days
    const conviction = Math.floor(Math.random() * 30 + 70); // 70-100%
    
    // Calculate HHR ratio (lower is better - high hold, low hype)
    const hypeScore = (mentions / 100) + (memes * 2) + socialBuzz;
    const holdScore = retention + (avgHoldTime / 5) + conviction;
    const hhrRatio = Math.round((hypeScore / holdScore) * 100) / 100;
    
    let convictionLevel = "Low";
    if (hhrRatio < 0.5) convictionLevel = "High";
    else if (hhrRatio < 1.0) convictionLevel = "Moderate";
    
    // Opportunity zone: low hype, high hold
    const opportunityZone = hhrRatio < 0.8 && retention > 75;

    return {
      symbol: asset.symbol,
      name: asset.name,
      hypeMetrics: {
        mentions,
        memes,
        socialBuzz,
      },
      holdMetrics: {
        retention,
        avgHoldTime,
        conviction,
      },
      hhrRatio,
      convictionLevel,
      opportunityZone,
    };
  });

  // Filter and sort data
  const filteredData = hhrData
    .filter(item => {
      if (filterZone === "opportunity") return item.opportunityZone;
      if (filterZone === "high-conviction") return item.convictionLevel === "High";
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "hhr": return a.hhrRatio - b.hhrRatio; // Lower HHR is better
        case "conviction": return b.holdMetrics.conviction - a.holdMetrics.conviction;
        case "retention": return b.holdMetrics.retention - a.holdMetrics.retention;
        default: return a.hhrRatio - b.hhrRatio;
      }
    });

  // Scatter plot data for hype vs hold visualization
  const scatterData = hhrData.map(item => ({
    x: item.hypeMetrics.socialBuzz + (item.hypeMetrics.mentions / 100),
    y: item.holdMetrics.retention,
    z: item.hhrRatio,
    symbol: item.symbol,
    opportunityZone: item.opportunityZone,
  }));

  const getConvictionColor = (level: string) => {
    switch (level) {
      case "High": return "text-[var(--success-green)]";
      case "Moderate": return "text-[var(--warning-amber)]";
      default: return "text-[var(--danger-red)]";
    }
  };

  const getHHRColor = (ratio: number) => {
    if (ratio < 0.5) return "text-[var(--success-green)]";
    if (ratio < 1.0) return "text-[var(--warning-amber)]";
    return "text-[var(--danger-red)]";
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Hype-to-Hold Ratio Comparator</h2>
        <p className="text-[var(--text-secondary)]">Social buzz vs. holding conviction analysis to identify opportunity zones</p>
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

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-[var(--dark-bg)] border-[var(--dark-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hhr">HHR Ratio</SelectItem>
                <SelectItem value="conviction">Conviction</SelectItem>
                <SelectItem value="retention">Retention</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterZone} onValueChange={setFilterZone}>
              <SelectTrigger className="w-48 bg-[var(--dark-bg)] border-[var(--dark-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assets</SelectItem>
                <SelectItem value="opportunity">Opportunity Zone</SelectItem>
                <SelectItem value="high-conviction">High Conviction</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[var(--success-green)] rounded-full"></div>
              <span className="text-[var(--text-secondary)]">Opportunity Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[var(--warning-amber)] rounded-full"></div>
              <span className="text-[var(--text-secondary)]">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[var(--danger-red)] rounded-full"></div>
              <span className="text-[var(--text-secondary)]">High Risk</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Hype vs Hold Scatter Plot */}
        <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)]">Hype vs. Hold Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Hype Level"
                    stroke="var(--text-secondary)"
                    fontSize={12}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Retention %"
                    stroke="var(--text-secondary)"
                    fontSize={12}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{
                      backgroundColor: 'var(--dark-panel)',
                      border: '1px solid var(--dark-border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)'
                    }}
                    formatter={(value, name, props) => [
                      name === "x" ? `${value} (Hype)` : `${value}% (Retention)`,
                      props.payload.symbol
                    ]}
                  />
                  <Scatter 
                    data={scatterData} 
                    fill={(entry: any) => entry.opportunityZone ? 'var(--success-green)' : 'var(--primary-blue)'}
                  >
                    {scatterData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.opportunityZone ? 'var(--success-green)' : 'var(--primary-blue)'} 
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Opportunity Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--success-green)]">
                  {hhrData.filter(item => item.opportunityZone).length}
                </div>
                <p className="text-xs text-[var(--text-secondary)]">Low hype, high hold</p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  High Conviction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--primary-blue)]">
                  {hhrData.filter(item => item.convictionLevel === "High").length}
                </div>
                <p className="text-xs text-[var(--text-secondary)]">Strong holders</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-[var(--text-primary)]">Best HHR Ratios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredData.slice(0, 5).map((item, index) => (
                  <div key={item.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{item.symbol}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${getHHRColor(item.hhrRatio)}`}>
                        {item.hhrRatio.toFixed(2)}
                      </span>
                      {item.opportunityZone && (
                        <Badge variant="outline" className="text-xs bg-[var(--success-green)]/20 text-[var(--success-green)] border-[var(--success-green)]/20">
                          OPP
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Asset Analysis */}
      <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--text-primary)]">Detailed HHR Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredData.slice(0, 8).map((item) => (
              <div key={item.symbol} className="p-4 bg-[var(--dark-bg)] rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-[var(--text-primary)]">{item.symbol}</div>
                    <div className="text-sm text-[var(--text-secondary)]">{item.name}</div>
                    {item.opportunityZone && (
                      <Badge variant="outline" className="bg-[var(--success-green)]/20 text-[var(--success-green)] border-[var(--success-green)]/20">
                        Opportunity Zone
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getHHRColor(item.hhrRatio)}`}>
                      {item.hhrRatio.toFixed(2)}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">HHR Ratio</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Hype Metrics */}
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Hype Metrics
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Social Mentions</span>
                        <span className="text-[var(--text-primary)]">{item.hypeMetrics.mentions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Memes/Hour</span>
                        <span className="text-[var(--text-primary)]">{item.hypeMetrics.memes}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Social Buzz</span>
                        <span className="text-[var(--text-primary)]">{item.hypeMetrics.socialBuzz}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Hold Metrics */}
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Hold Metrics
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Retention Rate</span>
                        <span className="text-[var(--text-primary)]">{item.holdMetrics.retention}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Avg Hold Time</span>
                        <span className="text-[var(--text-primary)]">{item.holdMetrics.avgHoldTime}d</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Conviction Score</span>
                        <span className="text-[var(--text-primary)]">{item.holdMetrics.conviction}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}