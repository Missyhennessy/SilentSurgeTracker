#!/usr/bin/env python3
"""
Standalone decision analysis script for API integration
"""

import sys
import json
import argparse
from decision_logic import run_decision_analysis

def main():
    parser = argparse.ArgumentParser(description='Run decision analysis')
    parser.add_argument('input_file', help='Input JSON file with token data')
    parser.add_argument('--risk-profile', choices=['conservative', 'moderate', 'aggressive'], 
                       default='moderate', help='Risk profile for analysis')
    
    args = parser.parse_args()
    
    try:
        # Read input data
        with open(args.input_file, 'r') as f:
            token_data = json.load(f)
        
        # Run decision analysis
        result = run_decision_analysis(token_data, args.risk_profile)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()