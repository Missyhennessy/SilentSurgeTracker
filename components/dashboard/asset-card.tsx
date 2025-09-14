'use client'

import { Star, TrendingUp, TrendingDown, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { AnimatedPrice, AnimatedPercentage } from "@/components/ui/animated-price";
import { SSScoreAnimation } from "@/components/ui/sss-score-animation";
import { FloatingPriceChange } from "@/components/ui/floating-price-change";
import { CryptoAsset } from "@/types/crypto";
import { getScoreColor, getTrendArrow } from "@/lib/sss-calculator";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";


interface AssetCardProps {
  asset: CryptoAsset;
  onSelect: (asset: CryptoAsset) => void;
}

export default function AssetCard({ asset, onSelect }: AssetCardProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [previousPrice, setPreviousPrice] = useState(asset.price);
  const [previousScore, setPreviousScore] = useState(asset.sssScore);
  const [showFloatingChange, setShowFloatingChange] = useState(false);

  // Track price changes for animations
  useEffect(() => {
    if (asset.price !== previousPrice) {
      setShowFloatingChange(true);
      setTimeout(() => {
        setPreviousPrice(asset.price);
        setShowFloatingChange(false);
      }, 2000);
    }
  }, [asset.price, previousPrice]);

  // Track SSS score changes
  useEffect(() => {
    if (asset.sssScore !== previousScore) {
      setTimeout(() => {
        setPreviousScore(asset.sssScore);
      }, 1000);
    }
  }, [asset.sssScore, previousScore]);
  

  
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
    <div className="relative bg-gray-800 rounded-xl border border-gray-700 p-6 hover:bg-gray-750 hover:border-gray-600 transition-all duration-200 transform hover:scale-105 group">
      
      {/* Floating Price Change Indicator */}
      {showFloatingChange && (
        <FloatingPriceChange
          oldPrice={previousPrice}
          newPrice={asset.price}
          symbol={asset.symbol}
          onAnimationComplete={() => setShowFloatingChange(false)}
        />
      )}
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
        
        <SSScoreAnimation 
          score={asset.sssScore} 
          previousScore={previousScore} 
          size={50} 
        />
      </div>


      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Price</span>
          <span className="text-[var(--text-primary)] font-medium">
            <AnimatedPrice 
              price={asset.price} 
              decimals={asset.price >= 1 ? 2 : 4}
              className="font-medium"
            />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">24h Change</span>
          <span className={asset.change24h >= 0 ? "text-[var(--success-green)]" : "text-[var(--danger-red)]"}>
            <AnimatedPercentage percentage={asset.change24h} />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Velocity Anomaly</span>
          <span className="text-[var(--warning-amber)] inline-flex items-center gap-1">
            <AnimatedPercentage 
              percentage={asset.velocityAnomaly} 
              className="text-[var(--warning-amber)]"
            />
            <span className="animate-wiggle">{getTrendArrow(asset.velocityAnomaly)}</span>
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-[var(--dark-border)]">
        <div className="flex justify-between items-center gap-2">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/crypto/${asset.symbol}`);
            }}
            className="px-3 py-2 text-sm text-[var(--primary-blue)] hover:text-[var(--primary-blue)]/80 hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
            data-testid={`button-view-details-${asset.symbol}`}
          >
            View Details
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toast({
                title: "Added to Watchlist",
                description: `${asset.symbol} has been added to your watchlist.`,
              });
            }}
            className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
            data-testid={`button-favorite-${asset.symbol}`}
          >
            <Star className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
