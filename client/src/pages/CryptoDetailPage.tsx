import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Database, 
  Activity, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MonitoringStats {
  totalCryptocurrencies: number;
  coverageIncrease: string;
  apiSources: string[];
  monitoringCapacity: string;
  updateFrequency: string;
}

export default function CryptoMonitoringExpansion() {
  const [isExpanding, setIsExpanding] = useState(false);
  const { toast } = useToast();

  const { data: monitoringStats, isLoading: statsLoading, refetch: refetchStats } = useQuery<MonitoringStats>({
    queryKey: ['/api/crypto/monitoring-stats'],
  });

  const expandMonitoringMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/crypto/expand-monitoring", {});
      return response.json();
    },
    onSuccess: () => {
      setIsExpanding(true);
      toast({
        title: "Expansion Started",
        description: "Cryptocurrency monitoring expansion is now processing. This will take 10-15 minutes.",
      });
      
      // Timer disabled to prevent refresh cycles
      // const interval = setInterval(async () => {
      //   await refetchStats();
      // }, 30000);
      
      // Stop checking after 20 minutes
      // setTimeout(() => {
      //   clearInterval(interval);
      //   setIsExpanding(false);
      //   toast({
      //     title: "Expansion Complete",
      //     description: "Cryptocurrency monitoring has been expanded successfully!",
      //   });
      // }, 1200000);
    },
    onError: (error) => {
      toast({
        title: "Expansion Failed",
        description: "Failed to start cryptocurrency monitoring expansion. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartExpansion = () => {
    expandMonitoringMutation.mutate();
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Database className="w-8 h-8 text-blue-400" />
            Cryptocurrency Monitoring Expansion
          </h1>
          <p className="text-gray-400">
            Expand your platform to monitor as many cryptocurrencies as Mobula (~1.3 million assets)
          </p>
        </div>

        {/* Current Stats */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="w-5 h-5 text-green-400" />
              Current Monitoring Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monitoringStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Cryptocurrencies:</span>
                    <span className="font-bold text-white">
                      {typeof monitoringStats.totalCryptocurrencies === 'number' 
                        ? monitoringStats.totalCryptocurrencies.toLocaleString()
                        : monitoringStats.totalCryptocurrencies
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Coverage Increase:</span>
                    <span className="font-bold text-green-400">
                      {monitoringStats.coverageIncrease}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Update Frequency:</span>
                    <span className="font-bold text-blue-400">
                      {monitoringStats.updateFrequency}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400 block mb-2">API Sources:</span>
                    <div className="space-y-1">
                      {monitoringStats.apiSources.map((source, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-white">{source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Target Capacity:</span>
                    <span className="font-bold text-purple-400">
                      {monitoringStats.monitoringCapacity}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-400">Loading monitoring statistics...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expansion Control */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Expand Cryptocurrency Coverage
            </CardTitle>
            <CardDescription>
              Increase your platform's monitoring from ~1,886 to 50,000+ cryptocurrencies using Mobula's extensive database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-blue-400 mb-2">What This Expansion Includes:</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• 50,000+ cryptocurrencies from Mobula API</li>
                <li>• Emerging tokens, DeFi projects, GameFi, and NFT tokens</li>
                <li>• Meme coins, Layer 2 tokens, and AI projects</li>
                <li>• Real-world assets and cross-chain tokens</li>
                <li>• Comprehensive SSS scoring for all new assets</li>
              </ul>
            </div>

            {isExpanding ? (
              <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                <div>
                  <p className="font-medium text-yellow-400">Expansion in Progress</p>
                  <p className="text-sm text-gray-300">
                    Adding thousands of cryptocurrencies to your monitoring system. This process will take 10-15 minutes.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button 
                  onClick={handleStartExpansion} 
                  disabled={expandMonitoringMutation.isPending}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  data-testid="start-expansion-button"
                >
                  {expandMonitoringMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Starting Expansion...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      Start Expansion
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => refetchStats()}
                  className="flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  Refresh Stats
                </Button>
              </div>
            )}

            {expandMonitoringMutation.isError && (
              <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div>
                  <p className="font-medium text-red-400">Expansion Failed</p>
                  <p className="text-sm text-gray-300">
                    Unable to start cryptocurrency monitoring expansion. Please check your Mobula API key and try again.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Benefits of Expanded Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">Complete Market Coverage</h4>
                    <p className="text-sm text-gray-400">Monitor virtually every cryptocurrency available</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">Early Detection</h4>
                    <p className="text-sm text-gray-400">Spot emerging opportunities before they trend</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">Advanced Analytics</h4>
                    <p className="text-sm text-gray-400">Silent Surge Score for all monitored assets</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">Comprehensive Data</h4>
                    <p className="text-sm text-gray-400">Real-time updates across all blockchain networks</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}