import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { AssetCardSkeleton } from '@/components/ui/loading-skeleton';

interface ModelPerformance {
  [symbol: string]: {
    accuracy: number;
    directionAccuracy: number;
    sampleSize: number;
    lastUpdated: string;
  };
}

interface MLMetrics {
  totalModels: number;
  averageAccuracy: number;
  bestPerformer: string;
  worstPerformer: string;
  predictionCount: number;
  successRate: number;
}

export function ModelPerformance() {
  const [isRetraining, setIsRetraining] = useState(false);

  const { data: performance, isLoading, refetch } = useQuery<ModelPerformance>({
    queryKey: ['/api/ml/performance'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: metrics } = useQuery<MLMetrics>({
    queryKey: ['/api/ml/metrics'],
    refetchInterval: 30000,
  });

  const handleRetrain = async () => {
    setIsRetraining(true);
    try {
      await fetch('/api/ml/retrain', { method: 'POST' });
      await refetch();
    } catch (error) {
      console.error('Retraining failed:', error);
    } finally {
      setIsRetraining(false);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-500';
    if (accuracy >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-100 text-green-800';
    if (accuracy >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return <AssetCardSkeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* ML Overview Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">ML Score Optimization</h2>
          <p className="text-gray-400 mt-2">
            Machine learning models enhancing SSS prediction accuracy
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleRetrain}
            disabled={isRetraining}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRetraining ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            {isRetraining ? 'Retraining...' : 'Retrain Models'}
          </Button>
        </div>
      </div>

      {/* ML Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Brain className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Active Models</p>
                  <p className="text-2xl font-bold text-white">{metrics.totalModels}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Avg Accuracy</p>
                  <p className="text-2xl font-bold text-white">{metrics.averageAccuracy.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Predictions</p>
                  <p className="text-2xl font-bold text-white">{metrics.predictionCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-white">{metrics.successRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Model Performance Grid */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Model Performance by Asset</CardTitle>
          <CardDescription>
            Individual model accuracy and prediction performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {performance ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(performance).map(([symbol, data]) => (
                <div
                  key={symbol}
                  className="p-4 bg-gray-700 rounded-lg border border-gray-600"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white text-lg">{symbol}</h3>
                    <Badge className={getAccuracyBadge(data.accuracy)}>
                      {data.accuracy.toFixed(1)}%
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Prediction Accuracy</span>
                        <span className={getAccuracyColor(data.accuracy)}>
                          {data.accuracy.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={data.accuracy} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Direction Accuracy</span>
                        <span className={getAccuracyColor(data.directionAccuracy)}>
                          {data.directionAccuracy.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={data.directionAccuracy} className="h-2" />
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Sample Size</span>
                      <span className="text-white">{data.sampleSize}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Last Updated</span>
                      <span className="text-white">
                        {new Date(data.lastUpdated).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No model performance data available</p>
              <p className="text-sm text-gray-500 mt-1">
                Models need training data to generate performance metrics
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ML Feature Importance */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Feature Importance</CardTitle>
          <CardDescription>
            Key features driving ML prediction accuracy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { feature: 'Behavioral Activity', importance: 85, description: 'Wallet behavior patterns' },
              { feature: 'Token Velocity', importance: 82, description: 'Movement and transaction patterns' },
              { feature: 'Anchor Pressure', importance: 78, description: 'Long-term holder influence' },
              { feature: 'Community Cohesion', importance: 75, description: 'Sentiment unity metrics' },
              { feature: 'Volume Change', importance: 70, description: 'Trading volume anomalies' },
              { feature: 'Market Correlation', importance: 68, description: 'Cross-asset relationships' },
              { feature: 'Social Mentions', importance: 65, description: 'Social media activity' },
              { feature: 'Developer Activity', importance: 62, description: 'Code repository metrics' },
            ].map((item) => (
              <div key={item.feature} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white font-medium">{item.feature}</span>
                  <span className="text-gray-400">{item.importance}%</span>
                </div>
                <Progress value={item.importance} className="h-2" />
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Training Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Training Status</CardTitle>
          <CardDescription>
            Current model training and optimization status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <div className="h-3 w-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-white font-medium">Auto-training Active</p>
                  <p className="text-sm text-gray-400">Models retrain every 6 hours</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <div className="h-3 w-3 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-white font-medium">Feature Engineering</p>
                  <p className="text-sm text-gray-400">17 features extracted per prediction</p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Optimized</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <div className="h-3 w-3 bg-yellow-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-white font-medium">Data Quality</p>
                  <p className="text-sm text-gray-400">Historical data depth: 30 days</p>
                </div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}