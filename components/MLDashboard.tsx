import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Brain, TrendingUp, Target, Zap, Activity, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MLStatus {
  ml_ensemble: {
    trained: boolean;
    status: string;
    best_model?: {
      name: string;
      accuracy_percentage: number;
    };
    average_accuracy?: number;
  };
  lstm_models: {
    trained: boolean;
    status: string;
    total_models?: number;
    sequence_length?: number;
  };
  enhanced_algorithm: {
    status: string;
    version: string;
  };
}

interface MLPrediction {
  prediction: number;
  confidence: number;
  model_name: string;
  features_used: string[];
  timestamp: string;
}

interface ComprehensiveAnalysis {
  timestamp: string;
  token: string;
  analysis_components: {
    enhanced_sss: any;
    breakout_probability: any;
    time_series_forecast?: any;
  };
  final_recommendation: {
    action: string;
    confidence: string;
    final_sss: number;
    final_probability: number;
    reasoning: string[];
  };
}

export function MLDashboard() {
  const [mlStatus, setMLStatus] = useState<MLStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sssInputs, setSssInputs] = useState({
    behavioral_activity: 0.6,
    velocity_anomaly: 1.0,
    community_cohesion: 0.7,
    anchor_pressure: 0.6,
    hype_to_hold: 0.8,
    historical_volatility: 0.4
  });
  const [sssResult, setSssResult] = useState<any>(null);
  const [breakoutInputs, setBreakoutInputs] = useState({
    sss: 75,
    velocity: 1.2,
    sentiment: 3.8,
    anchor_pressure: 0.6,
    timeframe: 7
  });
  const [breakoutResult, setBreakoutResult] = useState<any>(null);
  const [analysisInputs, setAnalysisInputs] = useState({
    symbol: 'SOL',
    behavioral_activity: 0.8,
    velocity_anomaly: 1.4,
    community_cohesion: 0.75,
    anchor_pressure: 0.7,
    hype_to_hold: 0.8,
    historical_volatility: 0.4,
    velocity: 1.4,
    sentiment: 4.2
  });
  const [analysisResult, setAnalysisResult] = useState<ComprehensiveAnalysis | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadMLStatus();
  }, []);

  const loadMLStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/python-engine/ml-models');
      const data = await response.json();
      
      if (response.ok) {
        setMLStatus(data.ml_capabilities?.status || data.ml_capabilities);
        toast({
          title: "ML Status Loaded",
          description: "Machine learning capabilities updated successfully",
        });
      } else {
        throw new Error(data.error || 'Failed to load ML status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateEnhancedSSS = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/python-engine/enhanced-sss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sssInputs)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSssResult(data);
        toast({
          title: "Enhanced SSS Calculated",
          description: `ML-enhanced SSS: ${data.ml_enhanced?.blended_sss || data.sss}`,
        });
      } else {
        throw new Error(data.error || 'Failed to calculate SSS');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMLBreakout = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/python-engine/ml-breakout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(breakoutInputs)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setBreakoutResult(data);
        toast({
          title: "ML Breakout Calculated",
          description: `Ensemble probability: ${data.ensemble_probability}%`,
        });
      } else {
        throw new Error(data.error || 'Failed to calculate breakout probability');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runComprehensiveAnalysis = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/python-engine/comprehensive-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisInputs)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAnalysisResult(data);
        toast({
          title: "Analysis Complete",
          description: `Recommendation: ${data.final_recommendation?.action}`,
        });
      } else {
        throw new Error(data.error || 'Failed to run comprehensive analysis');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'trained': return 'bg-blue-500';
      case 'not_trained': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRecommendationColor = (action: string) => {
    switch (action) {
      case 'STRONG_BUY': return 'bg-green-600';
      case 'BUY': return 'bg-green-500';
      case 'ACCUMULATE': return 'bg-blue-500';
      case 'WATCHLIST': return 'bg-yellow-500';
      case 'AVOID': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="ml-dashboard">
      <div className="flex items-center space-x-3">
        <Brain className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold" data-testid="title-ml-dashboard">
            Machine Learning Dashboard
          </h1>
          <p className="text-muted-foreground">
            Enhanced algorithm accuracy with ML ensemble and LSTM models
          </p>
        </div>
        <Button 
          onClick={loadMLStatus} 
          disabled={loading}
          data-testid="button-refresh-status"
        >
          Refresh Status
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" data-testid="alert-error">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ML Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-testid="card-ml-ensemble">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ML Ensemble</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(mlStatus?.ml_ensemble?.status || 'inactive')}>
                {mlStatus?.ml_ensemble?.status || 'Loading...'}
              </Badge>
              {mlStatus?.ml_ensemble?.trained && (
                <span className="text-sm text-muted-foreground">
                  {mlStatus.ml_ensemble.average_accuracy?.toFixed(1)}% accuracy
                </span>
              )}
            </div>
            {mlStatus?.ml_ensemble?.best_model && (
              <p className="text-xs text-muted-foreground mt-2">
                Best: {mlStatus.ml_ensemble.best_model.name} 
                ({mlStatus.ml_ensemble.best_model.accuracy_percentage.toFixed(1)}%)
              </p>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-lstm-models">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LSTM Models</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(mlStatus?.lstm_models?.status || 'inactive')}>
                {mlStatus?.lstm_models?.status || 'Loading...'}
              </Badge>
              {mlStatus?.lstm_models?.total_models && (
                <span className="text-sm text-muted-foreground">
                  {mlStatus.lstm_models.total_models} models
                </span>
              )}
            </div>
            {mlStatus?.lstm_models?.sequence_length && (
              <p className="text-xs text-muted-foreground mt-2">
                Sequence length: {mlStatus.lstm_models.sequence_length}
              </p>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-enhanced-algorithm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enhanced Algorithm</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(mlStatus?.enhanced_algorithm?.status || 'inactive')}>
                {mlStatus?.enhanced_algorithm?.status || 'Loading...'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                v{mlStatus?.enhanced_algorithm?.version || '2.0'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ML Tools */}
      <Tabs defaultValue="sss" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sss" data-testid="tab-enhanced-sss">Enhanced SSS</TabsTrigger>
          <TabsTrigger value="breakout" data-testid="tab-ml-breakout">ML Breakout</TabsTrigger>
          <TabsTrigger value="analysis" data-testid="tab-comprehensive">Comprehensive</TabsTrigger>
        </TabsList>

        {/* Enhanced SSS Tab */}
        <TabsContent value="sss" className="space-y-4">
          <Card data-testid="card-enhanced-sss-calculator">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Enhanced SSS Calculator</span>
              </CardTitle>
              <CardDescription>
                Calculate ML-enhanced Silent Surge Score with market-adaptive weighting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(sssInputs).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="text-sm">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <Input
                      id={key}
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={value}
                      onChange={(e) => setSssInputs(prev => ({
                        ...prev,
                        [key]: parseFloat(e.target.value) || 0
                      }))}
                      data-testid={`input-${key}`}
                    />
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={calculateEnhancedSSS} 
                disabled={loading}
                className="w-full"
                data-testid="button-calculate-sss"
              >
                Calculate Enhanced SSS
              </Button>

              {sssResult && (
                <Card className="mt-4" data-testid="card-sss-result">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Base SSS Score</p>
                        <p className="text-2xl font-bold text-blue-600">{sssResult.sss}</p>
                      </div>
                      {sssResult.ml_enhanced && (
                        <div>
                          <p className="text-sm font-medium">ML-Enhanced SSS</p>
                          <p className="text-2xl font-bold text-green-600">
                            {sssResult.ml_enhanced.blended_sss}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ML Confidence: {(sssResult.ml_enhanced.ml_confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ML Breakout Tab */}
        <TabsContent value="breakout" className="space-y-4">
          <Card data-testid="card-ml-breakout-calculator">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>ML Breakout Probability</span>
              </CardTitle>
              <CardDescription>
                Calculate breakout probability using ML ensemble models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(breakoutInputs).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="text-sm">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <Input
                      id={key}
                      type="number"
                      step={key === 'timeframe' ? '1' : '0.1'}
                      min="0"
                      value={value}
                      onChange={(e) => setBreakoutInputs(prev => ({
                        ...prev,
                        [key]: parseFloat(e.target.value) || 0
                      }))}
                      data-testid={`input-breakout-${key}`}
                    />
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={calculateMLBreakout} 
                disabled={loading}
                className="w-full"
                data-testid="button-calculate-breakout"
              >
                Calculate ML Breakout Probability
              </Button>

              {breakoutResult && (
                <Card className="mt-4" data-testid="card-breakout-result">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">Ensemble Probability</p>
                        <p className="text-3xl font-bold text-green-600">
                          {breakoutResult.ensemble_probability}%
                        </p>
                        <Badge className="mt-2">
                          {breakoutResult.prediction_confidence}
                        </Badge>
                      </div>
                      
                      {breakoutResult.ml_ensemble && (
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Traditional</p>
                            <p className="text-lg font-semibold">
                              {breakoutResult.ml_ensemble.traditional_probability}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">ML Enhanced</p>
                            <p className="text-lg font-semibold">
                              {breakoutResult.ml_ensemble.ml_probability}%
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comprehensive Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <Card data-testid="card-comprehensive-analysis">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Comprehensive ML Analysis</span>
              </CardTitle>
              <CardDescription>
                Full token analysis with ML recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Token Symbol</Label>
                  <Input
                    id="symbol"
                    value={analysisInputs.symbol}
                    onChange={(e) => setAnalysisInputs(prev => ({
                      ...prev,
                      symbol: e.target.value
                    }))}
                    data-testid="input-analysis-symbol"
                  />
                </div>
                {Object.entries(analysisInputs).slice(1).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="text-xs">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <Input
                      id={key}
                      type="number"
                      step="0.1"
                      min="0"
                      value={value}
                      onChange={(e) => setAnalysisInputs(prev => ({
                        ...prev,
                        [key]: parseFloat(e.target.value) || 0
                      }))}
                      data-testid={`input-analysis-${key}`}
                    />
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={runComprehensiveAnalysis} 
                disabled={loading}
                className="w-full"
                data-testid="button-run-analysis"
              >
                Run Comprehensive Analysis
              </Button>

              {analysisResult && (
                <Card className="mt-4" data-testid="card-analysis-result">
                  <CardContent className="pt-6 space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">
                        {analysisResult.token} Analysis
                      </h3>
                      <Badge 
                        className={`${getRecommendationColor(analysisResult.final_recommendation.action)} text-white text-lg px-4 py-2`}
                      >
                        {analysisResult.final_recommendation.action}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        Confidence: {analysisResult.final_recommendation.confidence}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-sm font-medium">Final SSS</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {analysisResult.final_recommendation.final_sss}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Breakout Probability</p>
                        <p className="text-2xl font-bold text-green-600">
                          {analysisResult.final_recommendation.final_probability}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Reasoning:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {analysisResult.final_recommendation.reasoning.map((reason, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}