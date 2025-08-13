#!/usr/bin/env python3
"""
Silent Surge Scoring Engine (v1.0)
Advanced cryptocurrency breakout prediction and ranking system
"""

import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SilentSurgeEngine:
    """Main scoring engine for Silent Surge cryptocurrency analysis"""
    
    def __init__(self):
        self.weights = {
            'behavioral_activity': 0.25,
            'velocity_anomaly': 0.20,
            'community_cohesion': 0.15,
            'anchor_pressure': 0.15,
            'hype_to_hold': 0.15,
            'historical_volatility': 0.10
        }
        
    def calculate_sss_score(self, metrics: Dict) -> float:
        """Calculate Silent Surge Score based on weighted metrics"""
        sss = (
            metrics['behavioral_activity'] * self.weights['behavioral_activity'] +
            metrics['velocity_anomaly'] * self.weights['velocity_anomaly'] +
            metrics['community_cohesion'] * self.weights['community_cohesion'] +
            metrics['anchor_pressure'] * self.weights['anchor_pressure'] +
            metrics['hype_to_hold'] * self.weights['hype_to_hold'] +
            metrics['historical_volatility'] * self.weights['historical_volatility']
        )
        return round(min(max(sss, 0), 100), 2)
    
    def breakout_probability(self, sss: float, velocity: float, sentiment: float, 
                           anchor: float, timeframe: int = 7) -> float:
        """Calculate breakout probability using sigmoid function"""
        # Adjust weights based on timeframe
        time_factor = 1.0 if timeframe == 7 else 0.8
        
        # Logistic regression coefficients (tuned for crypto markets)
        z = (0.05 * sss + 0.3 * velocity + 0.4 * sentiment + 
             0.2 * anchor - 10) * time_factor
        
        probability = 1 / (1 + np.exp(-z)) * 100
        return round(min(max(probability, 0), 100), 2)
    
    def suggest_action(self, prob_3d: float, prob_7d: float, sss: float, 
                      anchor: float, current_price: float = None) -> Dict:
        """Generate trading recommendations based on probabilities and metrics"""
        
        # Define thresholds
        HIGH_PROB_THRESHOLD = 70
        MEDIUM_PROB_THRESHOLD = 50
        HIGH_SSS_THRESHOLD = 80
        HIGH_ANCHOR_THRESHOLD = 0.6
        
        confidence = "Low"
        action = "Ignore"
        reasoning = []
        
        if prob_7d >= HIGH_PROB_THRESHOLD and sss >= HIGH_SSS_THRESHOLD and anchor >= HIGH_ANCHOR_THRESHOLD:
            action = "Strong Buy"
            confidence = "High"
            reasoning.append(f"High 7d breakout probability ({prob_7d}%)")
            reasoning.append(f"Strong SSS score ({sss})")
            reasoning.append(f"Solid anchor pressure ({anchor:.2f})")
            
        elif prob_7d >= HIGH_PROB_THRESHOLD:
            action = "Accumulate"
            confidence = "Medium-High"
            reasoning.append(f"High breakout probability ({prob_7d}%)")
            
        elif prob_7d >= MEDIUM_PROB_THRESHOLD and sss >= 60:
            action = "Watchlist"
            confidence = "Medium"
            reasoning.append(f"Moderate signals - worth monitoring")
            
        elif prob_3d >= HIGH_PROB_THRESHOLD:
            action = "Short-term Watch"
            confidence = "Medium"
            reasoning.append(f"Strong 3d probability ({prob_3d}%)")
        
        return {
            'action': action,
            'confidence': confidence,
            'reasoning': reasoning,
            'risk_level': self._calculate_risk_level(prob_7d, anchor, sss)
        }
    
    def _calculate_risk_level(self, prob_7d: float, anchor: float, sss: float) -> str:
        """Calculate risk level based on various factors"""
        risk_score = 0
        
        # Lower probability = higher risk
        if prob_7d < 30:
            risk_score += 3
        elif prob_7d < 50:
            risk_score += 2
        elif prob_7d < 70:
            risk_score += 1
            
        # Lower anchor pressure = higher risk
        if anchor < 0.3:
            risk_score += 2
        elif anchor < 0.5:
            risk_score += 1
            
        # Extreme SSS scores can indicate higher volatility
        if sss > 90 or sss < 20:
            risk_score += 1
            
        if risk_score >= 4:
            return "High"
        elif risk_score >= 2:
            return "Medium"
        else:
            return "Low"
    
    def process_token_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Process token data and generate scores and recommendations"""
        logger.info(f"Processing {len(df)} tokens")
        
        # Calculate breakout probabilities
        df['Breakout_3d'] = df.apply(
            lambda row: self.breakout_probability(
                row['SSS'], row['Velocity'], row['Sentiment'], 
                row['AnchorPressure'], timeframe=3
            ), axis=1
        )
        
        df['Breakout_7d'] = df.apply(
            lambda row: self.breakout_probability(
                row['SSS'], row['Velocity'], row['Sentiment'], 
                row['AnchorPressure'], timeframe=7
            ), axis=1
        )
        
        # Generate trading recommendations
        recommendations = df.apply(
            lambda row: self.suggest_action(
                row['Breakout_3d'], row['Breakout_7d'], 
                row['SSS'], row['AnchorPressure'],
                row.get('Price', None)
            ), axis=1
        )
        
        df['Action'] = recommendations.apply(lambda x: x['action'])
        df['Confidence'] = recommendations.apply(lambda x: x['confidence'])
        df['Risk_Level'] = recommendations.apply(lambda x: x['risk_level'])
        df['Reasoning'] = recommendations.apply(lambda x: '; '.join(x['reasoning']))
        
        # Calculate composite score for ranking
        df['Composite_Score'] = (
            df['Breakout_7d'] * 0.4 + 
            df['SSS'] * 0.3 + 
            df['Breakout_3d'] * 0.2 + 
            (df['AnchorPressure'] * 100) * 0.1
        )
        
        return df.sort_values('Composite_Score', ascending=False)
    
    def generate_alerts(self, df: pd.DataFrame) -> List[Dict]:
        """Generate alerts for high-priority tokens"""
        alerts = []
        
        # Strong buy alerts
        strong_buys = df[df['Action'] == 'Strong Buy']
        for _, token in strong_buys.iterrows():
            alerts.append({
                'type': 'STRONG_BUY',
                'token': token['Token'],
                'message': f"{token['Token']}: Strong buy signal - {token['Breakout_7d']}% 7d breakout probability",
                'priority': 'HIGH',
                'timestamp': datetime.now().isoformat()
            })
        
        # High probability alerts
        high_prob = df[(df['Breakout_7d'] >= 75) & (df['Action'] != 'Strong Buy')]
        for _, token in high_prob.iterrows():
            alerts.append({
                'type': 'HIGH_PROBABILITY',
                'token': token['Token'],
                'message': f"{token['Token']}: {token['Breakout_7d']}% breakout probability detected",
                'priority': 'MEDIUM',
                'timestamp': datetime.now().isoformat()
            })
        
        return alerts
    
    def export_results(self, df: pd.DataFrame, filename: str = None) -> str:
        """Export results to JSON for integration with main platform"""
        if filename is None:
            filename = f"surge_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        # Prepare data for export
        results = {
            'timestamp': datetime.now().isoformat(),
            'total_tokens': len(df),
            'summary': {
                'strong_buys': len(df[df['Action'] == 'Strong Buy']),
                'accumulate': len(df[df['Action'] == 'Accumulate']),
                'watchlist': len(df[df['Action'] == 'Watchlist']),
                'high_risk': len(df[df['Risk_Level'] == 'High']),
                'avg_breakout_7d': df['Breakout_7d'].mean()
            },
            'top_opportunities': df.head(10).to_dict('records'),
            'alerts': self.generate_alerts(df)
        }
        
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        logger.info(f"Results exported to {filename}")
        return filename

def main():
    """Main execution function"""
    # Initialize engine
    engine = SilentSurgeEngine()
    
    # Sample data (replace with actual data source)
    sample_data = {
        'Token': ['SUI', 'PEPE', 'SOL', 'ETH', 'BTC', 'ADA', 'XRP'],
        'SSS': [85, 91, 78, 72, 68, 65, 70],
        'Velocity': [1.2, 0.7, 0.9, 0.8, 0.6, 0.5, 0.7],
        'Sentiment': [4.2, 2.1, 3.8, 3.5, 3.2, 2.8, 3.0],
        'AnchorPressure': [0.65, 0.45, 0.55, 0.60, 0.70, 0.40, 0.50],
        'Price': [1.85, 0.000012, 168.50, 3650.00, 114000.00, 0.75, 3.05]
    }
    
    df = pd.DataFrame(sample_data)
    
    # Process data
    processed_df = engine.process_token_data(df)
    
    # Display results
    print("\n🚀 SILENT SURGE ANALYSIS RESULTS")
    print("=" * 50)
    print(processed_df[['Token', 'SSS', 'Breakout_3d', 'Breakout_7d', 'Action', 'Confidence', 'Risk_Level']].to_string(index=False))
    
    # Export results
    export_file = engine.export_results(processed_df)
    print(f"\n📊 Results exported to: {export_file}")
    
    # Display top opportunities
    print(f"\n🎯 TOP OPPORTUNITIES:")
    top_3 = processed_df.head(3)
    for _, token in top_3.iterrows():
        print(f"• {token['Token']}: {token['Action']} ({token['Confidence']} confidence, {token['Breakout_7d']}% 7d breakout)")

if __name__ == "__main__":
    main()