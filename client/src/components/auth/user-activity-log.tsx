import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Eye, Search, TrendingUp, Settings, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface ActivityItem {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  type: 'view' | 'search' | 'update' | 'settings';
  metadata?: Record<string, any>;
}

export function UserActivityLog() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Generate some sample activity data
    const sampleActivities: ActivityItem[] = [
      {
        id: '1',
        action: 'dashboard_access',
        description: 'Accessed cryptocurrency dashboard',
        timestamp: new Date(),
        type: 'view',
      },
      {
        id: '2',
        action: 'crypto_search',
        description: 'Searched for LBLOCK cryptocurrency',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        type: 'search',
        metadata: { symbol: 'LBLOCK' }
      },
      {
        id: '3',
        action: 'watchlist_add',
        description: 'Added Bitcoin to watchlist',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        type: 'update',
        metadata: { symbol: 'BTC' }
      },
      {
        id: '4',
        action: 'sss_analysis',
        description: 'Viewed SSS analysis for Solana',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: 'view',
        metadata: { symbol: 'SOL', sss_score: 72.5 }
      },
      {
        id: '5',
        action: 'profile_update',
        description: 'Updated profile information',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'settings',
      }
    ];
    
    setActivities(sampleActivities);
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
      default:
        return 'bg-gray-500';
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Log
            </CardTitle>
            <CardDescription>
              Your recent actions and interactions
            </CardDescription>
          </div>
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
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                <div className="text-white">
                  {getActivityIcon(activity.type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500">
                    {format(activity.timestamp, 'MMM d, h:mm a')}
                  </p>
                  {activity.metadata && (
                    <Badge variant="outline" className="text-xs">
                      {activity.metadata.symbol || activity.action}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {activities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}