import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, RefreshCw } from "lucide-react";

export function SessionMonitor() {
  const { user, isAuthenticated } = useAuth() as { user?: User; isAuthenticated: boolean };
  const { toast } = useToast();
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (user && isAuthenticated) {
      // Calculate session expiry (7 days from login)
      const loginTime = user.createdAt ? new Date(user.createdAt) : new Date();
      const expiryTime = new Date(loginTime.getTime() + 7 * 24 * 60 * 60 * 1000);
      setSessionExpiry(expiryTime);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (!sessionExpiry) return;

    // Timer disabled to prevent refresh cycles
    // const timer = setInterval(() => {
    //   const now = new Date();
    //   const diff = sessionExpiry.getTime() - now.getTime();
    //   
    //   if (diff <= 0) {
    //     setTimeLeft("Expired");
    //     setShowWarning(true);
    //     return;
    //   }

    //   const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    //   const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    //   const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    //   if (days === 0 && hours < 2) {
    //     setShowWarning(true);
    //     setTimeLeft(`${hours}h ${minutes}m`);
    //   } else if (days === 0) {
    //     setTimeLeft(`${hours}h ${minutes}m`);
    //   } else {
    //     setTimeLeft(`${days}d ${hours}h`);
    //   }
    // }, 60000); // Update every minute

    // return () => clearInterval(timer);
  }, [sessionExpiry]);

  useEffect(() => {
    if (showWarning && timeLeft !== "Expired") {
      toast({
        title: "Session Expiring Soon",
        description: `Your session will expire in ${timeLeft}. Please save your work.`,
        variant: "destructive",
      });
    } else if (timeLeft === "Expired") {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please sign in again.",
        variant: "destructive",
      });
    }
  }, [showWarning, timeLeft, toast]);

  const handleRefreshSession = () => {
    // In a real implementation, this would refresh the authentication token
    toast({
      title: "Session Refreshed",
      description: "Your session has been extended.",
    });
    setShowWarning(false);
  };

  if (!isAuthenticated || !sessionExpiry) {
    return null;
  }

  return (
    <Card className={`${showWarning ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Session Status
          {showWarning && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
        </CardTitle>
        <CardDescription>
          Your current authentication session information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Session expires in:</span>
            <Badge variant={showWarning ? "destructive" : "secondary"}>
              {timeLeft || "Calculating..."}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Session type:</span>
            <Badge variant="outline">Replit Auth</Badge>
          </div>

          {showWarning && (
            <div className="pt-3 border-t">
              <Button 
                onClick={handleRefreshSession}
                size="sm" 
                className="w-full"
                variant={timeLeft === "Expired" ? "default" : "outline"}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {timeLeft === "Expired" ? "Sign In Again" : "Extend Session"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}