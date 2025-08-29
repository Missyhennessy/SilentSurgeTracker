import { useState, useEffect } from "react";
import { BarChart3, TrendingUp } from "lucide-react";

interface AnimatedVolumeProps {
  volume: number;
  previousVolume?: number;
  className?: string;
}

export function AnimatedVolume({ 
  volume, 
  previousVolume = volume,
  className = ""
}: AnimatedVolumeProps) {
  const [animationState, setAnimationState] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [displayVolume, setDisplayVolume] = useState(volume);

  useEffect(() => {
    if (volume !== previousVolume) {
      const direction = volume > previousVolume ? 'up' : 'down';
      setAnimationState(direction);
      
      // Animate volume change
      const startVolume = previousVolume;
      const endVolume = volume;
      const duration = 600;
      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = (endVolume - startVolume) / steps;
      
      // Animation disabled to prevent refresh cycles
      setDisplayVolume(endVolume);
      setAnimationState('neutral');
      
      // Original animation code disabled:
      // let currentStep = 0;
      // const interval = setInterval(() => {
      //   currentStep++;
      //   const newVolume = startVolume + (volumeStep * currentStep);
      //   setDisplayVolume(newVolume);
      //   
      //   if (currentStep >= steps) {
      //     clearInterval(interval);
      //     setDisplayVolume(endVolume);
      //     
      //     setTimeout(() => {
      //       setAnimationState('neutral');
      //     }, 1000);
      //   }
      // }, stepDuration);
      // 
      // return () => clearInterval(interval);
    }
  }, [volume, previousVolume]);

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const getAnimationClasses = () => {
    switch (animationState) {
      case 'up':
        return 'animate-bounce-up text-green-400 scale-105';
      case 'down':
        return 'animate-bounce-down text-red-400 scale-95';
      default:
        return '';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1 transition-all duration-300 ${getAnimationClasses()} ${className}`}>
      <BarChart3 
        className={`w-3 h-3 ${animationState === 'up' ? 'animate-pulse' : ''}`} 
      />
      <span>{formatVolume(displayVolume)}</span>
      {animationState === 'up' && (
        <TrendingUp className="w-3 h-3 text-green-400 animate-bounce" />
      )}
    </div>
  );
}