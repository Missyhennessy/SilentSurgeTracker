import { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// Using fetch directly for manual updates

interface RealTimeIndicatorProps {
  onDataUpdate?: (data: any) => void;
}

export function RealTimeIndicator({ onDataUpdate }: RealTimeIndicatorProps) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  const { lastMessage, isConnected } = useWebSocket('/ws');

  useEffect(() => {
    if (lastMessage) {
      try {
        // lastMessage is already parsed from WebSocket hook
        const data = lastMessage;
        if (data.type === 'crypto_update' || data.type === 'bulk_update' || data.type === 'asset_update') {
          setLastUpdate(new Date());
          setUpdateCount(prev => prev + 1);
          onDataUpdate?.(data.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage, onDataUpdate]);

  const handleManualUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/update-crypto-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      toast({
        title: "Data Updated",
        description: "Fetched latest crypto data from live sources",
      });
    } catch (error) {
      console.error('Manual update failed:', error);
      toast({
        title: "Update Failed",
        description: "Could not fetch live data. Check API connection.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <Badge variant={isConnected ? "default" : "destructive"}>
          {isConnected ? "Live" : "Offline"}
        </Badge>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Zap className="h-4 w-4" />
        <span>
          {lastUpdate 
            ? `Last update: ${lastUpdate.toLocaleTimeString()}`
            : 'Waiting for data...'
          }
        </span>
      </div>

      {updateCount > 0 && (
        <Badge variant="outline">
          {updateCount} updates
        </Badge>
      )}

      <Button
        onClick={handleManualUpdate}
        disabled={isUpdating}
        size="sm"
        variant="outline"
        className="ml-auto"
      >
        {isUpdating ? (
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-2" />
        )}
        Update Now
      </Button>
    </div>
  );
}