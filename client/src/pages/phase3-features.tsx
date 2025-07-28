import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Search, 
  AlertTriangle, 
  FileText, 
  Users, 
  TrendingUp, 
  Eye, 
  Clock,
  DollarSign,
  Building,
  Target,
  BarChart3,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  Network,
  Zap
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TransactionTrace {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: number;
  asset: string;
  timestamp: string;
  riskScore: number;
  flags: string[];
  chain: string;
  confidence: number;
}

interface AddressRisk {
  address: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  flags: string[];
  totalValue: number;
  transactionCount: number;
  complianceStatus: 'clean' | 'watchlist' | 'sanctioned' | 'blocked';
}

interface ComplianceAlert {
  id: string;
  ruleId: string;
  address: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  evidence: {
    riskScore: number;
    patterns: string[];
  };
}

interface InstitutionalClient {
  id: string;
  name: string;
  type: string;
  tier: string;
  aum: number;
  region: string;
  apiQuota: {
    daily: number;
    monthly: number;
    used: number;
  };
  features: string[];
  lastActive: string;
}

export default function Phase3Features() {
  const { toast } = useToast();
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedHash, setSelectedHash] = useState("");
  const [sanctionAddresses, setSanctionAddresses] = useState("");

  // Blockchain Forensics Queries
  const { data: addressRisk, isLoading: addressLoading } = useQuery({
    queryKey: ['/api/forensics/address', selectedAddress],
    enabled: !!selectedAddress
  });

  const { data: transactionTrace, isLoading: traceLoading } = useQuery({
    queryKey: ['/api/forensics/trace', selectedHash],
    enabled: !!selectedHash
  });

  // Compliance Queries
  const { data: complianceRules } = useQuery({
    queryKey: ['/api/compliance/rules']
  });

  const { data: complianceAlerts } = useQuery({
    queryKey: ['/api/compliance/alerts']
  });

  const { data: jurisdictions } = useQuery({
    queryKey: ['/api/compliance/jurisdictions']
  });

  // Institutional API Queries
  const { data: institutionalClients } = useQuery({
    queryKey: ['/api/institutional/clients']
  });

  const { data: apiMetrics } = useQuery({
    queryKey: ['/api/institutional/metrics']
  });

  const { data: revenueData } = useQuery({
    queryKey: ['/api/institutional/revenue']
  });

  // Sanction Check Mutation
  const sanctionCheckMutation = useMutation({
    mutationFn: async (addresses: string[]) => {
      return await apiRequest('/api/forensics/sanction-check', {
        method: 'POST',
        body: { addresses }
      });
    },
    onSuccess: () => {
      toast({
        title: "Sanction Check Complete",
        description: "Address screening completed successfully."
      });
    }
  });

  const handleSanctionCheck = () => {
    if (!sanctionAddresses.trim()) return;
    const addresses = sanctionAddresses.split('\n').map(addr => addr.trim()).filter(addr => addr);
    sanctionCheckMutation.mutate(addresses);
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phase 3: Enterprise Security & Compliance</h1>
          <p className="text-muted-foreground">
            Advanced blockchain forensics, regulatory compliance, and institutional API management
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Enterprise Grade
        </Badge>
      </div>

      <Tabs defaultValue="forensics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forensics" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Blockchain Forensics
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Regulatory Compliance
          </TabsTrigger>
          <TabsTrigger value="institutional" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Institutional APIs
          </TabsTrigger>
        </TabsList>

        {/* Blockchain Forensics Tab */}
        <TabsContent value="forensics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Trace Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Transaction Trace Analysis
                </CardTitle>
                <CardDescription>
                  Analyze transaction flows and identify suspicious patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="txHash">Transaction Hash</Label>
                  <Input
                    id="txHash"
                    placeholder="0x1234567890abcdef..."
                    value={selectedHash}
                    onChange={(e) => setSelectedHash(e.target.value)}
                  />
                </div>
                
                {traceLoading && (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm text-muted-foreground">Analyzing transaction...</span>
                  </div>
                )}

                {transactionTrace && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Risk Score</span>
                      <Badge className={getRiskBadgeColor(
                        transactionTrace.riskScore > 75 ? 'critical' : 
                        transactionTrace.riskScore > 50 ? 'high' : 
                        transactionTrace.riskScore > 25 ? 'medium' : 'low'
                      )}>
                        {transactionTrace.riskScore.toFixed(1)}
                      </Badge>
                    </div>
                    <Progress value={transactionTrace.riskScore} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <div className="font-medium">{transactionTrace.amount.toLocaleString()} {transactionTrace.asset}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Chain:</span>
                        <div className="font-medium">{transactionTrace.chain}</div>
                      </div>
                    </div>

                    {transactionTrace.flags.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Risk Flags:</span>
                        <div className="flex flex-wrap gap-1">
                          {transactionTrace.flags.map((flag, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Address Risk Assessment
                </CardTitle>
                <CardDescription>
                  Comprehensive risk analysis for blockchain addresses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Wallet Address</Label>
                  <Input
                    id="address"
                    placeholder="0xabcdef1234567890..."
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                  />
                </div>

                {addressLoading && (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm text-muted-foreground">Analyzing address...</span>
                  </div>
                )}

                {addressRisk && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Risk Level</span>
                      <Badge className={getRiskBadgeColor(addressRisk.riskLevel)}>
                        {addressRisk.riskLevel.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Value:</span>
                        <div className="font-medium">${addressRisk.totalValue.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Transactions:</span>
                        <div className="font-medium">{addressRisk.transactionCount.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm font-medium">Compliance Status:</span>
                      <Badge variant={addressRisk.complianceStatus === 'clean' ? 'default' : 'destructive'}>
                        {addressRisk.complianceStatus.toUpperCase()}
                      </Badge>
                    </div>

                    {addressRisk.flags.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Risk Flags:</span>
                        <div className="flex flex-wrap gap-1">
                          {addressRisk.flags.map((flag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sanction Screening */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Batch Sanction Screening
              </CardTitle>
              <CardDescription>
                Screen multiple addresses against global sanctions lists
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addresses">Addresses (one per line)</Label>
                <textarea
                  id="addresses"
                  className="w-full h-32 px-3 py-2 text-sm border border-border rounded-md resize-none"
                  placeholder="0x1234567890abcdef...&#10;0xfedcba0987654321...&#10;0xabcdef1234567890..."
                  value={sanctionAddresses}
                  onChange={(e) => setSanctionAddresses(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleSanctionCheck}
                disabled={sanctionCheckMutation.isPending || !sanctionAddresses.trim()}
                className="w-full"
              >
                {sanctionCheckMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Screening Addresses...
                  </>
                ) : (
                  'Run Sanction Check'
                )}
              </Button>

              {sanctionCheckMutation.data && (
                <div className="space-y-2">
                  <h4 className="font-medium">Screening Results:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {sanctionCheckMutation.data.map((result: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm font-mono">{result.address}</span>
                        <Badge variant={result.isBlocked ? 'destructive' : 'default'}>
                          {result.isBlocked ? 'BLOCKED' : 'CLEAR'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regulatory Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Active Compliance Rules
                </CardTitle>
                <CardDescription>
                  {complianceRules?.length || 0} rules monitoring transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {complianceRules?.map((rule: any) => (
                      <div key={rule.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{rule.name}</span>
                          <Badge className={getRiskBadgeColor(rule.severity)}>
                            {rule.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Jurisdiction: {rule.jurisdiction}</span>
                          <span>Category: {rule.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Compliance Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Compliance Alerts
                </CardTitle>
                <CardDescription>
                  {complianceAlerts?.filter((alert: any) => alert.status === 'open').length || 0} open alerts require attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {complianceAlerts?.slice(0, 10).map((alert: ComplianceAlert) => (
                      <div key={alert.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(alert.severity)}
                            <span className="font-medium">{alert.alertType.replace('_', ' ')}</span>
                          </div>
                          <Badge variant={alert.status === 'open' ? 'destructive' : 'default'}>
                            {alert.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Risk: {alert.evidence.riskScore.toFixed(1)}</span>
                          <span>Address: {alert.address.slice(0, 10)}...</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Jurisdiction Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Jurisdiction Requirements
              </CardTitle>
              <CardDescription>
                Regulatory requirements across different jurisdictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {jurisdictions?.map((jurisdiction: any) => (
                  <div key={jurisdiction.jurisdiction} className="p-4 border rounded-lg space-y-3">
                    <h4 className="font-medium">{jurisdiction.jurisdiction}</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>KYC Required:</span>
                        <Badge variant={jurisdiction.requirements.kyc ? 'default' : 'secondary'}>
                          {jurisdiction.requirements.kyc ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>AML Required:</span>
                        <Badge variant={jurisdiction.requirements.aml ? 'default' : 'secondary'}>
                          {jurisdiction.requirements.aml ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>Daily Limit: ${jurisdiction.thresholds.dailyLimit.toLocaleString()}</div>
                      <div>Monthly Limit: ${jurisdiction.thresholds.monthlyLimit.toLocaleString()}</div>
                      <div>Reporting: ${jurisdiction.thresholds.reportingThreshold.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Institutional APIs Tab */}
        <TabsContent value="institutional" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {revenueData && (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        ${revenueData.monthlyRevenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Clients:</span>
                        <div className="font-medium">{revenueData.clientCount}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Growth:</span>
                        <div className="font-medium text-green-600">+{revenueData.growthRate.toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm font-medium">Revenue by Tier:</span>
                      {Object.entries(revenueData.tierDistribution).map(([tier, percentage]) => (
                        <div key={tier} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{tier}:</span>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* API Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  API Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {apiMetrics?.slice(0, 8).map((metric: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{metric.endpoint.split('/').pop()}</span>
                          <Badge variant="outline">{metric.method}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Calls/24h:</span>
                            <div className="font-medium">{metric.calls24h.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg Response:</span>
                            <div className="font-medium">{metric.avgResponseTime.toFixed(0)}ms</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Error Rate:</span>
                          <span className={`font-medium ${metric.errorRate < 1 ? 'text-green-600' : 'text-red-600'}`}>
                            {metric.errorRate.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Client Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Institutional Clients
                </CardTitle>
                <CardDescription>
                  {institutionalClients?.length || 0} active enterprise clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {institutionalClients?.slice(0, 6).map((client: InstitutionalClient) => (
                      <div key={client.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{client.name}</span>
                          <Badge className={
                            client.tier === 'enterprise' ? 'bg-purple-500' :
                            client.tier === 'premium' ? 'bg-blue-500' : 'bg-gray-500'
                          }>
                            {client.tier}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {client.type.replace('_', ' ')} • {client.region}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">AUM:</span>
                            <div className="font-medium">${(client.aum / 1e9).toFixed(1)}B</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">API Usage:</span>
                            <div className="font-medium">
                              {((client.apiQuota.used / client.apiQuota.daily) * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>

                        <Progress 
                          value={(client.apiQuota.used / client.apiQuota.daily) * 100} 
                          className="h-1"
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Feature Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Phase 3 Feature Summary
              </CardTitle>
              <CardDescription>
                Enterprise-grade security and compliance capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Blockchain Forensics
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Transaction trace analysis</li>
                    <li>• Address risk assessment</li>
                    <li>• Cluster analysis & visualization</li>
                    <li>• Real-time sanction screening</li>
                    <li>• Multi-chain support</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Regulatory Compliance
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Multi-jurisdiction monitoring</li>
                    <li>• AML/KYC compliance rules</li>
                    <li>• Automated alert generation</li>
                    <li>• Regulatory reporting</li>
                    <li>• Risk-based assessments</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Institutional APIs
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Enterprise client management</li>
                    <li>• Custom indicator development</li>
                    <li>• Advanced risk models</li>
                    <li>• Real-time market data feeds</li>
                    <li>• Revenue analytics & reporting</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}