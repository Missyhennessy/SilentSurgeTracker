import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced animation configurations
export const animationConfig = {
  // Micro animations for better UX
  subtle: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.15, ease: "easeOut" }
  },
  
  // Slide animations
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.2, ease: "easeOut" }
  },
  
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.2, ease: "easeOut" }
  },
  
  // Bounce effect for important elements
  bounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: { opacity: 0, scale: 0.3 }
  },
  
  // Stagger animations for lists
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  },
  
  staggerChild: {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  }
};

// Enhanced counter with smooth transitions
interface AnimatedCounterProps {
  value: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export function EnhancedAnimatedCounter({ 
  value, 
  className = "", 
  suffix = "", 
  prefix = "",
  duration = 0.5 
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [prevValue, setPrevValue] = useState(0);

  useEffect(() => {
    if (value !== prevValue) {
      const startTime = Date.now();
      const startValue = displayValue;
      const difference = value - startValue;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (difference * easeOutCubic));
        
        setDisplayValue(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setPrevValue(value);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [value, displayValue, prevValue, duration]);

  return (
    <motion.span 
      key={value}
      initial={{ scale: 0.8, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {prefix}{displayValue.toLocaleString()}{suffix}
    </motion.span>
  );
}

// Price change animation component
interface PriceChangeAnimationProps {
  value: number;
  previousValue?: number;
  className?: string;
  children: React.ReactNode;
}

export function PriceChangeAnimation({ 
  value, 
  previousValue, 
  className = "",
  children 
}: PriceChangeAnimationProps) {
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (previousValue !== undefined && value !== previousValue) {
      const isIncrease = value > previousValue;
      setAnimationClass(isIncrease ? 'animate-price-up' : 'animate-price-down');
      
      // Clear animation class after animation completes
      const timer = setTimeout(() => setAnimationClass(''), 800);
      return () => clearTimeout(timer);
    }
  }, [value, previousValue]);

  return (
    <motion.div
      className={`${className} ${animationClass}`}
      animate={previousValue !== undefined && value !== previousValue ? {
        scale: [1, 1.05, 1],
        transition: { duration: 0.3, ease: "easeOut" }
      } : {}}
    >
      {children}
    </motion.div>
  );
}

// Loading skeleton with better animations
export function EnhancedSkeleton({ 
  className = "",
  children,
  isLoading = true 
}: {
  className?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
}) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <motion.div 
      className={`animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] rounded ${className}`}
      animate={{
        backgroundPosition: ['200% 0%', '-200% 0%'],
      }}
      transition={{
        duration: 2,
        ease: "linear",
        repeat: Infinity,
      }}
      style={{
        backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
      }}
    >
      {children || <div className="invisible">{children}</div>}
    </motion.div>
  );
}

// Optimized list animations
interface AnimatedListProps {
  children: React.ReactNode[];
  className?: string;
  itemDelay?: number;
}

export function AnimatedList({ children, className = "", itemDelay = 0.05 }: AnimatedListProps) {
  return (
    <motion.div 
      className={className}
      variants={animationConfig.stagger}
      initial="initial"
      animate="animate"
    >
      <AnimatePresence mode="popLayout">
        {children.map((child, index) => (
          <motion.div
            key={index}
            variants={animationConfig.staggerChild}
            layout
            layoutId={`item-${index}`}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// Performance-optimized hover effects
export function OptimizedHover({ 
  children, 
  className = "",
  hoverScale = 1.02,
  hoverBrightness = 1.1 
}: {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  hoverBrightness?: number;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale: hoverScale,
        filter: `brightness(${hoverBrightness})`,
        transition: { duration: 0.15 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}