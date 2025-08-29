import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  TrendingUp, 
  Star, 
  Plus,
  DollarSign,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface CryptoSearchResult {
  id: string;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  sssScore: number;
  behavioralActivity: number;
  velocityAnomaly: number;
  communityCohesion: number;
  anchorPressure: number;
  hypeToHoldRatio: number;
  historicalVolatility: number;
  lastUpdated: string;
  marketCapRank: number | null;
  circulatingSupply: number | null;
  totalSupply: number | null;
  maxSupply: number | null;
}

interface TrendingCoin {
  id: string;
  symbol: string;
  name: string;
  marketCapRank: number;
  thumb: string;
  score: number;
}

export default function CryptoSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<CryptoSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch trending cryptocurrencies
  const { data: trendingData } = useQuery<{ trending: TrendingCoin[]; lastUpdated: string }>({
    queryKey: ['/api/crypto/trending'],
    refetchInterval: false, // Disabled to prevent refresh cycles
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a cryptocurrency symbol or name",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const response = await fetch(`/api/crypto/search/${encodeURIComponent(searchQuery.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setSearchResult(data);
      toast({
        title: "Cryptocurrency Found",
        description: `${data.name} (${data.symbol}) - $${data.price.toFixed(6)}`,
      });
    } catch (error: any) {
      setSearchError(error.message);
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToTracking = async (symbol: string) => {
    try {
      const response = await fetch('/api/crypto/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add cryptocurrency');
      }

      toast({
        title: "Added to Tracking",
        description: `${symbol} is now being tracked in your portfolio`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to Add",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getSSSColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSSSBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-900/30 text-green-400 border-green-400/20';
    if (score >= 60) return 'bg-yellow-900/30 text-yellow-400 border-yellow-400/20';
    return 'bg-red-900/30 text-red-400 border-red-400/20';
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
            <Search className="w-5 h-5 text-[var(--primary-blue)]" />
            Cryptocurrency Search
          </CardTitle>
          <CardDescription>
            Search for any cryptocurrency including new tokens like LBLOCK, meme coins, and emerging projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter symbol (e.g., LBLOCK, PEPE, BTC) or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-[var(--dark-input)] border-[var(--dark-border)]"
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="bg-[var(--primary-blue)] hover:bg-[var(--primary-blue)]/80"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Search Error */}
          {searchError && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{searchError}</span>
            </div>
          )}

          {/* Search Result */}
          {searchResult && (
            <div className="mt-6 p-4 bg-[var(--dark-panel)] border border-[var(--dark-border)] rounded-lg">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">
                      {searchResult.name}
                    </h3>
                    <Badge variant="outline" className="text-[var(--text-secondary)]">
                      {searchResult.symbol}
                    </Badge>
                    <Badge className={getSSSBadgeColor(searchResult.sssScore)}>
                      SSS: {searchResult.sssScore.toFixed(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Price</p>
                      <p className="text-lg font-bold text-[var(--text-primary)]">
                        ${searchResult.price.toFixed(6)}
                      </p>
                      <p className={`text-sm ${searchResult.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {searchResult.change24h >= 0 ? '+' : ''}{searchResult.change24h.toFixed(2)}%
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Market Cap</p>
                      <p className="text-lg font-bold text-[var(--text-primary)]">
                        ${(searchResult.marketCap / 1e6).toFixed(2)}M
                      </p>
                      {searchResult.marketCapRank && (
                        <p className="text-sm text-[var(--text-secondary)]">
                          Rank #{searchResult.marketCapRank}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">24h Volume</p>
                      <p className="text-lg font-bold text-[var(--text-primary)]">
                        ${(searchResult.volume24h / 1e6).toFixed(2)}M
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Supply</p>
                      {searchResult.circulatingSupply && (
                        <p className="text-lg font-bold text-[var(--text-primary)]">
                          {(searchResult.circulatingSupply / 1e9).toFixed(2)}B
                        </p>
                      )}
                      <p className="text-sm text-[var(--text-secondary)]">Circulating</p>
                    </div>
                  </div>

                  {/* SSS Breakdown */}
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-[var(--text-primary)]">Silent Surge Score Breakdown</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Behavioral Activity:</span>
                        <span className="text-[var(--text-primary)]">{searchResult.behavioralActivity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Velocity Anomaly:</span>
                        <span className="text-[var(--text-primary)]">{searchResult.velocityAnomaly}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Community Cohesion:</span>
                        <span className="text-[var(--text-primary)]">{searchResult.communityCohesion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Anchor Pressure:</span>
                        <span className="text-[var(--text-primary)]">{searchResult.anchorPressure}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Hype-to-Hold:</span>
                        <span className="text-[var(--text-primary)]">{searchResult.hypeToHoldRatio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Volatility:</span>
                        <span className="text-[var(--text-primary)]">{searchResult.historicalVolatility}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleAddToTracking(searchResult.symbol)}
                  className="bg-[var(--primary-blue)] hover:bg-[var(--primary-blue)]/80"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Tracking
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trending Cryptocurrencies */}
      <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
            <TrendingUp className="w-5 h-5 text-[var(--primary-blue)]" />
            Trending Cryptocurrencies
          </CardTitle>
          <CardDescription>
            Discover new and trending cryptocurrencies before they go viral
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trendingData?.trending ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingData.trending.map((coin) => (
                <div 
                  key={coin.id}
                  className="p-3 bg-[var(--dark-panel)] border border-[var(--dark-border)] rounded-lg hover:border-[var(--primary-blue)]/30 transition-colors cursor-pointer"
                  onClick={() => setSearchQuery(coin.symbol)}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={coin.thumb} 
                      alt={coin.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--text-primary)]">{coin.name}</h4>
                      <p className="text-sm text-[var(--text-secondary)]">{coin.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--text-secondary)]">Score</p>
                      <p className="text-sm font-medium text-[var(--primary-blue)]">{coin.score}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-4" />
              <p className="text-[var(--text-secondary)]">Loading trending cryptocurrencies...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Access Examples */}
      <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--text-primary)]">Quick Search Examples</CardTitle>
          <CardDescription>
            Try searching for these popular tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['LBLOCK', 'PEPE', 'SHIB', 'BONK', 'WIF', 'BOME', 'FLOKI', 'DOGE', 'MEME', 'BRETT'].map((symbol) => (
              <Button
                key={symbol}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery(symbol);
                  handleSearch();
                }}
                className="border-[var(--dark-border)] hover:border-[var(--primary-blue)]/50"
              >
                {symbol}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}