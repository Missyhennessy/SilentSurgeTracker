#!/usr/bin/env python3
"""
Standalone SSS calculation script for API integration
"""

import sys
import json
from surge_engine import SilentSurgeEngine

def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: calculate_sss.py <input_file>"}))
        sys.exit(1)
    
    try:
        # Read input data
        with open(sys.argv[1], 'r') as f:
            token_data = json.load(f)
        
        # Initialize engine
        engine = SilentSurgeEngine()
        
        # Calculate SSS
        sss = engine.calculate_sss_score({
            'behavioral_activity': token_data.get('behavioral_activity', 0.5),
            'velocity_anomaly': token_data.get('velocity_anomaly', 0.5),
            'community_cohesion': token_data.get('community_cohesion', 0.5),
            'anchor_pressure': token_data.get('anchor_pressure', 0.5),
            'hype_to_hold': token_data.get('hype_to_hold', 0.5),
            'historical_volatility': token_data.get('historical_volatility', 0.5)
        })
        
        # Output result as JSON
        print(json.dumps({"sss": sss}))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()