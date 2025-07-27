import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SentimentDashboard } from "@/components/advanced/sentiment-dashboard";
import { 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Globe,
  Zap,
  MessageSquare,
  ArrowRightLeft,
  LineChart
} from "lucide-react";

export function Phase1Features() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Phase 1: Advanced Prediction Features
          </CardTitle>
          <CardDescription>
            Enhanced cryptocurrency analysis with social sentiment, advanced alerts, cross-exchange monitoring, and macro economic integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sentiment" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sentiment" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Sentiment Analysis
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Advanced Alerts
              </TabsTrigger>
              <TabsTrigger value="exchanges" className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                Cross-Exchange
              </TabsTrigger>
              <TabsTrigger value="macro" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                Macro Economics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sentiment">
              <SentimentDashboard />
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Advanced Multi-Condition Alerts
                  </CardTitle>
                  <CardDescription>
                    Create complex alert rules combining price, SSS scores, volume, sentiment, and technical indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                          <h3 className="font-semibold">Multi-Condition Logic</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Combine multiple conditions with AND/OR logic for precise alerts
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                          <h3 className="font-semibold">Technical Indicators</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            RSI, MACD, Bollinger Bands, and moving average alerts
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <h3 className="font-semibold">Whale Movement Tracking</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Real-time alerts for large wallet movements and transfers
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold mb-2">Available Alert Types:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>• Price threshold alerts</div>
                      <div>• SSS score changes</div>
                      <div>• Volume spike detection</div>
                      <div>• Sentiment shifts</div>
                      <div>• Technical indicator signals</div>
                      <div>• News impact alerts</div>
                      <div>• Whale movement notifications</div>
                      <div>• Cross-exchange arbitrage</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exchanges" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5" />
                    Cross-Exchange Price Monitoring
                  </CardTitle>
                  <CardDescription>
                    Real-time price comparison and arbitrage opportunity detection across major exchanges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Supported Exchanges</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-medium">Binance</span>
                          <span className="text-sm text-green-600">Connected</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-medium">Coinbase Pro</span>
                          <span className="text-sm text-green-600">Connected</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-medium">Kraken</span>
                          <span className="text-sm text-green-600">Connected</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-medium">KuCoin</span>
                          <span className="text-sm text-green-600">Connected</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-medium">Uniswap V3</span>
                          <span className="text-sm text-green-600">Connected</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-medium">PancakeSwap</span>
                          <span className="text-sm text-green-600">Connected</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Key Features</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">Real-time Price Feeds</p>
                            <p className="text-sm text-gray-600">Live price monitoring across all major exchanges</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">Arbitrage Detection</p>
                            <p className="text-sm text-gray-600">Automatic identification of profitable price differences</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">Fee Calculation</p>
                            <p className="text-sm text-gray-600">Accurate profit calculation including all trading fees</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">Risk Assessment</p>
                            <p className="text-sm text-gray-600">Automated risk scoring for arbitrage opportunities</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="macro" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Macro Economic Integration
                  </CardTitle>
                  <CardDescription>
                    Global economic events, market correlations, and their impact on cryptocurrency prices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Economic Calendar</h4>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium">Federal Reserve Decision</span>
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Critical</span>
                          </div>
                          <p className="text-sm text-gray-600">FOMC interest rate announcement</p>
                          <p className="text-xs text-gray-500 mt-1">Expected: Hold at 5.25%</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium">US CPI Data</span>
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">High</span>
                          </div>
                          <p className="text-sm text-gray-600">Monthly inflation report</p>
                          <p className="text-xs text-gray-500 mt-1">Forecast: 3.2% YoY</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium">ECB Policy Meeting</span>
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Medium</span>
                          </div>
                          <p className="text-sm text-gray-600">European monetary policy update</p>
                          <p className="text-xs text-gray-500 mt-1">Expected: Hold at 4.0%</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Market Correlations</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                          <span className="font-medium">S&P 500</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">0.42</span>
                            <span className="text-xs text-green-600">Moderate +</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                          <span className="font-medium">Gold</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">0.31</span>
                            <span className="text-xs text-green-600">Weak +</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                          <span className="font-medium">USD Index (DXY)</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">-0.48</span>
                            <span className="text-xs text-red-600">Moderate -</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                          <span className="font-medium">NASDAQ</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">0.58</span>
                            <span className="text-xs text-green-600">Strong +</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                          <span className="font-medium">VIX (Volatility)</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">-0.22</span>
                            <span className="text-xs text-red-600">Weak -</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold mb-2 text-green-800 dark:text-green-200">Current Market Environment</h4>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      <p className="mb-2"><strong>Risk Assessment:</strong> Medium risk environment with moderate institutional adoption signals</p>
                      <p className="mb-2"><strong>USD Strength:</strong> Weakening dollar supports crypto asset prices</p>
                      <p><strong>Inflation Outlook:</strong> Declining inflation trends favor alternative store of value assets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}