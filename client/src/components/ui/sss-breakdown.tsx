import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, Users, Zap, Shield, Target, BarChart3, Info } from "lucide-react";
import { CryptoAsset, SSSScorebBreakdown } from "@/types/crypto";
import { calculateSSS, getScoreColor } from "@/lib/sss-calculator";

interface SSSBreakdownProps {
  asset: CryptoAsset;
  showWeights?: boolean;
  compact?: boolean;
}

const SSS_COMPONENTS = [
  {
    key: 'anchorPressure' as keyof SSSScorebBreakdown,
    label: 'Anchor Pressure',
    description: 'Price support and resistance analysis',
    icon: <Shield className="w-4 h-4" />,
    weight: 25,
    color: 'text-blue-400'
  },
  {
    key: 'behavioralActivity' as keyof SSSScorebBreakdown,
    label: 'Behavioral Activity',
    description: 'Community engagement and sentiment patterns',
    icon: <Users className="w-4 h-4" />,
    weight: 20,
    color: 'text-green-400'
  },
  {
    key: 'velocityAnomaly' as keyof SSSScorebBreakdown,
    label: 'Velocity Anomaly',
    description: 'Token movement and trading velocity',
    icon: <Zap className="w-4 h-4" />,
    weight: 20,
    color: 'text-yellow-400'
  },
  {
    key: 'communityCohesion' as keyof SSSScorebBreakdown,
    label: 'Community Cohesion',
    description: 'Social unity and holder stability',
    icon: <Target className="w-4 h-4" />,
    weight: 20,
    color: 'text-purple-400'
  },
  {
    key: 'hypeToHoldRatio' as keyof SSSScorebBreakdown,
    label: 'Hype-to-Hold Ratio',
    description: 'Social buzz vs. actual holding behavior',
    icon: <TrendingUp className="w-4 h-4" />,
    weight: 10,
    color: 'text-orange-400'
  },
  {
    key: 'historicalVolatility' as keyof SSSScorebBreakdown,
    label: 'Historical Volatility',
    description: 'Risk dampener based on price stability',
    icon: <BarChart3 className="w-4 h-4" />,
    weight: 5,
    color: 'text-red-400'
  }
];

export function SSSBreakdown({ asset, showWeights = true, compact = false }: SSSBreakdownProps) {
  const breakdown = calculateSSS(asset);
  const totalScore = breakdown.totalScore;

  if (compact) {
    return (
      <div className="space-y-3" data-testid="sss-breakdown-compact">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Silent Surge Score</h3>
          <Badge className={`text-lg font-bold ${getScoreColor(totalScore)}`} data-testid="sss-total-score">
            {totalScore}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {SSS_COMPONENTS.map((component) => (
            <div key={component.key} className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{component.label.split(' ')[0]}</span>
              <span className={component.color}>{breakdown[component.key]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Card className="bg-gray-800 border-gray-700" data-testid="sss-breakdown-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <span>Silent Surge Score Analysis</span>
            <Badge 
              className={`text-xl font-bold px-3 py-1 ${getScoreColor(totalScore)}`}
              data-testid="sss-total-score"
            >
              {totalScore}
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-400">
            Weighted analysis of {asset.symbol} using behavioral psychology and network theory
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {SSS_COMPONENTS.map((component) => (
            <div key={component.key} className="space-y-2" data-testid={`sss-component-${component.key}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={component.color}>{component.icon}</span>
                  <span className="text-white font-medium">{component.label}</span>
                  {showWeights && (
                    <Badge variant="outline" className="text-xs">
                      {component.weight}%
                    </Badge>
                  )}
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{component.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className={`font-bold ${component.color}`}>
                  {breakdown[component.key]}
                </span>
              </div>
              
              <div className="space-y-1">
                <Progress 
                  value={breakdown[component.key]} 
                  className="h-2"
                  data-testid={`progress-${component.key}`}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span className="text-gray-400">
                    Contributes: {Math.round(breakdown[component.key] * component.weight / 100)} points
                  </span>
                  <span>100</span>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-600">
            <h4 className="text-white font-medium mb-2">Score Interpretation</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">80+ = Strong Buy</span>
                <span className="text-green-400">High Potential</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">60-79 = Buy</span>
                <span className="text-yellow-400">Good Potential</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">40-59 = Hold</span>
                <span className="text-orange-400">Monitor</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">&lt;40 = Caution</span>
                <span className="text-red-400">High Risk</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export function SSSScoreBadge({ score, size = "default", showLabel = true }: { 
  score: number; 
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
}) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    default: "text-sm px-3 py-1",
    lg: "text-lg px-4 py-2"
  };

  return (
    <Badge 
      className={`font-bold ${getScoreColor(score)} ${sizeClasses[size]}`}
      data-testid="sss-score-badge"
    >
      {showLabel && "SSS: "}{score}
    </Badge>
  );
}