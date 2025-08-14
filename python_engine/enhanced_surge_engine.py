#!/usr/bin/env python3
"""
Enhanced Silent Surge Scoring Engine (v2.0)
Improved accuracy with market-adaptive algorithms and machine learning enhancements
"""

import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import logging
from dataclasses import dataclass
import math

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class MarketContext:
    """Market context for dynamic algorithm adjustment"""
    volatility_regime: str  # low, medium, high
    trend_direction: str    # bullish, bearish, sideways
    risk_sentiment: float   # 0-1 scale
    correlation_strength: float  # BTC correlation 0-1
    volume_profile: str     # increasing, decreasing, stable

class EnhancedSilentSurgeEngine:
    """Enhanced scoring engine with adaptive algorithms and improved accuracy"""
    
    def __init__(self):
        # Base weights (will be dynamically adjusted)
        self.base_weights = {
            'behavioral_activity': 0.25,
            'velocity_anomaly': 0.20,
            'community_cohesion': 0.15,
            'anchor_pressure': 0.15,
            'hype_to_hold': 0.15,
            'historical_volatility': 0.10
        }
        
        # Market regime adjustments
        self.regime_adjustments = {
            'high_vol': {'velocity_anomaly': 1.2, 'historical_volatility': 0.8},
            'low_vol': {'behavioral_activity': 1.1, 'community_cohesion': 1.2},
            'bullish': {'hype_to_hold': 1.15, 'anchor_pressure': 1.1},
            'bearish': {'behavioral_activity': 0.9, 'velocity_anomaly': 1.3}
        }
        
        # Accuracy tracking
        self.performance_history = []
        self.model_confidence = 0.75  # Initial confidence
        
    def calculate_enhanced_sss(self, metrics: Dict, market_context: Optional[MarketContext] = None) -> Dict:
        """Calculate enhanced SSS with dynamic weighting and confidence intervals"""
        
        # Get market-adaptive weights
        weights = self._get_adaptive_weights(market_context)
        
        # Base SSS calculation
        base_sss = sum(metrics.get(key, 0.5) * weight for key, weight in weights.items())
        
        # Apply accuracy enhancements
        enhanced_sss = self._apply_accuracy_enhancements(base_sss, metrics, market_context)
        
        # Calculate confidence interval
        confidence_interval = self._calculate_confidence_interval(enhanced_sss, metrics)
        
        # Risk-adjusted score
        risk_adjusted_sss = self._apply_risk_adjustment(enhanced_sss, metrics)
        
        return {
            'sss': round(min(max(risk_adjusted_sss, 0), 100), 2),
            'base_sss': round(base_sss * 100, 2),
            'confidence_lower': round(confidence_interval[0], 2),
            'confidence_upper': round(confidence_interval[1], 2),
            'model_confidence': round(self.model_confidence * 100, 2),
            'weights_used': weights,
            'market_regime': market_context.volatility_regime if market_context else 'unknown'
        }
    
    def enhanced_breakout_probability(self, sss: float, velocity: float, sentiment: float, 
                                    anchor: float, timeframe: int = 7, 
                                    market_context: Optional[MarketContext] = None) -> Dict:
        """Enhanced breakout probability with multiple model ensemble"""
        
        # Model 1: Adaptive Sigmoid
        sigmoid_prob = self._adaptive_sigmoid_model(sss, velocity, sentiment, anchor, timeframe, market_context)
        
        # Model 2: Momentum-based
        momentum_prob = self._momentum_based_model(sss, velocity, sentiment, timeframe)
        
        # Model 3: Pattern Recognition
        pattern_prob = self._pattern_recognition_model(sss, velocity, sentiment, anchor)
        
        # Model 4: Market Regime-aware
        regime_prob = self._regime_aware_model(sss, velocity, sentiment, anchor, market_context)
        
        # Ensemble weighting based on market conditions
        ensemble_weights = self._get_ensemble_weights(market_context)
        
        # Calculate weighted ensemble
        ensemble_prob = (
            sigmoid_prob * ensemble_weights['sigmoid'] +
            momentum_prob * ensemble_weights['momentum'] +
            pattern_prob * ensemble_weights['pattern'] +
            regime_prob * ensemble_weights['regime']
        )
        
        # Apply confidence penalty for uncertain conditions
        confidence_factor = self._calculate_prediction_confidence(sss, velocity, sentiment, anchor)
        final_prob = ensemble_prob * confidence_factor
        
        return {
            'ensemble_probability': round(min(max(final_prob, 0), 100), 2),
            'model_breakdown': {
                'sigmoid': round(sigmoid_prob, 2),
                'momentum': round(momentum_prob, 2),
                'pattern': round(pattern_prob, 2),
                'regime': round(regime_prob, 2)
            },
            'ensemble_weights': ensemble_weights,
            'confidence_factor': round(confidence_factor, 3),
            'prediction_confidence': self._get_prediction_confidence_level(confidence_factor)
        }
    
    def _get_adaptive_weights(self, market_context: Optional[MarketContext]) -> Dict:
        """Get market-adaptive weights for SSS calculation"""
        weights = self.base_weights.copy()
        
        if not market_context:
            return weights
        
        # Adjust for volatility regime
        if market_context.volatility_regime == 'high':
            weights['velocity_anomaly'] *= 1.2
            weights['historical_volatility'] *= 0.8
        elif market_context.volatility_regime == 'low':
            weights['behavioral_activity'] *= 1.1
            weights['community_cohesion'] *= 1.2
        
        # Adjust for trend direction
        if market_context.trend_direction == 'bullish':
            weights['hype_to_hold'] *= 1.15
            weights['anchor_pressure'] *= 1.1
        elif market_context.trend_direction == 'bearish':
            weights['behavioral_activity'] *= 0.9
            weights['velocity_anomaly'] *= 1.3
        
        # Normalize weights to sum to 1
        total_weight = sum(weights.values())
        return {k: v/total_weight for k, v in weights.items()}
    
    def _apply_accuracy_enhancements(self, base_sss: float, metrics: Dict, 
                                   market_context: Optional[MarketContext]) -> float:
        """Apply various accuracy enhancements to the base SSS"""
        
        enhanced_sss = base_sss
        
        # Enhancement 1: Non-linear scaling for extreme values
        if base_sss > 0.8:
            enhanced_sss = 0.8 + (base_sss - 0.8) * 0.7  # Dampen extreme highs
        elif base_sss < 0.2:
            enhanced_sss = 0.2 * (base_sss / 0.2) ** 0.7  # Smooth extreme lows
        
        # Enhancement 2: Momentum consistency check
        velocity = metrics.get('velocity_anomaly', 0.5)
        if abs(velocity - base_sss) > 0.4:  # Inconsistent signals
            enhanced_sss *= 0.9  # Apply penalty
        
        # Enhancement 3: Market context adjustment
        if market_context and market_context.risk_sentiment < 0.3:
            enhanced_sss *= 0.85  # Reduce scores in risk-off environment
        
        return enhanced_sss * 100  # Convert to 0-100 scale
    
    def _adaptive_sigmoid_model(self, sss: float, velocity: float, sentiment: float, 
                              anchor: float, timeframe: int, 
                              market_context: Optional[MarketContext]) -> float:
        """Adaptive sigmoid model with market regime awareness"""
        
        # Base coefficients
        coeffs = {
            'sss': 0.06,
            'velocity': 0.35,
            'sentiment': 0.25,
            'anchor': 0.15,
            'intercept': -8.5
        }
        
        # Adjust coefficients based on market context
        if market_context:
            if market_context.volatility_regime == 'high':
                coeffs['velocity'] *= 1.3
                coeffs['sss'] *= 0.9
            elif market_context.volatility_regime == 'low':
                coeffs['sss'] *= 1.2
                coeffs['sentiment'] *= 1.1
        
        # Timeframe adjustment
        time_factor = {3: 0.85, 7: 1.0, 14: 1.15}.get(timeframe, 1.0)
        
        # Calculate logistic input
        z = (
            coeffs['sss'] * sss +
            coeffs['velocity'] * velocity +
            coeffs['sentiment'] * sentiment +
            coeffs['anchor'] * anchor +
            coeffs['intercept']
        ) * time_factor
        
        # Apply adaptive sigmoid
        probability = 1 / (1 + np.exp(-z)) * 100
        
        # Apply market volatility adjustment
        if market_context and market_context.volatility_regime == 'high':
            probability *= 0.95  # Slight reduction for high volatility
        
        return probability
    
    def _momentum_based_model(self, sss: float, velocity: float, sentiment: float, timeframe: int) -> float:
        """Momentum-based probability model"""
        
        # Calculate momentum score
        momentum_score = (velocity * 0.4 + sss/100 * 0.35 + sentiment/5 * 0.25)
        
        # Apply timeframe decay
        decay_factor = math.exp(-timeframe / 10)
        adjusted_momentum = momentum_score * (1 + decay_factor * 0.3)
        
        # Convert to probability using power function
        probability = (adjusted_momentum ** 1.5) * 85  # Max 85% for this model
        
        return min(probability, 85)
    
    def _pattern_recognition_model(self, sss: float, velocity: float, sentiment: float, anchor: float) -> float:
        """Pattern recognition model for breakout probability"""
        
        # Define pattern signatures
        patterns = {
            'strong_breakout': (sss > 80 and velocity > 1.2 and anchor > 0.7),
            'accumulation': (60 < sss < 80 and 0.8 < velocity < 1.2 and anchor > 0.6),
            'momentum_build': (sss > 70 and velocity > 1.5 and sentiment > 3.5),
            'consolidation': (40 < sss < 70 and velocity < 0.8 and anchor > 0.5)
        }
        
        # Pattern-based probabilities
        pattern_probs = {
            'strong_breakout': 82,
            'accumulation': 65,
            'momentum_build': 75,
            'consolidation': 45
        }
        
        # Check for patterns
        for pattern_name, condition in patterns.items():
            if condition:
                return pattern_probs[pattern_name]
        
        # Default probability based on SSS
        return max(30, min(70, sss * 0.8))
    
    def _regime_aware_model(self, sss: float, velocity: float, sentiment: float, anchor: float, 
                          market_context: Optional[MarketContext]) -> float:
        """Market regime-aware probability model"""
        
        base_prob = (sss * 0.3 + velocity * 20 + sentiment * 12 + anchor * 25)
        
        if not market_context:
            return min(base_prob, 75)
        
        # Regime adjustments
        if market_context.trend_direction == 'bullish':
            regime_multiplier = 1.15
        elif market_context.trend_direction == 'bearish':
            regime_multiplier = 0.75
        else:
            regime_multiplier = 0.9
        
        # Volatility adjustments
        if market_context.volatility_regime == 'high':
            vol_adjustment = 0.9
        else:
            vol_adjustment = 1.05
        
        adjusted_prob = base_prob * regime_multiplier * vol_adjustment
        return min(adjusted_prob, 85)
    
    def _get_ensemble_weights(self, market_context: Optional[MarketContext]) -> Dict:
        """Get dynamic ensemble weights based on market conditions"""
        
        default_weights = {
            'sigmoid': 0.35,
            'momentum': 0.25,
            'pattern': 0.25,
            'regime': 0.15
        }
        
        if not market_context:
            return default_weights
        
        weights = default_weights.copy()
        
        # Adjust based on volatility
        if market_context.volatility_regime == 'high':
            weights['momentum'] *= 1.2
            weights['pattern'] *= 0.8
        elif market_context.volatility_regime == 'low':
            weights['sigmoid'] *= 1.1
            weights['regime'] *= 1.3
        
        # Normalize
        total = sum(weights.values())
        return {k: v/total for k, v in weights.items()}
    
    def _calculate_confidence_interval(self, sss: float, metrics: Dict) -> Tuple[float, float]:
        """Calculate confidence interval for SSS score"""
        
        # Base confidence based on data quality
        data_quality = sum(1 for v in metrics.values() if 0.1 <= v <= 0.9) / len(metrics)
        base_confidence = 0.8 + data_quality * 0.2
        
        # Calculate standard error
        std_error = (100 - sss) * 0.1 * (1 - base_confidence)
        
        # 95% confidence interval
        margin = 1.96 * std_error
        
        return (max(0, sss - margin), min(100, sss + margin))
    
    def _apply_risk_adjustment(self, sss: float, metrics: Dict) -> float:
        """Apply risk-based adjustments to SSS"""
        
        # High volatility penalty
        if metrics.get('historical_volatility', 0.5) > 0.8:
            sss *= 0.95
        
        # Extreme hype-to-hold ratio concerns
        htr = metrics.get('hype_to_hold', 0.5)
        if htr > 0.9 or htr < 0.1:
            sss *= 0.9
        
        return sss
    
    def _calculate_prediction_confidence(self, sss: float, velocity: float, 
                                       sentiment: float, anchor: float) -> float:
        """Calculate confidence factor for predictions"""
        
        # Signal consistency check
        signals = [sss/100, velocity/2, sentiment/5, anchor]
        signal_std = np.std(signals)
        consistency_factor = max(0.7, 1 - signal_std)
        
        # Extreme value penalty
        extreme_penalty = 1.0
        for signal in signals:
            if signal > 0.95 or signal < 0.05:
                extreme_penalty *= 0.95
        
        return consistency_factor * extreme_penalty
    
    def _get_prediction_confidence_level(self, confidence_factor: float) -> str:
        """Convert confidence factor to qualitative level"""
        if confidence_factor >= 0.9:
            return "Very High"
        elif confidence_factor >= 0.8:
            return "High"
        elif confidence_factor >= 0.7:
            return "Medium"
        elif confidence_factor >= 0.6:
            return "Low"
        else:
            return "Very Low"
    
    def update_model_performance(self, prediction: float, actual_outcome: bool, timeframe: int):
        """Update model performance tracking for continuous improvement"""
        
        # Convert actual outcome to probability-like score
        outcome_score = 100 if actual_outcome else 0
        
        # Calculate prediction error
        error = abs(prediction - outcome_score)
        
        # Update performance history
        self.performance_history.append({
            'prediction': prediction,
            'outcome': outcome_score,
            'error': error,
            'timeframe': timeframe,
            'timestamp': datetime.now()
        })
        
        # Keep only recent history (last 100 predictions)
        if len(self.performance_history) > 100:
            self.performance_history = self.performance_history[-100:]
        
        # Update model confidence
        recent_errors = [p['error'] for p in self.performance_history[-20:]]
        if recent_errors:
            avg_error = np.mean(recent_errors)
            # Convert error to confidence (lower error = higher confidence)
            self.model_confidence = max(0.5, 1 - (avg_error / 100))
        
        logger.info(f"Model performance updated. Current confidence: {self.model_confidence:.3f}")
    
    def get_model_diagnostics(self) -> Dict:
        """Get comprehensive model diagnostics"""
        
        if not self.performance_history:
            return {"status": "No performance history available"}
        
        recent_predictions = self.performance_history[-50:]
        
        return {
            'total_predictions': len(self.performance_history),
            'model_confidence': round(self.model_confidence, 3),
            'recent_accuracy': round(100 - np.mean([p['error'] for p in recent_predictions]), 2),
            'performance_trend': self._calculate_performance_trend(),
            'last_updated': self.performance_history[-1]['timestamp'].isoformat() if self.performance_history else None
        }
    
    def _calculate_performance_trend(self) -> str:
        """Calculate whether model performance is improving or declining"""
        
        if len(self.performance_history) < 20:
            return "Insufficient data"
        
        # Compare recent vs older performance
        recent_errors = [p['error'] for p in self.performance_history[-10:]]
        older_errors = [p['error'] for p in self.performance_history[-20:-10]]
        
        recent_avg = np.mean(recent_errors)
        older_avg = np.mean(older_errors)
        
        if recent_avg < older_avg * 0.9:
            return "Improving"
        elif recent_avg > older_avg * 1.1:
            return "Declining"
        else:
            return "Stable"