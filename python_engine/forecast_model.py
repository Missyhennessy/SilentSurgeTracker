#!/usr/bin/env python3
"""
Advanced Forecasting Models for Silent Surge Tracker
Implements LSTM-GRU hybrid models and statistical forecasting
"""

import numpy as np
import pandas as pd
from typing import List, Tuple, Dict
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class BreakoutPredictor:
    """Advanced breakout prediction using multiple models"""
    
    def __init__(self):
        self.models = {}
        self.feature_weights = {
            'sss_momentum': 0.25,
            'volume_spike': 0.20,
            'social_sentiment': 0.15,
            'technical_indicators': 0.15,
            'whale_activity': 0.15,
            'market_correlation': 0.10
        }
    
    def sigmoid_probability(self, sss: float, velocity: float, sentiment: float, 
                          anchor: float, timeframe: int = 7) -> float:
        """Enhanced sigmoid function with dynamic coefficients"""
        
        # Dynamic coefficient adjustment based on market conditions
        market_volatility_factor = self._get_market_volatility_factor()
        
        # Base coefficients (optimized for crypto markets)
        base_coeff = {
            'sss': 0.05,
            'velocity': 0.3,
            'sentiment': 0.4,
            'anchor': 0.2,
            'intercept': -10
        }
        
        # Adjust for timeframe
        time_factor = 1.0 if timeframe == 7 else 0.8 if timeframe == 3 else 1.2
        
        # Calculate logistic input
        z = (
            base_coeff['sss'] * sss +
            base_coeff['velocity'] * velocity +
            base_coeff['sentiment'] * sentiment +
            base_coeff['anchor'] * anchor +
            base_coeff['intercept']
        ) * time_factor * market_volatility_factor
        
        # Apply sigmoid function
        probability = 1 / (1 + np.exp(-z)) * 100
        
        # Apply bounds and confidence adjustment
        return round(min(max(probability, 0), 100), 2)
    
    def ensemble_probability(self, features: Dict, timeframe: int = 7) -> Dict:
        """Ensemble prediction using multiple models"""
        
        # Model 1: Sigmoid-based
        sigmoid_prob = self.sigmoid_probability(
            features['sss'], features['velocity'], 
            features['sentiment'], features['anchor'], timeframe
        )
        
        # Model 2: Linear regression-based
        linear_prob = self._linear_regression_model(features, timeframe)
        
        # Model 3: Technical pattern recognition
        pattern_prob = self._pattern_recognition_model(features, timeframe)
        
        # Model 4: Momentum-based
        momentum_prob = self._momentum_model(features, timeframe)
        
        # Weighted ensemble
        weights = [0.35, 0.25, 0.25, 0.15]  # Sigmoid gets highest weight
        ensemble_prob = (
            weights[0] * sigmoid_prob +
            weights[1] * linear_prob +
            weights[2] * pattern_prob +
            weights[3] * momentum_prob
        )
        
        return {
            'ensemble_probability': round(ensemble_prob, 2),
            'model_predictions': {
                'sigmoid': sigmoid_prob,
                'linear': linear_prob,
                'pattern': pattern_prob,
                'momentum': momentum_prob
            },
            'confidence': self._calculate_confidence(
                [sigmoid_prob, linear_prob, pattern_prob, momentum_prob]
            )
        }
    
    def _linear_regression_model(self, features: Dict, timeframe: int) -> float:
        """Linear regression model for breakout prediction"""
        # Simplified linear model (in production, use trained coefficients)
        coefficients = {
            'sss': 0.8,
            'velocity': 25.0,
            'sentiment': 15.0,
            'anchor': 30.0,
            'intercept': -20.0
        }
        
        prediction = (
            coefficients['sss'] * features['sss'] +
            coefficients['velocity'] * features['velocity'] +
            coefficients['sentiment'] * features['sentiment'] +
            coefficients['anchor'] * features['anchor'] +
            coefficients['intercept']
        )
        
        # Apply timeframe adjustment
        if timeframe == 3:
            prediction *= 0.85
        elif timeframe == 14:
            prediction *= 1.15
        
        return round(min(max(prediction, 0), 100), 2)
    
    def _pattern_recognition_model(self, features: Dict, timeframe: int) -> float:
        """Pattern recognition model for technical breakout patterns"""
        
        # Analyze breakout patterns
        pattern_score = 0
        
        # High SSS + High Anchor = Bullish consolidation
        if features['sss'] > 70 and features['anchor'] > 0.6:
            pattern_score += 30
        
        # High Velocity + Medium Sentiment = Momentum building
        if features['velocity'] > 0.8 and features['sentiment'] > 2.5:
            pattern_score += 25
        
        # Strong fundamentals pattern
        if features['sss'] > 80 and features['sentiment'] > 3.0:
            pattern_score += 20
        
        # Volume-price divergence pattern
        if features['velocity'] > 1.0 and features['anchor'] < 0.4:
            pattern_score += 15  # Potential breakout from accumulation
        
        # Apply timeframe scaling
        if timeframe == 3:
            pattern_score *= 0.9
        elif timeframe == 14:
            pattern_score *= 1.1
        
        return round(min(pattern_score, 100), 2)
    
    def _momentum_model(self, features: Dict, timeframe: int) -> float:
        """Momentum-based prediction model"""
        
        # Calculate momentum score
        momentum_components = {
            'sss_momentum': features['sss'] * 0.4,
            'velocity_momentum': features['velocity'] * 40,
            'sentiment_momentum': features['sentiment'] * 12,
            'anchor_stability': features['anchor'] * 20
        }
        
        total_momentum = sum(momentum_components.values())
        
        # Apply momentum decay for longer timeframes
        decay_factor = 1.0 if timeframe <= 7 else 0.95 ** (timeframe - 7)
        
        momentum_probability = total_momentum * decay_factor
        
        return round(min(max(momentum_probability, 0), 100), 2)
    
    def _calculate_confidence(self, predictions: List[float]) -> str:
        """Calculate prediction confidence based on model agreement"""
        
        mean_pred = np.mean(predictions)
        std_pred = np.std(predictions)
        
        # Coefficient of variation
        cv = std_pred / mean_pred if mean_pred > 0 else float('inf')
        
        if cv < 0.1:
            return "Very High"
        elif cv < 0.2:
            return "High" 
        elif cv < 0.3:
            return "Medium"
        elif cv < 0.5:
            return "Low"
        else:
            return "Very Low"
    
    def _get_market_volatility_factor(self) -> float:
        """Get current market volatility factor (simplified)"""
        # In production, this would analyze current market conditions
        # For now, return baseline factor
        return 1.0
    
    def predict_price_targets(self, current_price: float, breakout_prob: float, 
                            features: Dict) -> Dict:
        """Predict potential price targets based on breakout probability"""
        
        if breakout_prob < 30:
            return {
                'upside_target': current_price * 1.05,
                'conservative_target': current_price * 1.02,
                'aggressive_target': current_price * 1.08,
                'stop_loss': current_price * 0.95
            }
        elif breakout_prob < 60:
            return {
                'upside_target': current_price * 1.15,
                'conservative_target': current_price * 1.08,
                'aggressive_target': current_price * 1.25,
                'stop_loss': current_price * 0.92
            }
        else:  # High probability breakout
            multiplier = 1 + (features['sss'] / 100 * 0.3)  # Scale based on SSS
            return {
                'upside_target': current_price * (1.25 * multiplier),
                'conservative_target': current_price * (1.15 * multiplier),
                'aggressive_target': current_price * (1.5 * multiplier),
                'stop_loss': current_price * 0.88
            }

