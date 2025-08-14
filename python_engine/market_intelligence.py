#!/usr/bin/env python3
"""
Advanced Market Intelligence Module
Provides real-time market context and regime detection for improved accuracy
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class MarketSnapshot:
    """Real-time market snapshot for context-aware analysis"""
    timestamp: datetime
    btc_dominance: float
    total_market_cap: float
    fear_greed_index: int
    volatility_index: float
    trending_tokens: List[str]
    sector_performance: Dict[str, float]
    
class MarketIntelligenceEngine:
    """Advanced market intelligence for context-aware predictions"""
    
    def __init__(self):
        self.market_history = []
        self.regime_thresholds = {
            'volatility': {'low': 0.3, 'medium': 0.6, 'high': 1.0},
            'fear_greed': {'fear': 25, 'neutral_low': 40, 'neutral_high': 60, 'greed': 75},
            'btc_dominance': {'alt_season': 40, 'mixed': 50, 'btc_season': 60}
        }
    
    def detect_market_regime(self, market_data: Dict) -> Dict:
        """Detect current market regime for adaptive algorithm tuning"""
        
        regime = {
            'volatility_regime': self._classify_volatility(market_data.get('volatility', 0.5)),
            'sentiment_regime': self._classify_sentiment(market_data.get('fear_greed', 50)),
            'dominance_regime': self._classify_dominance(market_data.get('btc_dominance', 45)),
            'trend_regime': self._classify_trend(market_data),
            'liquidity_regime': self._classify_liquidity(market_data.get('volume_24h', 0))
        }
        
        # Calculate regime score (0-100, higher = more bullish)
        regime_score = self._calculate_regime_score(regime)
        
        # Determine overall market phase
        market_phase = self._determine_market_phase(regime, regime_score)
        
        return {
            'regimes': regime,
            'regime_score': regime_score,
            'market_phase': market_phase,
            'confidence': self._calculate_regime_confidence(regime),
            'recommended_adjustments': self._get_algorithm_adjustments(regime)
        }
    
    def _classify_volatility(self, volatility: float) -> str:
        """Classify volatility regime"""
        thresholds = self.regime_thresholds['volatility']
        
        if volatility <= thresholds['low']:
            return 'low'
        elif volatility <= thresholds['medium']:
            return 'medium'
        else:
            return 'high'
    
    def _classify_sentiment(self, fear_greed: int) -> str:
        """Classify sentiment regime based on fear/greed index"""
        thresholds = self.regime_thresholds['fear_greed']
        
        if fear_greed <= thresholds['fear']:
            return 'extreme_fear'
        elif fear_greed <= thresholds['neutral_low']:
            return 'fear'
        elif fear_greed <= thresholds['neutral_high']:
            return 'neutral'
        elif fear_greed <= thresholds['greed']:
            return 'greed'
        else:
            return 'extreme_greed'
    
    def _classify_dominance(self, btc_dominance: float) -> str:
        """Classify market dominance regime"""
        thresholds = self.regime_thresholds['btc_dominance']
        
        if btc_dominance <= thresholds['alt_season']:
            return 'alt_season'
        elif btc_dominance <= thresholds['mixed']:
            return 'mixed_market'
        else:
            return 'btc_dominance'
    
    def _classify_trend(self, market_data: Dict) -> str:
        """Classify overall market trend"""
        
        # Use multiple indicators for trend classification
        price_momentum = market_data.get('price_momentum', 0)
        volume_trend = market_data.get('volume_trend', 0)
        market_cap_change = market_data.get('market_cap_24h_change', 0)
        
        # Composite trend score
        trend_score = (price_momentum * 0.5 + volume_trend * 0.3 + market_cap_change * 0.2)
        
        if trend_score > 0.1:
            return 'bullish'
        elif trend_score < -0.1:
            return 'bearish'
        else:
            return 'sideways'
    
    def _classify_liquidity(self, volume_24h: float) -> str:
        """Classify liquidity regime"""
        
        # Normalize volume (this would need historical context in practice)
        if volume_24h > 1000000000:  # > $1B
            return 'high_liquidity'
        elif volume_24h > 500000000:  # > $500M
            return 'medium_liquidity'
        else:
            return 'low_liquidity'
    
    def _calculate_regime_score(self, regimes: Dict) -> int:
        """Calculate overall market regime score (0-100)"""
        
        scores = {
            'volatility_regime': {'low': 70, 'medium': 50, 'high': 30},
            'sentiment_regime': {'extreme_fear': 20, 'fear': 35, 'neutral': 50, 'greed': 70, 'extreme_greed': 85},
            'dominance_regime': {'btc_dominance': 40, 'mixed_market': 60, 'alt_season': 80},
            'trend_regime': {'bearish': 20, 'sideways': 45, 'bullish': 80},
            'liquidity_regime': {'low_liquidity': 30, 'medium_liquidity': 55, 'high_liquidity': 75}
        }
        
        weights = {
            'sentiment_regime': 0.3,
            'trend_regime': 0.25,
            'volatility_regime': 0.2,
            'dominance_regime': 0.15,
            'liquidity_regime': 0.1
        }
        
        weighted_score = sum(
            scores[regime_type][regime_value] * weights[regime_type]
            for regime_type, regime_value in regimes.items()
            if regime_type in scores and regime_value in scores[regime_type]
        )
        
        return round(weighted_score)
    
    def _determine_market_phase(self, regimes: Dict, regime_score: int) -> str:
        """Determine overall market phase"""
        
        if regime_score >= 70:
            if regimes['volatility_regime'] == 'high':
                return 'euphoric_bull'
            else:
                return 'steady_bull'
        elif regime_score >= 55:
            return 'cautious_optimism'
        elif regime_score >= 45:
            return 'consolidation'
        elif regime_score >= 30:
            return 'cautious_pessimism'
        else:
            if regimes['volatility_regime'] == 'high':
                return 'panic_bear'
            else:
                return 'steady_bear'
    
    def _calculate_regime_confidence(self, regimes: Dict) -> float:
        """Calculate confidence in regime classification"""
        
        # Higher confidence when multiple indicators align
        alignment_score = 0
        
        # Check for aligned signals
        if regimes['sentiment_regime'] in ['greed', 'extreme_greed'] and regimes['trend_regime'] == 'bullish':
            alignment_score += 1
        
        if regimes['volatility_regime'] == 'low' and regimes['liquidity_regime'] == 'high_liquidity':
            alignment_score += 1
        
        if regimes['dominance_regime'] == 'alt_season' and regimes['trend_regime'] == 'bullish':
            alignment_score += 1
        
        # Base confidence + alignment bonus
        base_confidence = 0.7
        alignment_bonus = alignment_score * 0.1
        
        return min(base_confidence + alignment_bonus, 0.95)
    
    def _get_algorithm_adjustments(self, regimes: Dict) -> Dict:
        """Get recommended algorithm adjustments based on market regime"""
        
        adjustments = {
            'sss_weight_multipliers': {},
            'probability_adjustments': {},
            'risk_factors': {},
            'timeframe_preferences': {}
        }
        
        # Volatility-based adjustments
        if regimes['volatility_regime'] == 'high':
            adjustments['sss_weight_multipliers']['velocity_anomaly'] = 1.2
            adjustments['probability_adjustments']['confidence_penalty'] = 0.9
            adjustments['risk_factors']['volatility_penalty'] = 1.1
            adjustments['timeframe_preferences']['short_term_boost'] = 1.15
        
        elif regimes['volatility_regime'] == 'low':
            adjustments['sss_weight_multipliers']['behavioral_activity'] = 1.1
            adjustments['probability_adjustments']['confidence_boost'] = 1.05
            adjustments['timeframe_preferences']['long_term_boost'] = 1.1
        
        # Sentiment-based adjustments
        if regimes['sentiment_regime'] in ['extreme_greed', 'greed']:
            adjustments['risk_factors']['euphoria_penalty'] = 0.95
            adjustments['sss_weight_multipliers']['hype_to_hold'] = 0.9
        
        elif regimes['sentiment_regime'] in ['fear', 'extreme_fear']:
            adjustments['probability_adjustments']['contrarian_boost'] = 1.1
            adjustments['sss_weight_multipliers']['anchor_pressure'] = 1.2
        
        # Dominance-based adjustments
        if regimes['dominance_regime'] == 'alt_season':
            adjustments['probability_adjustments']['altcoin_boost'] = 1.15
            adjustments['sss_weight_multipliers']['community_cohesion'] = 1.2
        
        elif regimes['dominance_regime'] == 'btc_dominance':
            adjustments['probability_adjustments']['altcoin_penalty'] = 0.9
            adjustments['risk_factors']['correlation_risk'] = 1.1
        
        return adjustments
    
    def get_market_timing_signals(self, regimes: Dict) -> Dict:
        """Generate market timing signals based on regime analysis"""
        
        signals = {
            'overall_signal': 'NEUTRAL',
            'confidence': 0.5,
            'reasoning': [],
            'risk_level': 'MEDIUM',
            'suggested_exposure': 0.5
        }
        
        # Determine overall signal
        bullish_factors = 0
        bearish_factors = 0
        
        # Sentiment analysis
        if regimes['sentiment_regime'] in ['greed', 'extreme_greed']:
            if regimes['volatility_regime'] != 'high':
                bullish_factors += 1
            else:
                bearish_factors += 1  # Euphoric + high vol = risk
                signals['reasoning'].append("High volatility in greedy market suggests caution")
        
        elif regimes['sentiment_regime'] in ['fear', 'extreme_fear']:
            bullish_factors += 1  # Contrarian signal
            signals['reasoning'].append("Fear presents contrarian opportunity")
        
        # Trend analysis
        if regimes['trend_regime'] == 'bullish':
            bullish_factors += 2
            signals['reasoning'].append("Strong bullish trend momentum")
        elif regimes['trend_regime'] == 'bearish':
            bearish_factors += 2
            signals['reasoning'].append("Bearish trend suggests caution")
        
        # Liquidity analysis
        if regimes['liquidity_regime'] == 'high_liquidity':
            bullish_factors += 1
            signals['reasoning'].append("High liquidity supports price discovery")
        
        # Final signal determination
        net_signal = bullish_factors - bearish_factors
        
        if net_signal >= 2:
            signals['overall_signal'] = 'BULLISH'
            signals['confidence'] = min(0.8, 0.5 + net_signal * 0.1)
            signals['suggested_exposure'] = min(0.8, 0.5 + net_signal * 0.1)
        elif net_signal <= -2:
            signals['overall_signal'] = 'BEARISH'
            signals['confidence'] = min(0.8, 0.5 + abs(net_signal) * 0.1)
            signals['suggested_exposure'] = max(0.2, 0.5 - abs(net_signal) * 0.1)
        else:
            signals['confidence'] = 0.6
            signals['suggested_exposure'] = 0.5
        
        # Risk level determination
        if regimes['volatility_regime'] == 'high' or regimes['sentiment_regime'] == 'extreme_greed':
            signals['risk_level'] = 'HIGH'
        elif regimes['volatility_regime'] == 'low' and regimes['liquidity_regime'] == 'high_liquidity':
            signals['risk_level'] = 'LOW'
        
        return signals
    
    def generate_market_report(self, market_data: Dict) -> Dict:
        """Generate comprehensive market intelligence report"""
        
        regime_analysis = self.detect_market_regime(market_data)
        timing_signals = self.get_market_timing_signals(regime_analysis['regimes'])
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'market_regime': regime_analysis,
            'timing_signals': timing_signals,
            'key_insights': [],
            'risk_warnings': [],
            'opportunities': []
        }
        
        # Generate insights
        regimes = regime_analysis['regimes']
        
        if regimes['volatility_regime'] == 'high' and regimes['sentiment_regime'] == 'extreme_greed':
            report['risk_warnings'].append("High volatility in euphoric market - consider reducing exposure")
        
        if regimes['dominance_regime'] == 'alt_season' and regimes['trend_regime'] == 'bullish':
            report['opportunities'].append("Alt season with bullish trend - favorable for altcoin selections")
        
        if regimes['sentiment_regime'] == 'extreme_fear' and regimes['liquidity_regime'] == 'high_liquidity':
            report['opportunities'].append("Fear with high liquidity presents contrarian opportunities")
        
        # Key insights
        report['key_insights'].append(f"Market Phase: {regime_analysis['market_phase']}")
        report['key_insights'].append(f"Regime Score: {regime_analysis['regime_score']}/100")
        report['key_insights'].append(f"Overall Signal: {timing_signals['overall_signal']} ({timing_signals['confidence']:.1%} confidence)")
        
        return report