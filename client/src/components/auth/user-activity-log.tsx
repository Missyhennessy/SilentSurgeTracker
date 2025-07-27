import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, Eye, Search, TrendingUp, Settings, RefreshCw, Filter, Download, Shield, AlertTriangle, CheckCircle, Globe, Smartphone, Monitor } from "lucide-react";
import { format, subDays, isWithinInterval } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ActivityItem {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  type: 'view' | 'search' | 'update' | 'settings' | 'security' | 'login' | 'logout';
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  device?: string;
  riskLevel?: 'low' | 'medium' | 'high';
}

interface SecurityEvent {
  id: string;
  type: 'login_success' | 'login_failed' | 'password_change' | '2fa_enabled' | '2fa_disabled' | 'suspicious_activity';
  timestamp: Date;
  description: string;
  ipAddress: string;
  location: string;
  riskLevel: 'low' | 'medium' | 'high';
  details: Record<string, any>;
}

export function UserActivityLog() {
  const { toast } = useToast();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTimeframe, setFilterTimeframe] = useState<string>('7days');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Generate comprehensive sample activity data
    const sampleActivities: ActivityItem[] = [
      {
        id: '1',
        action: 'login_success',
        description: 'Successful login via Replit Auth',
        timestamp: new Date(),
        type: 'login',
        ipAddress: '192.168.1.1',
        location: 'New York, US',
        device: 'Desktop',
        riskLevel: 'low'
      },
      {
        id: '2',
        action: 'dashboard_access',
        description: 'Accessed cryptocurrency dashboard',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        type: 'view',
        ipAddress: '192.168.1.1',
        location: 'New York, US',
        device: 'Desktop',
        riskLevel: 'low'
      },
      {
        id: '3',
        action: 'crypto_search',
        description: 'Searched for LBLOCK cryptocurrency',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        type: 'search',
        metadata: { symbol: 'LBLOCK' },
        ipAddress: '192.168.1.1',
        location: 'New York, US',
        device: 'Desktop',
        riskLevel: 'low'
      },
      {
        id: '4',
        action: 'profile_access',
        description: 'Accessed user profile page',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: 'view',
        ipAddress: '192.168.1.1',
        location: 'New York, US',
        device: 'Desktop',
        riskLevel: 'low'
      },
      {
        id: '5',
        action: 'suspicious_login',
        description: 'Login attempt from unusual location',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'security',
        ipAddress: '203.0.113.1',
        location: 'Moscow, RU',
        device: 'Mobile',
        riskLevel: 'high'
      }
    ];

    const sampleSecurityEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'login_success',
        timestamp: new Date(),
        description: 'Successful login from trusted device',
        ipAddress: '192.168.1.1',
        location: 'New York, US',
        riskLevel: 'low',
        details: { device: 'Desktop Chrome', method: 'replit_auth' }
      },
      {
        id: '2',
        type: 'suspicious_activity',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        description: 'Login attempt from unusual location blocked',
        ipAddress: '203.0.113.1',
        location: 'Moscow, RU',
        riskLevel: 'high',
        details: { reason: 'geographic_anomaly', action: 'blocked' }
      },
      {
        id: '3',
        type: '2fa_enabled',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        description: 'Two-factor authentication enabled',
        ipAddress: '192.168.1.1',
        location: 'New York, US',
        riskLevel: 'low',
        details: { method: 'totp' }
      }
    ];
    
    setActivities(sampleActivities);
    setSecurityEvents(sampleSecurityEvents);
  }, []);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'view':
        return <Eye className="h-4 w-4" />;
      case 'search':
        return <Search className="h-4 w-4" />;
      case 'update':
        return <TrendingUp className="h-4 w-4" />;
      case 'settings':
        return <Settings className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'login':
        return <CheckCircle className="h-4 w-4" />;
      case 'logout':
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'view':
        return 'bg-blue-500';
      case 'search':
        return 'bg-green-500';
      case 'update':
        return 'bg-purple-500';
      case 'settings':
        return 'bg-orange-500';
      case 'security':
        return 'bg-red-500';
      case 'login':
        return 'bg-green-500';
      case 'logout':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskColor = (riskLevel?: string) => {
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

  const filterActivities = () => {
    let filtered = activities;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.type === filterType);
    }

    // Filter by timeframe
    const now = new Date();
    const timeframeMap = {
      '1day': subDays(now, 1),
      '7days': subDays(now, 7),
      '30days': subDays(now, 30),
      'all': subDays(now, 365)
    };
    const startDate = timeframeMap[filterTimeframe as keyof typeof timeframeMap];
    filtered = filtered.filter(activity => 
      isWithinInterval(activity.timestamp, { start: startDate, end: now })
    );

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.action.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const exportActivityLog = () => {
    const csvData = filterActivities().map(activity => ({
      timestamp: format(activity.timestamp, 'yyyy-MM-dd HH:mm:ss'),
      action: activity.action,
      description: activity.description,
      type: activity.type,
      ipAddress: activity.ipAddress || '',
      location: activity.location || '',
      device: activity.device || '',
      riskLevel: activity.riskLevel || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Activity log has been exported to CSV.",
    });
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const filteredActivities = filterActivities();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Enhanced Activity Log
            </CardTitle>
            <CardDescription>
              Comprehensive tracking of your account activity and security events
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportActivityLog}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="security">Security Events</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1 min-w-48">
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="view">Views</SelectItem>
                  <SelectItem value="search">Searches</SelectItem>
                  <SelectItem value="update">Updates</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="login">Logins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterTimeframe} onValueChange={setFilterTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1day">Today</SelectItem>
                  <SelectItem value="7days">7 Days</SelectItem>
                  <SelectItem value="30days">30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activity List */}
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className={`p-4 border rounded-lg ${
                  activity.riskLevel === 'high' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' :
                  activity.riskLevel === 'medium' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' :
                  'bg-gray-50 dark:bg-gray-800'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      <div className="text-white">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>{format(activity.timestamp, 'MMM d, h:mm a')}</span>
                            {activity.ipAddress && (
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {activity.ipAddress}
                              </span>
                            )}
                            {activity.location && (
                              <span>{activity.location}</span>
                            )}
                            {activity.device && (
                              <span className="flex items-center gap-1">
                                {activity.device === 'Mobile' ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                                {activity.device}
                              </span>
                            )}
                          </div>
                        </div>
                        {activity.riskLevel && (
                          <Badge variant="outline" className={getRiskColor(activity.riskLevel)}>
                            {activity.riskLevel.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      {activity.metadata && (
                        <div className="mt-2 flex gap-2">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredActivities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No activities match your filters</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Security events are automatically logged to help protect your account from unauthorized access.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {securityEvents.map((event) => (
                <div key={event.id} className={`p-4 border rounded-lg ${
                  event.riskLevel === 'high' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' :
                  event.riskLevel === 'medium' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' :
                  'border-green-200 bg-green-50 dark:bg-green-900/20'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      event.riskLevel === 'high' ? 'bg-red-500' :
                      event.riskLevel === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}>
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>{format(event.timestamp, 'MMM d, h:mm a')}</span>
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {event.ipAddress}
                            </span>
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={getRiskColor(event.riskLevel)}>
                          {event.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      {Object.keys(event.details).length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {Object.entries(event.details).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}