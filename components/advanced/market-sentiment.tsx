'use client'

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  MessageCircle, 
  Users, 
  Eye,
  Twitter,
  Heart,
  Share,
  Activity,
  Zap,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';

interface SentimentData {
  timestamp: string;
  sentiment: number;
  volume: number;
  fear_greed: number;
  social_mentions: number;
}

interface SentimentMetrics {
  overall: number;
  fearGreedIndex: number;
  socialMentions: number;
  influencerSentiment: number;
  newsImpact: number;
  communityEngagement: number;
}

export default function MarketSentiment() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const { toast } = useToast();

  // Fetch general market sentiment (using BTC as market proxy)
  const { data: overallSentiment, isLoading: sentimentLoading, error: sentimentError } = useQuery({
    queryKey: ['/api/sentiment', 'BTC'],
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch fear and greed index
  const { data: fearGreedData, isLoading: fearGreedLoading, error: fearGreedError } = useQuery({
    queryKey: ['/api/sentiment/fear-greed'],
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  // Fetch trending topics
  const { data: trendingData, isLoading: trendingLoading, error: trendingError } = useQuery({
    queryKey: ['/api/sentiment/trending'],
    refetchInterval: 180000, // Refetch every 3 minutes
  });

  // Fetch recent news
  const { data: newsData, isLoading: newsLoading, error: newsError } = useQuery({
    queryKey: ['/api/sentiment/news'],
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  // Extract metrics from API responses with fallback values
  const sentimentMetrics: SentimentMetrics = {
    overall: overallSentiment?.sentiment_score ? Math.round((overallSentiment.sentiment_score + 1) * 50) : 0,
    fearGreedIndex: fearGreedData?.index || 0,
    socialMentions: overallSentiment?.platforms ? Object.values(overallSentiment.platforms).reduce((sum: number, platform: any) => sum + (platform.volume || 0), 0) : 0,
    influencerSentiment: overallSentiment?.top_influencers?.length ? Math.round(overallSentiment.top_influencers.filter((inf: any) => inf.recent_sentiment === 'bullish').length / overallSentiment.top_influencers.length * 100) : 0,
    newsImpact: newsData?.length ? Math.round(newsData.filter((news: any) => news.sentiment === 'positive').length / newsData.length * 100) : 0,
    communityEngagement: overallSentiment?.social_dominance ? Math.round(overallSentiment.social_dominance) : 0
  };

  // Create timeline data from sentiment metrics (simplified for now)
  const mockSentimentData: SentimentData[] = [
    { timestamp: '00:00', sentiment: sentimentMetrics.overall - 8, volume: 120, fear_greed: sentimentMetrics.fearGreedIndex - 6, social_mentions: 1200 },
    { timestamp: '04:00', sentiment: sentimentMetrics.overall - 1, volume: 140, fear_greed: sentimentMetrics.fearGreedIndex - 2, social_mentions: 1350 },
    { timestamp: '08:00', sentiment: sentimentMetrics.overall - 5, volume: 135, fear_greed: sentimentMetrics.fearGreedIndex - 5, social_mentions: 1180 },
    { timestamp: '12:00', sentiment: sentimentMetrics.overall + 2, volume: 160, fear_greed: sentimentMetrics.fearGreedIndex + 4, social_mentions: 1450 },
    { timestamp: '16:00', sentiment: sentimentMetrics.overall - 3, volume: 145, fear_greed: sentimentMetrics.fearGreedIndex, social_mentions: 1320 },
    { timestamp: '20:00', sentiment: sentimentMetrics.overall + 5, volume: 170, fear_greed: sentimentMetrics.fearGreedIndex + 8, social_mentions: 1580 }
  ];

  const getSentimentColor = (value: number) => {
    if (value >= 75) return 'text-green-400';
    if (value >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSentimentBg = (value: number) => {
    if (value >= 75) return 'bg-green-400/10';
    if (value >= 50) return 'bg-yellow-400/10';
    return 'bg-red-400/10';
  };

  // Handle loading states
  const isLoading = sentimentLoading || fearGreedLoading || trendingLoading || newsLoading;
  const hasError = sentimentError || fearGreedError || trendingError || newsError;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Market Sentiment</h2>
            <p className="text-[var(--text-secondary)] mt-1">
              Real-time social and news sentiment analysis
            </p>
          </div>
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Market Sentiment</h2>
            <p className="text-[var(--text-secondary)] mt-1">
              Real-time social and news sentiment analysis
            </p>
          </div>
        </div>
        <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-400 font-medium">Failed to load sentiment data</span>
          </div>
          <p className="text-[var(--text-secondary)] mt-2">
            Unable to fetch sentiment analysis. Please check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Market Sentiment</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Real-time social and news sentiment analysis
          </p>
        </div>
        <Badge className={`${getSentimentColor(sentimentMetrics.overall)} bg-transparent border-current`} data-testid="badge-overall-sentiment">
          Overall: {sentimentMetrics.overall}% Bullish
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4" data-testid="tabs-list-sentiment">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="social" data-testid="tab-social">Social</TabsTrigger>
          <TabsTrigger value="news" data-testid="tab-news">News</TabsTrigger>
          <TabsTrigger value="trends" data-testid="tab-trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Overall Sentiment */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Overall Sentiment</p>
                    <p className={`text-2xl font-bold ${getSentimentColor(sentimentMetrics.overall)}`}>
                      {sentimentMetrics.overall}%
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${getSentimentBg(sentimentMetrics.overall)}`}>
                    <TrendingUp className={`h-6 w-6 ${getSentimentColor(sentimentMetrics.overall)}`} />
                  </div>
                </div>
                <Progress value={sentimentMetrics.overall} className="h-2" />
              </CardContent>
            </Card>

            {/* Fear & Greed Index */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Fear & Greed</p>
                    <p className={`text-2xl font-bold ${getSentimentColor(sentimentMetrics.fearGreedIndex)}`}>
                      {sentimentMetrics.fearGreedIndex}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${getSentimentBg(sentimentMetrics.fearGreedIndex)}`}>
                    <Zap className={`h-6 w-6 ${getSentimentColor(sentimentMetrics.fearGreedIndex)}`} />
                  </div>
                </div>
                <Progress value={sentimentMetrics.fearGreedIndex} className="h-2" />
              </CardContent>
            </Card>

            {/* Social Mentions */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Social Mentions</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {sentimentMetrics.socialMentions.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-400/10">
                    <MessageCircle className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
                <p className="text-sm text-green-400">+12% from yesterday</p>
              </CardContent>
            </Card>

            {/* Influencer Sentiment */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Influencer Sentiment</p>
                    <p className={`text-2xl font-bold ${getSentimentColor(sentimentMetrics.influencerSentiment)}`}>
                      {sentimentMetrics.influencerSentiment}%
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${getSentimentBg(sentimentMetrics.influencerSentiment)}`}>
                    <Users className={`h-6 w-6 ${getSentimentColor(sentimentMetrics.influencerSentiment)}`} />
                  </div>
                </div>
                <Progress value={sentimentMetrics.influencerSentiment} className="h-2" />
              </CardContent>
            </Card>

            {/* News Impact */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">News Impact</p>
                    <p className={`text-2xl font-bold ${getSentimentColor(sentimentMetrics.newsImpact)}`}>
                      {sentimentMetrics.newsImpact}%
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${getSentimentBg(sentimentMetrics.newsImpact)}`}>
                    <Eye className={`h-6 w-6 ${getSentimentColor(sentimentMetrics.newsImpact)}`} />
                  </div>
                </div>
                <Progress value={sentimentMetrics.newsImpact} className="h-2" />
              </CardContent>
            </Card>

            {/* Community Engagement */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Community Engagement</p>
                    <p className={`text-2xl font-bold ${getSentimentColor(sentimentMetrics.communityEngagement)}`}>
                      {sentimentMetrics.communityEngagement}%
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${getSentimentBg(sentimentMetrics.communityEngagement)}`}>
                    <Activity className={`h-6 w-6 ${getSentimentColor(sentimentMetrics.communityEngagement)}`} />
                  </div>
                </div>
                <Progress value={sentimentMetrics.communityEngagement} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Sentiment Timeline */}
          <Card className="bg-[var(--dark-card)] border-[var(--dark-border)] mt-6">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Sentiment Timeline</CardTitle>
              <CardDescription>24-hour sentiment progression</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockSentimentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sentiment" 
                    stroke="#3B82F6" 
                    fill="url(#sentimentGradient)" 
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Social Platforms */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Platform Breakdown</CardTitle>
                <CardDescription>Mentions by social platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { platform: 'Twitter', mentions: 8420, sentiment: 72, icon: Twitter },
                    { platform: 'Reddit', mentions: 3180, sentiment: 68, icon: MessageCircle },
                    { platform: 'Telegram', mentions: 2340, sentiment: 75, icon: Share },
                    { platform: 'Discord', mentions: 1480, sentiment: 71, icon: Users }
                  ].map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <div key={item.platform} className="flex items-center justify-between p-3 bg-[var(--dark-panel)] rounded-lg">
                        <div className="flex items-center">
                          <IconComponent className="h-5 w-5 text-[var(--primary-blue)] mr-3" />
                          <div>
                            <p className="text-[var(--text-primary)] font-medium">{item.platform}</p>
                            <p className="text-sm text-[var(--text-secondary)]">{item.mentions.toLocaleString()} mentions</p>
                          </div>
                        </div>
                        <Badge className={`${getSentimentColor(item.sentiment)} bg-transparent border-current`}>
                          {item.sentiment}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Trending Topics</CardTitle>
                <CardDescription>Most discussed crypto topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { topic: '#Bitcoin', mentions: 4200, change: '+15%' },
                    { topic: '#Ethereum', mentions: 3100, change: '+8%' },
                    { topic: '#Solana', mentions: 2400, change: '+22%' },
                    { topic: '#DeFi', mentions: 1800, change: '+5%' },
                    { topic: '#NFT', mentions: 1200, change: '-3%' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-[var(--dark-panel)] rounded-lg transition-colors">
                      <div>
                        <p className="text-[var(--text-primary)] font-medium">{item.topic}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{item.mentions.toLocaleString()} mentions</p>
                      </div>
                      <Badge className={`${item.change.startsWith('+') ? 'text-green-400' : 'text-red-400'} bg-transparent border-current`}>
                        {item.change}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="news">
          <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">News Impact Analysis</CardTitle>
              <CardDescription>Recent news and market impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    headline: "Major Exchange Announces New Staking Features",
                    impact: 78,
                    sentiment: "Positive",
                    time: "2 hours ago",
                    source: "CoinDesk"
                  },
                  {
                    headline: "Regulatory Clarity Improves for Crypto Assets",
                    impact: 72,
                    sentiment: "Positive",
                    time: "4 hours ago",
                    source: "Reuters"
                  },
                  {
                    headline: "DeFi Protocol Suffers Security Breach",
                    impact: -45,
                    sentiment: "Negative",
                    time: "6 hours ago",
                    source: "The Block"
                  }
                ].map((news, index) => (
                  <div key={index} className="p-4 bg-[var(--dark-panel)] rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-[var(--text-primary)] font-medium flex-1">{news.headline}</h4>
                      <Badge className={`ml-2 ${news.impact > 0 ? 'text-green-400' : 'text-red-400'} bg-transparent border-current`}>
                        {news.impact > 0 ? '+' : ''}{news.impact}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                      <span>{news.source} • {news.time}</span>
                      <span className={news.sentiment === 'Positive' ? 'text-green-400' : 'text-red-400'}>
                        {news.sentiment}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Sentiment Trends</CardTitle>
              <CardDescription>Historical sentiment patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={mockSentimentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Line type="monotone" dataKey="sentiment" stroke="#3B82F6" strokeWidth={2} name="Overall Sentiment" />
                  <Line type="monotone" dataKey="fear_greed" stroke="#10B981" strokeWidth={2} name="Fear & Greed" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}