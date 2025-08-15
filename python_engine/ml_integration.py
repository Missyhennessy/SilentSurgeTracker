#!/usr/bin/env python3
"""
ML Integration Module for Silent Surge Engine
Integrates machine learning models with the existing API endpoints
"""

import json
import numpy as np
from datetime import datetime
from typing import Dict, List, Optional
import logging

from ml_models import MLModelEngine
from lstm_time_series import LSTMTimeSeriesEngine
from enhanced_surge_engine import EnhancedSilentSurgeEngine, MarketContext

logger = logging.getLogger(__name__)

class MLIntegratedEngine:
    """Integrated ML-powered Silent Surge Engine"""
    
    def __init__(self):
        # Initialize all engines
        self.enhanced_engine = EnhancedSilentSurgeEngine()
        self.ml_engine = MLModelEngine()
        self.lstm_engine = LSTMTimeSeriesEngine()
        
        # Training status
        self.ml_trained = False
        self.lstm_trained = False
        
        # Performance tracking
        self.performance_history = []
        
    def initialize_ml_models(self) -> Dict:
        """Initialize and train all ML models"""
        
        initialization_report = {
            'timestamp': datetime.now().isoformat(),
            'status': 'initializing',
            'components': {}
        }
        
        try:
            # Train ML models
            logger.info("Training ML ensemble models...")
            ml_results = self.ml_engine.train_models('breakout_probability')
            self.ml_trained = True
            initialization_report['components']['ml_ensemble'] = {
                'status': 'trained',
                'models_count': len(ml_results['model_performance']),
                'best_accuracy': max([
                    perf.get('accuracy_percentage', 0) 
                    for perf in ml_results['model_performance'].values()
                    if 'error' not in perf
                ], default=0)
            }
            
        except Exception as e:
            logger.error(f"ML training failed: {e}")
            initialization_report['components']['ml_ensemble'] = {'status': 'failed', 'error': str(e)}
        
        try:
            # Train LSTM models
            logger.info("Training LSTM time series models...")
            time_series_data = self.lstm_engine.generate_time_series_data(1000)
            lstm_results = self.lstm_engine.train_lstm_models(time_series_data)
            self.lstm_trained = True
            initialization_report['components']['lstm_models'] = {
                'status': 'trained',
                'models_count': len(lstm_results['model_performance']),
                'sequence_length': self.lstm_engine.sequence_length
            }
            
        except Exception as e:
            logger.error(f"LSTM training failed: {e}")
            initialization_report['components']['lstm_models'] = {'status': 'failed', 'error': str(e)}
        
        initialization_report['status'] = 'completed'
        initialization_report['ml_ready'] = self.ml_trained
        initialization_report['lstm_ready'] = self.lstm_trained
        
        return initialization_report
    
    def enhanced_sss_calculation(self, metrics: Dict, market_context: Optional[MarketContext] = None) -> Dict:
        """Enhanced SSS calculation with ML predictions"""
        
        # Base enhanced SSS
        base_result = self.enhanced_engine.calculate_enhanced_sss(metrics, market_context)
        
        # Add ML predictions if available
        if self.ml_trained:
            try:
                # Prepare ML features
                ml_features = {
                    **metrics,
                    'volume_spike': 0.8,
                    'social_sentiment': 3.5,
                    'whale_activity': 0.4,
                    'market_correlation': 0.6,
                    'technical_momentum': 0.6,
                    'news_sentiment': 0.0,
                    'rsi': 50.0,
                    'macd_signal': 0.0
                }
                
                ml_prediction = self.ml_engine.predict_ensemble(ml_features)
                
                # Blend traditional and ML predictions
                ml_weight = 0.3  # 30% ML, 70% traditional
                blended_sss = (
                    base_result['sss'] * (1 - ml_weight) +
                    ml_prediction.prediction * ml_weight
                )
                
                base_result['ml_enhanced'] = {
                    'blended_sss': round(blended_sss, 2),
                    'ml_prediction': round(ml_prediction.prediction, 2),
                    'ml_confidence': round(ml_prediction.confidence, 3),
                    'blend_weight': ml_weight
                }
                
            except Exception as e:
                logger.error(f"ML prediction failed: {e}")
                base_result['ml_enhanced'] = {'error': str(e)}
        
        return base_result
    
    def ml_breakout_probability(self, sss: float, velocity: float, sentiment: float,
                              anchor: float, timeframe: int = 7,
                              market_context: Optional[MarketContext] = None) -> Dict:
        """Enhanced breakout probability with ML ensemble"""
        
        # Base enhanced probability
        base_result = self.enhanced_engine.enhanced_breakout_probability(
            sss, velocity, sentiment, anchor, timeframe, market_context
        )
        
        # Add ML ensemble predictions
        if self.ml_trained:
            try:
                # ML features for breakout prediction
                ml_features = {
                    'behavioral_activity': sss / 100,
                    'velocity_anomaly': velocity / 2,
                    'community_cohesion': sentiment / 5,
                    'anchor_pressure': anchor,
                    'hype_to_hold': (sss / 100) * 0.9,
                    'historical_volatility': 0.5,
                    'volume_spike': velocity,
                    'social_sentiment': sentiment,
                    'whale_activity': 0.4,
                    'market_correlation': 0.6,
                    'technical_momentum': sss / 100,
                    'news_sentiment': 0.0,
                    'rsi': 50 + (sss - 50) * 0.5,
                    'macd_signal': (velocity - 1) * 0.1
                }
                
                ml_prediction = self.ml_engine.predict_ensemble(ml_features)
                
                # Advanced ensemble weighting
                traditional_weight = 0.6
                ml_weight = 0.4
                
                # Adjust weights based on confidence
                if ml_prediction.confidence > 0.8:
                    ml_weight = 0.5
                    traditional_weight = 0.5
                
                final_probability = (
                    base_result['ensemble_probability'] * traditional_weight +
                    ml_prediction.prediction * ml_weight
                )
                
                base_result['ml_ensemble'] = {
                    'final_probability': round(final_probability, 2),
                    'ml_probability': round(ml_prediction.prediction, 2),
                    'traditional_probability': base_result['ensemble_probability'],
                    'ml_confidence': round(ml_prediction.confidence, 3),
                    'weighting': {'traditional': traditional_weight, 'ml': ml_weight}
                }
                
                # Update main prediction
                base_result['ensemble_probability'] = round(final_probability, 2)
                
            except Exception as e:
                logger.error(f"ML ensemble failed: {e}")
                base_result['ml_ensemble'] = {'error': str(e)}
        
        return base_result
    
    def time_series_forecast(self, historical_data: List[Dict], forecast_steps: int = 7) -> Dict:
        """Generate time series forecasts using LSTM models"""
        
        if not self.lstm_trained:
            return {'error': 'LSTM models not trained yet'}
        
        try:
            # Convert historical data to DataFrame format
            import pandas as pd
            
            # Mock recent data for demonstration
            recent_data = pd.DataFrame({
                'behavioral_activity': [d.get('behavioral_activity', 0.5) for d in historical_data[-50:]],
                'velocity_anomaly': [d.get('velocity_anomaly', 0.5) for d in historical_data[-50:]],
                'community_cohesion': [d.get('community_cohesion', 0.5) for d in historical_data[-50:]],
                'anchor_pressure': [d.get('anchor_pressure', 0.5) for d in historical_data[-50:]],
                'hype_to_hold': [d.get('hype_to_hold', 0.5) for d in historical_data[-50:]],
                'historical_volatility': [d.get('historical_volatility', 0.5) for d in historical_data[-50:]],
                'rsi': [50.0] * len(historical_data[-50:]),
                'macd': [0.0] * len(historical_data[-50:]),
                'social_sentiment': [3.0] * len(historical_data[-50:]),
                'news_sentiment': [0.0] * len(historical_data[-50:])
            })
            
            feature_columns = [
                'behavioral_activity', 'velocity_anomaly', 'community_cohesion',
                'anchor_pressure', 'hype_to_hold', 'historical_volatility',
                'rsi', 'macd', 'social_sentiment', 'news_sentiment'
            ]
            
            # Generate predictions
            predictions = self.lstm_engine.predict_time_series(recent_data, feature_columns, forecast_steps)
            
            # Format results
            forecast_result = {
                'timestamp': datetime.now().isoformat(),
                'forecast_steps': forecast_steps,
                'lstm_predictions': predictions.get('predictions', {}),
                'confidence_level': 'medium',
                'model_status': 'active'
            }
            
            return forecast_result
            
        except Exception as e:
            logger.error(f"Time series forecast failed: {e}")
            return {'error': str(e)}
    
    def adaptive_learning_update(self, prediction_results: List[Dict]) -> Dict:
        """Update models based on prediction outcomes"""
        
        update_report = {
            'timestamp': datetime.now().isoformat(),
            'updates_processed': len(prediction_results),
            'model_updates': {}
        }
        
        # Track performance
        for result in prediction_results:
            if 'prediction' in result and 'actual_outcome' in result:
                self.enhanced_engine.update_model_performance(
                    result['prediction'],
                    result['actual_outcome'],
                    result.get('timeframe', 7)
                )
        
        # Check if retraining is needed
        if len(prediction_results) >= 10:  # Minimum batch size
            try:
                # Convert results to training data format
                import pandas as pd
                
                new_data_rows = []
                for result in prediction_results:
                    if all(key in result for key in ['features', 'actual_outcome']):
                        row = result['features'].copy()
                        row['breakout_success'] = 1 if result['actual_outcome'] else 0
                        new_data_rows.append(row)
                
                if new_data_rows:
                    new_data = pd.DataFrame(new_data_rows)
                    
                    # Adaptive retraining
                    if self.ml_trained:
                        retrain_result = self.ml_engine.adaptive_retrain(new_data)
                        update_report['model_updates']['ml_ensemble'] = retrain_result
                    
                    update_report['adaptive_learning'] = 'active'
                else:
                    update_report['adaptive_learning'] = 'insufficient_data'
                    
            except Exception as e:
                logger.error(f"Adaptive learning update failed: {e}")
                update_report['model_updates']['error'] = str(e)
        
        return update_report
    
    def comprehensive_analysis(self, token_data: Dict) -> Dict:
        """Comprehensive analysis combining all ML models"""
        
        analysis = {
            'timestamp': datetime.now().isoformat(),
            'token': token_data.get('symbol', 'UNKNOWN'),
            'analysis_components': {}
        }
        
        # Extract metrics
        metrics = {
            'behavioral_activity': token_data.get('behavioral_activity', 0.5),
            'velocity_anomaly': token_data.get('velocity_anomaly', 0.5),
            'community_cohesion': token_data.get('community_cohesion', 0.5),
            'anchor_pressure': token_data.get('anchor_pressure', 0.5),
            'hype_to_hold': token_data.get('hype_to_hold', 0.5),
            'historical_volatility': token_data.get('historical_volatility', 0.5)
        }
        
        # Market context
        market_context = MarketContext(
            volatility_regime='medium',
            trend_direction='bullish',
            risk_sentiment=0.6,
            correlation_strength=0.7,
            volume_profile='increasing'
        )
        
        # Enhanced SSS with ML
        sss_result = self.enhanced_sss_calculation(metrics, market_context)
        analysis['analysis_components']['enhanced_sss'] = sss_result
        
        # ML-enhanced breakout probability
        probability_result = self.ml_breakout_probability(
            sss_result['sss'],
            token_data.get('velocity', 1.0),
            token_data.get('sentiment', 3.0),
            token_data.get('anchor_pressure', 0.5),
            7,
            market_context
        )
        analysis['analysis_components']['breakout_probability'] = probability_result
        
        # Time series forecast (if historical data available)
        if 'historical_data' in token_data:
            forecast_result = self.time_series_forecast(token_data['historical_data'])
            analysis['analysis_components']['time_series_forecast'] = forecast_result
        
        # Generate final recommendation
        final_sss = sss_result.get('ml_enhanced', {}).get('blended_sss', sss_result['sss'])
        final_probability = probability_result['ensemble_probability']
        
        # Decision logic
        if final_sss >= 80 and final_probability >= 75:
            recommendation = 'STRONG_BUY'
            confidence = 'HIGH'
        elif final_sss >= 70 and final_probability >= 60:
            recommendation = 'BUY'
            confidence = 'MEDIUM_HIGH'
        elif final_sss >= 60 and final_probability >= 50:
            recommendation = 'ACCUMULATE'
            confidence = 'MEDIUM'
        elif final_sss >= 45:
            recommendation = 'WATCHLIST'
            confidence = 'LOW_MEDIUM'
        else:
            recommendation = 'AVOID'
            confidence = 'LOW'
        
        analysis['final_recommendation'] = {
            'action': recommendation,
            'confidence': confidence,
            'final_sss': final_sss,
            'final_probability': final_probability,
            'reasoning': [
                f"ML-enhanced SSS score: {final_sss}",
                f"Ensemble breakout probability: {final_probability}%",
                f"Market context: {market_context.trend_direction} trend with {market_context.volatility_regime} volatility"
            ]
        }
        
        return analysis
    
    def get_ml_status(self) -> Dict:
        """Get status of all ML components"""
        
        status = {
            'timestamp': datetime.now().isoformat(),
            'ml_ensemble': {
                'trained': self.ml_trained,
                'status': 'active' if self.ml_trained else 'not_trained'
            },
            'lstm_models': {
                'trained': self.lstm_trained,
                'status': 'active' if self.lstm_trained else 'not_trained'
            },
            'enhanced_algorithm': {
                'status': 'active',
                'version': '2.0'
            }
        }
        
        if self.ml_trained:
            performance_report = self.ml_engine.get_model_performance_report()
            status['ml_ensemble'].update({
                'best_model': performance_report.get('best_model', {}),
                'average_accuracy': performance_report.get('average_performance', {}).get('accuracy_percentage', 0)
            })
        
        if self.lstm_trained:
            model_summary = self.lstm_engine.get_model_summary()
            status['lstm_models'].update({
                'total_models': model_summary.get('total_models', 0),
                'sequence_length': model_summary.get('sequence_length', 30)
            })
        
        return status

