#!/usr/bin/env python3

import sys
import os
import json
import requests
from urllib.parse import urljoin

# Add the python_engine directory to the path
sys.path.append('python_engine')

def run_enhanced_ml_analysis():
    """Run enhanced ML analysis directly using our Python engine"""
    
    print("🚀 ENHANCED ML ANALYSIS - CLBTC & SUI")
    print("="*60)
    
    # Test data for both cryptocurrencies
    crypto_data = {
        'CLBTC': {
            'behavioral_activity': 10.0,
            'velocity_anomaly': 3.71,
            'community_cohesion': 7.65,
            'anchor_pressure': 5.76,
            'hype_to_hold': 10.0,
            'historical_volatility': 2.59,
            'current_price': 104.50,
            'market_cap': 519000000,
            'volume_24h': 45000000,
            'price_change_24h': -2.35
        },
        'SUI': {
            'behavioral_activity': 10.0,
            'velocity_anomaly': 5.05,
            'community_cohesion': 6.97,
            'anchor_pressure': 5.32,
            'hype_to_hold': 10.0,
            'historical_volatility': 3.71,
            'current_price': 3.80,
            'market_cap': 13353412144,
            'volume_24h': 3235569779,
            'price_change_24h': -6.85
        }
    }
    
    # Import our enhanced ML modules directly
    try:
        from simple_ml_demo import enhanced_sss_calculation, ml_breakout_probability, comprehensive_analysis
        print("✓ Successfully imported enhanced ML modules")
    except ImportError as e:
        print(f"✗ Failed to import ML modules: {e}")
        return
    
    results = {}
    
    for symbol, data in crypto_data.items():
        print(f"\n{'='*40}")
        print(f"🔍 ANALYZING {symbol}")
        print(f"{'='*40}")
        
        # 1. Enhanced SSS Calculation
        print(f"\n🎯 Enhanced SSS Analysis:")
        try:
            sss_metrics = {
                'behavioral_activity': data['behavioral_activity'],
                'velocity_anomaly': data['velocity_anomaly'],
                'community_cohesion': data['community_cohesion'],
                'anchor_pressure': data['anchor_pressure'],
                'hype_to_hold': data['hype_to_hold'],
                'historical_volatility': data['historical_volatility']
            }
            
            sss_result = enhanced_sss_calculation(sss_metrics)
            print(f"   Enhanced SSS: {sss_result.get('enhanced_sss', 0):.1f}")
            print(f"   Confidence: {sss_result.get('confidence_level', 'N/A')}")
            print(f"   Market Regime: {sss_result.get('market_regime', 'N/A')}")
            print(f"   Risk Assessment: {sss_result.get('risk_assessment', 'N/A')}")
            
        except Exception as e:
            print(f"   ❌ Enhanced SSS failed: {e}")
            sss_result = {'enhanced_sss': 65.0}
        
        # 2. ML Breakout Probability
        print(f"\n📈 ML Breakout Probability:")
        try:
            breakout_result = ml_breakout_probability(
                sss_result.get('enhanced_sss', 65),
                data['velocity_anomaly'],
                data['behavioral_activity'],
                data['anchor_pressure']
            )
            
            print(f"   3-day breakout: {breakout_result.get('breakout_3d', 0):.1f}%")
            print(f"   7-day breakout: {breakout_result.get('breakout_7d', 0):.1f}%")
            print(f"   14-day breakout: {breakout_result.get('breakout_14d', 0):.1f}%")
            print(f"   Confidence: {breakout_result.get('confidence', 'N/A')}")
            print(f"   Model Accuracy: {breakout_result.get('model_accuracy', 'N/A')}")
            
        except Exception as e:
            print(f"   ❌ Breakout analysis failed: {e}")
            breakout_result = {'breakout_7d': 70.0}
        
        # 3. Comprehensive Analysis
        print(f"\n🎯 Comprehensive ML Analysis:")
        try:
            token_data = {
                'symbol': symbol,
                **data
            }
            
            comp_result = comprehensive_analysis(token_data)
            
            print(f"   Trading Action: {comp_result.get('action', 'HOLD')}")
            print(f"   Confidence: {comp_result.get('confidence', 'Medium')}")
            print(f"   Risk Level: {comp_result.get('risk_level', 'Medium')}")
            print(f"   Expected Return: {comp_result.get('expected_return', 'N/A')}")
            
            if 'reasoning' in comp_result:
                print(f"   Reasoning:")
                for reason in comp_result['reasoning'][:3]:  # Show top 3 reasons
                    print(f"     • {reason}")
            
            if 'price_targets' in comp_result:
                targets = comp_result['price_targets']
                print(f"   Price Targets:")
                print(f"     Conservative: ${targets.get('conservative_target', data['current_price']):.4f}")
                print(f"     Upside: ${targets.get('upside_target', data['current_price']):.4f}")
                print(f"     Stop Loss: ${targets.get('stop_loss', data['current_price']):.4f}")
            
        except Exception as e:
            print(f"   ❌ Comprehensive analysis failed: {e}")
            comp_result = {'action': 'HOLD', 'confidence': 'Low'}
        
        # Store results
        results[symbol] = {
            'enhanced_sss': sss_result.get('enhanced_sss', 65),
            'breakout_7d': breakout_result.get('breakout_7d', 70),
            'action': comp_result.get('action', 'HOLD'),
            'confidence': comp_result.get('confidence', 'Medium'),
            'risk_level': comp_result.get('risk_level', 'Medium')
        }
    
    # Final comparison
    print(f"\n{'='*60}")
    print("🏆 ENHANCED ML ANALYSIS SUMMARY")
    print(f"{'='*60}")
    
    print(f"\n{'Symbol':<8} {'Enhanced SSS':<12} {'Action':<12} {'7d Breakout':<12} {'Confidence':<12}")
    print("-" * 60)
    
    for symbol, result in results.items():
        print(f"{symbol:<8} {result['enhanced_sss']:<12.1f} {result['action']:<12} {result['breakout_7d']:<12.1f}% {result['confidence']:<12}")
    
    # Winner determination
    best_performer = max(results.items(), key=lambda x: x[1]['enhanced_sss'])
    print(f"\n🎯 Highest Enhanced SSS: {best_performer[0]} ({best_performer[1]['enhanced_sss']:.1f} points)")
    
    # ML Insights
    print(f"\n🧠 ML-Powered Insights:")
    for symbol, result in results.items():
        action_emoji = "🔥" if result['action'] in ['STRONG_BUY', 'BUY'] else "📊" if result['action'] == 'ACCUMULATE' else "⏸️"
        print(f"   {action_emoji} {symbol}: {result['action']} signal with {result['confidence']} confidence")
    
    return results

if __name__ == "__main__":
    results = run_enhanced_ml_analysis()