import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Users, 
  ExternalLink,
  Star,
  StarOff,
  ShoppingCart,
  Info
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CryptoAsset } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PriceDataPoint {
  timestamp: string;
  price: number;
  volume?: number;
}

interface ExchangePair {
  exchange: string;
  pair: string;
  price: number;
  volume_24h: number;
  trust_score?: number;
}

interface AssetMetadata {
  description?: string;
  website?: string;
  whitepaper?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  blockchain?: string;
  contract_address?: string;
}

export default function CryptoDetailPage() {
  const [location, navigate] = useLocation();
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d' | '30d' | '90d'>('24h');
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const { toast } = useToast();

  // Extract symbol from URL path
  const pathParts = location.split('/');
  const symbol = pathParts[pathParts.length - 1];

  const { data: asset, isLoading: assetLoading, isError: assetError } = useQuery<CryptoAsset>({
    queryKey: [`/api/assets/symbol/${symbol}`],
    enabled: !!symbol,
  });

  const { data: priceHistory, isLoading: priceLoading } = useQuery<PriceDataPoint[]>({
    queryKey: [`/api/assets/${symbol}/price-history`, timeframe],
    enabled: !!symbol,
  });

  const { data: exchangePairs, isLoading: pairsLoading } = useQuery<ExchangePair[]>({
    queryKey: [`/api/assets/${symbol}/pairs`],
    enabled: !!symbol,
  });

  const { data: metadata, isLoading: metadataLoading } = useQuery<AssetMetadata>({
    queryKey: [`/api/assets/${symbol}/metadata`],
    enabled: !!symbol,
  });

  const handleWatchlistToggle = async () => {
    try {
      const response = await apiRequest("POST", `/api/assets/${asset?.id}/watchlist`, {
        action: isWatchlisted ? 'remove' : 'add'
      });
      
      if (response.ok) {
        setIsWatchlisted(!isWatchlisted);
        toast({
          title: isWatchlisted ? "Removed from Watchlist" : "Added to Watchlist",
          description: `${asset?.name} has been ${isWatchlisted ? 'removed from' : 'added to'} your watchlist.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update watchlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else if (price >= 0.01) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(8)}`;
    }
  };

  const formatPercentage = (percentage: number) => {
    const isPositive = percentage >= 0;
    return (
      <span className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {Math.abs(percentage).toFixed(2)}%
      </span>
    );
  };

  const getSSSBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  if (assetLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-64"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-700 rounded"></div>
              <div className="h-64 bg-gray-700 rounded"></div>
              <div className="h-64 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (assetError || !asset) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-400">Asset Not Found</CardTitle>
            <CardDescription>
              The cryptocurrency "{symbol}" could not be found or loaded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="hover:bg-gray-700"
                data-testid="back-button"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {asset.symbol.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{asset.name}</h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-gray-300">
                      {asset.symbol}
                    </Badge>
                    <Badge className={getSSSBadgeColor(asset.sssScore || 0)}>
                      SSS: {(asset.sssScore || 0).toFixed(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  {formatPrice(asset.price)}
                </div>
                <div className="text-sm">
                  {asset.change24h !== undefined && formatPercentage(asset.change24h)}
                </div>
              </div>
              
              <Button
                variant={isWatchlisted ? "default" : "outline"}
                onClick={handleWatchlistToggle}
                className="flex items-center gap-2"
                data-testid="watchlist-toggle"
              >
                {isWatchlisted ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                {isWatchlisted ? "Watchlisted" : "Add to Watchlist"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chart">Charts & Analysis</TabsTrigger>
            <TabsTrigger value="exchanges">Where to Buy</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-400">Market Cap</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    ${asset.marketCap ? (asset.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-400">24h Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    ${asset.volume24h ? (asset.volume24h / 1e6).toFixed(2) + 'M' : 'N/A'}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-400">Behavioral Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">
                    {(asset.behavioralActivity || 0).toFixed(1)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-400">Velocity Anomaly</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">
                    {(asset.velocityAnomaly || 0).toFixed(1)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SSS Components */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Silent Surge Score Breakdown</CardTitle>
                <CardDescription>
                  Advanced behavioral analysis components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Community Cohesion</span>
                      <span className="font-bold">{(asset.communityCohesion || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Anchor Pressure</span>
                      <span className="font-bold">{(asset.anchorPressure || 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hype-to-Hold Ratio</span>
                      <span className="font-bold">{(asset.hypeToHoldRatio || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Historical Volatility</span>
                      <span className="font-bold">{(asset.historicalVolatility || 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-4xl font-bold mb-2 ${getSSSBadgeColor(asset.sssScore || 0)} bg-clip-text text-transparent`}>
                        {(asset.sssScore || 0).toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-400">Overall SSS Score</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="chart" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Price Chart</CardTitle>
                <div className="flex gap-2">
                  {(['1h', '24h', '7d', '30d', '90d'] as const).map((period) => (
                    <Button
                      key={period}
                      variant={timeframe === period ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeframe(period)}
                      data-testid={`timeframe-${period}`}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  {priceLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceHistory || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="timestamp" 
                          stroke="#9CA3AF"
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          tickFormatter={(value) => `$${value.toFixed(4)}`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                          labelFormatter={(value) => new Date(value).toLocaleString()}
                          formatter={(value: number) => [`$${value.toFixed(6)}`, 'Price']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#3B82F6" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exchanges Tab */}
          <TabsContent value="exchanges" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Where to Buy {asset.symbol}
                </CardTitle>
                <CardDescription>
                  Top exchanges and trading pairs for {asset.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pairsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : exchangePairs && exchangePairs.length > 0 ? (
                  <div className="space-y-4">
                    {exchangePairs.map((pair, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                        <div>
                          <div className="font-semibold text-white">{pair.exchange}</div>
                          <div className="text-gray-400 text-sm">{pair.pair}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white">{formatPrice(pair.price)}</div>
                          <div className="text-gray-400 text-sm">
                            Vol: ${(pair.volume_24h / 1e6).toFixed(2)}M
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`https://${pair.exchange.toLowerCase().replace(' ', '')}.com`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Trade
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-gray-400">Exchange data not available for this asset</div>
                    <div className="text-sm text-gray-500 mt-2">
                      Try searching on major exchanges like Binance, Coinbase, or Kraken
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Asset Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Symbol:</span>
                    <span className="font-mono">{asset.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span>{asset.name}</span>
                  </div>
                  {metadata?.blockchain && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Blockchain:</span>
                      <span>{metadata.blockchain}</span>
                    </div>
                  )}
                  {metadata?.contract_address && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Contract:</span>
                      <span className="font-mono text-xs break-all">{metadata.contract_address}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated:</span>
                    <span>{new Date(asset.lastUpdated || Date.now()).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {metadata && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Links & Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {metadata.website && (
                      <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <a href={metadata.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Official Website
                        </a>
                      </Button>
                    )}
                    {metadata.whitepaper && (
                      <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <a href={metadata.whitepaper} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Whitepaper
                        </a>
                      </Button>
                    )}
                    {metadata.twitter && (
                      <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <a href={metadata.twitter} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Twitter
                        </a>
                      </Button>
                    )}
                    {metadata.telegram && (
                      <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <a href={metadata.telegram} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Telegram
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {metadata?.description && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>About {asset.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">{metadata.description}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}