#!/usr/bin/env python3
"""
Hybrid SSS calculation script for API integration
Enhanced algorithm with ML ensemble and regime detection
"""

import sys
import json
from hybrid_surge_engine import HybridSilentSurgeEngine

def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: calculate_hybrid_sss.py <input_file>"}))
        sys.exit(1)
    
    try:
        # Read input data
        with open(sys.argv[1], 'r') as f:
            data = json.load(f)
        
        token_data = data.get('token_data', {})
        market_data = data.get('market_data', {})
        
        # Initialize hybrid engine
        engine = HybridSilentSurgeEngine()
        
        # Prepare metrics for hybrid calculation
        metrics = {
            'behavioral_activity': token_data.get('behavioral_activity', 0.5),
            'velocity_anomaly': token_data.get('velocity_anomaly', 0.5),
            'community_cohesion': token_data.get('community_cohesion', 0.5),
            'anchor_pressure': token_data.get('anchor_pressure', 0.5),
            'hype_to_hold': token_data.get('hype_to_hold', 0.5),
            'historical_volatility': token_data.get('historical_volatility', 0.5),
            'volume_spike': token_data.get('volume_spike', 0.5),
            'social_sentiment': token_data.get('social_sentiment', 3.0),
            'whale_activity': token_data.get('whale_activity', 0.3),
            'market_correlation': token_data.get('market_correlation', 0.6),
            'technical_momentum': token_data.get('technical_momentum', 0.5),
            'news_sentiment': token_data.get('news_sentiment', 0.0),
            'volume_24h': token_data.get('volume_24h', 1000000),
            'price_change_7d': token_data.get('price_change_7d', 0.0),
            'rsi': token_data.get('rsi', 50.0),
            'macd_signal': token_data.get('macd_signal', 0.0)
        }
        
        # Calculate hybrid SSS
        prediction = engine.calculate_hybrid_sss(metrics, market_data)
        
        # Format output for API
        result = {
            "success": True,
            "sss_score": prediction.sss_score,
            "regime_adjusted_score": prediction.regime_adjusted_score,
            "ml_ensemble_score": prediction.ml_ensemble_score,
            "breakout_probability": prediction.breakout_probability,
            "confidence_level": prediction.confidence_level,
            "regime_context": {
                "volatility_regime": prediction.regime_context.volatility_regime,
                "momentum_regime": prediction.regime_context.momentum_regime,
                "liquidity_regime": prediction.regime_context.liquidity_regime,
                "sentiment_regime": prediction.regime_context.sentiment_regime,
                "confidence_score": prediction.regime_context.confidence_score,
                "regime_strength": prediction.regime_context.regime_strength
            },
            "trading_signals": prediction.trading_signals,
            "model_breakdown": prediction.model_breakdown,
            "algorithm_version": "Hybrid SSS v3.0"
        }
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({
            "success": False, 
            "error": str(e),
            "algorithm_version": "Hybrid SSS v3.0"
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()