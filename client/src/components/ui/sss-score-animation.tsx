import { useState, useEffect } from "react";
import { AnimatedCounter } from "./animated-counter";
import { ProgressRing } from "./progress-ring";

interface SSScoreAnimationProps {
  score: number;
  previousScore?: number;
  size?: number;
}

export function SSScoreAnimation({ 
  score, 
  previousScore = score, 
  size = 50 
}: SSScoreAnimationProps) {
  const [animationState, setAnimationState] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [displayScore, setDisplayScore] = useState(score);

  useEffect(() => {
    if (score !== previousScore) {
      const direction = score > previousScore ? 'up' : 'down';
      setAnimationState(direction);
      
      // Animate score change over time
      const startScore = previousScore;
      const endScore = score;
      const duration = 1000; // ms
      const steps = 40;
      const stepDuration = duration / steps;
      const scoreStep = (endScore - startScore) / steps;
      
      // Animation disabled to prevent refresh cycles
      setDisplayScore(endScore);
      setAnimationState('neutral');
      
      // Original animation code disabled:
      // let currentStep = 0;
      // const interval = setInterval(() => {
      //   currentStep++;
      //   const newScore = startScore + (scoreStep * currentStep);
      //   setDisplayScore(newScore);
      //   
      //   if (currentStep >= steps) {
      //     clearInterval(interval);
      //     setDisplayScore(endScore);
      //     
      //     // Reset animation state after delay
      //     setTimeout(() => {
      //       setAnimationState('neutral');
      //     }, 1500);
      //   }
      // }, stepDuration);
      // 
      // return () => clearInterval(interval);
    }
  }, [score, previousScore]);

  const getColor = (currentScore: number) => {
    if (currentScore >= 80) return '#10B981'; // Green
    if (currentScore >= 60) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const getAnimationClasses = () => {
    switch (animationState) {
      case 'up':
        return 'animate-bounce-up';
      case 'down':
        return 'animate-bounce-down';
      default:
        return '';
    }
  };

  const getScoreColor = (currentScore: number) => {
    if (currentScore >= 80) return 'text-green-400';
    if (currentScore >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`transition-transform duration-300 ${getAnimationClasses()}`}>
        <ProgressRing 
          progress={displayScore} 
          size={size} 
          color={getColor(displayScore)}
        />
      </div>
      <div className="text-right">
        <div className={`text-xl font-bold transition-colors duration-300 ${getScoreColor(displayScore)} ${getAnimationClasses()}`}>
          <AnimatedCounter value={displayScore} decimals={1} />
        </div>
        <div className="text-xs text-gray-400">SSS Score</div>
      </div>
    </div>
  );
}