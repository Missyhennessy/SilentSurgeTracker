import { Star, TrendingUp, TrendingDown, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { CryptoAsset } from "@/types/crypto";
import { getScoreColor, getTrendArrow } from "@/lib/sss-calculator";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface AssetCardProps {
  asset: CryptoAsset;
  onSelect: (asset: CryptoAsset) => void;
}

export default function AssetCard({ asset, onSelect }: AssetCardProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Test if React is working at all
  console.log(`AssetCard rendering for ${asset.symbol}`);
  
  // Add a test to check if JavaScript is working
  useEffect(() => {
    console.log(`useEffect running for ${asset.symbol}`);
    // Try to create a simple DOM element test
    const testDiv = document.createElement('div');
    testDiv.id = `test-${asset.symbol}`;
    console.log(`Created test div:`, testDiv);
  }, [asset.symbol]);
  
  const getAssetIcon = (symbol: string) => {
    const iconMap: { [key: string]: string } = {
      'BTC': '₿',
      'ETH': 'Ξ', 
      'SOL': 'S',
      'ADA': 'A',
    };
    return iconMap[symbol] || symbol[0];
  };

  const handleAddToWatchlist = () => {
    console.log(`=== STAR BUTTON CLICKED ===`);
    console.log(`Adding ${asset.symbol} to watchlist`);
    try {
      toast({
        title: "Added to Watchlist",
        description: `${asset.symbol} has been added to your watchlist.`,
      });
      console.log(`Toast notification triggered successfully`);
    } catch (error) {
      console.error(`Toast error:`, error);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(asset);
  };

  const handleViewDetails = () => {
    console.log(`=== BUTTON CLICKED ===`);
    console.log(`Navigating to crypto detail page for ${asset.symbol}`);
    console.log(`Current location:`, window.location.href);
    try {
      navigate(`/crypto/${asset.symbol}`);
      console.log(`Navigate function called successfully`);
    } catch (error) {
      console.error(`Navigation error:`, error);
    }
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
    <div className="relative bg-gray-800 rounded-xl border border-gray-700 p-6 hover:bg-gray-750 hover:border-gray-600 transition-all duration-200 group"
         style={{ pointerEvents: 'auto' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-gradient-to-r ${getAssetGradient(asset.symbol)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
            {getAssetIcon(asset.symbol)}
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">{asset.symbol}</h3>
            <p className="text-sm text-gray-400">{asset.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ProgressRing 
            progress={asset.sssScore} 
            size={50} 
            color={asset.sssScore >= 80 ? '#10B981' : asset.sssScore >= 60 ? '#F59E0B' : '#EF4444'}
          />
          <div className="text-right">
            <div className={`text-xl font-bold ${getScoreColor(asset.sssScore)}`}>
              <AnimatedCounter value={asset.sssScore} decimals={1} />
            </div>
            <div className="text-xs text-gray-400">SSS Score</div>
          </div>
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
        <div className="flex justify-between items-center gap-2">
          <button 
            onMouseDown={() => console.log('MOUSE DOWN DETECTED')}
            onMouseUp={() => console.log('MOUSE UP DETECTED')}
            onPointerDown={() => console.log('POINTER DOWN DETECTED')}
            onTouchStart={() => console.log('TOUCH START DETECTED')}
            onClick={(e) => {
              console.log('=== CLICK EVENT FIRED ===');
              window.alert(`BUTTON CLICKED! ${asset.symbol}`);
              e.preventDefault();
              e.stopPropagation();
              navigate(`/crypto/${asset.symbol}`);
            }}
            className="px-4 py-2 bg-red-600 text-white font-bold rounded cursor-pointer"
            data-testid={`button-view-details-${asset.symbol}`}
            style={{ 
              position: 'relative', 
              zIndex: 9999,
              pointerEvents: 'auto',
              backgroundColor: '#dc2626 !important',
              border: '2px solid #ffffff',
              minHeight: '40px',
              minWidth: '120px'
            }}
          >
            CLICK ME - Details
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert(`STAR BUTTON WORKS! ${asset.symbol}`);
              console.log('Star button clicked - this should work now');
              toast({
                title: "Added to Watchlist",
                description: `${asset.symbol} added to watchlist.`,
              });
            }}
            className="px-4 py-2 bg-green-600 text-white font-bold rounded cursor-pointer"
            data-testid={`button-favorite-${asset.symbol}`}
            style={{ 
              position: 'relative', 
              zIndex: 9999,
              pointerEvents: 'auto',
              backgroundColor: '#16a34a !important',
              border: '2px solid #ffffff'
            }}
          >
            CLICK ME - Star
          </button>
        </div>
      </div>
    </div>
  );
}
