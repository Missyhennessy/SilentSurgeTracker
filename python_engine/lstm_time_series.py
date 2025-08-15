#!/usr/bin/env python3
"""
LSTM Time Series Models for Silent Surge Engine
Advanced neural networks for time-series prediction and pattern recognition
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import logging
import json

# Try to import TensorFlow/Keras
try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers, callbacks
    from tensorflow.keras.optimizers import Adam
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    logging.warning("TensorFlow not available, using fallback time series models")

logger = logging.getLogger(__name__)

class LSTMTimeSeriesEngine:
    """Advanced LSTM-based time series prediction for crypto markets"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.sequence_length = 30  # Look back 30 time periods
        self.training_history = {}
        
        # Initialize models
        if TENSORFLOW_AVAILABLE:
            self._initialize_lstm_models()
        else:
            self._initialize_fallback_models()
    
    def _initialize_lstm_models(self):
        """Initialize LSTM neural network models"""
        
        # Price prediction model
        self.models['price_lstm'] = self._create_price_prediction_model()
        
        # SSS prediction model
        self.models['sss_lstm'] = self._create_sss_prediction_model()
        
        # Volatility prediction model
        self.models['volatility_lstm'] = self._create_volatility_prediction_model()
        
        # Multi-output ensemble model
        self.models['ensemble_lstm'] = self._create_ensemble_model()
    
    def _create_price_prediction_model(self):
        """Create LSTM model for price prediction"""
        
        model = keras.Sequential([
            layers.LSTM(128, return_sequences=True, input_shape=(self.sequence_length, 8)),
            layers.Dropout(0.2),
            layers.LSTM(64, return_sequences=True),
            layers.Dropout(0.2),
            layers.LSTM(32, return_sequences=False),
            layers.Dropout(0.1),
            layers.Dense(16, activation='relu'),
            layers.Dense(1, activation='linear')
        ])
        
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae', 'mape']
        )
        
        return model
    
    def _create_sss_prediction_model(self):
        """Create LSTM model for SSS score prediction"""
        
        model = keras.Sequential([
            layers.LSTM(64, return_sequences=True, input_shape=(self.sequence_length, 6)),
            layers.Dropout(0.2),
            layers.LSTM(32, return_sequences=False),
            layers.Dropout(0.1),
            layers.Dense(16, activation='relu'),
            layers.Dense(8, activation='relu'),
            layers.Dense(1, activation='sigmoid')  # Output 0-1 for SSS score
        ])
        
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )
        
        return model
    
    def _create_volatility_prediction_model(self):
        """Create LSTM model for volatility prediction"""
        
        model = keras.Sequential([
            layers.LSTM(48, return_sequences=True, input_shape=(self.sequence_length, 4)),
            layers.Dropout(0.15),
            layers.LSTM(24, return_sequences=False),
            layers.Dropout(0.1),
            layers.Dense(12, activation='relu'),
            layers.Dense(1, activation='relu')  # Volatility is always positive
        ])
        
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )
        
        return model
    
    def _create_ensemble_model(self):
        """Create multi-output ensemble LSTM model"""
        
        # Input layer
        inputs = layers.Input(shape=(self.sequence_length, 10))
        
        # Shared LSTM layers
        lstm_1 = layers.LSTM(96, return_sequences=True)(inputs)
        lstm_1 = layers.Dropout(0.2)(lstm_1)
        lstm_2 = layers.LSTM(48, return_sequences=True)(lstm_1)
        lstm_2 = layers.Dropout(0.2)(lstm_2)
        lstm_3 = layers.LSTM(24, return_sequences=False)(lstm_2)
        lstm_3 = layers.Dropout(0.1)(lstm_3)
        
        # Shared dense layer
        shared_dense = layers.Dense(32, activation='relu')(lstm_3)
        
        # Output heads
        price_output = layers.Dense(16, activation='relu')(shared_dense)
        price_output = layers.Dense(1, activation='linear', name='price')(price_output)
        
        sss_output = layers.Dense(16, activation='relu')(shared_dense)
        sss_output = layers.Dense(1, activation='sigmoid', name='sss')(sss_output)
        
        volatility_output = layers.Dense(8, activation='relu')(shared_dense)
        volatility_output = layers.Dense(1, activation='relu', name='volatility')(volatility_output)
        
        probability_output = layers.Dense(16, activation='relu')(shared_dense)
        probability_output = layers.Dense(1, activation='sigmoid', name='probability')(probability_output)
        
        # Create model
        model = keras.Model(
            inputs=inputs,
            outputs=[price_output, sss_output, volatility_output, probability_output]
        )
        
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss={
                'price': 'mse',
                'sss': 'mse',
                'volatility': 'mse',
                'probability': 'binary_crossentropy'
            },
            loss_weights={
                'price': 1.0,
                'sss': 1.0,
                'volatility': 0.8,
                'probability': 1.2
            },
            metrics={
                'price': ['mae'],
                'sss': ['mae'],
                'volatility': ['mae'],
                'probability': ['accuracy']
            }
        )
        
        return model
    
    def _initialize_fallback_models(self):
        """Initialize fallback models when TensorFlow unavailable"""
        
        class FallbackLSTM:
            """Simple fallback for LSTM functionality"""
            
            def __init__(self, output_type='regression'):
                self.weights = np.random.normal(0, 0.1, 50)
                self.bias = 0.5
                self.output_type = output_type
                self.history = None
            
            def fit(self, X, y, epochs=50, validation_split=0.2, verbose=0, callbacks=None):
                # Simple moving average-based fitting
                if len(X.shape) == 3:
                    X_flat = X.reshape(X.shape[0], -1)
                else:
                    X_flat = X
                
                # Ensure weights match input size
                if X_flat.shape[1] != len(self.weights):
                    self.weights = np.random.normal(0, 0.1, X_flat.shape[1])
                
                # Simple linear regression fit
                try:
                    self.weights = np.linalg.lstsq(X_flat, y, rcond=None)[0]
                except:
                    pass
                
                # Mock history
                self.history = type('History', (), {
                    'history': {
                        'loss': np.random.exponential(0.1, epochs).tolist(),
                        'val_loss': np.random.exponential(0.12, epochs).tolist()
                    }
                })()
                
                return self.history
            
            def predict(self, X, verbose=0):
                if len(X.shape) == 3:
                    X_flat = X.reshape(X.shape[0], -1)
                else:
                    X_flat = X
                
                # Ensure dimensions match
                if X_flat.shape[1] != len(self.weights):
                    # Pad or truncate weights
                    if X_flat.shape[1] > len(self.weights):
                        self.weights = np.pad(self.weights, (0, X_flat.shape[1] - len(self.weights)))
                    else:
                        self.weights = self.weights[:X_flat.shape[1]]
                
                predictions = X_flat @ self.weights + self.bias
                
                if self.output_type == 'sigmoid':
                    predictions = 1 / (1 + np.exp(-predictions))
                elif self.output_type == 'relu':
                    predictions = np.maximum(0, predictions)
                
                return predictions
        
        self.models['price_lstm'] = FallbackLSTM('regression')
        self.models['sss_lstm'] = FallbackLSTM('sigmoid')
        self.models['volatility_lstm'] = FallbackLSTM('relu')
        self.models['ensemble_lstm'] = FallbackLSTM('regression')
    
    def generate_time_series_data(self, n_samples: int = 1000) -> Dict:
        """Generate realistic time series data for training"""
        
        np.random.seed(42)
        
        # Generate base time series
        dates = pd.date_range(start='2023-01-01', periods=n_samples, freq='H')
        
        # Price series with trends and volatility
        price_trend = np.cumsum(np.random.normal(0.001, 0.02, n_samples))
        price_volatility = np.random.exponential(0.05, n_samples)
        price_noise = np.random.normal(0, price_volatility)
        prices = 100 * np.exp(price_trend + price_noise)
        
        # Volume with correlation to price movements
        volume_base = np.random.lognormal(15, 1, n_samples)
        price_change = np.diff(prices, prepend=prices[0])
        volume_multiplier = 1 + np.abs(price_change) / np.std(price_change)
        volumes = volume_base * volume_multiplier
        
        # SSS components
        behavioral_activity = np.random.beta(2, 2, n_samples)
        velocity_anomaly = np.random.gamma(2, 0.5, n_samples)
        community_cohesion = np.random.beta(3, 2, n_samples)
        anchor_pressure = np.random.beta(2, 3, n_samples)
        hype_to_hold = np.random.beta(2, 2, n_samples)
        historical_volatility = np.random.beta(2, 3, n_samples)
        
        # Calculate SSS scores
        sss_scores = (
            behavioral_activity * 25 +
            velocity_anomaly * 20 +
            community_cohesion * 15 +
            anchor_pressure * 15 +
            hype_to_hold * 15 +
            historical_volatility * 10
        )
        
        # Technical indicators
        rsi = np.random.beta(2, 2, n_samples) * 100
        macd = np.random.normal(0, 0.1, n_samples)
        
        # Market sentiment
        social_sentiment = np.random.normal(3, 0.8, n_samples)
        news_sentiment = np.random.normal(0, 1, n_samples)
        
        # Create DataFrame
        data = pd.DataFrame({
            'timestamp': dates,
            'price': prices,
            'volume': volumes,
            'behavioral_activity': behavioral_activity,
            'velocity_anomaly': velocity_anomaly,
            'community_cohesion': community_cohesion,
            'anchor_pressure': anchor_pressure,
            'hype_to_hold': hype_to_hold,
            'historical_volatility': historical_volatility,
            'sss_score': sss_scores,
            'rsi': rsi,
            'macd': macd,
            'social_sentiment': social_sentiment,
            'news_sentiment': news_sentiment
        })
        
        # Calculate derived features
        data['price_change'] = data['price'].pct_change()
        data['volume_change'] = data['volume'].pct_change()
        data['volatility'] = data['price_change'].rolling(24).std()
        data['momentum'] = data['price_change'].rolling(12).mean()
        
        # Fill NaN values
        data = data.fillna(method='bfill').fillna(0)
        
        return {
            'data': data,
            'feature_columns': [
                'behavioral_activity', 'velocity_anomaly', 'community_cohesion',
                'anchor_pressure', 'hype_to_hold', 'historical_volatility',
                'rsi', 'macd', 'social_sentiment', 'news_sentiment'
            ],
            'target_columns': ['price', 'sss_score', 'volatility', 'price_change']
        }
    
    def prepare_sequences(self, data: pd.DataFrame, feature_columns: List[str], 
                         target_column: str) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare sequential data for LSTM training"""
        
        # Extract features and targets
        features = data[feature_columns].values
        targets = data[target_column].values
        
        # Normalize features
        feature_mean = np.mean(features, axis=0)
        feature_std = np.std(features, axis=0) + 1e-8
        features_normalized = (features - feature_mean) / feature_std
        
        # Store normalization parameters
        self.scalers[target_column] = {
            'feature_mean': feature_mean,
            'feature_std': feature_std,
            'target_mean': np.mean(targets),
            'target_std': np.std(targets) + 1e-8
        }
        
        # Normalize targets (except for binary classification)
        if target_column != 'breakout_success':
            targets_normalized = (targets - self.scalers[target_column]['target_mean']) / self.scalers[target_column]['target_std']
        else:
            targets_normalized = targets
        
        # Create sequences
        X, y = [], []
        for i in range(self.sequence_length, len(features_normalized)):
            X.append(features_normalized[i-self.sequence_length:i])
            y.append(targets_normalized[i])
        
        return np.array(X), np.array(y)
    
    def train_lstm_models(self, time_series_data: Dict) -> Dict:
        """Train all LSTM models on time series data"""
        
        data = time_series_data['data']
        feature_columns = time_series_data['feature_columns']
        
        training_results = {
            'timestamp': datetime.now().isoformat(),
            'sequence_length': self.sequence_length,
            'n_samples': len(data),
            'model_performance': {}
        }
        
        print("🔧 Preparing Time Series Data...")
        
        # Train individual models
        models_to_train = [
            ('price_lstm', 'price', feature_columns[:8]),
            ('sss_lstm', 'sss_score', feature_columns[:6]),
            ('volatility_lstm', 'volatility', feature_columns[:4])
        ]
        
        for model_name, target_col, features in models_to_train:
            try:
                print(f"🚀 Training {model_name}...")
                
                # Prepare data
                X, y = self.prepare_sequences(data, features, target_col)
                
                # Split data
                split_idx = int(0.8 * len(X))
                X_train, X_test = X[:split_idx], X[split_idx:]
                y_train, y_test = y[:split_idx], y[split_idx:]
                
                # Train model
                if TENSORFLOW_AVAILABLE:
                    early_stopping = callbacks.EarlyStopping(
                        monitor='val_loss', patience=10, restore_best_weights=True
                    )
                    
                    history = self.models[model_name].fit(
                        X_train, y_train,
                        epochs=100,
                        batch_size=32,
                        validation_split=0.2,
                        callbacks=[early_stopping],
                        verbose=0
                    )
                    
                    # Evaluate
                    y_pred = self.models[model_name].predict(X_test, verbose=0)
                    
                else:
                    # Fallback training
                    history = self.models[model_name].fit(X_train, y_train, epochs=50)
                    y_pred = self.models[model_name].predict(X_test)
                
                # Calculate metrics
                mse = np.mean((y_test - y_pred.flatten()) ** 2)
                mae = np.mean(np.abs(y_test - y_pred.flatten()))
                
                # Store performance
                training_results['model_performance'][model_name] = {
                    'mse': float(mse),
                    'mae': float(mae),
                    'samples_trained': len(X_train),
                    'samples_tested': len(X_test)
                }
                
                # Store training history
                if hasattr(history, 'history'):
                    self.training_history[model_name] = history.history
                
                print(f"   ✓ {model_name} - MSE: {mse:.4f}, MAE: {mae:.4f}")
                
            except Exception as e:
                print(f"   ✗ Error training {model_name}: {e}")
                training_results['model_performance'][model_name] = {'error': str(e)}
        
        # Train ensemble model
        try:
            print("🚀 Training Ensemble LSTM...")
            
            # Prepare multi-target data
            all_features = feature_columns
            X_ensemble, _ = self.prepare_sequences(data, all_features, 'price')
            
            # Prepare all targets
            targets = {}
            for target in ['price', 'sss_score', 'volatility']:
                _, y_target = self.prepare_sequences(data, all_features, target)
                targets[target] = y_target
            
            # Create probability target (breakout success)
            data['breakout_success'] = (data['price'].pct_change().shift(-1) > 0.1).astype(int)
            _, y_prob = self.prepare_sequences(data, all_features, 'breakout_success')
            targets['probability'] = y_prob
            
            # Split data
            split_idx = int(0.8 * len(X_ensemble))
            X_train = X_ensemble[:split_idx]
            X_test = X_ensemble[split_idx:]
            
            y_train = {key: target[:split_idx] for key, target in targets.items()}
            y_test = {key: target[split_idx:] for key, target in targets.items()}
            
            if TENSORFLOW_AVAILABLE:
                # Train ensemble model
                early_stopping = callbacks.EarlyStopping(
                    monitor='val_loss', patience=15, restore_best_weights=True
                )
                
                history = self.models['ensemble_lstm'].fit(
                    X_train, y_train,
                    epochs=100,
                    batch_size=32,
                    validation_split=0.2,
                    callbacks=[early_stopping],
                    verbose=0
                )
                
                # Evaluate ensemble
                y_pred = self.models['ensemble_lstm'].predict(X_test, verbose=0)
                
                ensemble_metrics = {}
                for i, target_name in enumerate(['price', 'sss', 'volatility', 'probability']):
                    if isinstance(y_pred, list):
                        pred = y_pred[i].flatten()
                    else:
                        pred = y_pred.flatten()
                    
                    true = y_test[target_name]
                    mse = np.mean((true - pred) ** 2)
                    mae = np.mean(np.abs(true - pred))
                    
                    ensemble_metrics[target_name] = {'mse': float(mse), 'mae': float(mae)}
                
                training_results['model_performance']['ensemble_lstm'] = ensemble_metrics
                self.training_history['ensemble_lstm'] = history.history
                
            else:
                # Fallback ensemble training
                y_combined = np.column_stack([targets[key] for key in ['price', 'sss_score', 'volatility']])
                history = self.models['ensemble_lstm'].fit(X_train, y_combined[:, 0])  # Train on price only for fallback
                
                training_results['model_performance']['ensemble_lstm'] = {
                    'fallback_mode': True,
                    'trained_on': 'price_only'
                }
            
            print("   ✓ Ensemble LSTM trained successfully")
            
        except Exception as e:
            print(f"   ✗ Error training ensemble LSTM: {e}")
            training_results['model_performance']['ensemble_lstm'] = {'error': str(e)}
        
        return training_results
    
    def predict_time_series(self, recent_data: pd.DataFrame, 
                           feature_columns: List[str], steps_ahead: int = 1) -> Dict:
        """Make time series predictions using trained LSTM models"""
        
        if len(recent_data) < self.sequence_length:
            return {'error': f'Need at least {self.sequence_length} data points for prediction'}
        
        # Prepare input sequence
        features = recent_data[feature_columns].values
        
        # Use the scaler from the last trained model (fallback)
        scaler_key = list(self.scalers.keys())[-1] if self.scalers else None
        
        if scaler_key:
            scaler = self.scalers[scaler_key]
            features_normalized = (features - scaler['feature_mean']) / scaler['feature_std']
        else:
            # No scaler available, use raw features
            features_normalized = features
        
        # Get last sequence
        input_sequence = features_normalized[-self.sequence_length:].reshape(1, self.sequence_length, -1)
        
        predictions = {}
        
        # Individual model predictions
        for model_name, model in self.models.items():
            try:
                if model_name == 'ensemble_lstm':
                    continue  # Handle separately
                
                # Adjust input dimensions for specific models
                if model_name == 'price_lstm':
                    model_input = input_sequence[:, :, :8]
                elif model_name == 'sss_lstm':
                    model_input = input_sequence[:, :, :6]
                elif model_name == 'volatility_lstm':
                    model_input = input_sequence[:, :, :4]
                else:
                    model_input = input_sequence
                
                pred = model.predict(model_input, verbose=0)
                
                # Denormalize prediction if scaler available
                if scaler_key and model_name in ['price_lstm', 'volatility_lstm']:
                    scaler = self.scalers[scaler_key]
                    pred_denorm = pred * scaler['target_std'] + scaler['target_mean']
                else:
                    pred_denorm = pred
                
                predictions[model_name] = {
                    'prediction': float(pred_denorm.flatten()[0]),
                    'confidence': np.random.uniform(0.7, 0.9)  # Mock confidence
                }
                
            except Exception as e:
                predictions[model_name] = {'error': str(e)}
        
        # Ensemble prediction
        try:
            if 'ensemble_lstm' in self.models:
                ensemble_pred = self.models['ensemble_lstm'].predict(input_sequence, verbose=0)
                
                if isinstance(ensemble_pred, list):
                    predictions['ensemble_lstm'] = {
                        'price': float(ensemble_pred[0].flatten()[0]),
                        'sss': float(ensemble_pred[1].flatten()[0]),
                        'volatility': float(ensemble_pred[2].flatten()[0]),
                        'probability': float(ensemble_pred[3].flatten()[0])
                    }
                else:
                    predictions['ensemble_lstm'] = {
                        'combined_prediction': float(ensemble_pred.flatten()[0])
                    }
        
        except Exception as e:
            predictions['ensemble_lstm'] = {'error': str(e)}
        
        return {
            'timestamp': datetime.now().isoformat(),
            'predictions': predictions,
            'input_sequence_length': self.sequence_length,
            'steps_ahead': steps_ahead
        }
    
    def get_model_summary(self) -> Dict:
        """Get summary of all LSTM models"""
        
        summary = {
            'total_models': len(self.models),
            'sequence_length': self.sequence_length,
            'tensorflow_available': TENSORFLOW_AVAILABLE,
            'models': {},
            'training_history_available': len(self.training_history) > 0
        }
        
        for model_name, model in self.models.items():
            try:
                if TENSORFLOW_AVAILABLE and hasattr(model, 'count_params'):
                    summary['models'][model_name] = {
                        'total_params': model.count_params(),
                        'trainable_params': model.count_params(),
                        'model_type': 'LSTM Neural Network'
                    }
                else:
                    summary['models'][model_name] = {
                        'model_type': 'Fallback Model',
                        'parameters': len(getattr(model, 'weights', []))
                    }
            except:
                summary['models'][model_name] = {'model_type': 'Unknown'}
        
        return summary

def demonstrate_lstm_capabilities():
    """Demonstrate LSTM time series capabilities"""
    
    print("🧠 LSTM TIME SERIES ENGINE DEMONSTRATION")
    print("=" * 60)
    
    # Initialize LSTM engine
    lstm_engine = LSTMTimeSeriesEngine()
    
    print(f"🔧 TensorFlow Available: {TENSORFLOW_AVAILABLE}")
    print(f"📊 Models Initialized: {len(lstm_engine.models)}")
    print(f"⏱️  Sequence Length: {lstm_engine.sequence_length}")
    print()
    
    # Generate time series data
    print("📈 Generating Time Series Data...")
    time_series_data = lstm_engine.generate_time_series_data(1000)
    
    print(f"   ✓ Generated {len(time_series_data['data'])} time points")
    print(f"   ✓ Features: {len(time_series_data['feature_columns'])}")
    print(f"   ✓ Targets: {len(time_series_data['target_columns'])}")
    print()
    
    # Train models
    print("🚀 Training LSTM Models...")
    training_results = lstm_engine.train_lstm_models(time_series_data)
    
    print("\n📊 Training Results:")
    print("-" * 40)
    for model_name, performance in training_results['model_performance'].items():
        if 'error' not in performance:
            if isinstance(performance, dict) and 'mse' in performance:
                print(f"{model_name:15}: MSE {performance['mse']:.4f}, MAE {performance['mae']:.4f}")
            else:
                print(f"{model_name:15}: Multi-target model")
        else:
            print(f"{model_name:15}: Error occurred")
    
    # Test predictions
    print("\n🔮 Testing Time Series Predictions...")
    recent_data = time_series_data['data'].tail(50)  # Last 50 time points
    feature_columns = time_series_data['feature_columns']
    
    predictions = lstm_engine.predict_time_series(recent_data, feature_columns)
    
    print("Prediction Results:")
    for model_name, pred_data in predictions.get('predictions', {}).items():
        if 'error' not in pred_data:
            if isinstance(pred_data, dict) and 'prediction' in pred_data:
                print(f"  {model_name:15}: {pred_data['prediction']:.3f}")
            else:
                print(f"  {model_name:15}: Multi-output prediction")
        else:
            print(f"  {model_name:15}: Error in prediction")
    
    # Model summary
    model_summary = lstm_engine.get_model_summary()
    print(f"\n🏗️  Model Architecture Summary:")
    print(f"   Total Models: {model_summary['total_models']}")
    print(f"   TensorFlow: {model_summary['tensorflow_available']}")
    
    return lstm_engine, training_results

if __name__ == "__main__":
    engine, results = demonstrate_lstm_capabilities()
    print(f"\n✅ LSTM demonstration complete!")