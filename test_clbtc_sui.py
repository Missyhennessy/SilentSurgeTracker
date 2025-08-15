#!/usr/bin/env python3

import sys
import os
import json
import random

# Add the python_engine directory to the path
sys.path.append('python_engine')

# Import our enhanced surge engine
try:
    from enhanced_surge_engine import EnhancedSurgeEngine
    print("✓ Successfully imported EnhancedSurgeEngine")
except ImportError as e:
    print(f"✗ Failed to import EnhancedSurgeEngine: {e}")
    print("Using fallback SSS calculation...")

def calculate_behavioral_metrics(price_data, volume_data, social_metrics=None):
    """Calculate behavioral activity metrics from price and volume data"""
    if not price_data or not volume_data:
        return {
            'behavioral_activity': random.uniform(5.0, 8.5),
            'velocity_anomaly': random.uniform(4.0, 9.0),
            'community_cohesion': random.uniform(6.0, 9.0),
            'anchor_pressure': random.uniform(3.0, 7.0),
            'hype_to_hold': random.uniform(5.0, 8.0),
            'historical_volatility': random.uniform(4.0, 8.5)
        }
    
    # Real calculation based on available data
    price_volatility = abs(price_data.get('change_24h', 0)) / 100
    volume_ratio = volume_data.get('volume_24h', 1000000) / volume_data.get('market_cap', 100000000)
    
    return {
        'behavioral_activity': min(9.5, max(1.0, 5.0 + (volume_ratio * 100))),
        'velocity_anomaly': min(9.5, max(1.0, 6.0 + (price_volatility * 30))),
        'community_cohesion': random.uniform(6.0, 8.5),  # Would need social data
        'anchor_pressure': min(9.5, max(1.0, 5.0 - (price_volatility * 20))),
        'hype_to_hold': min(9.5, max(1.0, 6.0 + (volume_ratio * 50))),
        'historical_volatility': min(9.5, max(1.0, 4.0 + (price_volatility * 40)))
    }

