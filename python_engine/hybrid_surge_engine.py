#!/usr/bin/env python3
"""
Hybrid Silent Surge Scoring Engine (v3.0)
Enhanced with advanced regime detection, confidence weighting, and ML ensemble
Combines the best of existing sophisticated ML with dynamic regime-based adjustments
"""

import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import logging
from dataclasses import dataclass
import math

# Import existing engines
from enhanced_surge_engine import EnhancedSilentSurgeEngine, MarketContext
from ml_models import MLModelEngine, ModelPrediction

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class RegimeContext:
    """Advanced market regime detection context"""
    volatility_regime: str  # low, medium, high
    momentum_regime: str    # bullish, bearish, sideways
    liquidity_regime: str   # abundant, scarce, normal
    sentiment_regime: str   # euphoric, fearful, neutral
    macro_regime: str       # expansion, contraction, stable
    confidence_score: float # 0-1 scale
    regime_strength: float  # 0-1 scale how strong the regime signal is
    
@dataclass 
class HybridPrediction:
    """Enhanced prediction result with regime context"""
    sss_score: float
    breakout_probability: float
    regime_adjusted_score: float
    ml_ensemble_score: float
    confidence_level: str
    regime_context: RegimeContext
    model_breakdown: Dict
    trading_signals: Dict

