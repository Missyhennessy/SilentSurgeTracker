import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface FloatingPriceChangeProps {
  oldPrice: number;
  newPrice: number;
  symbol: string;
  onAnimationComplete?: () => void;
}

export function FloatingPriceChange({ 
  oldPrice, 
  newPrice, 
  symbol,
  onAnimationComplete 
}: FloatingPriceChangeProps) {
  const [isVisible, setIsVisible] = useState(true);
  const change = newPrice - oldPrice;
  const changePercent = (change / oldPrice) * 100;
  const isPositive = change > 0;

  useEffect(() => {
    // Timer disabled to prevent refresh cycles
    setIsVisible(false);
    onAnimationComplete?.();
    
    // const timer = setTimeout(() => {
    //   setIsVisible(false);
    //   onAnimationComplete?.();
    // }, 2000);

    // return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  if (!isVisible || change === 0) return null;

  return (
    <div 
      className={`
        absolute top-2 right-2 z-50 
        px-2 py-1 rounded-md text-xs font-medium
        animate-float-up pointer-events-none
        ${isPositive 
          ? 'bg-green-500/90 text-white' 
          : 'bg-red-500/90 text-white'
        }
      `}
      style={{
        animation: 'float-up 2s ease-out forwards'
      }}
    >
      <div className="flex items-center gap-1">
        {isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        <span>
          {isPositive ? '+' : ''}${change.toFixed(4)}
        </span>
        <span className="opacity-75">
          ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}

// Hook to manage floating price changes
export function useFloatingPriceChange() {
  const [floatingChanges, setFloatingChanges] = useState<
    Map<string, { id: string; oldPrice: number; newPrice: number; symbol: string }>
  >(new Map());

  const addFloatingChange = (symbol: string, oldPrice: number, newPrice: number) => {
    const id = `${symbol}-${Date.now()}`;
    setFloatingChanges(prev => new Map(prev).set(id, { id, oldPrice, newPrice, symbol }));
  };

  const removeFloatingChange = (id: string) => {
    setFloatingChanges(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  };

  return {
    floatingChanges: Array.from(floatingChanges.values()),
    addFloatingChange,
    removeFloatingChange
  };
}