#!/usr/bin/env python3
"""
Silent Surge Analysis Runner
Complete workflow for cryptocurrency analysis using the Silent Surge methodology
"""

import pandas as pd
import json
import argparse
from datetime import datetime
import logging
import os
from typing import Dict, List

# Import our modules
from surge_engine import SilentSurgeEngine
from forecast_model import run_forecast_analysis
from decision_logic import run_decision_analysis
from visualize import SurgeVisualizer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('surge_analysis.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SilentSurgeRunner:
    """Main runner class for Silent Surge analysis"""
    
    def __init__(self, data_path: str = "data/sample_tokens.csv"):
        self.data_path = data_path
        self.engine = SilentSurgeEngine()
        self.visualizer = SurgeVisualizer()
        self.results = {}
    
    def load_data(self) -> pd.DataFrame:
        """Load token data from CSV"""
        try:
            df = pd.read_csv(self.data_path)
            logger.info(f"Loaded {len(df)} tokens from {self.data_path}")
            return df
        except FileNotFoundError:
            logger.error(f"Data file not found: {self.data_path}")
            raise
        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            raise
    
    def run_complete_analysis(self, risk_profile: str = 'moderate', 
                            generate_charts: bool = True) -> Dict:
        """Run complete Silent Surge analysis pipeline"""
        
        logger.info("🚀 Starting Silent Surge Analysis Pipeline")
        start_time = datetime.now()
        
        # Step 1: Load data
        logger.info("Step 1: Loading token data...")
        df = self.load_data()
        
        # Step 2: Process with main engine
        logger.info("Step 2: Processing tokens with Silent Surge Engine...")
        processed_df = self.engine.process_token_data(df)
        
        # Step 3: Enhanced forecasting for top tokens
        logger.info("Step 3: Running enhanced forecasting analysis...")
        top_tokens = processed_df.head(10)  # Top 10 opportunities
        forecast_results = []
        
        for _, token in top_tokens.iterrows():
            token_data = {
                'symbol': token['Token'],
                'sss': token['SSS'],
                'velocity': token['Velocity'], 
                'sentiment': token['Sentiment'],
                'anchor_pressure': token['AnchorPressure'],
                'current_price': token.get('Price', 1.0)
            }
            
            forecast = run_forecast_analysis(token_data)
            forecast_results.append(forecast)
        
        # Step 4: Decision analysis for top tokens
        logger.info("Step 4: Generating trading decisions...")
        decision_results = []
        
        for _, token in top_tokens.iterrows():
            token_data = {
                'symbol': token['Token'],
                'sss': token['SSS'],
                'velocity': token['Velocity'],
                'social_sentiment': token['Sentiment'],
                'anchor_pressure': token['AnchorPressure'],
                'breakout_3d': token['Breakout_3d'],
                'breakout_7d': token['Breakout_7d'],
                'volume_anomaly': token['Velocity'],  # Using velocity as proxy
                'network_activity': token['SSS'] * 0.8,
                'market_cap': token.get('MarketCap', 1000000000),
                'volume_24h': token.get('Volume24h', 100000000),
                'btc_correlation': token.get('BtcCorrelation', 0.7)
            }
            
            decision = run_decision_analysis(token_data, risk_profile)
            decision_results.append(decision)
        
        # Step 5: Generate comprehensive results
        logger.info("Step 5: Compiling comprehensive results...")
        
        # Market summary
        market_summary = {
            'total_tokens_analyzed': len(df),
            'strong_buy_signals': len(processed_df[processed_df['Action'] == 'Strong Buy']),
            'buy_signals': len(processed_df[processed_df['Action'] == 'Buy']),
            'accumulate_signals': len(processed_df[processed_df['Action'] == 'Accumulate']),
            'watchlist_tokens': len(processed_df[processed_df['Action'] == 'Watchlist']),
            'high_risk_tokens': len(processed_df[processed_df['Risk_Level'] == 'High']),
            'average_sss': processed_df['SSS'].mean(),
            'average_breakout_7d': processed_df['Breakout_7d'].mean(),
            'top_opportunity': processed_df.iloc[0]['Token'],
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        # Compile final results
        self.results = {
            'market_summary': market_summary,
            'processed_tokens': processed_df.to_dict('records'),
            'top_opportunities': top_tokens.to_dict('records'),
            'detailed_forecasts': forecast_results,
            'trading_decisions': decision_results,
            'alerts': self.engine.generate_alerts(processed_df),
            'risk_profile_used': risk_profile,
            'execution_time': str(datetime.now() - start_time)
        }
        
        # Step 6: Generate visualizations (optional)
        if generate_charts:
            logger.info("Step 6: Generating visualizations...")
            self._generate_visualizations(processed_df)
        
        logger.info(f"✅ Analysis complete! Processed {len(df)} tokens in {datetime.now() - start_time}")
        return self.results
    
    def _generate_visualizations(self, df: pd.DataFrame):
        """Generate comprehensive visualizations"""
        
        # Create output directory
        os.makedirs("output/charts", exist_ok=True)
        
        # Main dashboard
        dashboard_path = self.visualizer.create_comprehensive_dashboard(
            df, "output/charts/dashboard.html"
        )
        
        # Breakout analysis
        breakout_path = self.visualizer.plot_breakout_probabilities(
            df, "output/charts/breakout_analysis.png"
        )
        
        # Individual token analyses for top 3
        top_3 = df.head(3)
        for _, token in top_3.iterrows():
            token_data = {
                'symbol': token['Token'],
                'breakout_3d': token['Breakout_3d'],
                'breakout_7d': token['Breakout_7d'],
                'technical_score': token['SSS'],
                'fundamental_score': token['SSS'] * 0.8,
                'sentiment_score': token['Sentiment'] * 20,
                'volume_score': token['Velocity'] * 70,
                'momentum_score': token['Composite_Score'],
                'current_price': token.get('Price', 1.0)
            }
            
            self.visualizer.plot_token_analysis(
                token_data, f"output/charts/{token['Token']}_analysis.png"
            )
        
        logger.info("📊 Visualizations saved to output/charts/")
    
    def save_results(self, filename: str = None) -> str:
        """Save analysis results to JSON"""
        
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"output/surge_analysis_{timestamp}.json"
        
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        with open(filename, 'w') as f:
            json.dump(self.results, f, indent=2, default=str)
        
        logger.info(f"💾 Results saved to {filename}")
        return filename
    
    def print_summary(self):
        """Print executive summary of analysis"""
        
        if not self.results:
            logger.warning("No results to summarize. Run analysis first.")
            return
        
        summary = self.results['market_summary']
        
        print("\n" + "="*60)
        print("🚀 SILENT SURGE ANALYSIS SUMMARY")
        print("="*60)
        
        print(f"📊 Total Tokens Analyzed: {summary['total_tokens_analyzed']}")
        print(f"🎯 Top Opportunity: {summary['top_opportunity']}")
        print(f"📈 Average SSS Score: {summary['average_sss']:.1f}")
        print(f"⚡ Average 7d Breakout Probability: {summary['average_breakout_7d']:.1f}%")
        
        print(f"\n🔥 TRADING SIGNALS:")
        print(f"   • Strong Buy: {summary['strong_buy_signals']} tokens")
        print(f"   • Buy: {summary['buy_signals']} tokens") 
        print(f"   • Accumulate: {summary['accumulate_signals']} tokens")
        print(f"   • Watchlist: {summary['watchlist_tokens']} tokens")
        
        print(f"\n⚠️  High Risk Tokens: {summary['high_risk_tokens']}")
        print(f"🔔 Active Alerts: {len(self.results['alerts'])}")
        
        print(f"\n⏱️  Analysis completed in: {self.results['execution_time']}")
        print(f"📅 Timestamp: {summary['analysis_timestamp']}")
        
        # Top 5 opportunities
        print(f"\n🏆 TOP 5 OPPORTUNITIES:")
        top_5 = self.results['top_opportunities'][:5]
        for i, token in enumerate(top_5, 1):
            print(f"   {i}. {token['Token']}: {token['Action']} "
                  f"({token['Breakout_7d']}% 7d breakout, SSS: {token['SSS']})")
        
        print("="*60)

def main():
    """Main execution function with command line interface"""
    
    parser = argparse.ArgumentParser(description='Silent Surge Cryptocurrency Analysis')
    parser.add_argument('--data', '-d', default='data/sample_tokens.csv',
                       help='Path to token data CSV file')
    parser.add_argument('--risk-profile', '-r', choices=['conservative', 'moderate', 'aggressive'],
                       default='moderate', help='Risk tolerance profile')
    parser.add_argument('--no-charts', action='store_true',
                       help='Skip chart generation')
    parser.add_argument('--output', '-o', 
                       help='Output file for results (auto-generated if not specified)')
    parser.add_argument('--quiet', '-q', action='store_true',
                       help='Suppress summary output')
    
    args = parser.parse_args()
    
    # Initialize runner
    runner = SilentSurgeRunner(args.data)
    
    try:
        # Run complete analysis
        results = runner.run_complete_analysis(
            risk_profile=args.risk_profile,
            generate_charts=not args.no_charts
        )
        
        # Save results
        output_file = runner.save_results(args.output)
        
        # Print summary unless quiet mode
        if not args.quiet:
            runner.print_summary()
            print(f"\n📄 Detailed results saved to: {output_file}")
            if not args.no_charts:
                print(f"📊 Charts saved to: output/charts/")
        
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise

if __name__ == "__main__":
    main()