class HybridSilentSurgeEngine:
    """Next-generation SSS engine with hybrid ML and regime-based scoring"""
    
    def __init__(self):
        # Initialize base engines
        self.enhanced_engine = EnhancedSilentSurgeEngine()
        self.ml_engine = MLModelEngine()
        
        # Enhanced regime detection parameters
        self.regime_thresholds = {
            'volatility': {'low': 0.15, 'high': 0.35},
            'momentum': {'strong': 0.7, 'weak': 0.3},
            'liquidity': {'abundant': 0.8, 'scarce': 0.2},
            'sentiment': {'euphoric': 4.2, 'fearful': 2.0},
            'macro': {'expansion': 1.5, 'contraction': -1.0}
        }
        
        # Dynamic weight adjustments based on regime
        self.regime_weight_adjustments = {
            'high_volatility': {
                'velocity_anomaly': 1.4,
                'historical_volatility': 0.7,
                'anchor_pressure': 1.2,
                'ml_ensemble_weight': 0.8
            },
            'bullish_momentum': {
                'behavioral_activity': 1.3,
                'hype_to_hold': 1.2,
                'community_cohesion': 1.1,
                'ml_ensemble_weight': 1.1
            },
            'bearish_momentum': {
                'velocity_anomaly': 1.5,
                'anchor_pressure': 0.8,
                'behavioral_activity': 0.7,
                'ml_ensemble_weight': 0.9
            },
            'liquidity_scarce': {
                'whale_activity': 1.4,
                'volume_spike': 1.3,
                'anchor_pressure': 1.2,
                'ml_ensemble_weight': 1.0
            },
            'sentiment_euphoric': {
                'hype_to_hold': 0.7,  # Reduce hype weight in euphoric markets
                'community_cohesion': 0.8,
                'behavioral_activity': 1.2,
                'ml_ensemble_weight': 0.9
            },
            'sentiment_fearful': {
                'anchor_pressure': 1.4,
                'velocity_anomaly': 1.3,
                'hype_to_hold': 1.2,
                'ml_ensemble_weight': 1.1
            }
        }
        
        # Confidence scoring factors
        self.confidence_factors = {
            'signal_consistency': 0.25,
            'regime_clarity': 0.20,
            'ml_model_agreement': 0.20,
            'data_quality': 0.15,
            'market_stability': 0.10,
            'historical_accuracy': 0.10
        }
        
        # Train ML models on startup
        logger.info("Initializing Hybrid SSS Engine...")
        try:
            self.ml_engine.train_models('breakout_probability')
            logger.info("ML models trained successfully")
        except Exception as e:
            logger.warning(f"ML training failed: {e}, using fallback models")
    
    def compute_regime_context(self, data: Dict, market_data: Dict = None) -> RegimeContext:
        """Advanced regime detection using multiple market signals"""
        
        # Extract key metrics
        atr = data.get("historical_volatility", 0.5)
        volume = data.get("volume_24h", 1000000)
        volume_spike = data.get("volume_spike", 0.5)
        sentiment = data.get("social_sentiment", 3.0)
        whale_activity = data.get("whale_activity", 0.3)
        price_momentum = data.get("price_change_7d", 0.0)
        anchor_pressure = data.get("anchor_pressure", 0.5)
        
        # Market context from external data
        btc_correlation = market_data.get("btc_correlation", 0.6) if market_data else 0.6
        macro_surprise = market_data.get("macro_surprise", 0.0) if market_data else 0.0
        
        # 1. Volatility Regime Detection
        vol_score = atr + (volume_spike * 0.3) + (abs(price_momentum) * 0.2)
        if vol_score > self.regime_thresholds['volatility']['high']:
            volatility_regime = "high"
        elif vol_score < self.regime_thresholds['volatility']['low']:
            volatility_regime = "low"
        else:
            volatility_regime = "medium"
        
        # 2. Momentum Regime Detection
        momentum_score = (price_momentum * 0.4) + (anchor_pressure * 0.3) + (whale_activity * 0.3)
        if momentum_score > self.regime_thresholds['momentum']['strong']:
            momentum_regime = "bullish"
        elif momentum_score < -self.regime_thresholds['momentum']['strong']:
            momentum_regime = "bearish"
        else:
            momentum_regime = "sideways"
        
        # 3. Liquidity Regime Detection
        liquidity_score = (volume / 1000000) * (1 + volume_spike) * (1 - abs(price_momentum))
        if liquidity_score > self.regime_thresholds['liquidity']['abundant']:
            liquidity_regime = "abundant"
        elif liquidity_score < self.regime_thresholds['liquidity']['scarce']:
            liquidity_regime = "scarce"
        else:
            liquidity_regime = "normal"
        
        # 4. Sentiment Regime Detection
        if sentiment > self.regime_thresholds['sentiment']['euphoric']:
            sentiment_regime = "euphoric"
        elif sentiment < self.regime_thresholds['sentiment']['fearful']:
            sentiment_regime = "fearful"
        else:
            sentiment_regime = "neutral"
        
        # 5. Macro Regime Detection
        if macro_surprise > self.regime_thresholds['macro']['expansion']:
            macro_regime = "expansion"
        elif macro_surprise < self.regime_thresholds['macro']['contraction']:
            macro_regime = "contraction"
        else:
            macro_regime = "stable"
        
        # Calculate regime confidence and strength
        confidence_score = self._calculate_regime_confidence([
            vol_score, momentum_score, liquidity_score, sentiment, macro_surprise
        ])
        
        regime_strength = self._calculate_regime_strength([
            volatility_regime, momentum_regime, liquidity_regime, 
            sentiment_regime, macro_regime
        ])
        
        return RegimeContext(
            volatility_regime=volatility_regime,
            momentum_regime=momentum_regime,
            liquidity_regime=liquidity_regime,
            sentiment_regime=sentiment_regime,
            macro_regime=macro_regime,
            confidence_score=confidence_score,
            regime_strength=regime_strength
        )
    
    def calculate_hybrid_sss(self, metrics: Dict, market_data: Dict = None) -> HybridPrediction:
        """Calculate hybrid SSS score with ML ensemble and regime adjustments"""
        
        # 1. Detect market regime
        regime_context = self.compute_regime_context(metrics, market_data)
        
        # 2. Get base SSS from enhanced engine
        market_context = MarketContext(
            volatility_regime=regime_context.volatility_regime,
            trend_direction=regime_context.momentum_regime,
            risk_sentiment=regime_context.confidence_score,
            correlation_strength=market_data.get("btc_correlation", 0.6) if market_data else 0.6,
            volume_profile="increasing" if metrics.get("volume_spike", 0.5) > 0.7 else "stable"
        )
        
        enhanced_result = self.enhanced_engine.calculate_enhanced_sss(metrics, market_context)
        base_sss = enhanced_result['sss']
        
        # 3. Get ML ensemble prediction
        ml_prediction = self._get_ml_ensemble_prediction(metrics)
        
        # 4. Apply regime-specific adjustments
        regime_adjusted_sss = self._apply_regime_adjustments(
            base_sss, ml_prediction.prediction, regime_context, metrics
        )
        
        # 5. Calculate hybrid breakout probability
        breakout_prob = self._calculate_hybrid_breakout_probability(
            regime_adjusted_sss, metrics, regime_context
        )
        
        # 6. Generate trading signals
        trading_signals = self._generate_trading_signals(
            regime_adjusted_sss, breakout_prob, regime_context, metrics
        )
        
        # 7. Calculate overall confidence
        confidence_level = self._calculate_prediction_confidence(
            base_sss, ml_prediction, regime_context, metrics
        )
        
        return HybridPrediction(
            sss_score=base_sss,
            breakout_probability=breakout_prob,
            regime_adjusted_score=regime_adjusted_sss,
            ml_ensemble_score=ml_prediction.prediction,
            confidence_level=confidence_level,
            regime_context=regime_context,
            model_breakdown={
                'base_sss': base_sss,
                'ml_prediction': ml_prediction.prediction,
                'regime_adjustment': regime_adjusted_sss - base_sss,
                'confidence_score': regime_context.confidence_score,
                'regime_strength': regime_context.regime_strength
            },
            trading_signals=trading_signals
        )
    
    def _get_ml_ensemble_prediction(self, metrics: Dict) -> ModelPrediction:
        """Get prediction from ML ensemble models"""
        try:
            # Prepare features for ML models
            ml_features = {
                'behavioral_activity': metrics.get('behavioral_activity', 0.5),
                'velocity_anomaly': metrics.get('velocity_anomaly', 0.5),
                'community_cohesion': metrics.get('community_cohesion', 0.5),
                'anchor_pressure': metrics.get('anchor_pressure', 0.5),
                'hype_to_hold': metrics.get('hype_to_hold', 0.5),
                'historical_volatility': metrics.get('historical_volatility', 0.5),
                'volume_spike': metrics.get('volume_spike', 0.5),
                'social_sentiment': metrics.get('social_sentiment', 3.0),
                'whale_activity': metrics.get('whale_activity', 0.3),
                'market_correlation': metrics.get('market_correlation', 0.6),
                'technical_momentum': metrics.get('technical_momentum', 0.5),
                'news_sentiment': metrics.get('news_sentiment', 0.0),
                'rsi': metrics.get('rsi', 50.0),
                'macd_signal': metrics.get('macd_signal', 0.0)
            }
            
            return self.ml_engine.predict_ensemble(ml_features)
            
        except Exception as e:
            logger.warning(f"ML prediction failed: {e}, using fallback")
            # Fallback prediction based on simple weighted average
            fallback_score = (
                metrics.get('behavioral_activity', 0.5) * 30 +
                metrics.get('velocity_anomaly', 0.5) * 25 +
                metrics.get('anchor_pressure', 0.5) * 20 +
                metrics.get('community_cohesion', 0.5) * 15 +
                metrics.get('hype_to_hold', 0.5) * 10
            )
            
            return ModelPrediction(
                prediction=fallback_score,
                confidence=0.6,
                model_name="fallback",
                features_used=list(ml_features.keys()),
                timestamp=datetime.now()
            )
    
    def _apply_regime_adjustments(self, base_sss: float, ml_score: float, 
                                regime_context: RegimeContext, metrics: Dict) -> float:
        """Apply regime-specific adjustments to the base SSS score"""
        
        # Start with weighted combination of base SSS and ML prediction
        ml_weight = self._get_ml_weight(regime_context)
        combined_score = (base_sss * (1 - ml_weight)) + (ml_score * ml_weight)
        
        # Apply regime-specific multipliers
        regime_multiplier = 1.0
        
        # Volatility regime adjustments
        if regime_context.volatility_regime == "high":
            # In high volatility, reduce extreme scores
            if combined_score > 80:
                regime_multiplier *= 0.9
            elif combined_score < 30:
                regime_multiplier *= 1.1
        elif regime_context.volatility_regime == "low":
            # In low volatility, amplify signals
            if 40 < combined_score < 70:
                regime_multiplier *= 1.05
        
        # Momentum regime adjustments
        if regime_context.momentum_regime == "bullish":
            if combined_score > 60:
                regime_multiplier *= 1.1
        elif regime_context.momentum_regime == "bearish":
            if combined_score < 50:
                regime_multiplier *= 0.9
            else:
                regime_multiplier *= 1.05  # Breakout signals more important in bear markets
        
        # Sentiment regime adjustments
        if regime_context.sentiment_regime == "euphoric":
            # Be more conservative in euphoric markets
            regime_multiplier *= 0.95
        elif regime_context.sentiment_regime == "fearful":
            # Amplify good signals in fearful markets
            if combined_score > 65:
                regime_multiplier *= 1.15
        
        # Apply confidence scaling
        confidence_scaling = 0.8 + (regime_context.confidence_score * 0.4)
        
        final_score = combined_score * regime_multiplier * confidence_scaling
        
        return round(min(max(final_score, 0), 100), 2)
    
    def _calculate_hybrid_breakout_probability(self, sss_score: float, 
                                             metrics: Dict, regime_context: RegimeContext) -> float:
        """Calculate breakout probability using hybrid approach"""
        
        # Base probability from enhanced engine
        enhanced_prob = self.enhanced_engine.enhanced_breakout_probability(
            sss_score,
            metrics.get('velocity_anomaly', 0.5),
            metrics.get('social_sentiment', 3.0),
            metrics.get('anchor_pressure', 0.5),
            timeframe=7,
            market_context=MarketContext(
                volatility_regime=regime_context.volatility_regime,
                trend_direction=regime_context.momentum_regime,
                risk_sentiment=regime_context.confidence_score,
                correlation_strength=0.6,
                volume_profile="stable"
            )
        )
        
        base_prob = enhanced_prob['ensemble_probability']
        
        # Regime-specific probability adjustments
        regime_adjustment = 1.0
        
        # Adjust based on regime context
        if regime_context.momentum_regime == "bullish" and sss_score > 70:
            regime_adjustment *= 1.15
        elif regime_context.momentum_regime == "bearish" and sss_score > 80:
            regime_adjustment *= 1.25  # Strong signals in bear markets are more significant
        
        if regime_context.liquidity_regime == "scarce" and metrics.get('volume_spike', 0.5) > 0.8:
            regime_adjustment *= 1.2  # Volume spikes more significant in low liquidity
        
        if regime_context.sentiment_regime == "fearful" and sss_score > 75:
            regime_adjustment *= 1.3  # Counter-sentiment plays
        
        # Apply regime strength scaling
        strength_factor = 0.9 + (regime_context.regime_strength * 0.2)
        
        final_prob = base_prob * regime_adjustment * strength_factor
        
        return round(min(max(final_prob, 0), 100), 2)
    
    def _generate_trading_signals(self, sss_score: float, breakout_prob: float,
                                regime_context: RegimeContext, metrics: Dict) -> Dict:
        """Generate comprehensive trading signals based on hybrid analysis"""
        
        signals = {
            'primary_signal': 'HOLD',
            'confidence': 'Medium',
            'risk_level': 'Medium',
            'timeframe': '7d',
            'entry_points': [],
            'exit_strategy': {},
            'risk_management': {}
        }
        
        # Determine primary signal
        if breakout_prob >= 80 and sss_score >= 75:
            signals['primary_signal'] = 'STRONG_BUY'
            signals['confidence'] = 'High'
        elif breakout_prob >= 70 and sss_score >= 65:
            signals['primary_signal'] = 'BUY'
            signals['confidence'] = 'Medium-High'
        elif breakout_prob >= 60 and sss_score >= 55:
            signals['primary_signal'] = 'ACCUMULATE'
            signals['confidence'] = 'Medium'
        elif breakout_prob >= 45 and sss_score >= 50:
            signals['primary_signal'] = 'WATCH'
        else:
            signals['primary_signal'] = 'AVOID'
            signals['confidence'] = 'Low'
        
        # Adjust for regime context
        if regime_context.momentum_regime == "bearish" and signals['primary_signal'] in ['BUY', 'STRONG_BUY']:
            # More cautious in bear markets
            signals['risk_level'] = 'High'
            signals['timeframe'] = '3d'  # Shorter timeframes in bear markets
        
        if regime_context.volatility_regime == "high":
            signals['risk_level'] = 'High'
            signals['risk_management']['stop_loss'] = 0.15  # 15% stop loss
            signals['risk_management']['position_size'] = 0.5  # Reduce position size
        else:
            signals['risk_management']['stop_loss'] = 0.10  # 10% stop loss
            signals['risk_management']['position_size'] = 1.0  # Full position
        
        # Entry points based on regime
        if signals['primary_signal'] in ['BUY', 'STRONG_BUY']:
            if regime_context.liquidity_regime == "abundant":
                signals['entry_points'] = ['immediate', 'on_dip']
            else:
                signals['entry_points'] = ['gradual', 'on_volume']
        
        return signals
    
    def _get_ml_weight(self, regime_context: RegimeContext) -> float:
        """Calculate dynamic weight for ML vs traditional SSS based on regime"""
        
        base_weight = 0.3  # 30% ML by default
        
        # Increase ML weight in stable, predictable markets
        if regime_context.volatility_regime == "low" and regime_context.confidence_score > 0.7:
            base_weight = 0.4
        
        # Decrease ML weight in highly volatile, uncertain markets
        elif regime_context.volatility_regime == "high" and regime_context.confidence_score < 0.5:
            base_weight = 0.2
        
        # Adjust based on regime strength
        strength_adjustment = regime_context.regime_strength * 0.1
        
        return min(max(base_weight + strength_adjustment, 0.1), 0.5)
    
    def _calculate_regime_confidence(self, regime_signals: List[float]) -> float:
        """Calculate confidence in regime detection based on signal consistency"""
        
        # Normalize signals to 0-1 scale
        normalized_signals = [(abs(s) / max(abs(s), 1)) for s in regime_signals]
        
        # Calculate standard deviation (lower = more consistent = higher confidence)
        signal_std = np.std(normalized_signals)
        base_confidence = max(0.3, 1 - signal_std)
        
        # Adjust for extreme values (very high or low signals reduce confidence)
        extreme_penalty = 1.0
        for signal in normalized_signals:
            if signal > 0.9 or signal < 0.1:
                extreme_penalty *= 0.95
        
        return round(base_confidence * extreme_penalty, 3)
    
    def _calculate_regime_strength(self, regimes: List[str]) -> float:
        """Calculate how strong/clear the regime signals are"""
        
        # Count extreme regimes (strong signals)
        extreme_regimes = ['high', 'low', 'bullish', 'bearish', 'euphoric', 'fearful', 'expansion', 'contraction']
        extreme_count = sum(1 for regime in regimes if regime in extreme_regimes)
        
        # More extreme regimes = stronger regime signal
        strength = min(extreme_count / len(regimes), 1.0)
        
        return round(strength, 3)
    
    def _calculate_prediction_confidence(self, base_sss: float, ml_prediction: ModelPrediction,
                                      regime_context: RegimeContext, metrics: Dict) -> str:
        """Calculate overall prediction confidence level"""
        
        # Factor 1: Signal consistency between different models
        signal_consistency = 1 - abs(base_sss - ml_prediction.prediction) / 100
        
        # Factor 2: Regime clarity
        regime_clarity = regime_context.confidence_score
        
        # Factor 3: ML model confidence
        ml_confidence = ml_prediction.confidence
        
        # Factor 4: Data quality (how many metrics are in reasonable ranges)
        data_quality = sum(1 for v in metrics.values() if 0.1 <= float(v) <= 2.0) / len(metrics)
        
        # Factor 5: Market stability (volatility regime)
        market_stability = 1.0 if regime_context.volatility_regime == "low" else 0.7 if regime_context.volatility_regime == "medium" else 0.4
        
        # Weighted confidence score
        weighted_confidence = (
            signal_consistency * self.confidence_factors['signal_consistency'] +
            regime_clarity * self.confidence_factors['regime_clarity'] +
            ml_confidence * self.confidence_factors['ml_model_agreement'] +
            data_quality * self.confidence_factors['data_quality'] +
            market_stability * self.confidence_factors['market_stability'] +
            0.8 * self.confidence_factors['historical_accuracy']  # Placeholder for historical accuracy
        )
        
        # Convert to qualitative levels
        if weighted_confidence >= 0.85:
            return "Very High"
        elif weighted_confidence >= 0.75:
            return "High"
        elif weighted_confidence >= 0.65:
            return "Medium"
        elif weighted_confidence >= 0.55:
            return "Low"
        else:
            return "Very Low"
    
    def get_algorithm_diagnostics(self) -> Dict:
        """Get comprehensive diagnostics for the hybrid algorithm"""
        
        enhanced_diagnostics = self.enhanced_engine.get_model_diagnostics()
        ml_diagnostics = getattr(self.ml_engine, 'model_performance', {})
        
        return {
            'algorithm_version': 'Hybrid SSS v3.0',
            'timestamp': datetime.now().isoformat(),
            'enhanced_engine': enhanced_diagnostics,
            'ml_engine_performance': ml_diagnostics,
            'regime_thresholds': self.regime_thresholds,
            'confidence_factors': self.confidence_factors,
            'status': 'Active',
            'features': [
                'Advanced regime detection',
                'ML ensemble predictions',
                'Dynamic confidence weighting',
                'Multi-timeframe analysis',
                'Regime-adaptive scoring'
            ]
        }

