import { useEffect, useState, useRef } from 'react';
import { Monitor } from 'lucide-react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  networkRequests: number;
  loadTime: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    networkRequests: 0,
    loadTime: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    // FPS monitoring
    let animationFrame: number;
    
    const measureFPS = () => {
      frameCountRef.current++;
      const now = performance.now();
      
      if (now - lastTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage: (performance as any).memory ? 
            Math.round((performance as any).memory.usedJSHeapSize / 1048576) : 0,
          loadTime: 0 // Disabled performance timing
        }));
        
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      
      // animationFrame = requestAnimationFrame(measureFPS); // DISABLED
    };

    // FPS monitoring DISABLED to prevent refresh cycles
    // if (isVisible) {
    //   measureFPS();
    // }

    // Network request monitoring DISABLED to prevent refresh cycles
    // let requestCount = 0;
    // const originalFetch = window.fetch;
    // 
    // window.fetch = async (...args) => {
    //   requestCount++;
    //   setMetrics(prev => ({ ...prev, networkRequests: requestCount }));
    //   return originalFetch(...args);
    // };

    // Keyboard shortcut to toggle visibility (Ctrl+Shift+P)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      // window.fetch = originalFetch; // DISABLED
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  if (!isVisible && process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMemoryColor = (memory: number) => {
    if (memory < 50) return 'text-green-400';
    if (memory < 100) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div 
        className="bg-black/80 backdrop-blur-sm text-white p-3 rounded-lg border border-gray-700 shadow-xl font-mono text-xs"
        style={{ minWidth: '200px' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Monitor className="w-4 h-4" />
          <span className="font-semibold">Performance</span>
          <button 
            onClick={() => setIsVisible(false)}
            className="ml-auto text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>FPS:</span>
            <span className={getFPSColor(metrics.fps)}>{metrics.fps}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Memory:</span>
            <span className={getMemoryColor(metrics.memoryUsage)}>
              {metrics.memoryUsage}MB
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Requests:</span>
            <span className="text-blue-400">{metrics.networkRequests}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Load:</span>
            <span className="text-gray-300">{metrics.loadTime}ms</span>
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-gray-600 text-gray-400 text-xs">
          Press Ctrl+Shift+P to toggle
        </div>
      </div>
    </div>
  );
}

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    networkRequests: 0,
    loadTime: 0
  });

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          setMetrics(prev => ({
            ...prev,
            loadTime: Math.round(entry.loadEventEnd - entry.loadEventStart)
          }));
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });

    return () => observer.disconnect();
  }, []);

  return metrics;
}