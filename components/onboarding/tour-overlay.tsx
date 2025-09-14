import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, Lightbulb, Target, Star } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

interface TourOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Silent Surge Tracker',
    content: 'Discover hidden crypto gems before they surge using our revolutionary Silent Surge Score (SSS) algorithm.',
    target: '.dashboard-header',
    position: 'bottom',
    highlight: true
  },
  {
    id: 'sss-explanation',
    title: 'Understanding Silent Surge Score',
    content: 'SSS combines 6 key metrics: Behavioral Activity (20%), Token Velocity (20%), Community Cohesion (20%), Anchor Pressure (25%), Hype-to-Hold Ratio (10%), and Historical Volatility (5%).',
    target: '.sss-score',
    position: 'right'
  },
  {
    id: 'asset-scanner',
    title: 'Asset Scanner - Your Starting Point',
    content: 'Scan real-time crypto data to identify assets with high SSS scores. Look for scores above 80 for potential surge candidates.',
    target: '.asset-scanner',
    position: 'right'
  },
  {
    id: 'watchlist',
    title: 'Build Your Watchlist',
    content: 'Add promising assets to your watchlist for continuous monitoring. Set up alerts for price movements and SSS changes.',
    target: '.watchlist-section',
    position: 'left'
  },
  {
    id: 'heatmap',
    title: 'Behavioral Heatmap',
    content: 'Visualize market behavior patterns. Darker colors indicate stronger behavioral anomalies - potential surge indicators.',
    target: '.heatmap-module',
    position: 'top'
  },
  {
    id: 'analytics',
    title: 'Advanced Analytics',
    content: 'Access portfolio analysis, backtesting, and ML optimization. Test strategies and optimize your approach.',
    target: '.analytics-section',
    position: 'right'
  },
  {
    id: 'advanced-tools',
    title: 'Professional Tools',
    content: 'Use risk management, sentiment analysis, and portfolio optimization for institutional-grade trading decisions.',
    target: '.advanced-tools',
    position: 'left'
  },
  {
    id: 'signals',
    title: 'AI Trading Signals',
    content: 'Get AI-powered buy/sell/hold signals based on SSS analysis. Track performance and accuracy metrics.',
    target: '.trading-signals',
    position: 'top'
  }
];

export function TourOverlay({ isOpen, onClose, onComplete }: TourOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    const tourCompleted = localStorage.getItem('sst-tour-completed');
    setHasSeenTour(!!tourCompleted);
  }, []);

  useEffect(() => {
    if (isOpen && !hasSeenTour) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, hasSeenTour]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('sst-tour-completed', 'true');
    setHasSeenTour(true);
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen || hasSeenTour) {
    return null;
  }

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" />
      
      {/* Tour Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-[var(--dark-card)] border-[var(--dark-border)] shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[var(--primary-blue)]" />
                <CardTitle className="text-[var(--text-primary)]">{step.title}</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Step {currentStep + 1} of {tourSteps.length}
              </Badge>
              {step.highlight && (
                <Badge className="bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]">
                  <Star className="w-3 h-3 mr-1" />
                  Key Feature
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <CardDescription className="text-[var(--text-secondary)] text-base leading-relaxed">
              {step.content}
            </CardDescription>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                <span>Progress</span>
                <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-[var(--dark-border)] rounded-full h-2">
                <div 
                  className="bg-[var(--primary-blue)] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--dark-border)]">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSkip}>
                  Skip Tour
                </Button>
              </div>
              
              <Button onClick={handleNext} className="bg-[var(--primary-blue)]">
                {currentStep === tourSteps.length - 1 ? (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}