import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Globe } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

interface SecurityMetrics {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  activeThreats: number;
  blockedIPs: number;
  suspiciousActivities: number;
  lastScanTime: string;
  systemIntegrity: boolean;
  apiSecurity: boolean;
  dataEncryption: boolean;
}

interface ThreatAlert {
  id: string;
  type: 'ip_reputation' | 'rate_limit' | 'suspicious_login' | 'data_breach_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'investigating';
  source: string;
}

export function SecurityDashboard() {
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    threatLevel: 'low',
    activeThreats: 0,
    blockedIPs: 0,
    suspiciousActivities: 0,
    lastScanTime: new Date().toISOString(),
    systemIntegrity: true,
    apiSecurity: true,
    dataEncryption: true
  });

  const [threats, setThreats] = useState<ThreatAlert[]>([]);

  // Fetch security data
  const { data: securityData, isLoading } = useQuery({
    queryKey: ['/api/security/dashboard'],
    refetchInterval: 30000, // Update every 30 seconds
    retry: false
  });

  useEffect(() => {
    if (securityData) {
      setSecurityMetrics(securityData.metrics || securityMetrics);
      setThreats(securityData.threats || []);
    }
  }, [securityData]);

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'high': return 'text-orange-400 bg-orange-400/10';
      case 'critical': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const runSecurityScan = async () => {
    try {
      const response = await fetch('/api/security/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        setSecurityMetrics(prev => ({
          ...prev,
          lastScanTime: new Date().toISOString(),
          ...result.metrics
        }));
      }
    } catch (error) {
      console.error('Security scan failed:', error);
    }
  };

  return (
    <div className="space-y-6" data-testid="security-dashboard">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-300">Threat Level</CardTitle>
              <Shield className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <Badge className={`${getThreatLevelColor(securityMetrics.threatLevel)} font-semibold`}>
              {securityMetrics.threatLevel.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-300">Active Threats</CardTitle>
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {securityMetrics.activeThreats}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-300">Blocked IPs</CardTitle>
              <Globe className="w-4 h-4 text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {securityMetrics.blockedIPs}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-300">Suspicious Activity</CardTitle>
              <XCircle className="w-4 h-4 text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {securityMetrics.suspiciousActivities}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Status Indicators */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">System Integrity</span>
              {securityMetrics.systemIntegrity ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">API Security</span>
              {securityMetrics.apiSecurity ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Data Encryption</span>
              {securityMetrics.dataEncryption ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Last scan: {new Date(securityMetrics.lastScanTime).toLocaleString()}
            </div>
            <Button 
              onClick={runSecurityScan}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-security-scan"
            >
              Run Security Scan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Threat Alerts */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recent Threat Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-pulse text-gray-400">Loading security data...</div>
            </div>
          ) : threats.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <div className="text-gray-400">No active threats detected</div>
            </div>
          ) : (
            <div className="space-y-3">
              {threats.slice(0, 5).map((threat) => (
                <div 
                  key={threat.id}
                  className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg"
                  data-testid={`threat-alert-${threat.id}`}
                >
                  {getSeverityIcon(threat.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-white truncate">
                        {threat.description}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {threat.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Source: {threat.source}</span>
                      <span>{new Date(threat.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}