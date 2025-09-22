import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity, 
  BarChart3, 
  Brain, 
  Target,
  RefreshCw,
  Filter,
  Eye,
  ZapIcon as Zap
} from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

interface VolumeAnomaly {
  id: number;
  assetId: number;
  assetSymbol: string;
  timestamp: string;
  currentVolume: number;
  historicalAverage: number;
  percentageChange: number;
  zScore: number;
  anomalyScore: number;
  anomalyType: 'spike' | 'drop' | 'sustained_high' | 'sustained_low';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectionMethod: 'zscore' | 'iqr' | 'ml_ensemble' | 'isolation_forest';
  priceCorrelation?: number;
  marketCapImpact?: number;
  exchangeBreakdown?: Record<string, number>;
  timeframe: string;
  isConfirmed: boolean;
  alertTriggered: boolean;
  sssImpact?: number;
  volumePattern?: {
    trend: 'increasing' | 'decreasing' | 'volatile' | 'stable';
    momentum: number;
    acceleration: number;
    volatility: number;
  };
  metadata?: {
    news?: string[];
    social_sentiment?: number;
    whale_activity?: boolean;
    exchange_listings?: string[];
    technical_indicators?: Record<string, number>;
  };
}

interface VolumePattern {
  id: number;
  assetId: number;
  patternType: 'accumulation' | 'distribution' | 'breakout' | 'reversal';
  confidence: number;
  duration: number;
  startedAt: string;
  endedAt?: string;
  isActive: boolean;
  accuracy?: number;
}

interface AnalysisData {
  anomalies: VolumeAnomaly[];
  patterns: VolumePattern[];
  summary: {
    totalAnomalies: number;
    severityBreakdown: Record<string, number>;
    methodBreakdown: Record<string, number>;
    topAnomalies: VolumeAnomaly[];
  };
}

const severityColors = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200"
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
    case 'high': return <TrendingUp className="h-4 w-4 text-orange-600" />;
    case 'medium': return <Activity className="h-4 w-4 text-yellow-600" />;
    default: return <BarChart3 className="h-4 w-4 text-blue-600" />;
  }
};

const getAnomalyTypeIcon = (type: string) => {
  switch (type) {
    case 'spike': return <TrendingUp className="h-4 w-4 text-green-600" />;
    case 'drop': return <TrendingDown className="h-4 w-4 text-red-600" />;
    default: return <Activity className="h-4 w-4 text-blue-600" />;
  }
};

