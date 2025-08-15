#!/usr/bin/env python3

import sys
import os
import json

# Add the python_engine directory to the path
sys.path.append('python_engine')

def calculate_sss_metrics(symbol, price, market_cap, volume_24h, change_24h):
    """Calculate Silent Surge Score metrics for a cryptocurrency"""
    
    print(f"\n{'='*50}")
    print(f"TESTING {symbol.upper()} - SILENT SURGE ANALYSIS")
    print(f"{'='*50}")
    
    # Market data display
    print(f"\nMarket Data:")
    print(f"  Price: ${price:,.4f}")
    print(f"  Market Cap: ${market_cap:,.0f}")
    print(f"  24h Volume: ${volume_24h:,.0f}")
    print(f"  24h Change: {change_24h:+.2f}%")
    
    # Calculate volume/market cap ratio
    volume_to_mcap = (volume_24h / market_cap) * 100
    print(f"  Volume/MCap Ratio: {volume_to_mcap:.3f}%")
    
    # Calculate behavioral metrics based on real data
    price_volatility = abs(change_24h) / 100
    
    # Behavioral Activity (0-10): Based on volume activity and price movement
    behavioral_activity = min(10, max(0, 5.0 + (volume_to_mcap * 2) + (price_volatility * 10)))
    
    # Velocity Anomaly (0-10): Higher volatility = higher velocity anomaly  
    velocity_anomaly = min(10, max(0, 3.0 + (price_volatility * 30)))
    
    # Community Cohesion (0-10): Inverse relationship with extreme volatility
    community_cohesion = min(10, max(0, 8.0 - (price_volatility * 15)))
    
    # Anchor Pressure (0-10): Lower when prices are falling
    anchor_pressure = min(10, max(0, 6.0 + (change_24h / 10)))
    
    # Hype-to-Hold (0-10): High volume relative to market cap indicates hype
    hype_to_hold = min(10, max(0, 4.0 + (volume_to_mcap * 3)))
    
    # Historical Volatility (0-10): Based on 24h change
    historical_volatility = min(10, max(0, 2.0 + (price_volatility * 25)))
    
    print(f"\nBehavioral Metrics:")
    print(f"  Behavioral Activity: {behavioral_activity:.2f}")
    print(f"  Velocity Anomaly: {velocity_anomaly:.2f}")
    print(f"  Community Cohesion: {community_cohesion:.2f}")
    print(f"  Anchor Pressure: {anchor_pressure:.2f}")
    print(f"  Hype-to-Hold Ratio: {hype_to_hold:.2f}")
    print(f"  Historical Volatility: {historical_volatility:.2f}")
    
    # Calculate Silent Surge Score (weighted average)
    weights = {
        'behavioral_activity': 0.20,
        'velocity_anomaly': 0.18,
        'community_cohesion': 0.15,
        'anchor_pressure': 0.17,
        'hype_to_hold': 0.15,
        'historical_volatility': 0.15
    }
    
    sss = (
        behavioral_activity * weights['behavioral_activity'] +
        velocity_anomaly * weights['velocity_anomaly'] +
        community_cohesion * weights['community_cohesion'] +
        anchor_pressure * weights['anchor_pressure'] +
        hype_to_hold * weights['hype_to_hold'] +
        historical_volatility * weights['historical_volatility']
    ) * 10  # Scale to 0-100
    
    print(f"\nSilent Surge Score: {sss:.1f}/100")
    
    # Determine trading action based on SSS
    if sss >= 80:
        action = "STRONG BUY"
        risk_level = "High"
    elif sss >= 65:
        action = "BUY"
        risk_level = "Medium-High"
    elif sss >= 50:
        action = "ACCUMULATE"
        risk_level = "Medium"
    elif sss >= 35:
        action = "HOLD"
        risk_level = "Medium-Low"
    else:
        action = "AVOID"
        risk_level = "Low"
    
    print(f"Trading Recommendation: {action}")
    print(f"Risk Level: {risk_level}")
    
    # Calculate breakout probabilities
    breakout_3d = min(95, max(5, sss * 0.8 + (velocity_anomaly * 2)))
    breakout_7d = min(90, max(10, sss * 0.7 + (behavioral_activity * 3)))
    breakout_14d = min(85, max(15, sss * 0.6 + (hype_to_hold * 4)))
    
    print(f"\nBreakout Probabilities:")
    print(f"  3-day: {breakout_3d:.1f}%")
    print(f"  7-day: {breakout_7d:.1f}%")
    print(f"  14-day: {breakout_14d:.1f}%")
    
    return {
        'symbol': symbol.upper(),
        'sss': sss,
        'action': action,
        'risk_level': risk_level,
        'breakout_3d': breakout_3d,
        'breakout_7d': breakout_7d,
        'breakout_14d': breakout_14d,
        'metrics': {
            'behavioral_activity': behavioral_activity,
            'velocity_anomaly': velocity_anomaly,
            'community_cohesion': community_cohesion,
            'anchor_pressure': anchor_pressure,
            'hype_to_hold': hype_to_hold,
            'historical_volatility': historical_volatility
        }
    }

def main():
    print("SILENT SURGE TRACKER - CRYPTOCURRENCY ALGORITHM TEST")
    print("Testing CLBTC and SUI cryptocurrencies")
    
    # Test data for CLBTC and SUI
    # Note: Using realistic market data estimates since API rate limited
    
    test_cases = [
        {
            'symbol': 'CLBTC',
            'price': 104.50,
            'market_cap': 519000000,  # ~$519M
            'volume_24h': 45000000,   # ~$45M
            'change_24h': -2.35
        },
        {
            'symbol': 'SUI',
            'price': 3.80,
            'market_cap': 13353412144,  # ~$13.35B  
            'volume_24h': 3235569779,   # ~$3.24B
            'change_24h': -6.85
        }
    ]
    
    results = []
    
    for test_case in test_cases:
        result = calculate_sss_metrics(**test_case)
        results.append(result)
    
    # Summary comparison
    print(f"\n{'='*50}")
    print("COMPARISON SUMMARY")
    print(f"{'='*50}")
    
    print(f"\n{'Symbol':<8} {'SSS':<6} {'Action':<12} {'Risk':<12} {'7d Breakout':<12}")
    print("-" * 50)
    
    for result in results:
        print(f"{result['symbol']:<8} {result['sss']:<6.1f} {result['action']:<12} {result['risk_level']:<12} {result['breakout_7d']:<12.1f}%")
    
    # Determine winner
    best_performer = max(results, key=lambda x: x['sss'])
    print(f"\nHighest Silent Surge Score: {best_performer['symbol']} ({best_performer['sss']:.1f} points)")
    
    # Analysis insights
    print(f"\nKey Insights:")
    for result in results:
        if result['sss'] >= 70:
            print(f"  {result['symbol']}: Strong momentum detected - {result['action']} signal")
        elif result['sss'] >= 50:
            print(f"  {result['symbol']}: Moderate potential - {result['action']} position")
        else:
            print(f"  {result['symbol']}: Weak signals - {result['action']} recommended")
    
    return results

if __name__ == "__main__":
    results = main()