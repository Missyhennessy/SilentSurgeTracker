#!/usr/bin/env python3
"""
Advanced Decision Logic Engine for Silent Surge Tracker
Implements sophisticated trading logic and risk management
"""

import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class TradingDecisionEngine:
    """Advanced decision engine for cryptocurrency trading signals"""
    
    def __init__(self):
        self.risk_tolerance_profiles = {
            'conservative': {
                'min_probability': 75,
                'min_sss': 70,
                'min_anchor': 0.6,
                'max_risk_score': 2
            },
            'moderate': {
                'min_probability': 60,
                'min_sss': 60,
                'min_anchor': 0.4,
                'max_risk_score': 4
            },
            'aggressive': {
                'min_probability': 45,
                'min_sss': 50,
                'min_anchor': 0.3,
                'max_risk_score': 6
            }
        }
        
        self.market_conditions = self._assess_market_conditions()
    
    def generate_trading_signal(self, token_data: Dict, 
                              risk_profile: str = 'moderate') -> Dict:
        """Generate comprehensive trading signal with reasoning"""
        
        # Extract key metrics
        prob_3d = token_data.get('breakout_3d', 0)
        prob_7d = token_data.get('breakout_7d', 0)
        prob_14d = token_data.get('breakout_14d', 0)
        sss = token_data.get('sss', 0)
        anchor = token_data.get('anchor_pressure', 0)
        volume_anomaly = token_data.get('volume_anomaly', 0)
        social_sentiment = token_data.get('social_sentiment', 2.5)
        
        # Get risk profile thresholds
        thresholds = self.risk_tolerance_profiles.get(risk_profile, 
                                                     self.risk_tolerance_profiles['moderate'])
        
        # Calculate composite signals
        signals = self._calculate_signals(token_data)
        
        # Generate primary recommendation
        primary_action = self._determine_primary_action(signals, thresholds)
        
        # Calculate position sizing
        position_size = self._calculate_position_size(signals, risk_profile)
        
        # Generate entry/exit strategy
        strategy = self._generate_strategy(signals, primary_action)
        
        # Risk assessment
        risk_analysis = self._comprehensive_risk_analysis(token_data, signals)
        
        return {
            'token': token_data.get('symbol', 'UNKNOWN'),
            'timestamp': datetime.now().isoformat(),
            'signal': {
                'action': primary_action['action'],
                'strength': primary_action['strength'],
                'confidence': primary_action['confidence'],
                'reasoning': primary_action['reasoning']
            },
            'position_sizing': position_size,
            'strategy': strategy,
            'risk_analysis': risk_analysis,
            'market_context': self.market_conditions,
            'timeframe_analysis': {
                '3d_probability': prob_3d,
                '7d_probability': prob_7d, 
                '14d_probability': prob_14d,
                'optimal_timeframe': self._determine_optimal_timeframe(prob_3d, prob_7d, prob_14d)
            }
        }
    
    def _calculate_signals(self, token_data: Dict) -> Dict:
        """Calculate composite trading signals from multiple indicators"""
        
        # Technical signals
        technical_score = self._calculate_technical_score(token_data)
        
        # Fundamental signals
        fundamental_score = self._calculate_fundamental_score(token_data)
        
        # Sentiment signals
        sentiment_score = self._calculate_sentiment_score(token_data)
        
        # Volume signals
        volume_score = self._calculate_volume_score(token_data)
        
        # Momentum signals
        momentum_score = self._calculate_momentum_score(token_data)
        
        # Composite score
        weights = {
            'technical': 0.25,
            'fundamental': 0.20,
            'sentiment': 0.20,
            'volume': 0.20,
            'momentum': 0.15
        }
        
        composite_score = (
            technical_score * weights['technical'] +
            fundamental_score * weights['fundamental'] +
            sentiment_score * weights['sentiment'] +
            volume_score * weights['volume'] +
            momentum_score * weights['momentum']
        )
        
        return {
            'technical': technical_score,
            'fundamental': fundamental_score,
            'sentiment': sentiment_score,
            'volume': volume_score,
            'momentum': momentum_score,
            'composite': composite_score
        }
    
    def _determine_primary_action(self, signals: Dict, thresholds: Dict) -> Dict:
        """Determine primary trading action based on signals and thresholds"""
        
        composite = signals['composite']
        
        # Action determination logic
        if composite >= 80:
            action = "STRONG_BUY"
            strength = "Very Strong"
            confidence = "High"
            reasoning = ["Exceptional confluence of bullish signals", 
                        "High probability breakout setup",
                        "Strong technical and fundamental alignment"]
                        
        elif composite >= 70:
            action = "BUY"
            strength = "Strong"
            confidence = "High"
            reasoning = ["Strong bullish signals across multiple timeframes",
                        "Solid risk-reward setup"]
                        
        elif composite >= 60:
            action = "ACCUMULATE"
            strength = "Medium"
            confidence = "Medium-High"
            reasoning = ["Favorable setup developing",
                        "Good accumulation opportunity"]
                        
        elif composite >= 50:
            action = "WATCHLIST"
            strength = "Weak"
            confidence = "Medium"
            reasoning = ["Mixed signals - monitor closely",
                        "Wait for clearer confirmation"]
                        
        elif composite >= 40:
            action = "NEUTRAL"
            strength = "Very Weak"
            confidence = "Low"
            reasoning = ["Neutral technical picture",
                        "No clear directional bias"]
                        
        else:
            action = "AVOID"
            strength = "Negative"
            confidence = "High"
            reasoning = ["Weak fundamentals and technicals",
                        "High risk, low probability setup"]
        
        # Add specific signal strengths to reasoning
        if signals['technical'] >= 70:
            reasoning.append(f"Strong technical setup ({signals['technical']:.1f}/100)")
        if signals['sentiment'] >= 70:
            reasoning.append(f"Positive sentiment momentum ({signals['sentiment']:.1f}/100)")
        if signals['volume'] >= 70:
            reasoning.append(f"Unusual volume activity detected ({signals['volume']:.1f}/100)")
        
        return {
            'action': action,
            'strength': strength,
            'confidence': confidence,
            'reasoning': reasoning
        }
    
    def _calculate_position_size(self, signals: Dict, risk_profile: str) -> Dict:
        """Calculate recommended position sizing based on signals and risk profile"""
        
        base_allocation = {
            'conservative': 0.05,  # 5% max position
            'moderate': 0.10,      # 10% max position  
            'aggressive': 0.20     # 20% max position
        }
        
        max_allocation = base_allocation.get(risk_profile, 0.10)
        
        # Adjust based on signal strength
        signal_multiplier = min(signals['composite'] / 100, 1.0)
        
        recommended_size = max_allocation * signal_multiplier
        
        # Risk-adjusted sizing
        risk_adjustment = self._calculate_risk_adjustment(signals)
        final_size = recommended_size * risk_adjustment
        
        return {
            'recommended_percentage': round(final_size * 100, 2),
            'max_percentage': round(max_allocation * 100, 2),
            'risk_adjustment_factor': round(risk_adjustment, 3),
            'sizing_rationale': self._generate_sizing_rationale(final_size, signal_multiplier, risk_adjustment)
        }
    
    def _generate_strategy(self, signals: Dict, primary_action: Dict) -> Dict:
        """Generate detailed entry/exit strategy"""
        
        action = primary_action['action']
        
        if action in ['STRONG_BUY', 'BUY']:
            strategy = {
                'entry_strategy': 'Gradual accumulation over 3-5 days',
                'entry_levels': ['Current market price', '-2% for additional entry', '-5% for aggressive entry'],
                'stop_loss': '-12% from average entry',
                'take_profit_levels': ['+15% (partial)', '+30% (partial)', '+50% (final)'],
                'hold_duration': '2-8 weeks',
                'risk_management': 'Use trailing stop after +20% gains'
            }
        elif action == 'ACCUMULATE':
            strategy = {
                'entry_strategy': 'Dollar-cost averaging over 1-2 weeks',
                'entry_levels': ['Current price', '-3% dip', '-6% stronger dip'],
                'stop_loss': '-15% from average entry',
                'take_profit_levels': ['+20% (partial)', '+40% (remainder)'],
                'hold_duration': '4-12 weeks',
                'risk_management': 'Scale out gradually on strength'
            }
        elif action == 'WATCHLIST':
            strategy = {
                'entry_strategy': 'Wait for confirmation breakout',
                'entry_levels': ['Breakout above resistance', 'Pullback to breakout level'],
                'stop_loss': 'Below breakout level',
                'take_profit_levels': ['Measured move target'],
                'hold_duration': 'Trend dependent',
                'risk_management': 'Tight stops due to lower conviction'
            }
        else:
            strategy = {
                'entry_strategy': 'No entry recommended',
                'entry_levels': [],
                'stop_loss': 'N/A',
                'take_profit_levels': [],
                'hold_duration': 'N/A',
                'risk_management': 'Avoid position'
            }
        
        return strategy
    
    def _comprehensive_risk_analysis(self, token_data: Dict, signals: Dict) -> Dict:
        """Perform comprehensive risk analysis"""
        
        # Individual risk factors
        technical_risk = 100 - signals['technical']
        fundamental_risk = 100 - signals['fundamental'] 
        liquidity_risk = self._calculate_liquidity_risk(token_data)
        volatility_risk = token_data.get('volatility_score', 50)
        correlation_risk = self._calculate_correlation_risk(token_data)
        
        # Composite risk score
        risk_weights = {
            'technical': 0.2,
            'fundamental': 0.2,
            'liquidity': 0.2,
            'volatility': 0.2,
            'correlation': 0.2
        }
        
        composite_risk = (
            technical_risk * risk_weights['technical'] +
            fundamental_risk * risk_weights['fundamental'] +
            liquidity_risk * risk_weights['liquidity'] +
            volatility_risk * risk_weights['volatility'] +
            correlation_risk * risk_weights['correlation']
        )
        
        # Risk level classification
        if composite_risk <= 30:
            risk_level = "Low"
        elif composite_risk <= 50:
            risk_level = "Medium"
        elif composite_risk <= 70:
            risk_level = "High"
        else:
            risk_level = "Very High"
        
        return {
            'overall_risk_level': risk_level,
            'risk_score': round(composite_risk, 1),
            'risk_factors': {
                'technical_risk': round(technical_risk, 1),
                'fundamental_risk': round(fundamental_risk, 1),
                'liquidity_risk': round(liquidity_risk, 1),
                'volatility_risk': round(volatility_risk, 1),
                'correlation_risk': round(correlation_risk, 1)
            },
            'risk_mitigation': self._suggest_risk_mitigation(composite_risk, risk_level)
        }
    
    def _calculate_technical_score(self, token_data: Dict) -> float:
        """Calculate technical analysis score"""
        sss = token_data.get('sss', 50)
        anchor_pressure = token_data.get('anchor_pressure', 0.5)
        breakout_7d = token_data.get('breakout_7d', 0)
        
        # Weighted technical score
        technical_score = (sss * 0.4 + anchor_pressure * 100 * 0.3 + breakout_7d * 0.3)
        return min(max(technical_score, 0), 100)
    
    def _calculate_fundamental_score(self, token_data: Dict) -> float:
        """Calculate fundamental analysis score"""
        # In production, this would analyze tokenomics, team, partnerships, etc.
        # For now, use available metrics
        velocity = token_data.get('velocity', 0.5)
        network_activity = token_data.get('network_activity', 50)
        
        fundamental_score = (velocity * 50 + network_activity * 0.5)
        return min(max(fundamental_score, 0), 100)
    
    def _calculate_sentiment_score(self, token_data: Dict) -> float:
        """Calculate sentiment analysis score"""
        social_sentiment = token_data.get('social_sentiment', 2.5)
        sentiment_momentum = token_data.get('sentiment_momentum', 0)
        
        # Convert to 0-100 scale
        sentiment_score = (social_sentiment / 5.0) * 100 + sentiment_momentum
        return min(max(sentiment_score, 0), 100)
    
    def _calculate_volume_score(self, token_data: Dict) -> float:
        """Calculate volume analysis score"""
        volume_anomaly = token_data.get('volume_anomaly', 0)
        velocity = token_data.get('velocity', 0.5)
        
        volume_score = (volume_anomaly * 50 + velocity * 50)
        return min(max(volume_score, 0), 100)
    
    def _calculate_momentum_score(self, token_data: Dict) -> float:
        """Calculate momentum score"""
        breakout_3d = token_data.get('breakout_3d', 0)
        breakout_7d = token_data.get('breakout_7d', 0)
        sss = token_data.get('sss', 50)
        
        momentum_score = (breakout_3d * 0.3 + breakout_7d * 0.4 + sss * 0.3)
        return min(max(momentum_score, 0), 100)
    
    def _calculate_liquidity_risk(self, token_data: Dict) -> float:
        """Calculate liquidity risk score (0-100, higher = more risk)"""
        volume_24h = token_data.get('volume_24h', 0)
        market_cap = token_data.get('market_cap', 1)
        
        # Volume-to-market-cap ratio as liquidity indicator
        if market_cap > 0:
            liquidity_ratio = volume_24h / market_cap
            # Higher liquidity = lower risk
            liquidity_risk = max(0, 100 - (liquidity_ratio * 1000))
        else:
            liquidity_risk = 100  # Max risk if no market cap data
        
        return min(liquidity_risk, 100)
    
    def _calculate_correlation_risk(self, token_data: Dict) -> float:
        """Calculate correlation risk with market (0-100, higher = more risk)"""
        btc_correlation = token_data.get('btc_correlation', 0.7)
        
        # High correlation = high systematic risk
        correlation_risk = abs(btc_correlation) * 100
        return correlation_risk
    
    def _assess_market_conditions(self) -> Dict:
        """Assess current market conditions (simplified)"""
        # In production, this would analyze broader market metrics
        return {
            'trend': 'bullish',
            'volatility': 'moderate',
            'sentiment': 'optimistic',
            'risk_on': True
        }
    
    def _determine_optimal_timeframe(self, prob_3d: float, prob_7d: float, prob_14d: float) -> str:
        """Determine optimal trading timeframe based on probabilities"""
        probs = {'3d': prob_3d, '7d': prob_7d, '14d': prob_14d}
        
        # Find highest probability timeframe
        optimal = max(probs.items(), key=lambda x: x[1])
        
        # Only recommend if probability is meaningful
        if optimal[1] >= 60:
            return optimal[0]
        else:
            return 'unclear'
    
    def _calculate_risk_adjustment(self, signals: Dict) -> float:
        """Calculate risk adjustment factor for position sizing"""
        
        # Lower risk adjustment for weaker signals
        if signals['composite'] >= 80:
            return 1.0
        elif signals['composite'] >= 70:
            return 0.9
        elif signals['composite'] >= 60:
            return 0.7
        elif signals['composite'] >= 50:
            return 0.5
        else:
            return 0.3
    
    def _generate_sizing_rationale(self, final_size: float, signal_multiplier: float, 
                                 risk_adjustment: float) -> List[str]:
        """Generate rationale for position sizing recommendation"""
        rationale = []
        
        if signal_multiplier > 0.8:
            rationale.append("Strong signal confidence supports larger position")
        elif signal_multiplier > 0.6:
            rationale.append("Moderate signals suggest standard position size")
        else:
            rationale.append("Weak signals require reduced position size")
        
        if risk_adjustment < 0.7:
            rationale.append("Risk factors suggest additional size reduction")
        
        if final_size < 0.05:
            rationale.append("Very small position due to high uncertainty")
        elif final_size > 0.15:
            rationale.append("Larger position justified by strong setup")
        
        return rationale
    
    def _suggest_risk_mitigation(self, risk_score: float, risk_level: str) -> List[str]:
        """Suggest risk mitigation strategies"""
        suggestions = []
        
        if risk_score > 70:
            suggestions.extend([
                "Consider reducing position size by 50%",
                "Use tighter stop losses",
                "Monitor position closely for early exit signals"
            ])
        elif risk_score > 50:
            suggestions.extend([
                "Use position sizing below maximum allocation",
                "Consider scaling into position gradually",
                "Set alerts for key support/resistance levels"
            ])
        else:
            suggestions.extend([
                "Standard position sizing acceptable",
                "Use trailing stops to protect profits",
                "Monitor for changes in risk profile"
            ])
        
        return suggestions

def run_decision_analysis(token_data: Dict, risk_profile: str = 'moderate') -> Dict:
    """Run comprehensive decision analysis for a token"""
    
    engine = TradingDecisionEngine()
    return engine.generate_trading_signal(token_data, risk_profile)

if __name__ == "__main__":
    # Test the decision engine
    sample_token = {
        'symbol': 'SUI',
        'sss': 85,
        'velocity': 1.2,
        'social_sentiment': 4.2,
        'anchor_pressure': 0.65,
        'breakout_3d': 72,
        'breakout_7d': 78,
        'breakout_14d': 65,
        'volume_anomaly': 1.5,
        'network_activity': 75,
        'market_cap': 5000000000,
        'volume_24h': 150000000,
        'btc_correlation': 0.6
    }
    
    import json
    results = run_decision_analysis(sample_token, 'moderate')
    print(json.dumps(results, indent=2))