import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, TrendingUp, Shield, Zap, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  description?: string;
}

export default function PaywallModal({ isOpen, onClose, feature, description }: PaywallModalProps) {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await apiRequest("GET", "/api/subscription/status");
        const data = await response.json();
        setSubscriptionStatus(data);
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
      }
    };

    if (isOpen) {
      fetchSubscriptionStatus();
    }
  }, [isOpen]);

  const handleUpgrade = () => {
    window.location.href = "/subscribe";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Premium Feature
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-paywall"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription>
            {description || `${feature} requires a Pro subscription to access advanced machine learning capabilities.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              What you'll get with Pro:
            </h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-3 h-3 text-blue-500" />
                <span>Advanced ML Analysis with 86%+ accuracy</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span>Real-time Silent Surge Score calculations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-3 h-3 text-green-500" />
                <span>Breakout probability predictions</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span>Comprehensive token analysis</span>
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="text-2xl font-bold">$29<span className="text-lg font-normal text-muted-foreground">/month</span></div>
            <p className="text-sm text-muted-foreground">Cancel anytime</p>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={handleUpgrade} 
              className="w-full"
              data-testid="button-upgrade-to-pro"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="w-full"
              data-testid="button-maybe-later"
            >
              Maybe Later
            </Button>
          </div>

          {user?.email && (
            <p className="text-xs text-center text-muted-foreground">
              Subscription will be linked to {user.email}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}