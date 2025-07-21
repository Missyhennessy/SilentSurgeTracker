import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuickStatProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'percentage' | 'absolute';
  icon?: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  badge?: string;
  className?: string;
}

export function QuickStat({
  title,
  value,
  change,
  changeType = 'percentage',
  icon: Icon = DollarSign,
  trend,
  subtitle,
  badge,
  className
}: QuickStatProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return null;
  };

  const formatChange = (val: number) => {
    const prefix = val >= 0 ? '+' : '';
    const suffix = changeType === 'percentage' ? '%' : '';
    return `${prefix}${val.toFixed(changeType === 'percentage' ? 1 : 0)}${suffix}`;
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className={cn("bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-400 font-medium">{title}</p>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-white">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              
              {change !== undefined && TrendIcon && (
                <div className={cn("flex items-center text-sm", getTrendColor())}>
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {formatChange(change)}
                </div>
              )}
            </div>
            
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickStatsGridProps {
  stats: QuickStatProps[];
  className?: string;
}

export function QuickStatsGrid({ stats, className }: QuickStatsGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {stats.map((stat, index) => (
        <QuickStat key={index} {...stat} />
      ))}
    </div>
  );
}