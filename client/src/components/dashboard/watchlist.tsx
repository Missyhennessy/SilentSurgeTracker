import { useQuery } from "@tanstack/react-query";
import { Download, Settings, Eye, Star, Bell, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CryptoAsset } from "@/types/crypto";
import { getScoreColor } from "@/lib/sss-calculator";

export default function Watchlist() {
  const { data: assets, isLoading } = useQuery<CryptoAsset[]>({
    queryKey: ["/api/watchlist"],
    refetchInterval: false, // Disabled to prevent refresh cycles
  });

  const getAssetIcon = (symbol: string) => {
    const iconMap: { [key: string]: string } = {
      'BTC': '₿',
      'ETH': 'Ξ', 
      'SOL': 'S',
      'ADA': 'A',
    };
    return iconMap[symbol] || symbol[0];
  };

  const getAssetGradient = (symbol: string) => {
    const gradientMap: { [key: string]: string } = {
      'BTC': 'from-orange-500 to-orange-600',
      'ETH': 'from-blue-500 to-purple-600',
      'SOL': 'from-purple-500 to-pink-600',
      'ADA': 'from-green-500 to-emerald-600',
    };
    return gradientMap[symbol] || 'from-gray-500 to-gray-600';
  };

  const getAlertLevel = (score: number) => {
    if (score >= 90) return { level: 'High', color: 'text-[var(--danger-red)]', icon: AlertTriangle };
    if (score >= 80) return { level: 'Medium', color: 'text-[var(--warning-amber)]', icon: AlertCircle };
    return { level: 'Low', color: 'text-[var(--text-secondary)]', icon: AlertCircle };
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[var(--dark-panel)] rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-[var(--dark-panel)] rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Spike Watchlist</h2>
        <p className="text-[var(--text-secondary)]">Monitor assets with unusual behavior patterns</p>
      </div>

      <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">High Priority Watchlist</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="bg-[var(--primary-blue)]/10 text-[var(--primary-blue)] border-[var(--primary-blue)]/20">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="bg-[var(--dark-bg)] border-[var(--dark-border)]">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--dark-border)]">
                <TableHead className="text-[var(--text-secondary)]">Asset</TableHead>
                <TableHead className="text-[var(--text-secondary)]">SSS Score</TableHead>
                <TableHead className="text-[var(--text-secondary)]">Price</TableHead>
                <TableHead className="text-[var(--text-secondary)]">24h Change</TableHead>
                <TableHead className="text-[var(--text-secondary)]">Velocity</TableHead>
                <TableHead className="text-[var(--text-secondary)]">Anchor Pressure</TableHead>
                <TableHead className="text-[var(--text-secondary)]">Alert</TableHead>
                <TableHead className="text-[var(--text-secondary)]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets?.map((asset) => {
                const alertInfo = getAlertLevel(asset.sssScore);
                const AlertIcon = alertInfo.icon;
                
                return (
                  <TableRow key={asset.id} className="border-[var(--dark-border)]/50 hover:bg-[var(--dark-border)]/20">
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-gradient-to-r ${getAssetGradient(asset.symbol)} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                          {getAssetIcon(asset.symbol)}
                        </div>
                        <div>
                          <div className="font-medium text-[var(--text-primary)]">{asset.symbol}</div>
                          <div className="text-sm text-[var(--text-secondary)]">{asset.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`${asset.sssScore >= 80 ? 'bg-[var(--success-green)]/20 text-[var(--success-green)] border-[var(--success-green)]/20' : 'bg-[var(--warning-amber)]/20 text-[var(--warning-amber)] border-[var(--warning-amber)]/20'}`}
                      >
                        {Math.round(asset.sssScore)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[var(--text-primary)] font-medium">
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: asset.price >= 1 ? 2 : 4 })}
                    </TableCell>
                    <TableCell>
                      <span className={asset.change24h >= 0 ? "text-[var(--success-green)]" : "text-[var(--danger-red)]"}>
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[var(--danger-red)]">
                        +{Math.round(asset.velocityAnomaly)}% ↑
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-[var(--dark-bg)] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[var(--success-green)] rounded-full" 
                            style={{ width: `${asset.anchorPressure}%` }}
                          />
                        </div>
                        <span className="text-sm text-[var(--text-secondary)]">
                          {Math.round(asset.anchorPressure)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`${alertInfo.color === 'text-[var(--danger-red)]' ? 'bg-[var(--danger-red)]/20 text-[var(--danger-red)] border-[var(--danger-red)]/20' : alertInfo.color === 'text-[var(--warning-amber)]' ? 'bg-[var(--warning-amber)]/20 text-[var(--warning-amber)] border-[var(--warning-amber)]/20' : 'bg-[var(--text-secondary)]/20 text-[var(--text-secondary)] border-[var(--text-secondary)]/20'}`}
                      >
                        <AlertIcon className="w-3 h-3 mr-1" />
                        {alertInfo.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-[var(--primary-blue)] hover:text-[var(--primary-blue)]/80">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                          <Star className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                          <Bell className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
