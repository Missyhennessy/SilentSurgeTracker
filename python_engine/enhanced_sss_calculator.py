#!/usr/bin/env python3

"""
Enhanced Silent Surge Score Calculator
Integrates professional sentiment analysis and risk modeling for accurate predictions
"""

import sys
import os
import json
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sentiment_analyzer import CryptoSentimentAnalyzer
from risk_analyzer import ProfessionalRiskAnalyzer
from regime_analyzer import RegimeAnalyzer

class EnhancedSSS:
    def __init__(self):
        self.sentiment_analyzer = CryptoSentimentAnalyzer()
        self.risk_analyzer = ProfessionalRiskAnalyzer()
        self.regime_analyzer = RegimeAnalyzer()
        
        # Enhanced weighting system with regime analysis
        self.component_weights = {
            'behavioral_activity': 0.12,     # Reduced for regime integration
            'velocity_anomaly': 0.12,       # Reduced for regime integration
            'community_cohesion': 0.08,     # Reduced for regime integration
            'anchor_pressure': 0.08,        # Reduced for regime integration
            'hype_to_hold_ratio': 0.08,     # Reduced for regime integration
            'historical_volatility': 0.08,  # Reduced for regime integration
            'sentiment_score': 0.12,        # Real-time sentiment
            'risk_assessment': 0.12,        # Professional risk analysis
            'regime_score': 0.20            # NEW - Regime-aware hybrid scoring
        }
        
        # Validation weights sum to 1.0
        assert abs(sum(self.component_weights.values()) - 1.0) < 0.001
        
    def calculate_legacy_components(self, crypto_data: dict) -> dict:
        """Calculate traditional SSS components for compatibility"""
        return {
            'behavioral_activity': min(100.0, crypto_data.get('volume', 0) / 1000000),  # Volume-based
            'velocity_anomaly': crypto_data.get('velocityAnomaly', 50.0),
            'community_cohesion': crypto_data.get('communityScore', 50.0),
            'anchor_pressure': min(100.0, abs(crypto_data.get('change24h', 0)) * 10),
            'hype_to_hold_ratio': crypto_data.get('socialVolume', 50.0),
            'historical_volatility': min(100.0, abs(crypto_data.get('change7d', 0)) * 5)
        }
    
    def calculate_sentiment_component(self, symbol: str) -> dict:
        """Calculate sentiment component using professional analysis"""
        try:
            sentiment_data = self.sentiment_analyzer.get_comprehensive_sentiment(symbol)
            
            # Convert sentiment to 0-100 scale
            sentiment_score = sentiment_data.get('sentiment_score', 50.0)
            confidence = sentiment_data.get('confidence', 0.5)
            
            # Adjust score based on confidence
            adjusted_score = sentiment_score * confidence + 50.0 * (1 - confidence)
            
            return {
                'sentiment_score': float(adjusted_score),
                'sentiment_confidence': float(confidence),
                'market_mood': sentiment_data.get('market_mood', 'neutral'),
                'sentiment_breakdown': sentiment_data.get('sentiment_breakdown', {})
            }
            
        except Exception as e:
            print(f"Error calculating sentiment for {symbol}: {e}")
            return {
                'sentiment_score': 50.0,
                'sentiment_confidence': 0.0,
                'market_mood': 'neutral',
                'error': str(e)
            }
    
    def calculate_risk_component(self, symbol: str, prices: List[float]) -> dict:
        """Calculate risk component using professional risk analysis"""
        try:
            if len(prices) < 10:
                return {
                    'risk_score': 50.0,
                    'risk_level': 'medium',
                    'risk_confidence': 0.0,
                    'error': 'Insufficient price data'
                }
            
            # Convert prices to numpy array
            price_array = np.array(prices)
            
            # Calculate comprehensive risk metrics
            risk_metrics = self.risk_analyzer.calculate_risk_metrics(price_array)
            risk_classification = self.risk_analyzer.risk_classification(risk_metrics)
            
            # Convert risk to 0-100 scale (inverted: lower risk = higher score)
            risk_score = risk_classification.get('risk_score', 50)
            inverted_risk_score = 100 - risk_score  # Invert so low risk = high score
            
            return {
                'risk_score': float(inverted_risk_score),
                'risk_level': risk_classification.get('risk_level', 'medium'),
                'risk_confidence': float(risk_classification.get('confidence', 0.0)),
                'risk_metrics': {
                    'sharpe_ratio': risk_metrics.get('sharpe_ratio', 0),
                    'max_drawdown': risk_metrics.get('max_drawdown', 0),
                    'volatility': risk_metrics.get('annual_volatility', 0),
                    'var_95': risk_metrics.get('var_95', {}).get('var_historical', 0)
                },
                'recommendation': risk_classification.get('recommendation', 'Unknown')
            }
            
        except Exception as e:
            print(f"Error calculating risk for {symbol}: {e}")
            return {
                'risk_score': 50.0,
                'risk_level': 'medium',
                'risk_confidence': 0.0,
                'error': str(e)
            }
    
    def calculate_enhanced_sss(self, crypto_data: dict, price_history: Optional[List[float]] = None) -> dict:
        """Calculate enhanced SSS with professional analysis"""
        symbol = crypto_data.get('symbol', 'UNKNOWN')
        
        # Calculate legacy components
        legacy_components = self.calculate_legacy_components(crypto_data)
        
        # Calculate new professional components
        sentiment_component = self.calculate_sentiment_component(symbol)
        
        # Use price history if available, otherwise simulate from current data
        if price_history is None or len(price_history) < 10:
            current_price = crypto_data.get('price', 1.0)
            change_24h = crypto_data.get('change24h', 0) / 100
            
            # Simulate basic price history
            price_history = []
            for i in range(30):
                # Simple random walk with drift
                price = current_price * (1 + change_24h / 30 + np.random.normal(0, 0.02))
                price_history.append(max(0.001, price))  # Ensure positive prices
        
        risk_component = self.calculate_risk_component(symbol, price_history)
        
        # Calculate regime component
        regime_data = {
            'atr': abs(crypto_data.get('change24h', 0)) / 100,
            'volume': crypto_data.get('volume', 1000000),
            'macro_surprise': crypto_data.get('macro_surprise', 0),
            'anchor_pressure': legacy_components['anchor_pressure'] / 100,
            'price': crypto_data.get('price', 1.0)
        }
        
        regime_result = self.regime_analyzer.hybrid_score_asset(symbol, regime_data)
        regime_score = regime_result['Hybrid_Score']
        
        # Combine all components using weights
        total_score = (
            legacy_components['behavioral_activity'] * self.component_weights['behavioral_activity'] +
            legacy_components['velocity_anomaly'] * self.component_weights['velocity_anomaly'] +
            legacy_components['community_cohesion'] * self.component_weights['community_cohesion'] +
            legacy_components['anchor_pressure'] * self.component_weights['anchor_pressure'] +
            legacy_components['hype_to_hold_ratio'] * self.component_weights['hype_to_hold_ratio'] +
            legacy_components['historical_volatility'] * self.component_weights['historical_volatility'] +
            sentiment_component['sentiment_score'] * self.component_weights['sentiment_score'] +
            risk_component['risk_score'] * self.component_weights['risk_assessment'] +
            regime_score * self.component_weights['regime_score']
        )
        
        # Calculate overall confidence
        overall_confidence = (
            sentiment_component['sentiment_confidence'] * self.component_weights['sentiment_score'] +
            risk_component['risk_confidence'] * self.component_weights['risk_assessment'] +
            0.7 * sum(self.component_weights[k] for k in legacy_components.keys())  # Legacy components have moderate confidence
        )
        
        # Generate enhanced prediction
        prediction = self.generate_prediction(total_score, overall_confidence, sentiment_component, risk_component)
        
        return {
            'symbol': symbol,
            'enhanced_sss_score': float(total_score),
            'confidence': float(overall_confidence),
            'prediction': prediction,
            'components': {
                'legacy': legacy_components,
                'sentiment': sentiment_component,
                'risk': risk_component,
                'regime': regime_result
            },
            'component_weights': self.component_weights,
            'calculation_time': datetime.now().isoformat(),
            'version': '2.0_enhanced'
        }
    
    def generate_prediction(self, sss_score: float, confidence: float, sentiment: dict, risk: dict) -> dict:
        """Generate investment prediction with enhanced analysis"""
        
        # Base recommendation from SSS score
        if sss_score >= 80:
            base_rec = 'STRONG_BUY'
            profit_prob = 0.85
        elif sss_score >= 65:
            base_rec = 'BUY'
            profit_prob = 0.70
        elif sss_score >= 45:
            base_rec = 'HOLD'
            profit_prob = 0.55
        elif sss_score >= 30:
            base_rec = 'SELL'
            profit_prob = 0.35
        else:
            base_rec = 'STRONG_SELL'
            profit_prob = 0.20
        
        # Adjust based on sentiment
        sentiment_score = sentiment.get('sentiment_score', 50)
        if sentiment_score > 70:
            profit_prob += 0.05
        elif sentiment_score < 30:
            profit_prob -= 0.05
        
        # Adjust based on risk
        risk_level = risk.get('risk_level', 'medium')
        if risk_level in ['very_low', 'low']:
            profit_prob += 0.05
        elif risk_level in ['high', 'extremely_high']:
            profit_prob -= 0.10
            if base_rec in ['STRONG_BUY', 'BUY']:
                base_rec = 'HOLD'  # Downgrade due to high risk
        
        # Ensure profit probability is within bounds
        profit_prob = max(0.10, min(0.95, profit_prob))
        
        # Adjust confidence based on data quality
        if confidence < 0.5:
            base_rec += '_LOW_CONFIDENCE'
        
        return {
            'recommendation': base_rec,
            'profit_probability': float(profit_prob),
            'confidence_level': float(confidence),
            'risk_level': risk.get('risk_level', 'medium'),
            'market_sentiment': sentiment.get('market_mood', 'neutral'),
            'key_factors': self._identify_key_factors(sentiment, risk),
            'warnings': self._generate_warnings(risk, sentiment, confidence)
        }
    
    def _identify_key_factors(self, sentiment: dict, risk: dict) -> List[str]:
        """Identify key factors driving the prediction"""
        factors = []
        
        sentiment_score = sentiment.get('sentiment_score', 50)
        risk_level = risk.get('risk_level', 'medium')
        
        if sentiment_score > 70:
            factors.append('Strong positive market sentiment')
        elif sentiment_score < 30:
            factors.append('Negative market sentiment')
        
        if risk_level in ['very_low', 'low']:
            factors.append('Low risk profile')
        elif risk_level in ['high', 'extremely_high']:
            factors.append('High risk warning')
        
        # Risk metrics
        risk_metrics = risk.get('risk_metrics', {})
        sharpe = risk_metrics.get('sharpe_ratio', 0)
        if sharpe > 1.0:
            factors.append('Strong risk-adjusted returns')
        elif sharpe < 0:
            factors.append('Poor risk-adjusted performance')
        
        if not factors:
            factors.append('Mixed signals - moderate confidence')
        
        return factors
    
    def _generate_warnings(self, risk: dict, sentiment: dict, confidence: float) -> List[str]:
        """Generate investment warnings"""
        warnings = []
        
        if confidence < 0.5:
            warnings.append('LOW CONFIDENCE: Limited data available for analysis')
        
        risk_level = risk.get('risk_level', 'medium')
        if risk_level in ['high', 'extremely_high']:
            warnings.append(f'HIGH RISK: {risk.get("recommendation", "Exercise caution")}')
        
        sentiment_confidence = sentiment.get('sentiment_confidence', 0)
        if sentiment_confidence < 0.3:
            warnings.append('LIMITED SENTIMENT DATA: Sentiment analysis based on minimal data')
        
        risk_metrics = risk.get('risk_metrics', {})
        max_drawdown = abs(risk_metrics.get('max_drawdown', 0))
        if max_drawdown > 0.3:
            warnings.append(f'DRAWDOWN RISK: Historical maximum loss of {max_drawdown:.1%}')
        
        return warnings