def test_cryptocurrency(symbol, price, market_cap, volume_24h, change_24h):
    """Test a cryptocurrency with our Silent Surge Score algorithm"""
    
    print(f"\n{'='*60}")
    print(f"🔍 TESTING {symbol.upper()} WITH SILENT SURGE ALGORITHM")
    print(f"{'='*60}")
    
    # Basic market data
    print(f"\n📊 Market Data:")
    print(f"   Price: ${price:,.4f}")
    print(f"   Market Cap: ${market_cap:,.0f}")
    print(f"   24h Volume: ${volume_24h:,.0f}")
    print(f"   24h Change: {change_24h:+.2f}%")
    print(f"   Volume/MCap Ratio: {(volume_24h/market_cap)*100:.3f}%")
    
    # Calculate behavioral metrics
    price_data = {'change_24h': change_24h}
    volume_data = {'volume_24h': volume_24h, 'market_cap': market_cap}
    
    metrics = calculate_behavioral_metrics(price_data, volume_data)
    
    print(f"\n🧠 Behavioral Metrics:")
    for key, value in metrics.items():
        print(f"   {key.replace('_', ' ').title()}: {value:.2f}")
    
    # Calculate Enhanced SSS
    try:
        engine = EnhancedSurgeEngine()
        
        # Prepare token data for comprehensive analysis
        token_data = {
            'symbol': symbol.upper(),
            'current_price': price,
            'market_cap': market_cap,
            'volume_24h': volume_24h,
            'price_change_24h': change_24h,
            **metrics
        }
        
        print(f"\n🚀 Running Enhanced SSS Analysis...")
        
        # Enhanced SSS Calculation
        sss_result = engine.enhanced_sss_calculation(metrics)
        print(f"\n⭐ Enhanced Silent Surge Score: {sss_result.get('enhanced_sss', 0):.1f}")
        print(f"   Confidence Level: {sss_result.get('confidence_level', 'Medium')}")
        print(f"   Market Regime: {sss_result.get('market_regime', 'Unknown')}")
        
        # ML Breakout Probability
        breakout_result = engine.ml_breakout_probability(
            sss_result.get('enhanced_sss', 50),
            metrics['velocity_anomaly'],
            metrics['behavioral_activity'],
            metrics['anchor_pressure']
        )
        
        print(f"\n📈 Breakout Probability Analysis:")
        print(f"   3-day breakout: {breakout_result.get('breakout_3d', 0):.1f}%")
        print(f"   7-day breakout: {breakout_result.get('breakout_7d', 0):.1f}%")
        print(f"   14-day breakout: {breakout_result.get('breakout_14d', 0):.1f}%")
        
        # Comprehensive Analysis
        comprehensive_result = engine.comprehensive_analysis(token_data)
        
        print(f"\n🎯 Trading Recommendation:")
        print(f"   Action: {comprehensive_result.get('action', 'HOLD')}")
        print(f"   Confidence: {comprehensive_result.get('confidence', 'Medium')}")
        print(f"   Risk Level: {comprehensive_result.get('risk_level', 'Medium')}")
        
        if 'reasoning' in comprehensive_result:
            print(f"   Reasoning:")
            for reason in comprehensive_result['reasoning']:
                print(f"     • {reason}")
        
        if 'price_targets' in comprehensive_result:
            targets = comprehensive_result['price_targets']
            print(f"\n💰 Price Targets:")
            print(f"   Conservative: ${targets.get('conservative_target', price):.4f}")
            print(f"   Upside: ${targets.get('upside_target', price):.4f}")
            print(f"   Aggressive: ${targets.get('aggressive_target', price):.4f}")
            print(f"   Stop Loss: ${targets.get('stop_loss', price):.4f}")
        
        print(f"\n✅ Analysis completed successfully for {symbol.upper()}")
        
        return {
            'symbol': symbol.upper(),
            'sss': sss_result.get('enhanced_sss', 0),
            'breakout_7d': breakout_result.get('breakout_7d', 0),
            'action': comprehensive_result.get('action', 'HOLD'),
            'confidence': comprehensive_result.get('confidence', 'Medium'),
            'risk_level': comprehensive_result.get('risk_level', 'Medium')
        }
        
    except Exception as e:
        print(f"\n❌ Enhanced analysis failed: {e}")
        print("Using fallback basic SSS calculation...")
        
        # Basic SSS calculation as fallback
        basic_sss = sum(metrics.values()) / len(metrics) * 10
        basic_sss = min(100, max(0, basic_sss))
        
        print(f"   Basic SSS: {basic_sss:.1f}")
        
        return {
            'symbol': symbol.upper(),
            'sss': basic_sss,
            'action': 'HOLD' if basic_sss < 60 else 'BUY' if basic_sss < 80 else 'STRONG_BUY',
            'confidence': 'Low (Fallback)',
            'risk_level': 'Medium'
        }

def main():
    print("🔬 SILENT SURGE TRACKER - CRYPTOCURRENCY ALGORITHM TESTING")
    print("Testing CLBTC and SUI with Enhanced ML Analysis")
    
    # Test data for CLBTC and SUI (we'll get real data)
    test_cases = [
        {
            'symbol': 'CLBTC',
            'price': 104.50,  # We'll update with real data
            'market_cap': 519000000,
            'volume_24h': 45000000,
            'change_24h': -2.35
        },
        {
            'symbol': 'SUI', 
            'price': 3.80,
            'market_cap': 13353412144,
            'volume_24h': 3235569779,
            'change_24h': -6.85
        }
    ]
    
    results = []
    
    for test_case in test_cases:
        result = test_cryptocurrency(**test_case)
        results.append(result)
    
    # Summary comparison
    print(f"\n{'='*60}")
    print("📋 SUMMARY COMPARISON")
    print(f"{'='*60}")
    
    for result in results:
        print(f"\n{result['symbol']}:")
        print(f"  Silent Surge Score: {result['sss']:.1f}")
        print(f"  Trading Action: {result['action']}")
        print(f"  Confidence: {result['confidence']}")
        print(f"  Risk Level: {result['risk_level']}")
    
    # Winner determination
    best_score = max(results, key=lambda x: x['sss'])
    print(f"\n🏆 HIGHEST SSS: {best_score['symbol']} with {best_score['sss']:.1f} points")
    
    return results

if __name__ == "__main__":
    results = main()