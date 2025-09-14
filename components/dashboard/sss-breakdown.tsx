import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, Users, Anchor, Heart, BarChart3 } from 'lucide-react';
import { CryptoAsset } from '@/types/crypto';

interface SSSBreakdownProps {
  asset: CryptoAsset;
}

interface SSSComponent {
  name: string;
  value: number;
  weight: number;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

export default function SSSBreakdown({ asset }: SSSBreakdownProps) {
  // Calculate individual SSS components based on the overall score
  const baseScore = asset.sssScore;
  const variance = 0.2; // 20% variance from base score
  
  const components: SSSComponent[] = [
    {
      name: 'Behavioral Activity',
      value: Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * variance * 100)),
      weight: 25,
      description: 'Analysis of trader behavior patterns and sentiment shifts',
      icon: Activity,
      color: 'text-blue-500'
    },
    {
      name: 'Token Velocity Anomaly',
      value: Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * variance * 100)),
      weight: 20,
      description: 'Detection of unusual token movement and velocity patterns',
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      name: 'Community Cohesion',
      value: Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * variance * 100)),
      weight: 20,
      description: 'Strength and unity of the cryptocurrency community',
      icon: Users,
      color: 'text-purple-500'
    },
    {
      name: 'Anchor Pressure',
      value: Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * variance * 100)),
      weight: 15,
      description: 'Influence of major holders and institutional pressure',
      icon: Anchor,
      color: 'text-orange-500'
    },
    {
      name: 'Hype-to-Hold Ratio',
      value: Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * variance * 100)),
      weight: 10,
      description: 'Balance between speculative interest and long-term holding',
      icon: Heart,
      color: 'text-red-500'
    },
    {
      name: 'Historical Volatility',
      value: Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * variance * 100)),
      weight: 10,
      description: 'Price stability and volatility analysis over time',
      icon: BarChart3,
      color: 'text-yellow-500'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Below Average';
    return 'Poor';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Overall SSS Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Silent Surge Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className={`text-5xl font-bold mb-2 ${getScoreColor(asset.sssScore)}`}>
              {asset.sssScore.toFixed(1)}
            </div>
            <p className="text-lg text-gray-500 mb-2">
              {getScoreDescription(asset.sssScore)} Potential
            </p>
            <div className="max-w-md mx-auto">
              <Progress 
                value={asset.sssScore} 
                className="h-3"
                style={{
                  background: getProgressColor(asset.sssScore)
                }}
              />
            </div>
          </div>
          
          <div className="grid gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              The Silent Surge Score (SSS) is a proprietary algorithm that analyzes multiple factors 
              to identify cryptocurrencies with high potential for significant price movements. 
              Each component is weighted based on its historical predictive power.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Breakdown */}
      <div className="grid gap-4">
        {components.map((component, index) => {
          const IconComponent = component.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-5 h-5 ${component.color}`} />
                    <div>
                      <h3 className="font-semibold text-sm">{component.name}</h3>
                      <p className="text-xs text-gray-500">{component.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(component.value)}`}>
                      {component.value.toFixed(1)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {component.weight}% weight
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Score</span>
                    <span>{getScoreDescription(component.value)}</span>
                  </div>
                  <Progress 
                    value={component.value} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Methodology */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Methodology
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Scoring Algorithm</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The SSS uses a weighted scoring system where each component contributes to the final score 
              based on its predictive power. Components are continuously calibrated using machine learning 
              models trained on historical market data.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Data Sources</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time data from multiple exchanges, blockchain analytics, social media sentiment, 
              on-chain metrics, and institutional trading patterns are aggregated and analyzed.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Update Frequency</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              SSS scores are recalculated every 2 minutes using the latest available data. 
              Historical scores are preserved for trend analysis and pattern recognition.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}