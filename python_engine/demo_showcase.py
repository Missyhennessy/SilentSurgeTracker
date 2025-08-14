#!/usr/bin/env python3
"""
Silent Surge Python Engine Demonstration
Showcases the key capabilities of the scoring engine
"""

import pandas as pd
import sys
import json
from datetime import datetime

# Import our modules
from surge_engine import SilentSurgeEngine
from forecast_model import run_forecast_analysis, BreakoutPredictor
from decision_logic import run_decision_analysis
from visualize import SurgeVisualizer

def demonstrate_engine():
    """Comprehensive demonstration of the Silent Surge Python Engine"""
    
    print("🚀 SILENT SURGE PYTHON ENGINE DEMONSTRATION")
    print("=" * 60)
    
    # 1. Load and process sample data
    print("\n📊 1. DATA PROCESSING DEMONSTRATION")
    print("-" * 40)
    
    engine = SilentSurgeEngine()
    
    # Create realistic sample data with better calibrated values
    realistic_data = {
        'Token': ['SUI', 'PEPE', 'SOL', 'ETH', 'NEAR', 'FTM', 'AVAX'],
        'SSS': [85, 91, 78, 72, 69, 71, 73],
        'Velocity': [1.2, 2.1, 0.9, 0.8, 0.68, 0.78, 0.92],
        'Sentiment': [4.2, 3.8, 3.8, 3.5, 3.3, 3.2, 3.4],
        'AnchorPressure': [0.65, 0.75, 0.55, 0.60, 0.44, 0.49, 0.52],
        'Volume24h': [150000000, 89000000, 500000000, 1200000000, 110000000, 95000000, 180000000],
        'MarketCap': [5000000000, 2500000000, 78000000000, 450000000000, 7800000000, 6200000000, 18500000000],
        'Price': [1.85, 0.000012, 168.50, 3650.00, 2.50, 0.82, 22.75],
        'BtcCorrelation': [0.45, 0.65, 0.75, 0.85, 0.58, 0.66, 0.69]
    }
    
    df = pd.DataFrame(realistic_data)
    print(f"Processing {len(df)} high-potential tokens...")
    
    # Adjust engine weights for demonstration
    engine.weights = {
        'behavioral_activity': 0.20,
        'velocity_anomaly': 0.25,
        'community_cohesion': 0.20,
        'anchor_pressure': 0.15,
        'hype_to_hold': 0.15,
        'historical_volatility': 0.05
    }
    
    results = engine.process_token_data(df)
    print("\nTop 5 Analyzed Tokens:")
    print(results[['Token', 'SSS', 'Breakout_3d', 'Breakout_7d', 'Action', 'Confidence']].head().to_string(index=False))
    
    # 2. Advanced Forecasting Demonstration
    print(f"\n🔮 2. ADVANCED FORECASTING DEMONSTRATION")
    print("-" * 40)
    
    # Pick top token for detailed analysis
    top_token = results.iloc[0]
    
    token_data = {
        'symbol': top_token['Token'],
        'sss': top_token['SSS'],
        'velocity': top_token['Velocity'],
        'sentiment': top_token['Sentiment'],
        'anchor_pressure': top_token['AnchorPressure'],
        'current_price': top_token['Price'],
        'price_history': [top_token['Price'] * 0.95, top_token['Price'] * 0.98, 
                         top_token['Price'] * 1.02, top_token['Price']]
    }
    
    forecast = run_forecast_analysis(token_data)
    
    print(f"Token: {forecast['token']}")
    print(f"Multi-Timeframe Breakout Probabilities:")
    print(f"  • 3-Day:  {forecast['predictions']['3d']['ensemble_probability']}%")
    print(f"  • 7-Day:  {forecast['predictions']['7d']['ensemble_probability']}%")
    print(f"  • 14-Day: {forecast['predictions']['14d']['ensemble_probability']}%")
    print(f"Model Confidence: {forecast['predictions']['7d']['confidence']}")
    
    if 'price_targets' in forecast:
        targets = forecast['price_targets']
        print(f"\nPrice Targets:")
        print(f"  • Conservative: ${targets.get('conservative_target', 0):.2f}")
        print(f"  • Upside:       ${targets.get('upside_target', 0):.2f}")
        print(f"  • Aggressive:   ${targets.get('aggressive_target', 0):.2f}")
        print(f"  • Stop Loss:    ${targets.get('stop_loss', 0):.2f}")
    
    # 3. Trading Decision Engine
    print(f"\n🧠 3. TRADING DECISION ENGINE")
    print("-" * 40)
    
    # Enhanced token data for decision analysis
    decision_data = {
        'symbol': top_token['Token'],
        'sss': top_token['SSS'],
        'velocity': top_token['Velocity'],
        'social_sentiment': top_token['Sentiment'],
        'anchor_pressure': top_token['AnchorPressure'],
        'breakout_3d': top_token['Breakout_3d'],
        'breakout_7d': top_token['Breakout_7d'],
        'breakout_14d': top_token['Breakout_7d'] * 0.85,  # Simulate 14d
        'volume_anomaly': top_token['Velocity'],
        'network_activity': top_token['SSS'] * 0.8,
        'market_cap': top_token['MarketCap'],
        'volume_24h': top_token['Volume24h'],
        'btc_correlation': top_token['BtcCorrelation']
    }
    
    # Test moderate risk profile
    decision = run_decision_analysis(decision_data, 'moderate')
    
    print(f"Token Analysis: {decision['token']}")
    print(f"Recommendation: {decision['signal']['action']}")
    print(f"Confidence: {decision['signal']['confidence']}")
    print(f"Position Size: {decision['position_sizing']['recommended_percentage']}%")
    print(f"Risk Level: {decision['risk_analysis']['overall_risk_level']}")
    print(f"Entry Strategy: {decision['strategy']['entry_strategy']}")
    
    if decision['signal']['reasoning']:
        print(f"Key Reasoning: {decision['signal']['reasoning'][0]}")
    
    # 4. Risk Analysis
    print(f"\n⚠️  4. COMPREHENSIVE RISK ANALYSIS")
    print("-" * 40)
    
    risk_analysis = decision['risk_analysis']
    print(f"Overall Risk Score: {risk_analysis['risk_score']}/100")
    print("Risk Factor Breakdown:")
    for factor, score in risk_analysis['risk_factors'].items():
        risk_name = factor.replace('_risk', '').replace('_', ' ').title()
        print(f"  • {risk_name}: {score}/100")
    
    # 5. Market Summary
    print(f"\n📈 5. MARKET SUMMARY")
    print("-" * 40)
    
    summary_stats = {
        'total_analyzed': len(results),
        'avg_sss': results['SSS'].mean(),
        'avg_breakout_7d': results['Breakout_7d'].mean(),
        'strong_signals': len(results[results['Action'].isin(['Strong Buy', 'Buy'])]),
        'high_risk_count': len(results[results['Risk_Level'] == 'High'])
    }
    
    print(f"Total Tokens Analyzed: {summary_stats['total_analyzed']}")
    print(f"Average SSS Score: {summary_stats['avg_sss']:.1f}")
    print(f"Average 7d Breakout Probability: {summary_stats['avg_breakout_7d']:.1f}%")
    print(f"Strong Buy/Buy Signals: {summary_stats['strong_signals']}")
    print(f"High Risk Tokens: {summary_stats['high_risk_count']}")
    
    # 6. Export capabilities
    print(f"\n💾 6. EXPORT & INTEGRATION")
    print("-" * 40)
    
    # Generate alerts
    alerts = engine.generate_alerts(results)
    print(f"Generated {len(alerts)} alerts")
    
    # Export sample
    export_file = engine.export_results(results, "demo_analysis_results.json")
    print(f"Results exported to: {export_file}")
    
    # API-ready format
    api_response = {
        'timestamp': datetime.now().isoformat(),
        'top_opportunities': results.head(3)[['Token', 'SSS', 'Breakout_7d', 'Action']].to_dict('records'),
        'market_summary': summary_stats,
        'alerts': alerts
    }
    
    print(f"\nAPI Response Sample:")
    print(json.dumps(api_response, indent=2, default=str)[:300] + "...")
    
    print(f"\n✅ DEMONSTRATION COMPLETE")
    print("=" * 60)
    print("The Silent Surge Python Engine provides:")
    print("• Multi-dimensional scoring with customizable weights")
    print("• Ensemble forecasting with confidence scoring")
    print("• Risk-adjusted trading recommendations")
    print("• Comprehensive risk analysis")
    print("• Real-time alert generation")
    print("• API-ready export capabilities")
    print("• Integration-friendly architecture")

if __name__ == "__main__":
    demonstrate_engine()