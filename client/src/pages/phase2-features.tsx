import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  TrendingUp, 
  Brain, 
  Coins, 
  Users, 
  BarChart3,
  DollarSign,
  Target,
  Zap,
  Eye,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Whale Tracking Dashboard Component
function WhaleTrackingDashboard() {
  const { data: transactions } = useQuery({
    queryKey: ["/api/whale/transactions"],
    refetchInterval: false, // Disabled to prevent refresh cycles
  });

  const { data: sentiment } = useQuery({
    queryKey: ["/api/whale/sentiment"],
    refetchInterval: false, // Disabled to prevent refresh cycles
  });

  const { data: wallets } = useQuery({
    queryKey: ["/api/whale/wallets"],
    refetchInterval: false, // Disabled to prevent refresh cycles
  });

  return (
    <div className="space-y-6">
      {/* Whale Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Whale Sentiment</p>
                <p className="text-2xl font-bold">{sentiment && typeof sentiment.overall === 'number' ? sentiment.overall.toFixed(1) : '0'}%</p>
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <Progress value={sentiment && typeof sentiment.overall === 'number' ? sentiment.overall : 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Whales</p>
                <p className="text-2xl font-bold">{sentiment && typeof sentiment.activeWhales === 'number' ? sentiment.activeWhales : 0}</p>
              </div>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Flow</p>
                <p className="text-2xl font-bold">
                  ${sentiment && typeof sentiment.netFlow === 'number' ? (sentiment.netFlow / 1000000).toFixed(1) : '0'}M
                </p>
              </div>
              <DollarSign className={`h-4 w-4 ${sentiment && typeof sentiment.netFlow === 'number' && sentiment.netFlow >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Buy Pressure</p>
                <p className="text-2xl font-bold">
                  ${sentiment && typeof sentiment.buyPressure === 'number' ? (sentiment.buyPressure / 1000000).toFixed(1) : '0'}M
                </p>
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Whale Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Whale Transactions
          </CardTitle>
          <CardDescription>
            Large transactions detected in real-time with impact analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(transactions) && transactions.slice(0, 10).map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Badge variant={tx.transactionType === 'buy' ? 'default' : 'destructive'}>
                    {tx.transactionType.toUpperCase()}
                  </Badge>
                  <div>
                    <p className="font-medium">{tx.asset}</p>
                    <p className="text-sm text-muted-foreground">{tx.walletAddress}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${(tx.amount / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-muted-foreground">
                    Impact: {tx.impactScore?.toFixed(1)} | {tx.exchangeSource}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// LSTM Predictions Dashboard Component
function LSTMDashboard() {
  const { data: predictions } = useQuery({
    queryKey: ["/api/lstm/predictions"],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const { data: topPredictions } = useQuery({
    queryKey: ["/api/lstm/top"],
    refetchInterval: 300000,
  });

  const { data: performance } = useQuery({
    queryKey: ["/api/lstm/performance"],
    refetchInterval: 600000,
  });

  return (
    <div className="space-y-6">
      {/* LSTM Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Model Accuracy</p>
                <p className="text-2xl font-bold">
                  {Array.isArray(performance) && performance.length ? (performance.reduce((acc: number, p: any) => acc + p.accuracy, 0) / performance.length).toFixed(1) : '0'}%
                </p>
              </div>
              <Brain className="h-4 w-4 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Models</p>
                <p className="text-2xl font-bold">{Array.isArray(predictions) ? predictions.length : 0}</p>
              </div>
              <Target className="h-4 w-4 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Predictions</p>
                <p className="text-2xl font-bold">
                  {Array.isArray(performance) ? performance.reduce((acc: number, p: any) => acc + p.predictions, 0) : 0}
                </p>
              </div>
              <BarChart3 className="h-4 w-4 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            High-Confidence LSTM Predictions
          </CardTitle>
          <CardDescription>
            AI-powered price predictions with confidence scores and technical analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(topPredictions) && topPredictions.slice(0, 8).map((prediction: any) => {
              const selected = prediction.selectedPrediction || prediction.predictions?.[0];
              return (
                <div key={prediction.asset} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{prediction.asset}</span>
                      <Badge variant={selected?.direction === 'bullish' ? 'default' : selected?.direction === 'bearish' ? 'destructive' : 'secondary'}>
                        {selected?.direction || 'neutral'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Current: ${prediction.currentPrice?.toFixed(4)}
                      </p>
                      <p className="text-sm font-medium">
                        Predicted: ${selected?.predictedPrice?.toFixed(4)} ({selected?.timeframe})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Confidence:</span>
                      <Progress value={selected?.confidence || 0} className="w-20" />
                      <span className="text-sm">{selected?.confidence?.toFixed(0)}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Probability: {((selected?.probability || 0) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// DeFi Integration Dashboard Component
function DeFiDashboard() {
  const { data: opportunities } = useQuery({
    queryKey: ["/api/defi/opportunities"],
    refetchInterval: 600000, // Refresh every 10 minutes
  });

  const { data: protocols } = useQuery({
    queryKey: ["/api/defi/protocols"],
    refetchInterval: 600000,
  });

  const { data: pools } = useQuery({
    queryKey: ["/api/defi/pools"],
    refetchInterval: 600000,
  });

  return (
    <div className="space-y-6">
      {/* DeFi Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total TVL</p>
                <p className="text-2xl font-bold">
                  ${Array.isArray(protocols) ? protocols.reduce((acc: number, p: any) => acc + p.tvl, 0).toLocaleString() : '0'}
                </p>
              </div>
              <Coins className="h-4 w-4 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best APY</p>
                <p className="text-2xl font-bold">
                  {Array.isArray(opportunities) && opportunities.length ? Math.max(...opportunities.map((o: any) => o.expectedAPY)).toFixed(1) : '0'}%
                </p>
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Protocols</p>
                <p className="text-2xl font-bold">{Array.isArray(protocols) ? protocols.length : 0}</p>
              </div>
              <Target className="h-4 w-4 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Yield Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            High-Yield DeFi Opportunities
          </CardTitle>
          <CardDescription>
            Curated yield farming and staking opportunities with risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(opportunities) && opportunities.slice(0, 8).map((opportunity: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">{opportunity.protocol}</p>
                    <p className="text-sm text-muted-foreground">{opportunity.strategy}</p>
                  </div>
                  <Badge variant={
                    opportunity.risk === 'low' ? 'default' : 
                    opportunity.risk === 'medium' ? 'secondary' : 'destructive'
                  }>
                    {opportunity.risk} risk
                  </Badge>
                  <Badge variant="outline">
                    {opportunity.chain}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">
                    {opportunity.expectedAPY?.toFixed(1)}% APY
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Min: ${opportunity.minDeposit} {opportunity.asset}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function Phase2Features() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-500" />
            Phase 2: Advanced Prediction & Analytics
          </CardTitle>
          <CardDescription>
            Cutting-edge whale tracking, LSTM-GRU hybrid models, and DeFi integration for institutional-grade cryptocurrency analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="whale" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="whale" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Whale Tracking
              </TabsTrigger>
              <TabsTrigger value="lstm" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                LSTM Predictions
              </TabsTrigger>
              <TabsTrigger value="defi" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                DeFi Integration
              </TabsTrigger>
            </TabsList>

            <TabsContent value="whale">
              <WhaleTrackingDashboard />
            </TabsContent>

            <TabsContent value="lstm">
              <LSTMDashboard />
            </TabsContent>

            <TabsContent value="defi">
              <DeFiDashboard />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}