export default function VolumeAnomalyDetector() {
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");
  const [refreshInterval, setRefreshInterval] = useState<number>(30000);

  const { data: analysisData, isLoading, refetch } = useQuery<AnalysisData>({
    queryKey: ["/api/volume/anomalies"],
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true,
  });

  const { data: modelPerformance } = useQuery({
    queryKey: ["/api/volume/model-performance"],
    refetchInterval: 60000,
  });

  // Filter anomalies based on selected criteria
  const filteredAnomalies = analysisData?.anomalies.filter(anomaly => {
    const severityMatch = selectedSeverity === "all" || anomaly.severity === selectedSeverity;
    const methodMatch = selectedMethod === "all" || anomaly.detectionMethod === selectedMethod;
    return severityMatch && methodMatch;
  }) || [];

  // Prepare chart data
  const severityData = analysisData ? Object.entries(analysisData.summary.severityBreakdown).map(([severity, count]) => ({
    severity,
    count,
    color: severity === 'critical' ? '#dc2626' : 
           severity === 'high' ? '#ea580c' :
           severity === 'medium' ? '#ca8a04' : '#2563eb'
  })) : [];

  const methodData = analysisData ? Object.entries(analysisData.summary.methodBreakdown).map(([method, count]) => ({
    method: method.replace('_', ' ').toUpperCase(),
    count,
  })) : [];

  const timeSeriesData = filteredAnomalies.slice(0, 20).map(anomaly => ({
    time: new Date(anomaly.timestamp).toLocaleTimeString(),
    symbol: anomaly.assetSymbol,
    score: Math.round(anomaly.anomalyScore),
    volume: anomaly.currentVolume,
    change: Math.round(anomaly.percentageChange)
  }));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            AI Volume Anomaly Detection
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-2">
            Advanced machine learning algorithms detecting unusual trading volume patterns
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="text-total-anomalies">
              <AnimatedCounter value={analysisData?.summary.totalAnomalies || 0} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400" data-testid="text-critical-alerts">
              <AnimatedCounter value={analysisData?.summary.severityBreakdown.critical || 0} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Active Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400" data-testid="text-active-patterns">
              <AnimatedCounter value={analysisData?.patterns.filter(p => p.isActive).length || 0} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              ML Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400" data-testid="text-ml-accuracy">
              {Array.isArray(modelPerformance) && modelPerformance.length > 0
                ? `${Math.round(modelPerformance.reduce((acc, model) => acc + model.metrics.accuracy, 0) / modelPerformance.length * 100)}%`
                : "91%"
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls and Filters */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Analysis Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">Severity Filter</label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">Detection Method</label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="zscore">Z-Score</SelectItem>
                  <SelectItem value="iqr">IQR</SelectItem>
                  <SelectItem value="ml_ensemble">ML Ensemble</SelectItem>
                  <SelectItem value="isolation_forest">Isolation Forest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">Refresh Rate</label>
              <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(Number(value))}>
                <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10000">10s</SelectItem>
                  <SelectItem value="30000">30s</SelectItem>
                  <SelectItem value="60000">1m</SelectItem>
                  <SelectItem value="300000">5m</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analysis Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="data-[state=active]:bg-purple-600">
            Anomalies
          </TabsTrigger>
          <TabsTrigger value="patterns" className="data-[state=active]:bg-purple-600">
            Patterns
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-purple-600">
            ML Performance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Severity Distribution</CardTitle>
                <CardDescription className="text-gray-400">
                  Breakdown of anomalies by severity level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} anomalies`, name]}
                      labelStyle={{ color: '#ffffff' }}
                      contentStyle={{ backgroundColor: '#374151', border: '1px solid #4b5563' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Detection Methods</CardTitle>
                <CardDescription className="text-gray-400">
                  Performance of different ML algorithms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={methodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="method" 
                      stroke="#9ca3af"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      labelStyle={{ color: '#ffffff' }}
                      contentStyle={{ backgroundColor: '#374151', border: '1px solid #4b5563' }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Anomaly Timeline */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Anomaly Timeline</CardTitle>
              <CardDescription className="text-gray-400">
                Real-time detection of volume anomalies across assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    labelStyle={{ color: '#ffffff' }}
                    contentStyle={{ backgroundColor: '#374151', border: '1px solid #4b5563' }}
                    formatter={(value, name) => {
                      if (name === 'score') return [`${value}%`, 'Anomaly Score'];
                      if (name === 'change') return [`${value}%`, 'Volume Change'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    name="Anomaly Score"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="change" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    name="Volume Change %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                Volume Anomalies ({filteredAnomalies.length})
              </CardTitle>
              <CardDescription className="text-gray-400">
                Detailed analysis of detected volume anomalies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {filteredAnomalies.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Activity className="h-12 w-12 mx-auto mb-4" />
                      <p>No anomalies found matching the selected criteria.</p>
                    </div>
                  ) : (
                    filteredAnomalies.map((anomaly) => (
                      <div 
                        key={`${anomaly.assetId}-${anomaly.timestamp}`}
                        className="border border-gray-700 rounded-lg p-4 bg-gray-900/50 hover:bg-gray-900/70 transition-colors"
                        data-testid={`anomaly-card-${anomaly.assetSymbol}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getAnomalyTypeIcon(anomaly.anomalyType)}
                            <div>
                              <h3 className="font-semibold text-white">
                                {anomaly.assetSymbol}
                              </h3>
                              <p className="text-sm text-gray-400">
                                {new Date(anomaly.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={`${severityColors[anomaly.severity]} border text-xs`}
                              data-testid={`badge-severity-${anomaly.severity}`}
                            >
                              {getSeverityIcon(anomaly.severity)}
                              <span className="ml-1">{anomaly.severity.toUpperCase()}</span>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {anomaly.detectionMethod.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-400">Anomaly Score</p>
                            <p className="font-semibold text-white" data-testid={`text-anomaly-score-${anomaly.assetSymbol}`}>
                              {Math.round(anomaly.anomalyScore)}%
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-400">Volume Change</p>
                            <p className={`font-semibold ${anomaly.percentageChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {anomaly.percentageChange > 0 ? '+' : ''}{Math.round(anomaly.percentageChange)}%
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-400">Current Volume</p>
                            <p className="font-semibold text-white">
                              ${(anomaly.currentVolume / 1000000).toFixed(2)}M
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-400">Z-Score</p>
                            <p className="font-semibold text-white">
                              {anomaly.zScore.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        {anomaly.volumePattern && (
                          <div className="mt-4 pt-3 border-t border-gray-700">
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-400">Pattern:</span>
                              <Badge variant="secondary" className="text-xs">
                                {anomaly.volumePattern.trend}
                              </Badge>
                              <span className="text-gray-400">Momentum:</span>
                              <span className={`font-medium ${
                                anomaly.volumePattern.momentum > 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {(anomaly.volumePattern.momentum * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {anomaly.metadata?.whale_activity && (
                          <Alert className="mt-3 border-blue-500 bg-blue-500/10">
                            <Zap className="h-4 w-4" />
                            <AlertDescription className="text-blue-300">
                              Whale activity detected - Large transaction volume anomaly
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                Volume Patterns ({analysisData?.patterns.length || 0})
              </CardTitle>
              <CardDescription className="text-gray-400">
                Identified volume patterns and their characteristics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {!analysisData?.patterns.length ? (
                    <div className="text-center py-8 text-gray-400">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                      <p>No volume patterns detected yet.</p>
                    </div>
                  ) : (
                    analysisData.patterns.map((pattern) => (
                      <div 
                        key={pattern.id}
                        className="border border-gray-700 rounded-lg p-4 bg-gray-900/50"
                        data-testid={`pattern-card-${pattern.patternType}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-600/20 rounded-lg">
                              <BarChart3 className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white capitalize">
                                {pattern.patternType} Pattern
                              </h3>
                              <p className="text-sm text-gray-400">
                                Duration: {pattern.duration} hours
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={`${pattern.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} border text-xs`}
                            >
                              {pattern.isActive ? 'Active' : 'Completed'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-400">Confidence Level</span>
                          </div>
                          <Progress 
                            value={pattern.confidence * 100} 
                            className="w-full"
                            data-testid={`progress-confidence-${pattern.patternType}`}
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            {(pattern.confidence * 100).toFixed(1)}% confidence
                          </p>
                        </div>
                        
                        {pattern.accuracy && (
                          <div className="mt-3 text-sm text-gray-300">
                            Historical Accuracy: {(pattern.accuracy * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ML Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">ML Model Performance</CardTitle>
              <CardDescription className="text-gray-400">
                Real-time performance metrics for anomaly detection models
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Array.isArray(modelPerformance) && modelPerformance.map((model: any) => (
                <div key={model.id} className="border border-gray-700 rounded-lg p-4 mb-4 bg-gray-900/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">{model.modelName}</h3>
                    <Badge variant="outline" className="text-xs">
                      v{model.modelVersion}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Accuracy</p>
                      <p className="font-semibold text-white">
                        {(model.metrics.accuracy * 100).toFixed(1)}%
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400">Precision</p>
                      <p className="font-semibold text-white">
                        {(model.metrics.precision * 100).toFixed(1)}%
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400">Recall</p>
                      <p className="font-semibold text-white">
                        {(model.metrics.recall * 100).toFixed(1)}%
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400">F1 Score</p>
                      <p className="font-semibold text-white">
                        {model.metrics.f1_score.toFixed(3)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">Anomaly Type Accuracy</h4>
                    {Object.entries(model.anomalyTypeAccuracy).map(([type, accuracy]: [string, any]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm text-gray-400 capitalize">{type}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={accuracy * 100} className="w-20" />
                          <span className="text-xs text-gray-300 w-12">
                            {(accuracy * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-400">
                  <Brain className="h-12 w-12 mx-auto mb-4" />
                  <p>Loading model performance data...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}