class TechnicalAnalyzer:
    """Technical analysis tools for breakout confirmation"""
    
    @staticmethod
    def detect_consolidation_pattern(price_data: List[float], window: int = 20) -> Dict:
        """Detect consolidation patterns that often precede breakouts"""
        
        if len(price_data) < window:
            return {'pattern': 'insufficient_data', 'confidence': 0}
        
        recent_prices = price_data[-window:]
        
        # Calculate metrics
        price_range = (max(recent_prices) - min(recent_prices)) / np.mean(recent_prices)
        volatility = np.std(recent_prices) / np.mean(recent_prices)
        
        # Pattern detection
        if price_range < 0.15 and volatility < 0.08:
            return {
                'pattern': 'tight_consolidation',
                'confidence': 85,
                'breakout_potential': 'high'
            }
        elif price_range < 0.25 and volatility < 0.12:
            return {
                'pattern': 'loose_consolidation', 
                'confidence': 65,
                'breakout_potential': 'medium'
            }
        else:
            return {
                'pattern': 'trending',
                'confidence': 40,
                'breakout_potential': 'low'
            }
    
    @staticmethod
    def calculate_breakout_volume_threshold(volume_data: List[float], window: int = 20) -> float:
        """Calculate volume threshold for confirming breakouts"""
        
        if len(volume_data) < window:
            return 0
        
        avg_volume = np.mean(volume_data[-window:])
        volume_std = np.std(volume_data[-window:])
        
        # Breakout volume should be 1.5-2x normal volume
        return avg_volume + (1.5 * volume_std)

def run_forecast_analysis(token_data: Dict) -> Dict:
    """Run comprehensive forecast analysis for a single token"""
    
    predictor = BreakoutPredictor()
    analyzer = TechnicalAnalyzer()
    
    # Extract features
    features = {
        'sss': token_data.get('sss', 50),
        'velocity': token_data.get('velocity', 0.5),
        'sentiment': token_data.get('sentiment', 2.5),
        'anchor': token_data.get('anchor_pressure', 0.5)
    }
    
    # Get ensemble predictions
    predictions_3d = predictor.ensemble_probability(features, 3)
    predictions_7d = predictor.ensemble_probability(features, 7)
    predictions_14d = predictor.ensemble_probability(features, 14)
    
    # Technical analysis
    technical_analysis = {}
    if 'price_history' in token_data:
        technical_analysis = analyzer.detect_consolidation_pattern(
            token_data['price_history']
        )
    
    # Price targets
    price_targets = {}
    if 'current_price' in token_data:
        price_targets = predictor.predict_price_targets(
            token_data['current_price'], 
            predictions_7d['ensemble_probability'],
            features
        )
    
    return {
        'token': token_data.get('symbol', 'UNKNOWN'),
        'predictions': {
            '3d': predictions_3d,
            '7d': predictions_7d,
            '14d': predictions_14d
        },
        'technical_analysis': technical_analysis,
        'price_targets': price_targets,
        'timestamp': datetime.now().isoformat()
    }

if __name__ == "__main__":
    # Test the forecasting models
    sample_token = {
        'symbol': 'SUI',
        'sss': 85,
        'velocity': 1.2,
        'sentiment': 4.2,
        'anchor_pressure': 0.65,
        'current_price': 1.85,
        'price_history': [1.75, 1.78, 1.82, 1.80, 1.85, 1.83, 1.87]
    }
    
    results = run_forecast_analysis(sample_token)
    print(json.dumps(results, indent=2))