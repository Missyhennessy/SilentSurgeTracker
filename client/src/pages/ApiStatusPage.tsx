import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiSource {
  name: string;
  enabled: boolean;
  callsUsed: number;
  callsLimit: number;
  utilizationPercent: number;
  priority: number;
  lastReset: string;
}

export default function ApiStatusPage() {
  const { data: apiSources, isLoading, refetch } = useQuery<ApiSource[]>({
    queryKey: ['/api/data-sources/status'],
    refetchInterval: false, // Disabled to prevent refresh cycles
  });

  const getStatusIcon = (source: ApiSource) => {
    if (!source.enabled) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (source.utilizationPercent > 90) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getStatusText = (source: ApiSource) => {
    if (!source.enabled) return "Inactive";
    if (source.utilizationPercent > 90) return "Near Limit";
    return "Active";
  };

  const getStatusColor = (source: ApiSource) => {
    if (!source.enabled) return "destructive";
    if (source.utilizationPercent > 90) return "secondary";
    return "default";
  };

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1: return <Badge variant="default" className="bg-yellow-500">Primary</Badge>;
      case 2: return <Badge variant="secondary">Secondary</Badge>;
      case 3: return <Badge variant="outline">Tertiary</Badge>;
      default: return <Badge variant="outline">Priority {priority}</Badge>;
    }
  };

  const formatApiName = (name: string) => {
    switch (name) {
      case 'mobula': return 'Mobula API';
      case 'cryptocompare': return 'CryptoCompare API';
      case 'coingecko': return 'CoinGecko API';
      default: return name;
    }
  };

  const getApiDescription = (name: string) => {
    switch (name) {
      case 'mobula': return 'Premium cryptocurrency data with 300K monthly calls';
      case 'cryptocompare': return 'Real-time crypto data with 100K monthly calls';
      case 'coingecko': return 'Market data with 10K monthly calls';
      default: return 'Cryptocurrency data source';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">API Status Dashboard</h1>
            <p className="text-muted-foreground">Monitor cryptocurrency data sources</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-2 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalCalls = apiSources?.reduce((sum, source) => sum + source.callsLimit, 0) || 0;
  const totalUsed = apiSources?.reduce((sum, source) => sum + source.callsUsed, 0) || 0;
  const activeSources = apiSources?.filter(source => source.enabled).length || 0;

  return (
    <div className="container mx-auto p-6" data-testid="api-status-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">API Status Dashboard</h1>
          <p className="text-muted-foreground">Real-time monitoring of cryptocurrency data sources</p>
        </div>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          size="sm"
          data-testid="refresh-button"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-sources">{apiSources?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {activeSources} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="monthly-capacity">
              {totalCalls.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              API calls per month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="calls-used">
              {totalUsed.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalCalls > 0 ? ((totalUsed / totalCalls) * 100).toFixed(1) : 0}% utilized
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="system-status">
              {activeSources > 0 ? 'Operational' : 'Offline'}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeSources > 1 ? 'Redundancy active' : activeSources === 1 ? 'Single source' : 'No sources'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* API Source Details */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {apiSources?.sort((a, b) => a.priority - b.priority).map((source, index) => (
          <Card key={source.name} className="relative" data-testid={`api-card-${source.name}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(source)}
                  {formatApiName(source.name)}
                </CardTitle>
                {getPriorityBadge(source.priority)}
              </div>
              <CardDescription>
                {getApiDescription(source.name)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={getStatusColor(source)} data-testid={`status-${source.name}`}>
                  {getStatusText(source)}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Usage</span>
                  <span data-testid={`usage-${source.name}`}>
                    {source.callsUsed.toLocaleString()} / {source.callsLimit.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={source.utilizationPercent} 
                  className="h-2"
                  data-testid={`progress-${source.name}`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{source.utilizationPercent}% used</span>
                  <span>{(source.callsLimit - source.callsUsed).toLocaleString()} remaining</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Last Reset</span>
                  <span data-testid={`last-reset-${source.name}`}>
                    {new Date(source.lastReset).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            Multi-API redundancy system with automatic failover
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Failover Strategy</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Primary source based on priority and availability</li>
                <li>• Automatic fallback to secondary sources</li>
                <li>• Real-time health monitoring</li>
                <li>• Usage tracking and limit management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Coverage</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 15,000+ cryptocurrencies supported</li>
                <li>• Real-time price updates</li>
                <li>• Market data and analytics</li>
                <li>• 99.9% uptime reliability</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}