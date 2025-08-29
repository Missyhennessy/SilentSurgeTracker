import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Star, Settings, Download, RefreshCw } from "lucide-react";
import { CryptoAsset } from "@/types/crypto";
import { calculateSSS } from "@/lib/sss-calculator";

interface WeightSettings {
  behavioralActivity: number;
  velocityAnomaly: number;
  communityCohesion: number;
  anchorPressure: number;
  hypeToHoldRatio: number;
  historicalVolatility: number;
}

const DEFAULT_WEIGHTS: WeightSettings = {
  behavioralActivity: 20,
  velocityAnomaly: 20,
  communityCohesion: 20,
  anchorPressure: 25,
  hypeToHoldRatio: 10,
  historicalVolatility: 5,
};

export default function CompositeRating() {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [weights, setWeights] = useState<WeightSettings>(DEFAULT_WEIGHTS);
  const [presetMode, setPresetMode] = useState("balanced");
  const [showSettings, setShowSettings] = useState(false);

  const { data: assets } = useQuery<CryptoAsset[]>({
    queryKey: ["/api/assets"],
    refetchInterval: false, // Disabled to prevent refresh cycles
  });

  // Calculate SSS with custom weights
  const calculateCustomSSS = (asset: CryptoAsset) => {
    const weightDecimal = {
      behavioralActivity: weights.behavioralActivity / 100,
      velocityAnomaly: weights.velocityAnomaly / 100,
      communityCohesion: weights.communityCohesion / 100,
      anchorPressure: weights.anchorPressure / 100,
      hypeToHoldRatio: weights.hypeToHoldRatio / 100,
      historicalVolatility: weights.historicalVolatility / 100,
    };
    
    return calculateSSS(asset, weightDecimal);
  };

  // Generate leaderboard with custom scoring
  const leaderboard = (assets || [])
    .map(asset => ({
      ...asset,
      customSSS: calculateCustomSSS(asset),
    }))
    .sort((a, b) => b.customSSS.totalScore - a.customSSS.totalScore);

  // Radar data for selected assets
  const radarData = selectedAssets.length > 0 
    ? [
        { metric: 'Behavioral Activity', ...selectedAssets.reduce((acc, symbol, i) => {
          const asset = assets?.find(a => a.symbol === symbol);
          if (asset) acc[symbol] = asset.behavioralActivity;
          return acc;
        }, {} as any) },
        { metric: 'Velocity Anomaly', ...selectedAssets.reduce((acc, symbol, i) => {
          const asset = assets?.find(a => a.symbol === symbol);
          if (asset) acc[symbol] = asset.velocityAnomaly;
          return acc;
        }, {} as any) },
        { metric: 'Community Cohesion', ...selectedAssets.reduce((acc, symbol, i) => {
          const asset = assets?.find(a => a.symbol === symbol);
          if (asset) acc[symbol] = asset.communityCohesion;
          return acc;
        }, {} as any) },
        { metric: 'Anchor Pressure', ...selectedAssets.reduce((acc, symbol, i) => {
          const asset = assets?.find(a => a.symbol === symbol);
          if (asset) acc[symbol] = asset.anchorPressure;
          return acc;
        }, {} as any) },
        { metric: 'Hype-to-Hold', ...selectedAssets.reduce((acc, symbol, i) => {
          const asset = assets?.find(a => a.symbol === symbol);
          if (asset) acc[symbol] = asset.hypeToHoldRatio;
          return acc;
        }, {} as any) },
      ]
    : [];

  const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#8884D8'];

  const applyPreset = (preset: string) => {
    switch (preset) {
      case "conservative":
        setWeights({
          behavioralActivity: 15,
          velocityAnomaly: 15,
          communityCohesion: 20,
          anchorPressure: 40,
          hypeToHoldRatio: 5,
          historicalVolatility: 5,
        });
        break;
      case "aggressive":
        setWeights({
          behavioralActivity: 30,
          velocityAnomaly: 35,
          communityCohesion: 15,
          anchorPressure: 10,
          hypeToHoldRatio: 5,
          historicalVolatility: 5,
        });
        break;
      case "community":
        setWeights({
          behavioralActivity: 25,
          velocityAnomaly: 15,
          communityCohesion: 35,
          anchorPressure: 15,
          hypeToHoldRatio: 5,
          historicalVolatility: 5,
        });
        break;
      default: // balanced
        setWeights(DEFAULT_WEIGHTS);
    }
    setPresetMode(preset);
  };

  const updateWeight = (key: keyof WeightSettings, value: number[]) => {
    setWeights(prev => ({ ...prev, [key]: value[0] }));
    setPresetMode("custom");
  };

  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  const toggleAssetSelection = (symbol: string) => {
    setSelectedAssets(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol].slice(0, 4) // Max 4 assets for readability
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[var(--success-green)]";
    if (score >= 60) return "text-[var(--warning-amber)]";
    return "text-[var(--danger-red)]";
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Composite Rating Panel</h2>
        <p className="text-[var(--text-secondary)]">Custom scoring with adjustable weightings and asset comparison tools</p>
      </div>

      {/* Controls */}
      <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4">
            <Select value={presetMode} onValueChange={applyPreset}>
              <SelectTrigger className="w-40 bg-[var(--dark-bg)] border-[var(--dark-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="conservative">Conservative</SelectItem>
                <SelectItem value="aggressive">Aggressive</SelectItem>
                <SelectItem value="community">Community Focus</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="bg-[var(--primary-blue)]/10 text-[var(--primary-blue)] border-[var(--primary-blue)]/20"
            >
              <Settings className="w-4 h-4 mr-2" />
              Weights
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-[var(--dark-bg)] border-[var(--dark-border)]">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Badge variant="outline" className={`${totalWeight === 100 ? 'text-[var(--success-green)]' : 'text-[var(--warning-amber)]'}`}>
              Total: {totalWeight}%
            </Badge>
          </div>
        </div>

        {/* Weight Settings Panel */}
        {showSettings && (
          <div className="mt-6 p-4 bg-[var(--dark-bg)] rounded-lg border border-[var(--dark-border)]">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Adjust Component Weights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(weights).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)] capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <span className="text-[var(--text-primary)] font-medium">{value}%</span>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={(val) => updateWeight(key as keyof WeightSettings, val)}
                    max={50}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Leaderboard */}
        <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)] flex items-center gap-2">
              <Star className="w-5 h-5" />
              Custom Score Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.slice(0, 8).map((item, index) => (
                <div 
                  key={item.symbol} 
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedAssets.includes(item.symbol) 
                      ? 'bg-[var(--primary-blue)]/20 border border-[var(--primary-blue)]/40' 
                      : 'bg-[var(--dark-bg)] hover:bg-[var(--dark-border)]/50'
                  }`}
                  onClick={() => toggleAssetSelection(item.symbol)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--text-primary)]">{item.symbol}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{item.name}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(item.customSSS.totalScore)}`}>
                      {item.customSSS.totalScore}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Δ{(item.customSSS.totalScore - item.sssScore).toFixed(0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Radar Comparison */}
        <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)]">
              Asset Comparison Radar
              {selectedAssets.length === 0 && <span className="text-sm text-[var(--text-secondary)] ml-2">(Select assets to compare)</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAssets.length > 0 ? (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--dark-border)" />
                    <PolarAngleAxis 
                      dataKey="metric" 
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]}
                      tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                    />
                    {selectedAssets.map((symbol, index) => (
                      <Radar
                        key={symbol}
                        name={symbol}
                        dataKey={symbol}
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-[var(--text-secondary)]">
                Click on assets in the leaderboard to compare them
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Assets Detail */}
      {selectedAssets.length > 0 && (
        <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)]">Selected Assets Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedAssets.map(symbol => {
                const asset = assets?.find(a => a.symbol === symbol);
                if (!asset) return null;
                
                const customScore = calculateCustomSSS(asset);
                const scoreDiff = customScore.totalScore - asset.sssScore;
                
                return (
                  <div key={symbol} className="p-4 bg-[var(--dark-bg)] rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)]">{asset.symbol}</h4>
                        <p className="text-sm text-[var(--text-secondary)]">{asset.name}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${getScoreColor(customScore.totalScore)}`}>
                          {customScore.totalScore}
                        </div>
                        <div className={`text-xs ${scoreDiff >= 0 ? 'text-[var(--success-green)]' : 'text-[var(--danger-red)]'}`}>
                          {scoreDiff >= 0 ? '+' : ''}{scoreDiff.toFixed(0)} vs default
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Price</span>
                        <span className="text-[var(--text-primary)]">
                          ${asset.price.toLocaleString(undefined, { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: asset.price >= 1 ? 2 : 4 
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">24h Change</span>
                        <span className={asset.change24h >= 0 ? "text-[var(--success-green)]" : "text-[var(--danger-red)]"}>
                          {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Top Component</span>
                        <span className="text-[var(--primary-blue)]">
                          {Object.entries({
                            'Behavioral': customScore.behavioralActivity,
                            'Velocity': customScore.velocityAnomaly,
                            'Cohesion': customScore.communityCohesion,
                            'Anchor': customScore.anchorPressure,
                          }).sort(([,a], [,b]) => b - a)[0][0]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}