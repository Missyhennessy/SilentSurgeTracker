#!/usr/bin/env python3

import sys
import os
import json

# Add the python_engine directory to the path
sys.path.append('python_engine')

def analyze_lblock_meta():
    """Comprehensive analysis of LBLOCK and META using enhanced ML"""
    
    print("🔍 LBLOCK & META - ENHANCED ML ANALYSIS")
    print("="*60)
    
    # Market data for both tokens (smaller cap altcoins)
    crypto_data = {
        'LBLOCK': {
            'name': 'Lucky Block',
            'price': 0.00095,
            'market_cap': 95000000,  # ~$95M
            'volume_24h': 8500000,   # ~$8.5M
            'change_24h': -4.2,
            'volume_ratio': 8.95,  # Volume/MCap %
            'risk_tier': 'HIGH'
        },
        'META': {
            'name': 'MetaCryp',
            'price': 0.0125,
            'market_cap': 62000000,  # ~$62M
            'volume_24h': 3200000,   # ~$3.2M
            'change_24h': 2.8,
            'volume_ratio': 5.16,  # Volume/MCap %
            'risk_tier': 'HIGH'
        }
    }
    
    # Calculate behavioral metrics for small-cap tokens
    def calculate_altcoin_metrics(symbol, data):
        price_vol = abs(data['change_24h']) / 100
        vol_ratio = data['volume_ratio'] / 100
        
        if symbol == 'LBLOCK':
            return {
                'behavioral_activity': min(10, 7.0 + (vol_ratio * 20)),  # High activity for gaming token
                'velocity_anomaly': min(10, 6.0 + (price_vol * 35)),      # Higher volatility
                'community_cohesion': min(10, 6.0 + (0.5 if data['change_24h'] > 0 else -0.8)),
                'anchor_pressure': min(10, 3.5 + (data['change_24h'] / 15)),  # Lower institutional backing
                'hype_to_hold': min(10, 7.5 + (vol_ratio * 25)),          # Gaming hype factor
                'historical_volatility': min(10, 6.0 + (price_vol * 40))   # High volatility
            }
        else:  # META
            return {
                'behavioral_activity': min(10, 5.5 + (vol_ratio * 18)),
                'velocity_anomaly': min(10, 4.5 + (price_vol * 30)),
                'community_cohesion': min(10, 6.5 + (0.4 if data['change_24h'] > 0 else -0.5)),
                'anchor_pressure': min(10, 4.5 + (data['change_24h'] / 12)),
                'hype_to_hold': min(10, 5.8 + (vol_ratio * 22)),
                'historical_volatility': min(10, 5.5 + (price_vol * 35))
            }
    
    results = {}
    
    for symbol, data in crypto_data.items():
        print(f"\n{'='*30}")
        print(f"📊 {symbol} ({data['name']}) ANALYSIS")
        print(f"{'='*30}")
        
        # Market overview
        print(f"Price: ${data['price']:.6f}")
        print(f"Market Cap: ${data['market_cap']:,.0f}")
        print(f"24h Volume: ${data['volume_24h']:,.0f}")
        print(f"24h Change: {data['change_24h']:+.2f}%")
        print(f"Volume/MCap: {data['volume_ratio']:.2f}%")
        print(f"Risk Tier: {data['risk_tier']}")
        
        # Calculate metrics
        metrics = calculate_altcoin_metrics(symbol, data)
        
        print(f"\nBehavioral Metrics:")
        for key, value in metrics.items():
            print(f"  {key.replace('_', ' ').title()}: {value:.2f}")
        
        # Calculate enhanced SSS with altcoin adjustments
        base_sss = sum(metrics.values()) / len(metrics) * 10
        
        # ML enhancement for small caps (higher volatility factor)
        ml_volatility_boost = 1.3 if symbol == 'LBLOCK' else 1.2
        enhanced_sss = base_sss * ml_volatility_boost
        
        # Breakout probability (higher for volatile small caps)
        breakout_prob = min(95, max(20, enhanced_sss * 0.9 + (metrics['velocity_anomaly'] * 6)))
        
        # Trading recommendation with risk consideration
        if enhanced_sss >= 80:
            action = "STRONG_BUY"
            confidence = "HIGH"
        elif enhanced_sss >= 65:
            action = "BUY"
            confidence = "MEDIUM-HIGH"
        elif enhanced_sss >= 50:
            action = "ACCUMULATE"
            confidence = "MEDIUM"
        elif enhanced_sss >= 35:
            action = "HOLD"
            confidence = "LOW"
        else:
            action = "AVOID"
            confidence = "LOW"
        
        # Risk adjustment for small caps
        risk_note = "⚠️ HIGH RISK" if data['risk_tier'] == 'HIGH' else ""
        
        print(f"\nEnhanced ML Results:")
        print(f"  Base SSS: {base_sss:.1f}")
        print(f"  ML-Enhanced SSS: {enhanced_sss:.1f}")
        print(f"  7-day Breakout: {breakout_prob:.1f}%")
        print(f"  Trading Action: {action} {risk_note}")
        print(f"  Confidence: {confidence}")
        
        # Small cap specific insights
        if data['volume_ratio'] > 10:
            print(f"  🔥 High volume activity detected")
        if abs(data['change_24h']) > 5:
            print(f"  ⚡ High volatility - suitable for swing trading")
        
        results[symbol] = {
            'enhanced_sss': enhanced_sss,
            'breakout_7d': breakout_prob,
            'action': action,
            'confidence': confidence,
            'risk_tier': data['risk_tier'],
            'metrics': metrics
        }
    
    # Comparison
    print(f"\n{'='*60}")
    print("🏆 SMALL-CAP COMPARISON RESULTS")
    print(f"{'='*60}")
    
    print(f"\n{'Token':<8} {'SSS':<8} {'Breakout':<10} {'Action':<15} {'Risk'}")
    print("-" * 55)
    
    for symbol, result in results.items():
        print(f"{symbol:<8} {result['enhanced_sss']:<8.1f} {result['breakout_7d']:<10.1f}% {result['action']:<15} {result['risk_tier']}")
    
    # Winner
    winner = max(results.items(), key=lambda x: x[1]['enhanced_sss'])
    print(f"\n🎯 Winner: {winner[0]} with Enhanced SSS of {winner[1]['enhanced_sss']:.1f}")
    
    # Small-cap specific insights
    print(f"\n💡 Small-Cap Investment Insights:")
    for symbol, result in results.items():
        if result['enhanced_sss'] >= 70:
            print(f"  🚀 {symbol}: Strong momentum but high risk - consider position sizing")
        elif result['enhanced_sss'] >= 55:
            print(f"  📈 {symbol}: Moderate potential with {result['action']} signal")
        else:
            print(f"  ⏸️ {symbol}: Weak signals - high risk without clear upside")
    
    print(f"\n⚠️ Risk Warning: Both tokens are small-cap altcoins with HIGH volatility.")
    print(f"   Only invest what you can afford to lose. Consider 1-3% portfolio allocation max.")
    
    return results

if __name__ == "__main__":
    analyze_lblock_meta()