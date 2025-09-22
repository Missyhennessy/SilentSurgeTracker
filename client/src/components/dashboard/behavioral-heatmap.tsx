import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, TrendingUp, Users, Zap, X, Eye, BarChart3, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
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
  const [selectedAsset, setSelectedAsset] = useState<BehavioralCell | null>(null);
  const [showDetails, setShowDetails] = useState(false);

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

  const handleCardClick = (asset: BehavioralCell) => {
    setSelectedAsset(asset);
    setShowDetails(true);
  };

  const generateDetailedAnalysis = (asset: BehavioralCell) => {
    // Generate additional behavioral analytics for the modal
    return {
      walletCount: Math.floor(Math.random() * 500) + 100,
      avgTransactionSize: (Math.random() * 50 + 10).toFixed(2),
      velocityScore: Math.floor(Math.random() * 100),
      concentrationRisk: Math.floor(Math.random() * 100),
      hodlerPercentage: Math.floor(Math.random() * 60) + 20,
      whaleActivity: {
        large_transactions: Math.floor(Math.random() * 20),
        accumulation_score: Math.floor(Math.random() * 100),
        distribution_pressure: Math.floor(Math.random() * 100)
      },
      riskFactors: [
        { factor: "Whale Concentration", level: Math.floor(Math.random() * 100) },
        { factor: "Social Sentiment", level: Math.floor(Math.random() * 100) },
        { factor: "Network Activity", level: Math.floor(Math.random() * 100) },
        { factor: "Exchange Flow", level: Math.floor(Math.random() * 100) }
      ]
    };
  };

  return (
    <div className="p-3 md:p-4 lg:p-6">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-2">Behavioral Heatmap</h2>
        <p className="text-sm md:text-base text-[var(--text-secondary)]">Micro-influencer wallet activity and behavioral deviations</p>
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
            <Card 
              key={item.symbol} 
              className="bg-[var(--dark-panel)] border-[var(--dark-border)] hover:border-[var(--primary-blue)]/40 transition-all cursor-pointer transform hover:scale-105"
              onClick={() => handleCardClick(item)}
              data-testid={`behavioral-card-${item.symbol}`}
            >
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

                <div className="pt-2 border-t border-[var(--dark-border)]">
                  <div className="flex items-center justify-center text-xs text-[var(--primary-blue)] hover:text-[var(--primary-blue)]/80">
                    <Eye className="w-3 h-3 mr-1" />
                    Click for details
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

      {/* Detailed Analysis Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[var(--dark-panel)] border-[var(--dark-border)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[var(--primary-blue)]" />
              Behavioral Analysis: {selectedAsset?.symbol}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAsset && (
            <div className="space-y-6">
              {/* Asset Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[var(--dark-bg)] border-[var(--dark-border)]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-[var(--text-secondary)]">Current Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {getActivityIcon(selectedAsset.activity)}
                      <span className="text-lg font-semibold text-[var(--text-primary)] capitalize">
                        {selectedAsset.activity}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] mt-1">
                      Confidence: {selectedAsset.confidence}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[var(--dark-bg)] border-[var(--dark-border)]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-[var(--text-secondary)]">Deviation Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-lg font-semibold ${
                      selectedAsset.deviation > 15 ? 'text-[var(--danger-red)]' :
                      selectedAsset.deviation > 0 ? 'text-[var(--warning-amber)]' :
                      'text-[var(--success-green)]'
                    }`}>
                      {selectedAsset.deviation > 0 ? '+' : ''}{selectedAsset.deviation}%
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] mt-1">
                      {getIntensityLabel(selectedAsset.deviation)} intensity
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[var(--dark-bg)] border-[var(--dark-border)]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-[var(--text-secondary)]">Influence Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold text-[var(--primary-blue)]">
                      {selectedAsset.influence}/100
                    </div>
                    <Progress value={selectedAsset.influence} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              {(() => {
                const analysis = generateDetailedAnalysis(selectedAsset);
                return (
                  <>
                    {/* Detailed Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-[var(--dark-bg)] border-[var(--dark-border)]">
                        <CardHeader>
                          <CardTitle className="text-sm text-[var(--text-secondary)]">Wallet Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Active Wallets</span>
                            <span className="text-[var(--text-primary)] font-semibold">{analysis.walletCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Avg Transaction</span>
                            <span className="text-[var(--text-primary)] font-semibold">${analysis.avgTransactionSize}K</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">HODL %</span>
                            <span className="text-[var(--success-green)] font-semibold">{analysis.hodlerPercentage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Velocity Score</span>
                            <span className="text-[var(--primary-blue)] font-semibold">{analysis.velocityScore}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-[var(--dark-bg)] border-[var(--dark-border)]">
                        <CardHeader>
                          <CardTitle className="text-sm text-[var(--text-secondary)]">Whale Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Large Transactions</span>
                            <span className="text-[var(--text-primary)] font-semibold">{analysis.whaleActivity.large_transactions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Accumulation</span>
                            <span className="text-[var(--success-green)] font-semibold">{analysis.whaleActivity.accumulation_score}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Distribution</span>
                            <span className="text-[var(--danger-red)] font-semibold">{analysis.whaleActivity.distribution_pressure}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-secondary)]">Concentration Risk</span>
                            <span className="text-[var(--warning-amber)] font-semibold">{analysis.concentrationRisk}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Risk Factors */}
                    <Card className="bg-[var(--dark-bg)] border-[var(--dark-border)]">
                      <CardHeader>
                        <CardTitle className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Risk Factor Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysis.riskFactors.map((risk, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-[var(--text-secondary)]">{risk.factor}</span>
                                <span className={`font-semibold ${
                                  risk.level > 70 ? 'text-[var(--danger-red)]' :
                                  risk.level > 40 ? 'text-[var(--warning-amber)]' :
                                  'text-[var(--success-green)]'
                                }`}>
                                  {risk.level}%
                                </span>
                              </div>
                              <Progress value={risk.level} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                );
              })()}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--dark-border)]">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                  className="bg-[var(--dark-bg)] border-[var(--dark-border)]"
                  data-testid="close-behavioral-details"
                >
                  Close
                </Button>
                <Button 
                  className="bg-[var(--primary-blue)] hover:bg-[var(--primary-blue)]/80"
                  data-testid="add-to-watchlist"
                >
                  Add to Watchlist
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}