def demonstrate_ml_integration():
    """Demonstrate full ML integration capabilities"""
    
    print("🤖 ML INTEGRATION DEMONSTRATION")
    print("=" * 60)
    
    # Initialize integrated engine
    ml_integrated = MLIntegratedEngine()
    
    print("🚀 Initializing ML Models...")
    init_report = ml_integrated.initialize_ml_models()
    
    print(f"✓ ML Ensemble: {init_report['components']['ml_ensemble']['status']}")
    print(f"✓ LSTM Models: {init_report['components']['lstm_models']['status']}")
    print()
    
    # Test comprehensive analysis
    print("🔍 Testing Comprehensive Analysis...")
    
    test_tokens = [
        {
            'symbol': 'SOL',
            'behavioral_activity': 0.85,
            'velocity_anomaly': 1.4,
            'community_cohesion': 0.75,
            'anchor_pressure': 0.7,
            'hype_to_hold': 0.8,
            'historical_volatility': 0.4,
            'velocity': 1.4,
            'sentiment': 4.2
        },
        {
            'symbol': 'ETH',
            'behavioral_activity': 0.7,
            'velocity_anomaly': 1.1,
            'community_cohesion': 0.68,
            'anchor_pressure': 0.65,
            'hype_to_hold': 0.6,
            'historical_volatility': 0.35,
            'velocity': 1.1,
            'sentiment': 3.6
        }
    ]
    
    for token in test_tokens:
        analysis = ml_integrated.comprehensive_analysis(token)
        recommendation = analysis['final_recommendation']
        
        print(f"\n{token['symbol']} Analysis:")
        print(f"  Action: {recommendation['action']}")
        print(f"  Confidence: {recommendation['confidence']}")
        print(f"  Final SSS: {recommendation['final_sss']}")
        print(f"  Probability: {recommendation['final_probability']}%")
    
    # Status report
    print(f"\n📊 ML Integration Status:")
    status = ml_integrated.get_ml_status()
    print(f"  ML Ensemble: {status['ml_ensemble']['status']}")
    print(f"  LSTM Models: {status['lstm_models']['status']}")
    print(f"  Enhanced Algorithm: {status['enhanced_algorithm']['version']}")
    
    return ml_integrated

if __name__ == "__main__":
    engine = demonstrate_ml_integration()
    print("\n✅ ML Integration demonstration complete!")