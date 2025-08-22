#!/usr/bin/env python3

import sys
import json
import requests
from enhanced_surge_engine import EnhancedSurgeEngine
from crypto_data_analyzer import CryptoDataAnalyzer

def analyze_24h_predictions():
    try:
        # Get current crypto data
        response = requests.get('http://localhost:5000/api/assets')
        assets = response.json()
        print(f'Loaded {len(assets)} cryptocurrencies')
        
        # Sort by SSS score and get top candidates
        top_assets = sorted(assets, key=lambda x: x.get('sssScore', 0), reverse=True)[:20]
        
        analyzer = CryptoDataAnalyzer()
        engine = EnhancedSurgeEngine()
        
        predictions = []
        
        for asset in top_assets:
            try:
                # Extract metrics for analysis
                metrics = {
                    'behavioral_activity': asset.get('behavioralActivity', 0.5),
                    'velocity_anomaly': asset.get('velocityAnomaly', 0.5),
                    'community_cohesion': asset.get('communityCohesion', 0.5),
                    'anchor_pressure': asset.get('anchorPressure', 0.5),
                    'hype_to_hold': asset.get('hypeToHold', 0.5),
                    'historical_volatility': asset.get('historicalVolatility', 0.5),
                    'price': asset.get('price', 0),
                    'change_24h': asset.get('change24h', 0),
                    'volume_24h': asset.get('volume24h', 0),
                    'market_cap': asset.get('marketCap', 0)
                }
                
                # Get enhanced analysis
                analysis = engine.calculate_enhanced_sss(metrics)
                
                # Calculate 24h profit probability using SSS methodology
                profit_factors = (
                    metrics['behavioral_activity'] * 0.25 +
                    metrics['velocity_anomaly'] * 0.30 +
                    metrics['community_cohesion'] * 0.20 +
                    (1 - metrics['anchor_pressure']) * 0.15 +
                    metrics['hype_to_hold'] * 0.10
                )
                
                profit_probability = min(max(profit_factors * analysis['model_confidence'] / 100, 0), 1)
                
                predictions.append({
                    'symbol': asset['symbol'],
                    'name': asset['name'],
                    'current_price': asset['price'],
                    'sss_score': analysis['sss'],
                    'confidence': analysis['model_confidence'],
                    'profit_probability_24h': round(profit_probability * 100, 1),
                    'risk_level': 'High' if analysis['sss'] > 80 else 'Medium' if analysis['sss'] > 60 else 'Low',
                    'change_24h': asset.get('change24h', 0),
                    'volume_spike': metrics['velocity_anomaly'] > 0.7,
                    'behavioral_strength': metrics['behavioral_activity'],
                    'velocity_anomaly': metrics['velocity_anomaly']
                })
                
            except Exception as e:
                continue
        
        # Sort by combined score: profit probability + SSS score weighted
        top_3 = sorted(predictions, 
                      key=lambda x: (x['profit_probability_24h'] + x['sss_score']/2), 
                      reverse=True)[:3]
        
        print('\n=== TOP 3 CRYPTOCURRENCIES FOR 24H PROFIT (Silent Surge Algorithm) ===\n')
        for i, pred in enumerate(top_3, 1):
            print(f'{i}. {pred["symbol"]} ({pred["name"]})')
            print(f'   Current Price: ${pred["current_price"]:.6f}')
            print(f'   SSS Score: {pred["sss_score"]:.1f}/100')
            print(f'   24h Profit Probability: {pred["profit_probability_24h"]}%')
            print(f'   Model Confidence: {pred["confidence"]:.1f}%')
            print(f'   Risk Level: {pred["risk_level"]}')
            print(f'   24h Change: {pred["change_24h"]:+.2f}%')
            print(f'   Behavioral Activity: {pred["behavioral_strength"]:.2f}')
            print(f'   Velocity Anomaly: {pred["velocity_anomaly"]:.2f}')
            print(f'   Volume Spike: {"Yes" if pred["volume_spike"] else "No"}')
            print()

    except Exception as e:
        print(f'Error: {e}')

if __name__ == "__main__":
    analyze_24h_predictions()