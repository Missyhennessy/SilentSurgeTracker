import { useState, useEffect } from "react";

interface AnimatedPriceProps {
  price: number;
  symbol?: string;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedPrice({ 
  price, 
  symbol = "$", 
  className = "", 
  prefix = "", 
  suffix = "",
  decimals = 2 
}: AnimatedPriceProps) {
  const [previousPrice, setPreviousPrice] = useState(price);
  const [animationState, setAnimationState] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [displayPrice, setDisplayPrice] = useState(price);

  useEffect(() => {
    if (price !== previousPrice) {
      // Determine animation direction
      const direction = price > previousPrice ? 'up' : 'down';
      setAnimationState(direction);
      
      // Animate price change
      const startPrice = previousPrice;
      const endPrice = price;
      const duration = 800; // ms
      const steps = 30;
      const stepDuration = duration / steps;
      const priceStep = (endPrice - startPrice) / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const newPrice = startPrice + (priceStep * currentStep);
        setDisplayPrice(newPrice);
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setDisplayPrice(endPrice);
          setPreviousPrice(endPrice);
          
          // Reset animation state after a delay
          setTimeout(() => {
            setAnimationState('neutral');
          }, 1500);
        }
      }, stepDuration);
      
      return () => clearInterval(interval);
    }
  }, [price, previousPrice]);

  const formatPrice = (value: number) => {
    if (value < 0.01 && value > 0) {
      return value.toFixed(6);
    }
    return value.toFixed(decimals);
  };

  const getAnimationClasses = () => {
    switch (animationState) {
      case 'up':
        return 'animate-price-up text-green-400 scale-110';
      case 'down':
        return 'animate-price-down text-red-400 scale-110';
      default:
        return '';
    }
  };

  return (
    <span className={`inline-block transition-all duration-300 ${getAnimationClasses()} ${className}`}>
      {prefix}{symbol}{formatPrice(displayPrice)}{suffix}
    </span>
  );
}

export function AnimatedPercentage({ 
  percentage, 
  className = "",
  showSign = true 
}: { 
  percentage: number; 
  className?: string;
  showSign?: boolean;
}) {
  const [previousPercentage, setPreviousPercentage] = useState(percentage);
  const [animationState, setAnimationState] = useState<'up' | 'down' | 'neutral'>('neutral');

  useEffect(() => {
    if (percentage !== previousPercentage) {
      const direction = percentage > previousPercentage ? 'up' : 'down';
      setAnimationState(direction);
      setPreviousPercentage(percentage);
      
      setTimeout(() => {
        setAnimationState('neutral');
      }, 1500);
    }
  }, [percentage, previousPercentage]);

  const getAnimationClasses = () => {
    switch (animationState) {
      case 'up':
        return 'animate-bounce-up text-green-400';
      case 'down':
        return 'animate-bounce-down text-red-400';
      default:
        return percentage >= 0 ? 'text-green-400' : 'text-red-400';
    }
  };

  return (
    <span className={`inline-block transition-all duration-300 ${getAnimationClasses()} ${className}`}>
      {showSign && percentage >= 0 ? '+' : ''}{percentage.toFixed(2)}%
    </span>
  );
}