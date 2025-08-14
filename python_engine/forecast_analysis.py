#!/usr/bin/env python3
"""
Standalone forecast analysis script for API integration
"""

import sys
import json
from forecast_model import run_forecast_analysis

def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: forecast_analysis.py <input_file>"}))
        sys.exit(1)
    
    try:
        # Read input data
        with open(sys.argv[1], 'r') as f:
            token_data = json.load(f)
        
        # Run forecast analysis
        result = run_forecast_analysis(token_data)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()