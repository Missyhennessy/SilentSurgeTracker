import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Brain, TrendingUp, Target, Activity, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface PythonEngineResult {
  token: string;
  sss: number;
  breakout_3d: number;
  breakout_7d: number;
  breakout_14d: number;
  action: string;
  confidence: string;
  risk_level: string;
  reasoning?: string[];
  price_targets?: {
    conservative_target: number;
    upside_target: number;
    aggressive_target: number;
    stop_loss: number;
  };
}

interface PythonEngineAnalysis {
  timestamp: string;
  total_analyzed: number;
  avg_breakout_probability: number;
  strong_signals: number;
  results: PythonEngineResult[];
  market_summary: {
    strong_buy_count: number;
    buy_count: number;
    accumulate_count: number;
    high_risk_count: number;
  };
  top_opportunities: PythonEngineResult[];
  alerts: any[];
}

export function PythonEnginePanel() {
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [customTokenInput, setCustomTokenInput] = useState('');
  const queryClient = useQueryClient();

  // Fetch engine status
  const { data: engineStatus } = useQuery({
    queryKey: ['/api/python-engine/status'],
    refetchInterval: false // Disabled to prevent refresh cycles
  });

  // Run full analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async (tokens?: string[]) => {
      const response = await fetch('/api/python-engine/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/python-engine'] });
    }
  });

  // Run demo mutation
  const demoMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/python-engine/demo', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/python-engine'] });
    }
  });

  const handleRunAnalysis = () => {
    const tokens = selectedTokens.length > 0 ? selectedTokens : undefined;
    analysisMutation.mutate(tokens);
  };

  const handleRunDemo = () => {
    demoMutation.mutate();
  };

  const handleAddCustomTokens = () => {
    const tokens = customTokenInput.split(',').map(t => t.trim().toUpperCase()).filter(t => t.length > 0);
    setSelectedTokens([...Array.from(new Set([...selectedTokens, ...tokens]))]);
    setCustomTokenInput('');
  };

  const renderAnalysisResults = (analysis: PythonEngineAnalysis) => (
    <div className="space-y-6">
      {/* Market Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Market Analysis Summary
          </CardTitle>
          <CardDescription>
            Analysis completed at {new Date(analysis.timestamp).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{analysis.total_analyzed}</div>
              <div className="text-sm text-muted-foreground">Tokens Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{analysis.avg_breakout_probability.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Avg Breakout Probability</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{analysis.strong_signals}</div>
              <div className="text-sm text-muted-foreground">Strong Signals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{analysis.market_summary.high_risk_count}</div>
              <div className="text-sm text-muted-foreground">High Risk Tokens</div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Strong Buy</span>
              <Badge variant="default" className="bg-green-500">{analysis.market_summary.strong_buy_count}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Buy</span>
              <Badge variant="secondary">{analysis.market_summary.buy_count}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Accumulate</span>
              <Badge variant="outline">{analysis.market_summary.accumulate_count}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Opportunities */}
      {analysis.top_opportunities && analysis.top_opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Top Investment Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.top_opportunities.map((opportunity, index) => (
                <div key={opportunity.token} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold">#{index + 1}</div>
                    <div>
                      <div className="font-semibold">{opportunity.token}</div>
                      <div className="text-sm text-muted-foreground">SSS: {opportunity.sss}</div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge 
                      variant={opportunity.action === 'Strong Buy' ? 'default' : 
                              opportunity.action === 'Buy' ? 'secondary' : 'outline'}
                      className={opportunity.action === 'Strong Buy' ? 'bg-green-500' : ''}
                    >
                      {opportunity.action}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {opportunity.breakout_7d.toFixed(1)}% breakout probability
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {analysis.results.map((result) => (
              <div key={result.token} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{result.token}</h3>
                    <Badge variant="outline">SSS: {result.sss}</Badge>
                    <Badge 
                      variant={result.risk_level === 'High' ? 'destructive' : 
                              result.risk_level === 'Medium' ? 'secondary' : 'outline'}
                    >
                      {result.risk_level} Risk
                    </Badge>
                  </div>
                  <Badge 
                    variant={result.action === 'Strong Buy' ? 'default' : 
                            result.action === 'Buy' ? 'secondary' : 'outline'}
                    className={result.action === 'Strong Buy' ? 'bg-green-500' : ''}
                  >
                    {result.action}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">3-Day Breakout</div>
                    <div className="font-semibold">{result.breakout_3d.toFixed(1)}%</div>
                    <Progress value={result.breakout_3d} className="h-2 mt-1" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">7-Day Breakout</div>
                    <div className="font-semibold">{result.breakout_7d.toFixed(1)}%</div>
                    <Progress value={result.breakout_7d} className="h-2 mt-1" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">14-Day Breakout</div>
                    <div className="font-semibold">{result.breakout_14d.toFixed(1)}%</div>
                    <Progress value={result.breakout_14d} className="h-2 mt-1" />
                  </div>
                </div>

                {result.price_targets && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-2">Price Targets</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Conservative:</span>
                        <span className="ml-1 font-medium">${result.price_targets.conservative_target.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Upside:</span>
                        <span className="ml-1 font-medium">${result.price_targets.upside_target.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Aggressive:</span>
                        <span className="ml-1 font-medium">${result.price_targets.aggressive_target.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Stop Loss:</span>
                        <span className="ml-1 font-medium">${result.price_targets.stop_loss.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {result.reasoning && result.reasoning.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm font-medium mb-2">Analysis Reasoning</div>
                    <ul className="text-sm space-y-1">
                      {result.reasoning.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Engine Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Python Scoring Engine
          </CardTitle>
          <CardDescription>
            Advanced institutional-grade cryptocurrency analysis engine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${(engineStatus as any)?.status === 'ready' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium">
                Status: {(engineStatus as any)?.status === 'ready' ? 'Ready' : 'Error'}
              </span>
            </div>
            {(engineStatus as any)?.python_version && (
              <Badge variant="outline">
                Python {(engineStatus as any)?.python_version?.split(' ')[0]}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={handleRunDemo}
              disabled={demoMutation.isPending}
              className="flex items-center gap-2"
              data-testid="button-run-demo"
            >
              <TrendingUp className="h-4 w-4" />
              {demoMutation.isPending ? 'Running Demo...' : 'Run Realistic Demo'}
            </Button>
            
            <Button 
              onClick={handleRunAnalysis}
              disabled={analysisMutation.isPending}
              variant="outline"
              className="flex items-center gap-2"
              data-testid="button-run-analysis"
            >
              <Activity className="h-4 w-4" />
              {analysisMutation.isPending ? 'Analyzing...' : 'Run Full Analysis'}
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Token Analysis</label>
            <div className="flex gap-2">
              <Textarea
                placeholder="Enter token symbols (e.g., BTC, ETH, SOL)"
                value={customTokenInput}
                onChange={(e) => setCustomTokenInput(e.target.value)}
                className="min-h-[40px]"
                data-testid="input-custom-tokens"
              />
              <Button onClick={handleAddCustomTokens} size="sm">
                Add
              </Button>
            </div>
            {selectedTokens.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTokens.map((token) => (
                  <Badge key={token} variant="secondary" className="cursor-pointer"
                    onClick={() => setSelectedTokens(selectedTokens.filter(t => t !== token))}
                  >
                    {token} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Display */}
      {(analysisMutation.data || demoMutation.data) && (
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">Analysis Results</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="results" className="space-y-4">
            {renderAnalysisResults(analysisMutation.data || demoMutation.data)}
          </TabsContent>
          
          <TabsContent value="raw" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Raw Analysis Data</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
                  {JSON.stringify(analysisMutation.data || demoMutation.data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Error Display */}
      {(analysisMutation.error || demoMutation.error) && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Analysis Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              {(analysisMutation.error as any)?.message || (demoMutation.error as any)?.message || 'An error occurred during analysis'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}