def main():
    """Test enhanced SSS calculation"""
    calculator = EnhancedSSS()
    
    # Test with sample crypto data
    test_crypto = {
        'symbol': 'SUI',
        'price': 4.95,
        'volume': 2590000000,
        'change24h': -0.98,
        'change7d': 0.0,
        'velocityAnomaly': 100.0,
        'communityScore': 75.0,
        'socialVolume': 80.0
    }
    
    print("=== ENHANCED SSS CALCULATION TEST ===")
    result = calculator.calculate_enhanced_sss(test_crypto)
    
    print(f"\nSymbol: {result['symbol']}")
    print(f"Enhanced SSS Score: {result['enhanced_sss_score']:.1f}/100")
    print(f"Overall Confidence: {result['confidence']:.1%}")
    
    prediction = result['prediction']
    print(f"\nPrediction: {prediction['recommendation']}")
    print(f"Profit Probability: {prediction['profit_probability']:.1%}")
    print(f"Risk Level: {prediction['risk_level'].replace('_', ' ').title()}")
    print(f"Market Sentiment: {prediction['market_sentiment'].replace('_', ' ').title()}")
    
    print(f"\nKey Factors:")
    for factor in prediction['key_factors']:
        print(f"• {factor}")
    
    if prediction['warnings']:
        print(f"\nWarnings:")
        for warning in prediction['warnings']:
            print(f"⚠️ {warning}")
    
    # Component breakdown
    print(f"\n=== COMPONENT BREAKDOWN ===")
    components = result['components']
    
    print(f"Sentiment Score: {components['sentiment']['sentiment_score']:.1f}/100")
    print(f"Risk Score: {components['risk']['risk_score']:.1f}/100")
    print(f"Velocity Anomaly: {components['legacy']['velocity_anomaly']:.1f}/100")
    print(f"Behavioral Activity: {components['legacy']['behavioral_activity']:.1f}/100")

if __name__ == "__main__":
    main()