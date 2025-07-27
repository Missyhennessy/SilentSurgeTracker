import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Globe, 
  Activity, 
  TrendingUp, 
  RefreshCw,
  Search,
  Eye,
  Settings,
  Zap,
  Lock,
  Wifi,
  Server
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
  ipAddress: string;
  location: string;
  action: string;
  details: Record<string, any>;
}

interface SecurityReport {
  totalAlerts: number;
  alertsBySeverity: Record<string, number>;
  topThreats: string[];
  recommendations: string[];
}

interface SecurityDashboardData {
  report: SecurityReport;
  recentAlerts: SecurityAlert[];
  timestamp: string;
}

interface IPAnalysis {
  allowed: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
}

export function ExternalSecurityDashboard() {
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<SecurityDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testIP, setTestIP] = useState('');
  const [ipAnalysis, setIpAnalysis] = useState<IPAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadSecurityDashboard();
  }, []);

  const loadSecurityDashboard = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/api/security/dashboard') as SecurityDashboardData;
      setDashboardData(data);
    } catch (error: any) {
      toast({
        title: "Failed to Load Security Dashboard",
        description: error.message || "Could not fetch security data",
        variant: "destructive",
      });
      
      // Fallback to mock data for demonstration
      setDashboardData({
        report: {
          totalAlerts: 12,
          alertsBySeverity: { low: 5, medium: 4, high: 2, critical: 1 },
          topThreats: ['brute_force', 'malware', 'phishing', 'ddos'],
          recommendations: [
            'Enable IP allowlisting for admin access',
            'Implement rate limiting on login endpoints',
            'Regular security audit and monitoring',
            'Update threat intelligence feeds'
          ]
        },
        recentAlerts: [
          {
            id: '1',
            type: 'suspicious_login',
            severity: 'high',
            timestamp: new Date().toISOString(),
            description: 'Multiple failed login attempts from suspicious IP',
            ipAddress: '203.0.113.1',
            location: 'Moscow, RU',
            action: 'blocked',
            details: { attempts: 15, timeframe: '5 minutes' }
          },
          {
            id: '2',
            type: 'geographic_anomaly',
            severity: 'medium',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            description: 'Login from unusual geographic location',
            ipAddress: '198.51.100.1',
            location: 'Beijing, CN',
            action: 'logged',
            details: { previousLocation: 'New York, US' }
          }
        ],
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeIP = async () => {
    if (!testIP) {
      toast({
        title: "IP Required",
        description: "Please enter an IP address to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await apiRequest('/api/security/analyze-ip', 'POST', {
        ipAddress: testIP
      }) as IPAnalysis;
      
      setIpAnalysis(analysis);
      toast({
        title: "IP Analysis Complete",
        description: `Risk Level: ${analysis.riskLevel.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message || "Could not analyze IP address",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const testSecurityIntegration = async () => {
    setIsLoading(true);
    try {
      const result = await apiRequest('/api/security/test-integration', 'POST') as any;
      
      toast({
        title: "Security Test Complete",
        description: `Integration test successful. Analysis: ${result.analysis.riskLevel}`,
      });
      
      // Refresh dashboard after test
      await loadSecurityDashboard();
    } catch (error: any) {
      toast({
        title: "Integration Test Failed",
        description: error.message || "Security integration test failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                External Security Integrations
              </CardTitle>
              <CardDescription>
                Advanced threat detection and security monitoring
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={testSecurityIntegration}
                disabled={isLoading}
              >
                <Zap className="h-4 w-4 mr-2" />
                Test Integration
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadSecurityDashboard}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="threats">Threat Intel</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="analysis">IP Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {dashboardData && (
                <>
                  {/* Security Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="text-2xl font-bold">{dashboardData.report.totalAlerts}</p>
                            <p className="text-sm text-gray-600">Total Alerts</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="text-2xl font-bold">{dashboardData.report.alertsBySeverity.critical || 0}</p>
                            <p className="text-sm text-gray-600">Critical Threats</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-2xl font-bold">{dashboardData.report.topThreats.length}</p>
                            <p className="text-sm text-gray-600">Threat Types</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-2xl font-bold">Active</p>
                            <p className="text-sm text-gray-600">Protection Status</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Alert Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Alert Distribution by Severity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(dashboardData.report.alertsBySeverity).map(([severity, count]) => (
                          <div key={severity} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(severity)}>
                                {severity.toUpperCase()}
                              </Badge>
                              <span className="text-sm">{count} alerts</span>
                            </div>
                            <Progress 
                              value={(count / dashboardData.report.totalAlerts) * 100} 
                              className="w-32"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Security Alerts */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Security Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboardData.recentAlerts.map((alert) => (
                          <div key={alert.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={getSeverityColor(alert.severity)}>
                                    {alert.severity.toUpperCase()}
                                  </Badge>
                                  <Badge variant="outline">{alert.type}</Badge>
                                  <span className="text-sm text-gray-500">
                                    {format(new Date(alert.timestamp), 'MMM d, h:mm a')}
                                  </span>
                                </div>
                                <p className="text-sm font-medium mb-1">{alert.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    {alert.ipAddress}
                                  </span>
                                  <span>{alert.location}</span>
                                  <span>Action: {alert.action}</span>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="threats" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Threat Intelligence</CardTitle>
                  <CardDescription>
                    Real-time threat detection and intelligence feeds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Active Threat Types</h4>
                      <div className="space-y-2">
                        {dashboardData?.report.topThreats.map((threat, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <span className="text-sm capitalize">{threat.replace('_', ' ')}</span>
                            <Badge variant="outline" className="text-xs">
                              Active
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Security Integrations</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4" />
                            <span className="text-sm">IP Reputation Service</span>
                          </div>
                          <Badge variant="outline" className="text-green-600">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span className="text-sm">Geolocation Service</span>
                          </div>
                          <Badge variant="outline" className="text-green-600">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            <span className="text-sm">Behavioral Analysis</span>
                          </div>
                          <Badge variant="outline" className="text-green-600">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex items-center gap-2">
                            <Wifi className="h-4 w-4" />
                            <span className="text-sm">Real-time Monitoring</span>
                          </div>
                          <Badge variant="outline" className="text-green-600">Active</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData?.report.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Real-time security monitoring is active. All login attempts and suspicious activities are automatically analyzed and logged.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Monitoring Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-green-600" />
                          <span className="text-sm">Login Monitoring</span>
                        </div>
                        <Badge className="bg-green-500 text-white">Active</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-green-600" />
                          <span className="text-sm">Geographic Tracking</span>
                        </div>
                        <Badge className="bg-green-500 text-white">Active</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <span className="text-sm">Behavioral Analysis</span>
                        </div>
                        <Badge className="bg-green-500 text-white">Active</Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Lock className="h-5 w-5 text-green-600" />
                          <span className="text-sm">Session Security</span>
                        </div>
                        <Badge className="bg-green-500 text-white">Active</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-green-600" />
                          <span className="text-sm">Threat Detection</span>
                        </div>
                        <Badge className="bg-green-500 text-white">Active</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-green-600" />
                          <span className="text-sm">Auto Response</span>
                        </div>
                        <Badge className="bg-green-500 text-white">Enabled</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>IP Address Analysis</CardTitle>
                  <CardDescription>
                    Analyze IP addresses for potential security threats
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="testIP">IP Address</Label>
                      <Input
                        id="testIP"
                        placeholder="Enter IP address (e.g., 203.0.113.1)"
                        value={testIP}
                        onChange={(e) => setTestIP(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={analyzeIP} disabled={isAnalyzing}>
                        {isAnalyzing ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4 mr-2" />
                        )}
                        Analyze
                      </Button>
                    </div>
                  </div>

                  {ipAnalysis && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Analysis Result</h4>
                        <Badge variant="outline" className={getRiskColor(ipAnalysis.riskLevel)}>
                          {ipAnalysis.riskLevel.toUpperCase()} RISK
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Status:</span>
                          <Badge variant={ipAnalysis.allowed ? "default" : "destructive"}>
                            {ipAnalysis.allowed ? "Allowed" : "Blocked"}
                          </Badge>
                        </div>
                        
                        {ipAnalysis.reasons.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Reasons:</span>
                            <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                              {ipAnalysis.reasons.map((reason, index) => (
                                <li key={index}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    <p className="font-medium mb-1">Test IP Addresses:</p>
                    <ul className="space-y-1">
                      <li>• 203.0.113.1 (High Risk - Malicious)</li>
                      <li>• 198.51.100.1 (Medium Risk - Suspicious Location)</li>
                      <li>• 192.168.1.1 (Low Risk - Clean)</li>
                    </ul>
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