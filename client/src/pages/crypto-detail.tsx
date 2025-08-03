import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ArrowLeft, ExternalLink, TrendingUp, TrendingDown, Minus, Calendar, Globe, FileText, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { CryptoAsset } from '@/types/crypto';
import SSSBreakdown from '@/components/dashboard/sss-breakdown';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  url: string;
  category: 'regulatory' | 'technical' | 'market' | 'partnership' | 'adoption';
}

interface PriceDataPoint {
  timestamp: string;
  price: number;
  volume: number;
  marketCap: number;
}

interface CryptoDetails {
  description: string;
  website: string;
  whitepaper?: string;
  github?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply?: number;
  allTimeHigh: number;
  allTimeLow: number;
  ath24hChange: number;
  atl24hChange: number;
  marketCapRank: number;
}

export default function CryptoDetail() {
  const [location, navigate] = useLocation();
  const [timeframe, setTimeframe] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Extract symbol from URL path
  const pathParts = location.split('/');
  const symbol = pathParts[pathParts.length - 1];

  const { data: asset, isError: assetError } = useQuery<CryptoAsset>({
    queryKey: [`/api/assets/symbol/${symbol}`],
    enabled: !!symbol,
  });

  const { data: priceHistory, isLoading: priceLoading } = useQuery<PriceDataPoint[]>({
    queryKey: [`/api/assets/${symbol}/price-history`, timeframe],
    enabled: !!symbol,
  });

  const { data: cryptoDetails, isLoading: detailsLoading } = useQuery<CryptoDetails>({
    queryKey: [`/api/assets/${symbol}/details`],
    enabled: !!symbol,
  });

  const { data: news, isLoading: newsLoading } = useQuery<NewsItem[]>({
    queryKey: [`/api/assets/${symbol}/news`],
    enabled: !!symbol,
  });

  // Generate mock data for demonstration
  const mockPriceHistory = Array.from({ length: 30 }, (_, i) => {
    const basePrice = asset?.price || 100;
    const variance = (Math.random() - 0.5) * 0.1;
    return {
      timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      price: basePrice * (1 + variance),
      volume: Math.random() * 1000000,
      marketCap: basePrice * (1 + variance) * 1000000,
    };
  });

  const mockNews: NewsItem[] = [
    {
      id: '1',
      title: `${symbol} Partnership Announcement with Major Financial Institution`,
      summary: 'Strategic partnership aims to enhance blockchain adoption in traditional finance sector.',
      source: 'CoinDesk',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      impact: 'high',
      url: '#',
      category: 'partnership'
    },
    {
      id: '2',
      title: 'New Regulatory Framework Could Impact Cryptocurrency Trading',
      summary: 'Proposed regulations may require additional compliance measures for crypto exchanges.',
      source: 'Reuters',
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      sentiment: 'negative',
      impact: 'medium',
      url: '#',
      category: 'regulatory'
    },
    {
      id: '3',
      title: `${symbol} Technical Upgrade Improves Network Efficiency`,
      summary: 'Latest protocol update reduces transaction fees and increases throughput.',
      source: 'CoinTelegraph',
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      impact: 'medium',
      url: '#',
      category: 'technical'
    }
  ];

  const mockDetails: CryptoDetails = {
    description: `${asset?.name || symbol} is a leading cryptocurrency that leverages blockchain technology to provide decentralized financial solutions. It aims to revolutionize the traditional financial system by offering faster, cheaper, and more transparent transactions.`,
    website: `https://${symbol?.toLowerCase()}.org`,
    whitepaper: `https://${symbol?.toLowerCase()}.org/whitepaper.pdf`,
    github: `https://github.com/${symbol?.toLowerCase()}`,
    twitter: `https://twitter.com/${symbol?.toLowerCase()}`,
    marketCap: (asset?.price || 0) * 1000000,
    circulatingSupply: 1000000,
    totalSupply: 1000000,
    maxSupply: 2000000,
    allTimeHigh: (asset?.price || 0) * 1.5,
    allTimeLow: (asset?.price || 0) * 0.1,
    ath24hChange: -15.2,
    atl24hChange: 45.8,
    marketCapRank: Math.floor(Math.random() * 100) + 1,
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'negative': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      case 'negative': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (assetError || (!asset && symbol)) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-6 text-blue-400 hover:text-blue-300 border-blue-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center py-12">
            <div className="mb-6">
              <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-3xl font-bold mb-4">Cryptocurrency Not Found</h2>
              <p className="text-lg text-gray-400 mb-6">
                The cryptocurrency "{symbol?.toUpperCase()}" is not available in our current database.
              </p>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="font-semibold mb-2">Available cryptocurrencies include:</h3>
                <p className="text-sm text-gray-400">
                  BTC, ETH, SOL, ADA, DOT, and many others. Please check the main dashboard for the complete list.
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              View All Cryptocurrencies
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-3 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{symbol?.slice(0, 2)}</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{asset.name}</h1>
              <p className="text-gray-400">{symbol}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl md:text-3xl font-bold text-white">
              ${asset.price.toFixed(2)}
            </div>
            <div className={`flex items-center gap-1 ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {asset.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {asset.change24h.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chart">Price Chart</TabsTrigger>
          <TabsTrigger value="analysis">SSS Analysis</TabsTrigger>
          <TabsTrigger value="news">News & Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Key Metrics */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Market Cap</p>
                  <p className="text-lg font-semibold">${mockDetails.marketCap.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">24h Volume</p>
                  <p className="text-lg font-semibold">${(asset.volume || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Market Rank</p>
                  <p className="text-lg font-semibold">#{mockDetails.marketCapRank}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">All-Time High</p>
                  <p className="text-lg font-semibold">${mockDetails.allTimeHigh.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">All-Time Low</p>
                  <p className="text-lg font-semibold">${mockDetails.allTimeLow.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Circulating Supply</p>
                  <p className="text-lg font-semibold">{mockDetails.circulatingSupply.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Silent Surge Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Silent Surge Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2" style={{ color: asset.sssScore >= 70 ? '#10b981' : asset.sssScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                    {asset.sssScore.toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    {asset.sssScore >= 70 ? 'High Potential' : asset.sssScore >= 50 ? 'Medium Potential' : 'Lower Potential'}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('analysis')}>
                    View Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description and Links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  About {asset.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {mockDetails.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Official Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href={mockDetails.website} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                  <Globe className="w-4 h-4" />
                  Official Website
                  <ExternalLink className="w-3 h-3" />
                </a>
                {mockDetails.whitepaper && (
                  <a href={mockDetails.whitepaper} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                    <FileText className="w-4 h-4" />
                    Whitepaper
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {mockDetails.github && (
                  <a href={mockDetails.github} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                    <FileText className="w-4 h-4" />
                    GitHub
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {mockDetails.twitter && (
                  <a href={mockDetails.twitter} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                    <Globe className="w-4 h-4" />
                    Twitter
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chart" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Price History
                </CardTitle>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 Hours</SelectItem>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                    <SelectItem value="90d">90 Days</SelectItem>
                    <SelectItem value="1y">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockPriceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="timestamp"
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      stroke="#9CA3AF"
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#3B82F6"
                      fill="url(#colorPrice)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Volume Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trading Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockPriceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="timestamp"
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      stroke="#9CA3AF"
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Volume']}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#10B981"
                      fill="url(#colorVolume)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <SSSBreakdown asset={asset} />
        </TabsContent>

        <TabsContent value="news" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent News & Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockNews.map((item) => (
                <div key={item.id} className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-semibold text-white text-sm md:text-base">{item.title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getSentimentIcon(item.sentiment)}
                      <Badge variant="outline" className={getSentimentColor(item.sentiment)}>
                        {item.sentiment}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-3">{item.summary}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>{item.source}</span>
                      <span>{new Date(item.publishedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.impact} impact
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        Read more
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Regulatory Impact Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Regulatory Impact Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-green-400">SEC Clarity</p>
                      <p className="text-sm text-gray-400">Clear regulatory guidance provided</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white">Positive</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="font-medium text-yellow-400">Pending Legislation</p>
                      <p className="text-sm text-gray-400">New crypto tax laws under review</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-600 text-white">Neutral</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-900/20 border border-red-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium text-red-400">Exchange Restrictions</p>
                      <p className="text-sm text-gray-400">Potential trading limitations in certain jurisdictions</p>
                    </div>
                  </div>
                  <Badge className="bg-red-600 text-white">Negative</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}