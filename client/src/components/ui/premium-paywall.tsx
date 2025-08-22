import { Crown, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

interface PremiumPaywallProps {
  feature: string;
  description: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showButton?: boolean;
}

export function PremiumPaywall({ 
  feature, 
  description, 
  className = "", 
  size = "md",
  showButton = true 
}: PremiumPaywallProps) {
  const [, navigate] = useLocation();

  const sizeClasses = {
    sm: "p-3 text-sm",
    md: "p-4",
    lg: "p-6"
  };

  return (
    <Card className={`border-2 border-dashed border-yellow-500/30 bg-gradient-to-br from-yellow-900/10 to-orange-900/10 ${className}`}>
      <CardContent className={sizeClasses[size]}>
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-yellow-400 flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              Premium Feature
            </h3>
            <p className="text-sm text-gray-300">
              <span className="font-medium text-yellow-300">{feature}</span> is only available with Silent Surge Pro
            </p>
            <p className="text-xs text-gray-400">{description}</p>
          </div>

          {showButton && (
            <Button
              onClick={() => navigate("/subscription")}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
              size={size === "sm" ? "sm" : "default"}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function InlinePaywall({ 
  feature, 
  className = ""
}: { 
  feature: string; 
  className?: string;
}) {
  const [, navigate] = useLocation();

  return (
    <div className={`flex items-center justify-center gap-3 p-3 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg ${className}`}>
      <Lock className="w-4 h-4 text-yellow-400" />
      <span className="text-sm text-gray-300">
        <span className="font-medium text-yellow-300">{feature}</span> requires Pro
      </span>
      <Button
        onClick={() => navigate("/subscription")}
        size="sm"
        variant="outline"
        className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
      >
        Upgrade
      </Button>
    </div>
  );
}