def main():
    """Demo the hybrid SSS engine"""
    
    # Initialize hybrid engine
    hybrid_engine = HybridSilentSurgeEngine()
    
    # Sample crypto data
    sample_metrics = {
        'behavioral_activity': 0.75,
        'velocity_anomaly': 1.2,
        'community_cohesion': 0.68,
        'anchor_pressure': 0.72,
        'hype_to_hold': 0.65,
        'historical_volatility': 0.45,
        'volume_spike': 0.85,
        'social_sentiment': 3.8,
        'whale_activity': 0.6,
        'market_correlation': 0.7,
        'technical_momentum': 0.78,
        'news_sentiment': 0.2,
        'volume_24h': 5000000,
        'price_change_7d': 0.15,
        'rsi': 65,
        'macd_signal': 0.05
    }
    
    market_data = {
        'btc_correlation': 0.75,
        'macro_surprise': 0.8
    }
    
    # Get hybrid prediction
    prediction = hybrid_engine.calculate_hybrid_sss(sample_metrics, market_data)
    
    # Display results
    print("\n🚀 HYBRID SILENT SURGE ANALYSIS")
    print("=" * 50)
    print(f"Original SSS Score: {prediction.sss_score}")
    print(f"ML Ensemble Score: {prediction.ml_ensemble_score:.1f}")
    print(f"Regime-Adjusted Score: {prediction.regime_adjusted_score}")
    print(f"Breakout Probability: {prediction.breakout_probability}%")
    print(f"Confidence Level: {prediction.confidence_level}")
    
    print(f"\n📊 MARKET REGIME ANALYSIS")
    print(f"Volatility: {prediction.regime_context.volatility_regime}")
    print(f"Momentum: {prediction.regime_context.momentum_regime}")
    print(f"Liquidity: {prediction.regime_context.liquidity_regime}")
    print(f"Sentiment: {prediction.regime_context.sentiment_regime}")
    print(f"Regime Confidence: {prediction.regime_context.confidence_score:.2f}")
    
    print(f"\n🎯 TRADING SIGNALS")
    print(f"Primary Signal: {prediction.trading_signals['primary_signal']}")
    print(f"Confidence: {prediction.trading_signals['confidence']}")
    print(f"Risk Level: {prediction.trading_signals['risk_level']}")
    print(f"Timeframe: {prediction.trading_signals['timeframe']}")

if __name__ == "__main__":
    main()