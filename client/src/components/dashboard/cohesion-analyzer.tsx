import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Users, Heart, TrendingUp } from "lucide-react";
import { CryptoAsset } from "@/types/crypto";
import { generateSentimentData } from "@/lib/mock-data";

interface CohesionData {
  symbol: string;
  name: string;
  telegram: number;
  discord: number;
  twitter: number;
  reddit: number;
  cohesionScore: number;
  unityLevel: string;
  sentimentTrend: string;
}

export default function CohesionAnalyzer() {
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");
  const [platform, setPlatform] = useState("all");
  const [timeframe, setTimeframe] = useState("24h");

  const { data: assets } = useQuery<CryptoAsset[]>({
    queryKey: ["/api/assets"],
    refetchInterval: false, // Disabled to prevent refresh cycles
  });

  const selectedAssetData = assets?.find(asset => asset.symbol === selectedAsset) || assets?.[0];

  // Generate cohesion data for all assets
  const cohesionData: CohesionData[] = (assets || []).map(asset => {
    const sentiment = generateSentimentData();
    const cohesionScore = (sentiment.telegram + sentiment.discord + sentiment.twitter + sentiment.reddit) / 4;
    const variance = Math.sqrt(
      [sentiment.telegram, sentiment.discord, sentiment.twitter, sentiment.reddit]
        .map(score => Math.pow(score - cohesionScore, 2))
        .reduce((a, b) => a + b, 0) / 4
    );
    
    let unityLevel = "Low";
    if (variance < 10) unityLevel = "High";
    else if (variance < 20) unityLevel = "Moderate";

    const trends = ["Rising", "Stable", "Declining"];
    const sentimentTrend = trends[Math.floor(Math.random() * trends.length)];

    return {
      symbol: asset.symbol,
      name: asset.name,
      telegram: sentiment.telegram,
      discord: sentiment.discord,
      twitter: sentiment.twitter,
      reddit: sentiment.reddit,
      cohesionScore: Math.round(cohesionScore),
      unityLevel,
      sentimentTrend,
    };
  });

  const selectedCohesionData = cohesionData.find(data => data.symbol === selectedAsset) || cohesionData[0];

  // Radar chart data for selected asset
  const radarData = selectedCohesionData ? [
    {
      platform: 'Telegram',
      score: selectedCohesionData.telegram,
      fullMark: 100
    },
    {
      platform: 'Discord',
      score: selectedCohesionData.discord,
      fullMark: 100
    },
    {
      platform: 'Twitter/X',
      score: selectedCohesionData.twitter,
      fullMark: 100
    },
    {
      platform: 'Reddit',
      score: selectedCohesionData.reddit,
      fullMark: 100
    }
  ] : [];

  // Pie chart data for sentiment distribution
  const pieData = selectedCohesionData ? [
    { name: 'Utility Focus', value: Math.random() * 40 + 30, color: '#00C49F' },
    { name: 'Speculation', value: Math.random() * 30 + 20, color: '#FFBB28' },
    { name: 'Technology', value: Math.random() * 20 + 10, color: '#FF8042' },
    { name: 'Community', value: Math.random() * 20 + 10, color: '#0088FE' },
  ] : [];

  const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

  // Comparative cohesion scores
  const comparativeData = cohesionData
    .sort((a, b) => b.cohesionScore - a.cohesionScore)
    .slice(0, 6);

  const getUnityColor = (level: string) => {
    switch (level) {
      case "High": return "text-[var(--success-green)]";
      case "Moderate": return "text-[var(--warning-amber)]";
      default: return "text-[var(--danger-red)]";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "Rising": return "text-[var(--success-green)]";
      case "Stable": return "text-[var(--primary-blue)]";
      default: return "text-[var(--danger-red)]";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Community Cohesion Analyzer</h2>
        <p className="text-[var(--text-secondary)]">Sentiment clustering and community unity analysis across platforms</p>
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

          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-40 bg-[var(--dark-bg)] border-[var(--dark-border)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="telegram">Telegram</SelectItem>
              <SelectItem value="discord">Discord</SelectItem>
              <SelectItem value="twitter">Twitter/X</SelectItem>
              <SelectItem value="reddit">Reddit</SelectItem>
            </SelectContent>
          </Select>

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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Platform Sentiment Radar */}
        <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)]">
              Platform Sentiment - {selectedCohesionData?.symbol}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--dark-border)" />
                  <PolarAngleAxis 
                    dataKey="platform" 
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                  />
                  <Radar
                    name="Sentiment Score"
                    dataKey="score"
                    stroke="var(--primary-blue)"
                    fill="var(--primary-blue)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Distribution */}
        <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)]">Sentiment Focus Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--dark-panel)',
                      border: '1px solid var(--dark-border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cohesion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Cohesion Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {selectedCohesionData?.cohesionScore || 0}/100
            </div>
            <Progress value={selectedCohesionData?.cohesionScore || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
              <Users className="w-4 h-4" />
              Unity Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUnityColor(selectedCohesionData?.unityLevel || "Low")}`}>
              {selectedCohesionData?.unityLevel || "Low"}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">Cross-platform</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Sentiment Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getTrendColor(selectedCohesionData?.sentimentTrend || "Stable")}`}>
              {selectedCohesionData?.sentimentTrend || "Stable"}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">24h trend</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Top Platform
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--primary-blue)]">
              {selectedCohesionData ? 
                Object.entries({
                  Telegram: selectedCohesionData.telegram,
                  Discord: selectedCohesionData.discord,
                  Twitter: selectedCohesionData.twitter,
                  Reddit: selectedCohesionData.reddit
                }).sort(([,a], [,b]) => b - a)[0][0]
                : "N/A"
              }
            </div>
            <p className="text-xs text-[var(--text-secondary)]">Highest sentiment</p>
          </CardContent>
        </Card>
      </div>

      {/* Comparative Cohesion Ranking */}
      <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--text-primary)]">Community Cohesion Ranking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparativeData.map((item, index) => (
              <div key={item.symbol} className="flex items-center justify-between p-4 bg-[var(--dark-bg)] rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">{item.symbol}</div>
                    <div className="text-sm text-[var(--text-secondary)]">{item.name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[var(--text-primary)]">{item.cohesionScore}</div>
                    <div className="text-xs text-[var(--text-secondary)]">Score</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-sm font-semibold ${getUnityColor(item.unityLevel)}`}>
                      {item.unityLevel}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">Unity</div>
                  </div>

                  <Badge 
                    variant="outline"
                    className={`${getTrendColor(item.sentimentTrend).includes('success') ? 'bg-[var(--success-green)]/20 text-[var(--success-green)] border-[var(--success-green)]/20' : 
                               getTrendColor(item.sentimentTrend).includes('primary') ? 'bg-[var(--primary-blue)]/20 text-[var(--primary-blue)] border-[var(--primary-blue)]/20' :
                               'bg-[var(--danger-red)]/20 text-[var(--danger-red)] border-[var(--danger-red)]/20'}`}
                  >
                    {item.sentimentTrend}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}