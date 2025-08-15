#!/usr/bin/env python3
"""
Machine Learning Models for Silent Surge Engine
Advanced ML capabilities including LSTM, XGBoost, and ensemble models
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Union
import logging
import json
import pickle
import os
from dataclasses import dataclass

# ML Libraries
try:
    from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
    from sklearn.model_selection import train_test_split, cross_val_score
    from sklearn.preprocessing import StandardScaler, MinMaxScaler
    from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
    from sklearn.linear_model import LinearRegression, Ridge, Lasso
    import xgboost as xgb
    import lightgbm as lgb
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logging.warning("Scikit-learn not available, using fallback models")

try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    logging.warning("TensorFlow not available, using alternative models")

logger = logging.getLogger(__name__)

@dataclass
class ModelPrediction:
    """Structured prediction result from ML models"""
    prediction: float
    confidence: float
    model_name: str
    features_used: List[str]
    timestamp: datetime

class MLModelEngine:
    """Advanced Machine Learning Engine for Silent Surge predictions"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.feature_importance = {}
        self.model_performance = {}
        self.training_history = []
        
        # Initialize models
        self._initialize_models()
        
        # Generate synthetic training data for demonstration
        self.training_data = self._generate_training_data()
        
    def _initialize_models(self):
        """Initialize all ML models"""
        
        if SKLEARN_AVAILABLE:
            self.models['random_forest'] = RandomForestRegressor(
                n_estimators=100, random_state=42, max_depth=10
            )
            self.models['gradient_boost'] = GradientBoostingRegressor(
                n_estimators=100, random_state=42, learning_rate=0.1
            )
            self.models['linear_ridge'] = Ridge(alpha=1.0)
            self.models['xgboost'] = xgb.XGBRegressor(
                n_estimators=100, random_state=42, learning_rate=0.1
            )
            self.models['lightgbm'] = lgb.LGBMRegressor(
                n_estimators=100, random_state=42, learning_rate=0.1, verbose=-1
            )
            
            # Scalers for different models
            self.scalers['standard'] = StandardScaler()
            self.scalers['minmax'] = MinMaxScaler()
        
        # Fallback models if sklearn not available
        else:
            self.models['fallback_linear'] = self._create_fallback_model()
    
    def _create_fallback_model(self):
        """Create simple fallback model when ML libraries unavailable"""
        class FallbackModel:
            def __init__(self):
                self.weights = np.random.normal(0, 0.1, 10)
                self.bias = 0.5
            
            def fit(self, X, y):
                # Simple linear regression using normal equations
                X_with_bias = np.column_stack([np.ones(len(X)), X])
                try:
                    self.weights = np.linalg.lstsq(X_with_bias, y, rcond=None)[0]
                except:
                    self.weights = np.random.normal(0, 0.1, X.shape[1] + 1)
            
            def predict(self, X):
                X_with_bias = np.column_stack([np.ones(len(X)), X])
                return X_with_bias @ self.weights
        
        return FallbackModel()
    
    def _generate_training_data(self, n_samples: int = 1000) -> pd.DataFrame:
        """Generate comprehensive training data for ML models"""
        
        np.random.seed(42)
        
        # Feature generation based on crypto market dynamics
        data = {
            'behavioral_activity': np.random.beta(2, 2, n_samples),
            'velocity_anomaly': np.random.gamma(2, 0.5, n_samples),
            'community_cohesion': np.random.beta(3, 2, n_samples),
            'anchor_pressure': np.random.beta(2, 3, n_samples),
            'hype_to_hold': np.random.beta(2, 2, n_samples),
            'historical_volatility': np.random.beta(2, 3, n_samples),
            'volume_spike': np.random.exponential(0.5, n_samples),
            'social_sentiment': np.random.normal(3, 0.8, n_samples),
            'whale_activity': np.random.exponential(0.3, n_samples),
            'market_correlation': np.random.beta(3, 2, n_samples),
            'technical_momentum': np.random.beta(2, 2, n_samples),
            'news_sentiment': np.random.normal(0, 1, n_samples),
            'trading_volume_24h': np.random.lognormal(15, 1.5, n_samples),
            'price_change_7d': np.random.normal(0, 0.3, n_samples),
            'rsi': np.random.beta(2, 2, n_samples) * 100,
            'macd_signal': np.random.normal(0, 0.1, n_samples)
        }
        
        df = pd.DataFrame(data)
        
        # Create realistic target variables
        # SSS Score (0-100)
        df['sss_score'] = (
            df['behavioral_activity'] * 25 +
            df['velocity_anomaly'] * 20 +
            df['community_cohesion'] * 15 +
            df['anchor_pressure'] * 15 +
            df['hype_to_hold'] * 15 +
            df['historical_volatility'] * 10 +
            np.random.normal(0, 5, n_samples)
        ).clip(0, 100)
        
        # Breakout Probability (0-100)
        df['breakout_probability'] = (
            df['sss_score'] * 0.4 +
            df['volume_spike'] * 20 +
            df['social_sentiment'] * 8 +
            df['technical_momentum'] * 25 +
            df['whale_activity'] * 15 +
            np.random.normal(0, 8, n_samples)
        ).clip(0, 100)
        
        # Price Movement (actual outcome, -50% to +200%)
        df['price_movement'] = (
            np.log1p(df['breakout_probability'] / 100) * 50 +
            df['market_correlation'] * 30 +
            df['news_sentiment'] * 10 +
            np.random.normal(0, 20, n_samples)
        ).clip(-50, 200)
        
        # Binary success indicator (1 if price_movement > 10%)
        df['breakout_success'] = (df['price_movement'] > 10).astype(int)
        
        return df
    
    def train_models(self, target_variable: str = 'breakout_probability') -> Dict:
        """Train all ML models on the generated dataset"""
        
        logger.info(f"Training ML models for target: {target_variable}")
        
        # Prepare features and target
        feature_columns = [
            'behavioral_activity', 'velocity_anomaly', 'community_cohesion',
            'anchor_pressure', 'hype_to_hold', 'historical_volatility',
            'volume_spike', 'social_sentiment', 'whale_activity',
            'market_correlation', 'technical_momentum', 'news_sentiment',
            'rsi', 'macd_signal'
        ]
        
        X = self.training_data[feature_columns].values
        y = self.training_data[target_variable].values
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        if SKLEARN_AVAILABLE:
            X_train_scaled = self.scalers['standard'].fit_transform(X_train)
            X_test_scaled = self.scalers['standard'].transform(X_test)
        else:
            X_train_scaled = X_train
            X_test_scaled = X_test
        
        training_results = {
            'timestamp': datetime.now().isoformat(),
            'target_variable': target_variable,
            'n_samples': len(X),
            'n_features': len(feature_columns),
            'model_performance': {}
        }
        
        # Train each model
        for model_name, model in self.models.items():
            try:
                logger.info(f"Training {model_name}...")
                
                # Use scaled or unscaled data based on model type
                if model_name in ['linear_ridge', 'fallback_linear']:
                    model.fit(X_train_scaled, y_train)
                    y_pred = model.predict(X_test_scaled)
                else:
                    model.fit(X_train, y_train)
                    y_pred = model.predict(X_test)
                
                # Calculate metrics
                mse = np.mean((y_test - y_pred) ** 2)
                mae = np.mean(np.abs(y_test - y_pred))
                r2 = max(0, 1 - (np.sum((y_test - y_pred) ** 2) / np.sum((y_test - np.mean(y_test)) ** 2)))
                
                # Store performance
                self.model_performance[model_name] = {
                    'mse': mse,
                    'mae': mae,
                    'r2_score': r2,
                    'accuracy_percentage': max(0, r2 * 100)
                }
                
                training_results['model_performance'][model_name] = self.model_performance[model_name]
                
                # Feature importance (for tree-based models)
                if hasattr(model, 'feature_importances_'):
                    self.feature_importance[model_name] = dict(
                        zip(feature_columns, model.feature_importances_)
                    )
                
                logger.info(f"{model_name} - R²: {r2:.3f}, MAE: {mae:.2f}")
                
            except Exception as e:
                logger.error(f"Error training {model_name}: {e}")
                training_results['model_performance'][model_name] = {'error': str(e)}
        
        # Train LSTM model if TensorFlow available
        if TENSORFLOW_AVAILABLE:
            lstm_performance = self._train_lstm_model(X_train_scaled, y_train, X_test_scaled, y_test)
            training_results['model_performance']['lstm'] = lstm_performance
        
        # Store training history
        self.training_history.append(training_results)
        
        # Save models
        self._save_models()
        
        return training_results
    
    def _train_lstm_model(self, X_train, y_train, X_test, y_test) -> Dict:
        """Train LSTM neural network model"""
        
        try:
            # Reshape data for LSTM (samples, timesteps, features)
            X_train_lstm = X_train.reshape((X_train.shape[0], 1, X_train.shape[1]))
            X_test_lstm = X_test.reshape((X_test.shape[0], 1, X_test.shape[1]))
            
            # Build LSTM model
            model = keras.Sequential([
                layers.LSTM(50, return_sequences=True, input_shape=(1, X_train.shape[1])),
                layers.Dropout(0.2),
                layers.LSTM(50, return_sequences=False),
                layers.Dropout(0.2),
                layers.Dense(25),
                layers.Dense(1)
            ])
            
            model.compile(optimizer='adam', loss='mse', metrics=['mae'])
            
            # Train model
            history = model.fit(
                X_train_lstm, y_train,
                epochs=50,
                batch_size=32,
                validation_split=0.2,
                verbose=0
            )
            
            # Evaluate
            y_pred = model.predict(X_test_lstm, verbose=0).flatten()
            
            mse = np.mean((y_test - y_pred) ** 2)
            mae = np.mean(np.abs(y_test - y_pred))
            r2 = max(0, 1 - (np.sum((y_test - y_pred) ** 2) / np.sum((y_test - np.mean(y_test)) ** 2)))
            
            # Store LSTM model
            self.models['lstm'] = model
            
            return {
                'mse': float(mse),
                'mae': float(mae),
                'r2_score': float(r2),
                'accuracy_percentage': float(max(0, r2 * 100)),
                'training_epochs': 50
            }
            
        except Exception as e:
            logger.error(f"Error training LSTM: {e}")
            return {'error': str(e)}
    
    def predict_ensemble(self, features: Dict) -> ModelPrediction:
        """Generate ensemble prediction from all trained models"""
        
        # Prepare feature vector
        feature_order = [
            'behavioral_activity', 'velocity_anomaly', 'community_cohesion',
            'anchor_pressure', 'hype_to_hold', 'historical_volatility',
            'volume_spike', 'social_sentiment', 'whale_activity',
            'market_correlation', 'technical_momentum', 'news_sentiment',
            'rsi', 'macd_signal'
        ]
        
        # Fill missing features with defaults
        feature_vector = []
        for feature in feature_order:
            if feature in features:
                feature_vector.append(features[feature])
            else:
                # Default values for missing features
                defaults = {
                    'volume_spike': 0.5, 'social_sentiment': 3.0, 'whale_activity': 0.3,
                    'market_correlation': 0.6, 'technical_momentum': 0.5, 'news_sentiment': 0.0,
                    'rsi': 50.0, 'macd_signal': 0.0
                }
                feature_vector.append(defaults.get(feature, 0.5))
        
        X = np.array([feature_vector])
        
        # Get predictions from all models
        predictions = []
        confidences = []
        
        for model_name, model in self.models.items():
            try:
                if model_name in ['linear_ridge', 'fallback_linear'] and SKLEARN_AVAILABLE:
                    X_scaled = self.scalers['standard'].transform(X)
                    pred = model.predict(X_scaled)[0]
                elif model_name == 'lstm' and TENSORFLOW_AVAILABLE:
                    X_scaled = self.scalers['standard'].transform(X)
                    X_lstm = X_scaled.reshape((1, 1, X_scaled.shape[1]))
                    pred = model.predict(X_lstm, verbose=0)[0][0]
                else:
                    pred = model.predict(X)[0]
                
                predictions.append(pred)
                
                # Calculate confidence based on model performance
                model_r2 = self.model_performance.get(model_name, {}).get('r2_score', 0.5)
                confidences.append(model_r2)
                
            except Exception as e:
                logger.error(f"Error predicting with {model_name}: {e}")
        
        if not predictions:
            # Fallback prediction
            return ModelPrediction(
                prediction=50.0,
                confidence=0.3,
                model_name='fallback',
                features_used=feature_order,
                timestamp=datetime.now()
            )
        
        # Weighted ensemble based on model confidence
        weights = np.array(confidences) / np.sum(confidences) if np.sum(confidences) > 0 else np.ones(len(predictions)) / len(predictions)
        ensemble_prediction = np.average(predictions, weights=weights)
        ensemble_confidence = np.mean(confidences)
        
        return ModelPrediction(
            prediction=float(np.clip(ensemble_prediction, 0, 100)),
            confidence=float(ensemble_confidence),
            model_name='ensemble',
            features_used=feature_order,
            timestamp=datetime.now()
        )
    
    def get_feature_importance(self) -> Dict:
        """Get feature importance analysis across all models"""
        
        if not self.feature_importance:
            return {"message": "No feature importance available - train models first"}
        
        # Aggregate feature importance across models
        all_features = set()
        for model_importance in self.feature_importance.values():
            all_features.update(model_importance.keys())
        
        aggregated_importance = {}
        for feature in all_features:
            importances = [
                model_importance.get(feature, 0)
                for model_importance in self.feature_importance.values()
            ]
            aggregated_importance[feature] = np.mean(importances)
        
        # Sort by importance
        sorted_importance = sorted(
            aggregated_importance.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return {
            'aggregated_importance': dict(sorted_importance),
            'by_model': self.feature_importance,
            'top_5_features': [item[0] for item in sorted_importance[:5]]
        }
    
    def get_model_performance_report(self) -> Dict:
        """Generate comprehensive model performance report"""
        
        if not self.model_performance:
            return {"message": "No performance data available - train models first"}
        
        # Find best performing model
        best_model = max(
            self.model_performance.items(),
            key=lambda x: x[1].get('r2_score', 0)
        )
        
        # Calculate average performance
        avg_r2 = np.mean([
            perf.get('r2_score', 0) 
            for perf in self.model_performance.values()
            if 'error' not in perf
        ])
        
        avg_mae = np.mean([
            perf.get('mae', 0)
            for perf in self.model_performance.values()
            if 'error' not in perf
        ])
        
        return {
            'timestamp': datetime.now().isoformat(),
            'best_model': {
                'name': best_model[0],
                'r2_score': best_model[1].get('r2_score', 0),
                'accuracy_percentage': best_model[1].get('accuracy_percentage', 0)
            },
            'average_performance': {
                'r2_score': avg_r2,
                'mae': avg_mae,
                'accuracy_percentage': avg_r2 * 100
            },
            'all_models': self.model_performance,
            'models_trained': len(self.model_performance),
            'training_history_count': len(self.training_history)
        }
    
    def _save_models(self):
        """Save trained models to disk"""
        
        model_dir = 'ml_models'
        os.makedirs(model_dir, exist_ok=True)
        
        try:
            # Save sklearn models
            if SKLEARN_AVAILABLE:
                for model_name, model in self.models.items():
                    if model_name != 'lstm':
                        with open(f'{model_dir}/{model_name}.pkl', 'wb') as f:
                            pickle.dump(model, f)
                
                # Save scalers
                for scaler_name, scaler in self.scalers.items():
                    with open(f'{model_dir}/{scaler_name}_scaler.pkl', 'wb') as f:
                        pickle.dump(scaler, f)
            
            # Save LSTM model
            if 'lstm' in self.models and TENSORFLOW_AVAILABLE:
                self.models['lstm'].save(f'{model_dir}/lstm_model')
            
            # Save metadata
            metadata = {
                'model_performance': self.model_performance,
                'feature_importance': self.feature_importance,
                'training_history': self.training_history
            }
            
            with open(f'{model_dir}/metadata.json', 'w') as f:
                json.dump(metadata, f, indent=2, default=str)
            
            logger.info(f"Models saved to {model_dir}/")
            
        except Exception as e:
            logger.error(f"Error saving models: {e}")
    
    def adaptive_retrain(self, new_data: pd.DataFrame, performance_threshold: float = 0.7):
        """Adaptively retrain models when performance drops"""
        
        current_performance = np.mean([
            perf.get('r2_score', 0)
            for perf in self.model_performance.values()
            if 'error' not in perf
        ])
        
        if current_performance < performance_threshold:
            logger.info(f"Performance below threshold ({current_performance:.3f} < {performance_threshold})")
            logger.info("Initiating adaptive retraining...")
            
            # Combine existing data with new data
            combined_data = pd.concat([self.training_data, new_data], ignore_index=True)
            
            # Keep only recent data (last 2000 samples)
            if len(combined_data) > 2000:
                combined_data = combined_data.tail(2000)
            
            self.training_data = combined_data
            
            # Retrain models
            return self.train_models()
        
        else:
            logger.info(f"Performance acceptable ({current_performance:.3f}), no retraining needed")
            return {"message": "No retraining required", "current_performance": current_performance}

def demonstrate_ml_capabilities():
    """Demonstrate ML capabilities with comprehensive testing"""
    
    print("🤖 MACHINE LEARNING ENGINE DEMONSTRATION")
    print("=" * 60)
    
    # Initialize ML engine
    ml_engine = MLModelEngine()
    
    print(f"📊 Training Data Generated: {len(ml_engine.training_data)} samples")
    print(f"🔧 Models Initialized: {len(ml_engine.models)}")
    print()
    
    # Train models
    print("🚀 Training Models...")
    training_results = ml_engine.train_models('breakout_probability')
    
    print("\n📈 Training Results:")
    print("-" * 40)
    for model_name, performance in training_results['model_performance'].items():
        if 'error' not in performance:
            accuracy = performance.get('accuracy_percentage', 0)
            mae = performance.get('mae', 0)
            print(f"{model_name:15}: {accuracy:6.1f}% accuracy, MAE: {mae:5.1f}")
        else:
            print(f"{model_name:15}: Error - {performance['error']}")
    
    # Feature importance
    print("\n🎯 Feature Importance Analysis:")
    print("-" * 40)
    importance = ml_engine.get_feature_importance()
    if 'top_5_features' in importance:
        for i, feature in enumerate(importance['top_5_features'], 1):
            imp_value = importance['aggregated_importance'][feature]
            print(f"{i}. {feature:20}: {imp_value:.3f}")
    
    # Test predictions
    print("\n🔮 Test Predictions:")
    print("-" * 30)
    
    test_cases = [
        {
            'name': 'High Momentum Token',
            'features': {
                'behavioral_activity': 0.8, 'velocity_anomaly': 1.5, 'community_cohesion': 0.75,
                'anchor_pressure': 0.7, 'hype_to_hold': 0.85, 'historical_volatility': 0.4,
                'volume_spike': 1.2, 'social_sentiment': 4.2, 'technical_momentum': 0.8
            }
        },
        {
            'name': 'Stable Accumulation',
            'features': {
                'behavioral_activity': 0.6, 'velocity_anomaly': 0.8, 'community_cohesion': 0.65,
                'anchor_pressure': 0.6, 'hype_to_hold': 0.5, 'historical_volatility': 0.3,
                'volume_spike': 0.6, 'social_sentiment': 3.2, 'technical_momentum': 0.5
            }
        },
        {
            'name': 'Risky Speculation',
            'features': {
                'behavioral_activity': 0.9, 'velocity_anomaly': 2.0, 'community_cohesion': 0.4,
                'anchor_pressure': 0.3, 'hype_to_hold': 0.95, 'historical_volatility': 0.8,
                'volume_spike': 2.5, 'social_sentiment': 3.8, 'technical_momentum': 0.9
            }
        }
    ]
    
    for test_case in test_cases:
        prediction = ml_engine.predict_ensemble(test_case['features'])
        print(f"{test_case['name']:20}: {prediction.prediction:5.1f}% (confidence: {prediction.confidence:.2f})")
    
    # Performance report
    performance_report = ml_engine.get_model_performance_report()
    print(f"\n🏆 Best Model: {performance_report['best_model']['name']}")
    print(f"   Accuracy: {performance_report['best_model']['accuracy_percentage']:.1f}%")
    print(f"📊 Average Accuracy: {performance_report['average_performance']['accuracy_percentage']:.1f}%")
    
    return ml_engine, training_results

if __name__ == "__main__":
    engine, results = demonstrate_ml_capabilities()
    print(f"\n✅ ML Engine demonstration complete!")
    print(f"🎯 Models trained with average {results.get('average_accuracy', 'N/A')}% accuracy")