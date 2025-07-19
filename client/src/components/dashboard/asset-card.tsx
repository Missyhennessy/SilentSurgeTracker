import { Star, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CryptoAsset } from "@/types/crypto";
import { getScoreColor, getTrendArrow } from "@/lib/sss-calculator";

interface AssetCardProps {
  asset: CryptoAsset;
  onSelect: (asset: CryptoAsset) => void;
}

export default function AssetCard({ asset, onSelect }: AssetCardProps) {
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

  return (
    <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-6 metric-card cursor-pointer"
         onClick={() => onSelect(asset)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${getAssetGradient(asset.symbol)} rounded-full flex items-center justify-center text-white font-bold`}>
            {getAssetIcon(asset.symbol)}
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">{asset.symbol}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{asset.name}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-xl font-bold ${getScoreColor(asset.sssScore)}`}>
            {Math.round(asset.sssScore)}
          </div>
          <div className="text-xs text-[var(--text-secondary)]">SSS Score</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Price</span>
          <span className="text-[var(--text-primary)] font-medium">
            ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: asset.price >= 1 ? 2 : 4 })}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">24h Change</span>
          <span className={asset.change24h >= 0 ? "text-[var(--success-green)]" : "text-[var(--danger-red)]"}>
            {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Velocity Anomaly</span>
          <span className="text-[var(--warning-amber)]">
            +{Math.round(asset.velocityAnomaly)}% {getTrendArrow(asset.velocityAnomaly)}
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-[var(--dark-border)]">
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="sm" className="text-[var(--primary-blue)] hover:text-[var(--primary-blue)]/80">
            View Details
          </Button>
          <Button variant="ghost" size="sm">
            <Star className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
