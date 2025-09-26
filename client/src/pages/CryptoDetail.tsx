import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Globe, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { CryptoAsset } from "@/types/crypto";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceHistory {
  timestamp: string;
  price: number;
  volume: number;
}

interface CryptoDetails {
  description: string;
  website: string;
  whitepaper: string;
  github: string;
  twitter: string;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number;
  allTimeHigh: number;
  allTimeLow: number;
}

type TimeFrame = '7d' | '30d' | '1y';

export default function CryptoDetail() {
  const { symbol } = useParams();
  const [, setLocation] = useLocation();
  const [timeframe, setTimeframe] = useState<TimeFrame>('7d');

  // Fetch crypto asset by symbol
  const { data: asset, isLoading: assetLoading } = useQuery<CryptoAsset>({
    queryKey: [`/api/assets/symbol/${symbol}`],
    enabled: !!symbol,
  });

  // Fetch detailed information
  const { data: details, isLoading: detailsLoading } = useQuery<CryptoDetails>({
    queryKey: [`/api/assets/${symbol}/details`],
    enabled: !!symbol,
  });

  // Fetch price history
  const { data: priceHistory = [], isLoading: priceLoading } = useQuery<PriceHistory[]>({
    queryKey: [`/api/assets/${symbol}/price-history?timeframe=${timeframe}`],
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Chart configuration
  const chartData = {
    labels: priceHistory.map(point => {
      const date = new Date(point.timestamp);
      return timeframe === '7d' 
        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: 'Price (USD)',
        data: priceHistory.map(point => point.price),
        borderColor: asset && asset.change24h >= 0 ? '#10B981' : '#EF4444',
        backgroundColor: asset && asset.change24h >= 0 ? '#10B98120' : '#EF444420',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: {
          color: '#374151',
        },
        ticks: {
          color: '#9CA3AF',
        }
      },
      y: {
        grid: {
          color: '#374151',
        },
        ticks: {
          color: '#9CA3AF',
          callback: function(value) {
            return '$' + Number(value).toFixed(4);
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  if (assetLoading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-700 rounded w-1/4 animate-pulse"></div>
          <div className="h-64 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-48 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Cryptocurrency Not Found</h2>
          <p className="text-gray-400 mb-6">The cryptocurrency "{symbol}" could not be found.</p>
          <Button onClick={() => setLocation('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation('/')}
          className="mr-4"
          data-testid="button-back-home"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                {asset.symbol}
                <span className="ml-3 text-lg text-gray-400 font-normal">
                  {asset.name}
                </span>
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xl font-semibold text-white">
                  ${asset.price.toFixed(4)}
                </span>
                <Badge variant={asset.change24h >= 0 ? "default" : "destructive"}>
                  {asset.change24h >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                </Badge>
                <Badge variant="secondary">
                  SSS: {asset.sssScore.toFixed(1)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Chart */}
        <div className="lg:col-span-2">
          <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Price Chart</CardTitle>
                <div className="flex space-x-2">
                  {(['7d', '30d', '1y'] as TimeFrame[]).map((tf) => (
                    <Button
                      key={tf}
                      variant={timeframe === tf ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeframe(tf)}
                      data-testid={`button-timeframe-${tf}`}
                    >
                      {tf === '7d' ? '1 Week' : tf === '30d' ? '1 Month' : '1 Year'}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {priceLoading ? (
                  <div className="h-full bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <Line data={chartData} options={chartOptions} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Statistics */}
        <div className="space-y-6">
          <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
            <CardHeader>
              <CardTitle className="text-white">Key Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Market Cap</span>
                <span className="text-white font-medium">
                  ${details?.marketCap.toLocaleString() || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">24h Volume</span>
                <span className="text-white font-medium">
                  ${asset.volume24h?.toLocaleString() || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Circulating Supply</span>
                <span className="text-white font-medium">
                  {details?.circulatingSupply.toLocaleString() || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">All Time High</span>
                <span className="text-white font-medium">
                  ${details?.allTimeHigh.toFixed(4) || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">All Time Low</span>
                <span className="text-white font-medium">
                  ${details?.allTimeLow.toFixed(4) || 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* SSS Breakdown */}
          <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
            <CardHeader>
              <CardTitle className="text-white">SSS Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Behavioral Activity</span>
                <span className="text-white font-medium">
                  {asset.behavioralActivity?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Velocity Anomaly</span>
                <span className="text-white font-medium">
                  {asset.velocityAnomaly?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Community Cohesion</span>
                <span className="text-white font-medium">
                  {asset.communityCohesion?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Anchor Pressure</span>
                <span className="text-white font-medium">
                  {asset.anchorPressure?.toFixed(2) || '0.00'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Information Tabs */}
      <div className="mt-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
              <CardHeader>
                <CardTitle className="text-white">About {asset.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  {detailsLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2"></div>
                    </div>
                  ) : (
                    details?.description || `${asset.name} is a cryptocurrency that leverages blockchain technology to provide decentralized financial solutions. It aims to revolutionize traditional finance by offering faster, cheaper, and more transparent transactions. ${asset.name} utilizes advanced cryptographic techniques and smart contracts to enable secure and efficient peer-to-peer transactions while maintaining decentralization and user privacy.`
                  )}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resources" className="mt-6">
            <Card className="bg-[var(--dark-panel)] border-[var(--dark-border)]">
              <CardHeader>
                <CardTitle className="text-white">Official Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <a
                    href={details?.website || `https://${symbol?.toLowerCase()}.org`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-[var(--dark-hover)] rounded-lg hover:bg-opacity-80 transition-colors"
                    data-testid="link-website"
                  >
                    <Globe className="w-5 h-5 text-blue-400" />
                    <span className="text-white">Official Website</span>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                  </a>
                  
                  <a
                    href={details?.whitepaper || `https://${symbol?.toLowerCase()}.org/whitepaper.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-[var(--dark-hover)] rounded-lg hover:bg-opacity-80 transition-colors"
                    data-testid="link-whitepaper"
                  >
                    <FileText className="w-5 h-5 text-green-400" />
                    <span className="text-white">Whitepaper</span>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                  </a>
                  
                  <a
                    href={details?.github || `https://github.com/${symbol?.toLowerCase()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-[var(--dark-hover)] rounded-lg hover:bg-opacity-80 transition-colors"
                    data-testid="link-github"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span className="text-white">GitHub Repository</span>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}