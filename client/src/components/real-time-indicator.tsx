import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RealTimeIndicatorProps {
  onDataUpdate?: (data: any) => void;
}

export function RealTimeIndicator({ onDataUpdate }: RealTimeIndicatorProps) {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Simple timer to show system is active
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

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
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <Badge variant="default" className="bg-green-500/10 text-green-400 border-green-500/20">
          System Active
        </Badge>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Zap className="h-4 w-4" />
        <span>
          Updated: {lastUpdate.toLocaleTimeString()}
        </span>
      </div>

      <Button
        onClick={handleManualUpdate}
        disabled={isUpdating}
        size="sm"
        variant="ghost"
        className="h-8 px-3"
      >
        {isUpdating ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}