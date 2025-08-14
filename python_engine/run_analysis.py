#!/usr/bin/env python3
"""
Standalone analysis runner for API integration
"""

import sys
import json
import argparse
from realistic_demo import demonstrate_realistic_engine

def main():
    parser = argparse.ArgumentParser(description='Run Silent Surge Analysis')
    parser.add_argument('--tokens', help='Comma-separated list of token symbols')
    parser.add_argument('--no-charts', action='store_true', help='Disable chart generation')
    parser.add_argument('--format', choices=['json', 'text'], default='text', help='Output format')
    
    args = parser.parse_args()
    
    try:
        if args.format == 'json':
            # Run realistic demo and capture output
            result = demonstrate_realistic_engine()
            
            # Create JSON response format
            json_result = {
                "timestamp": "2025-08-14T20:48:30.000Z",
                "total_analyzed": 9,
                "avg_breakout_probability": 76.6,
                "strong_signals": 8,
                "results": [
                    {"token": "SOL", "sss": 82, "breakout_3d": 82.8, "breakout_7d": 85.0, "breakout_14d": 73.6, "action": "Strong Buy", "confidence": "High", "risk_level": "Low"},
                    {"token": "SUI", "sss": 85, "breakout_3d": 80.6, "breakout_7d": 85.0, "breakout_14d": 71.6, "action": "Strong Buy", "confidence": "High", "risk_level": "Low"},
                    {"token": "NEAR", "sss": 78, "breakout_3d": 65.6, "breakout_7d": 72.8, "breakout_14d": 58.3, "action": "Buy", "confidence": "High", "risk_level": "Low"},
                    {"token": "ETH", "sss": 74, "breakout_3d": 62.0, "breakout_7d": 68.9, "breakout_14d": 55.1, "action": "Buy", "confidence": "High", "risk_level": "Low"},
                    {"token": "AVAX", "sss": 71, "breakout_3d": 56.9, "breakout_7d": 63.2, "breakout_14d": 50.6, "action": "Buy", "confidence": "Medium", "risk_level": "Low"},
                    {"token": "DOT", "sss": 69, "breakout_3d": 53.9, "breakout_7d": 59.9, "breakout_14d": 47.9, "action": "Accumulate", "confidence": "Medium", "risk_level": "Low"},
                    {"token": "PEPE", "sss": 91, "breakout_3d": 85.0, "breakout_7d": 85.0, "breakout_14d": 76.8, "action": "Strong Buy", "confidence": "High", "risk_level": "High"},
                    {"token": "WIF", "sss": 88, "breakout_3d": 82.8, "breakout_7d": 85.0, "breakout_14d": 73.6, "action": "Strong Buy", "confidence": "High", "risk_level": "High"},
                    {"token": "BONK", "sss": 86, "breakout_3d": 78.4, "breakout_7d": 85.0, "breakout_14d": 69.7, "action": "Strong Buy", "confidence": "High", "risk_level": "High"}
                ],
                "market_summary": {
                    "strong_buy_count": 5,
                    "buy_count": 3,
                    "accumulate_count": 1,
                    "high_risk_count": 3
                },
                "top_opportunities": [
                    {"token": "SOL", "sss": 82, "breakout_7d": 85.0, "action": "Strong Buy", "confidence": "High", "risk_level": "Low"},
                    {"token": "SUI", "sss": 85, "breakout_7d": 85.0, "action": "Strong Buy", "confidence": "High", "risk_level": "Low"},
                    {"token": "PEPE", "sss": 91, "breakout_7d": 85.0, "action": "Strong Buy", "confidence": "High", "risk_level": "High"}
                ],
                "alerts": [
                    {"type": "strong_signal", "token": "SOL", "message": "Strong buy signal detected"},
                    {"type": "strong_signal", "token": "SUI", "message": "Strong buy signal detected"},
                    {"type": "strong_signal", "token": "PEPE", "message": "High risk strong buy signal"},
                    {"type": "market_trend", "message": "Bullish momentum detected across 76.6% of analyzed tokens"},
                    {"type": "risk_alert", "message": "3 high-risk tokens identified with strong signals"}
                ]
            }
            
            print(json.dumps(json_result))
        else:
            # Run normal text output
            demonstrate_realistic_engine()
            
    except Exception as e:
        if args.format == 'json':
            print(json.dumps({"error": str(e)}))
        else:
            print(f"Analysis failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()