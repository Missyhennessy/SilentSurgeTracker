import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  MessageSquare, 
  Newspaper,
  ThermometerSun,
  Globe,
  RefreshCw,
  Star,
  Hash
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface SentimentAnalysis {
  symbol: string;
  overall_sentiment: 'bullish' | 'bearish' | 'neutral';
  sentiment_score: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  platforms: {
    twitter: { score: number; volume: number; trend: string };
    reddit: { score: number; volume: number; trend: string };
    discord: { score: number; volume: number; trend: string };
    telegram: { score: number; volume: number; trend: string };
    news: { score: number; volume: number; trend: string };
  };
  top_influencers: Array<{
    handle: string;
    platform: string;
    followers: number;
    accuracy: number;
    influence_score: number;
    recent_sentiment: string;
  }>;
  fear_greed_index: number;
  social_dominance: number;
}

interface NewsEvent {
  id: string;
  title: string;
  source: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: string;
  category: string;
}

interface FearGreedIndex {
  value: number;
  classification: string;
  description: string;
}

interface TrendingTopic {
  topic: string;
  mentions: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  change: number;
}

export function SentimentDashboard() {
  const { toast } = useToast();
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [sentimentData, setSentimentData] = useState<SentimentAnalysis | null>(null);
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>([]);
  const [fearGreedIndex, setFearGreedIndex] = useState<FearGreedIndex | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const symbols = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA'];

  useEffect(() => {
    loadSentimentData();
    loadNewsEvents();
    loadFearGreedIndex();
    loadTrendingTopics();
  }, [selectedSymbol]);

  const loadSentimentData = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest(`/api/sentiment/${selectedSymbol}`) as SentimentAnalysis;
      setSentimentData(data);
    } catch (error: any) {
      toast({
        title: "Failed to Load Sentiment Data",
        description: error.message || "Could not fetch sentiment analysis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadNewsEvents = async () => {
    try {
      const data = await apiRequest(`/api/sentiment/news/${selectedSymbol}`) as NewsEvent[];
      setNewsEvents(data);
    } catch (error: any) {
      console.error('Failed to load news events:', error);
    }
  };

  const loadFearGreedIndex = async () => {
    try {
      const data = await apiRequest('/api/sentiment/fear-greed') as FearGreedIndex;
      setFearGreedIndex(data);
    } catch (error: any) {
      console.error('Failed to load fear-greed index:', error);
    }
  };

  const loadTrendingTopics = async () => {
    try {
      const data = await apiRequest('/api/sentiment/trending') as TrendingTopic[];
      setTrendingTopics(data);
    } catch (error: any) {
      console.error('Failed to load trending topics:', error);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'bearish':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getFearGreedColor = (value: number) => {
    if (value <= 25) return 'text-red-600 bg-red-50';
    if (value <= 45) return 'text-orange-600 bg-orange-50';
    if (value <= 55) return 'text-gray-600 bg-gray-50';
    if (value <= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Enhanced Sentiment Analysis
              </CardTitle>
              <CardDescription>
                Multi-platform social sentiment and market psychology analysis
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="flex gap-1">
                {symbols.map(symbol => (
                  <Button
                    key={symbol}
                    variant={selectedSymbol === symbol ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSymbol(symbol)}
                  >
                    {symbol}
                  </Button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadSentimentData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="platforms">Platforms</TabsTrigger>
              <TabsTrigger value="influencers">Influencers</TabsTrigger>
              <TabsTrigger value="news">News & Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {sentimentData && (
                <>
                  {/* Overall Sentiment */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(sentimentData.overall_sentiment)}
                          <div>
                            <p className="text-2xl font-bold capitalize">{sentimentData.overall_sentiment}</p>
                            <p className="text-sm text-gray-600">Overall Sentiment</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-2xl font-bold">{(sentimentData.sentiment_score * 100).toFixed(1)}</p>
                            <p className="text-sm text-gray-600">Sentiment Score</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="text-2xl font-bold">{sentimentData.social_dominance.toFixed(1)}%</p>
                            <p className="text-sm text-gray-600">Social Dominance</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-2xl font-bold">{(sentimentData.confidence * 100).toFixed(0)}%</p>
                            <p className="text-sm text-gray-600">Confidence</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Fear & Greed Index */}
                  {fearGreedIndex && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ThermometerSun className="h-5 w-5" />
                          Fear & Greed Index
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-3xl font-bold">{fearGreedIndex.value}</p>
                            <Badge className={getFearGreedColor(fearGreedIndex.value)}>
                              {fearGreedIndex.classification}
                            </Badge>
                          </div>
                          <div className="w-32">
                            <Progress value={fearGreedIndex.value} className="h-2" />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{fearGreedIndex.description}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Sentiment Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Sentiment Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(sentimentData.platforms).map(([platform, data]) => (
                          <div key={platform} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="capitalize font-medium">{platform}</span>
                              <Badge variant="outline">{data.trend}</Badge>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-500">{data.volume.toLocaleString()} mentions</span>
                              <div className="w-24">
                                <Progress 
                                  value={((data.score + 1) / 2) * 100} 
                                  className="h-2"
                                />
                              </div>
                              <span className="text-sm w-12 text-right">
                                {(data.score * 100).toFixed(0)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="platforms" className="space-y-6">
              {sentimentData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(sentimentData.platforms).map(([platform, data]) => (
                    <Card key={platform}>
                      <CardHeader>
                        <CardTitle className="capitalize flex items-center justify-between">
                          {platform}
                          <Badge variant="outline" className={getSentimentColor(
                            data.score > 0.1 ? 'bullish' : data.score < -0.1 ? 'bearish' : 'neutral'
                          )}>
                            {data.score > 0.1 ? 'Bullish' : data.score < -0.1 ? 'Bearish' : 'Neutral'}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Score:</span>
                            <span className="font-medium">{(data.score * 100).toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Volume:</span>
                            <span className="font-medium">{data.volume.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Trend:</span>
                            <Badge variant="outline">{data.trend}</Badge>
                          </div>
                          <Progress 
                            value={((data.score + 1) / 2) * 100} 
                            className="h-2"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="influencers" className="space-y-6">
              {sentimentData && sentimentData.top_influencers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Crypto Influencers</CardTitle>
                    <CardDescription>
                      Key opinion leaders and their recent sentiment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sentimentData.top_influencers.map((influencer, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <div>
                              <p className="font-medium">{influencer.handle}</p>
                              <p className="text-sm text-gray-600 capitalize">{influencer.platform}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-sm font-medium">{(influencer.followers / 1000000).toFixed(1)}M</p>
                              <p className="text-xs text-gray-500">Followers</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium">{(influencer.accuracy * 100).toFixed(0)}%</p>
                              <p className="text-xs text-gray-500">Accuracy</p>
                            </div>
                            <Badge className={getSentimentColor(influencer.recent_sentiment)}>
                              {influencer.recent_sentiment}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="news" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* News Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Newspaper className="h-5 w-5" />
                      Recent News Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {newsEvents.slice(0, 5).map((event) => (
                        <div key={event.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={getImpactColor(event.impact)}>
                              {event.impact.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm font-medium mb-1">{event.title}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{event.source}</span>
                            <Badge variant="outline" className={getSentimentColor(event.sentiment)}>
                              {event.sentiment}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Trending Topics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hash className="h-5 w-5" />
                      Trending Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {trendingTopics.map((topic, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{topic.topic}</p>
                            <p className="text-sm text-gray-600">{topic.mentions.toLocaleString()} mentions</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getSentimentColor(topic.sentiment)}>
                              {topic.sentiment}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {topic.change > 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              <span className={`text-sm ${topic.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {Math.abs(topic.change).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}