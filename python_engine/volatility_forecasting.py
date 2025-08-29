#!/usr/bin/env python3
"""
Cryptocurrency Volatility Forecasting Engine
Advanced volatility prediction using GARCH models, historical analysis, and ML
"""

import numpy as np
import pandas as pd
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging
from dataclasses import dataclass
import math

logger = logging.getLogger(__name__)

@dataclass
class VolatilityForecast:
    """Structured volatility forecast result"""
    symbol: str
    current_volatility: float
    predicted_volatility_1d: float
    predicted_volatility_7d: float
    predicted_volatility_30d: float
    volatility_regime: str  # low, medium, high, extreme
    confidence: float
    var_95: float  # Value at Risk 95%
    var_99: float  # Value at Risk 99%
    expected_shortfall: float
    volatility_trend: str  # increasing, decreasing, stable
    risk_metrics: Dict

class CryptoVolatilityForecaster:
    """Advanced cryptocurrency volatility forecasting engine"""
    
    def __init__(self):
        # Volatility regime thresholds (annualized)
        self.volatility_regimes = {
            'low': 0.3,      # < 30% annual volatility
            'medium': 0.6,   # 30-60% annual volatility  
            'high': 1.0,     # 60-100% annual volatility
            'extreme': 1.0   # > 100% annual volatility
        }
        
        # GARCH model parameters
        self.garch_params = {
            'omega': 0.0001,    # Long-term volatility
            'alpha': 0.1,       # ARCH effect
            'beta': 0.85,       # GARCH effect
            'lambda': 0.94      # RiskMetrics decay factor
        }
        
        # Volatility clustering parameters
        self.clustering_memory = 0.9  # How long volatility clusters persist
        
    def forecast_volatility(self, symbol: str, price_data: List[float] = None, 
                          returns_data: List[float] = None) -> VolatilityForecast:
        """Comprehensive volatility forecasting for a cryptocurrency"""
        
        try:
            # Generate realistic price data if not provided
            if price_data is None:
                price_data = self._generate_realistic_price_data(symbol)
            
            # Calculate returns if not provided
            if returns_data is None:
                returns_data = self._calculate_returns(price_data)
            
            # Calculate current volatility metrics
            current_vol = self._calculate_current_volatility(returns_data)
            
            # GARCH volatility forecast
            garch_forecast = self._garch_volatility_forecast(returns_data)
            
            # Exponential smoothing forecast
            ewma_forecast = self._ewma_volatility_forecast(returns_data)
            
            # Historical volatility-based forecast
            hist_forecast = self._historical_volatility_forecast(returns_data)
            
            # Ensemble forecast (weighted combination)
            ensemble_forecast = self._create_ensemble_forecast(
                garch_forecast, ewma_forecast, hist_forecast
            )
            
            # Determine volatility regime
            vol_regime = self._classify_volatility_regime(current_vol)
            
            # Calculate VaR and Expected Shortfall
            var_metrics = self._calculate_var_metrics(returns_data, current_vol)
            
            # Assess volatility trend
            vol_trend = self._assess_volatility_trend(returns_data)
            
            # Calculate comprehensive risk metrics
            risk_metrics = self._calculate_risk_metrics(returns_data, current_vol)
            
            # Calculate forecast confidence
            confidence = self._calculate_forecast_confidence(returns_data, vol_regime)
            
            return VolatilityForecast(
                symbol=symbol.upper(),
                current_volatility=round(current_vol * 100, 2),  # Convert to percentage
                predicted_volatility_1d=round(ensemble_forecast['1d'] * 100, 2),
                predicted_volatility_7d=round(ensemble_forecast['7d'] * 100, 2),
                predicted_volatility_30d=round(ensemble_forecast['30d'] * 100, 2),
                volatility_regime=vol_regime,
                confidence=round(confidence, 3),
                var_95=round(var_metrics['var_95'] * 100, 2),
                var_99=round(var_metrics['var_99'] * 100, 2),
                expected_shortfall=round(var_metrics['expected_shortfall'] * 100, 2),
                volatility_trend=vol_trend,
                risk_metrics=risk_metrics
            )
            
        except Exception as e:
            logger.error(f"Volatility forecasting error for {symbol}: {e}")
            return self._create_default_forecast(symbol)
    
    def _generate_realistic_price_data(self, symbol: str, days: int = 90) -> List[float]:
        """Generate realistic cryptocurrency price data for testing"""
        
        # Base parameters for different crypto types
        if symbol.upper() in ['BTC', 'ETH']:
            base_price = 50000 if symbol.upper() == 'BTC' else 3000
            daily_vol = 0.04  # 4% daily volatility
        elif symbol.upper() in ['SOL', 'ADA', 'DOT']:
            base_price = 100
            daily_vol = 0.06  # 6% daily volatility
        else:  # Altcoins/meme coins
            base_price = 1
            daily_vol = 0.08  # 8% daily volatility
        
        # Generate price series with volatility clustering
        prices = [base_price]
        vol_state = daily_vol
        
        for i in range(days):
            # Volatility clustering - volatility persists
            vol_state = vol_state * self.clustering_memory + daily_vol * (1 - self.clustering_memory)
            
            # Add occasional volatility spikes
            if np.random.random() < 0.05:  # 5% chance of volatility spike
                vol_state *= np.random.uniform(2, 4)
            
            # Generate return with current volatility state
            return_today = np.random.normal(0, vol_state)
            
            # Apply return to get new price
            new_price = prices[-1] * (1 + return_today)
            prices.append(max(new_price, 0.001))  # Prevent negative prices
        
        return prices
    
    def _calculate_returns(self, prices: List[float]) -> List[float]:
        """Calculate log returns from price series"""
        
        if len(prices) < 2:
            return [0.0]
        
        returns = []
        for i in range(1, len(prices)):
            if prices[i-1] > 0 and prices[i] > 0:
                ret = np.log(prices[i] / prices[i-1])
                returns.append(ret)
            else:
                returns.append(0.0)
        
        return returns
    
    def _calculate_current_volatility(self, returns: List[float], window: int = 30) -> float:
        """Calculate current volatility using recent returns"""
        
        if len(returns) < 2:
            return 0.05  # Default 5% daily volatility
        
        recent_returns = returns[-window:] if len(returns) >= window else returns
        
        # Calculate standard deviation (volatility)
        volatility = np.std(recent_returns) if recent_returns else 0.05
        
        # Annualize volatility (daily to annual)
        annualized_vol = volatility * np.sqrt(252)  # 252 trading days
        
        return max(annualized_vol, 0.01)  # Minimum 1% volatility
    
    def _garch_volatility_forecast(self, returns: List[float]) -> Dict[str, float]:
        """GARCH(1,1) volatility forecasting"""
        
        if len(returns) < 10:
            return {'1d': 0.05, '7d': 0.05, '30d': 0.05}
        
        # Initialize GARCH parameters
        omega = self.garch_params['omega']
        alpha = self.garch_params['alpha']  
        beta = self.garch_params['beta']
        
        # Calculate squared returns
        squared_returns = [r**2 for r in returns]
        
        # Initialize variance series
        variances = [np.var(returns[:10])]  # Start with sample variance
        
        # GARCH variance equation: σ²(t) = ω + α*ε²(t-1) + β*σ²(t-1)
        for i in range(1, len(squared_returns)):
            new_variance = (omega + 
                          alpha * squared_returns[i-1] + 
                          beta * variances[-1])
            variances.append(new_variance)
        
        # Forecast future volatilities
        current_variance = variances[-1]
        current_return_sq = squared_returns[-1]
        
        # 1-day ahead forecast
        vol_1d = np.sqrt(omega + alpha * current_return_sq + beta * current_variance)
        
        # Multi-step forecasts (mean reversion to long-term)
        long_term_var = omega / (1 - alpha - beta)
        
        # 7-day forecast with mean reversion
        vol_7d = np.sqrt(current_variance * (alpha + beta)**7 + 
                        long_term_var * (1 - (alpha + beta)**7))
        
        # 30-day forecast
        vol_30d = np.sqrt(current_variance * (alpha + beta)**30 + 
                         long_term_var * (1 - (alpha + beta)**30))
        
        return {
            '1d': max(vol_1d, 0.001),
            '7d': max(vol_7d, 0.001),
            '30d': max(vol_30d, 0.001)
        }
    
    def _ewma_volatility_forecast(self, returns: List[float]) -> Dict[str, float]:
        """Exponentially Weighted Moving Average volatility forecast"""
        
        if len(returns) < 5:
            return {'1d': 0.05, '7d': 0.05, '30d': 0.05}
        
        lambda_factor = self.garch_params['lambda']
        
        # Calculate EWMA variance
        ewma_var = 0
        weights_sum = 0
        
        for i, ret in enumerate(reversed(returns)):
            weight = lambda_factor ** i
            ewma_var += weight * (ret ** 2)
            weights_sum += weight
            
            # Limit history to prevent numerical issues
            if i > 100:
                break
        
        ewma_var = ewma_var / weights_sum if weights_sum > 0 else np.var(returns)
        ewma_vol = np.sqrt(ewma_var)
        
        # Forecast assumes persistence
        persistence = lambda_factor
        
        return {
            '1d': ewma_vol,
            '7d': ewma_vol * np.sqrt(persistence**7),
            '30d': ewma_vol * np.sqrt(persistence**30)
        }
    
    def _historical_volatility_forecast(self, returns: List[float]) -> Dict[str, float]:
        """Historical volatility-based forecast"""
        
        if len(returns) < 10:
            return {'1d': 0.05, '7d': 0.05, '30d': 0.05}
        
        # Calculate rolling volatilities
        window_sizes = [7, 14, 30, 60]
        rolling_vols = []
        
        for window in window_sizes:
            if len(returns) >= window:
                recent_returns = returns[-window:]
                vol = np.std(recent_returns)
                rolling_vols.append(vol)
        
        if not rolling_vols:
            avg_vol = np.std(returns)
        else:
            avg_vol = np.mean(rolling_vols)
        
        # Simple persistence forecast
        return {
            '1d': avg_vol,
            '7d': avg_vol * 1.05,  # Slight increase for longer horizon
            '30d': avg_vol * 1.10
        }
    
    def _create_ensemble_forecast(self, garch: Dict, ewma: Dict, hist: Dict) -> Dict[str, float]:
        """Create ensemble forecast from multiple models"""
        
        # Weights for different models
        weights = {
            'garch': 0.5,    # GARCH gets highest weight
            'ewma': 0.3,     # EWMA for persistence
            'hist': 0.2      # Historical for baseline
        }
        
        ensemble = {}
        for horizon in ['1d', '7d', '30d']:
            ensemble[horizon] = (
                garch[horizon] * weights['garch'] +
                ewma[horizon] * weights['ewma'] +
                hist[horizon] * weights['hist']
            )
        
        return ensemble
    
    def _classify_volatility_regime(self, current_vol: float) -> str:
        """Classify current volatility regime"""
        
        if current_vol < self.volatility_regimes['low']:
            return 'low'
        elif current_vol < self.volatility_regimes['medium']:
            return 'medium'
        elif current_vol < self.volatility_regimes['high']:
            return 'high'
        else:
            return 'extreme'
    
    def _calculate_var_metrics(self, returns: List[float], current_vol: float) -> Dict:
        """Calculate Value at Risk and Expected Shortfall"""
        
        if len(returns) < 10:
            return {'var_95': 0.05, 'var_99': 0.08, 'expected_shortfall': 0.10}
        
        # Sort returns for quantile calculation
        sorted_returns = sorted(returns)
        n = len(sorted_returns)
        
        # VaR at 95% confidence (5th percentile)
        var_95_idx = int(0.05 * n)
        var_95 = abs(sorted_returns[var_95_idx]) if var_95_idx < n else abs(min(returns))
        
        # VaR at 99% confidence (1st percentile)
        var_99_idx = int(0.01 * n)
        var_99 = abs(sorted_returns[var_99_idx]) if var_99_idx < n else abs(min(returns))
        
        # Expected Shortfall (average of losses beyond VaR 95%)
        tail_losses = [abs(r) for r in sorted_returns[:var_95_idx]] if var_95_idx > 0 else [var_95]
        expected_shortfall = np.mean(tail_losses) if tail_losses else var_95
        
        return {
            'var_95': var_95,
            'var_99': var_99,
            'expected_shortfall': expected_shortfall
        }
    
    def _assess_volatility_trend(self, returns: List[float], window: int = 20) -> str:
        """Assess whether volatility is increasing, decreasing, or stable"""
        
        if len(returns) < window * 2:
            return 'stable'
        
        # Calculate rolling volatilities
        recent_vol = np.std(returns[-window:])
        previous_vol = np.std(returns[-(window*2):-window])
        
        vol_change = (recent_vol - previous_vol) / previous_vol if previous_vol > 0 else 0
        
        if vol_change > 0.2:  # 20% increase
            return 'increasing'
        elif vol_change < -0.2:  # 20% decrease
            return 'decreasing'
        else:
            return 'stable'
    
    def _calculate_risk_metrics(self, returns: List[float], current_vol: float) -> Dict:
        """Calculate comprehensive risk metrics"""
        
        if len(returns) < 5:
            return {'sharpe_ratio': 0, 'max_drawdown': 0, 'skewness': 0, 'kurtosis': 0}
        
        # Sharpe ratio (assuming risk-free rate = 0)
        mean_return = np.mean(returns)
        volatility = np.std(returns)
        sharpe_ratio = mean_return / volatility if volatility > 0 else 0
        
        # Maximum drawdown
        cumulative_returns = np.cumprod([1 + r for r in returns])
        running_max = np.maximum.accumulate(cumulative_returns)
        drawdowns = (cumulative_returns - running_max) / running_max
        max_drawdown = abs(min(drawdowns)) if len(drawdowns) > 0 else 0
        
        # Skewness and Kurtosis
        skewness = self._calculate_skewness(returns)
        kurtosis = self._calculate_kurtosis(returns)
        
        return {
            'sharpe_ratio': round(sharpe_ratio * np.sqrt(252), 3),  # Annualized
            'max_drawdown': round(max_drawdown * 100, 2),  # Percentage
            'skewness': round(skewness, 3),
            'kurtosis': round(kurtosis, 3),
            'volatility_percentile': self._calculate_vol_percentile(current_vol)
        }
    
    def _calculate_skewness(self, returns: List[float]) -> float:
        """Calculate skewness of returns"""
        if len(returns) < 3:
            return 0
        
        mean_ret = np.mean(returns)
        std_ret = np.std(returns)
        
        if std_ret == 0:
            return 0
        
        skew = np.mean([((r - mean_ret) / std_ret)**3 for r in returns])
        return skew
    
    def _calculate_kurtosis(self, returns: List[float]) -> float:
        """Calculate kurtosis of returns"""
        if len(returns) < 4:
            return 3  # Normal distribution kurtosis
        
        mean_ret = np.mean(returns)
        std_ret = np.std(returns)
        
        if std_ret == 0:
            return 3
        
        kurt = np.mean([((r - mean_ret) / std_ret)**4 for r in returns])
        return kurt
    
    def _calculate_vol_percentile(self, current_vol: float) -> float:
        """Calculate where current volatility stands historically"""
        
        # Typical crypto volatility ranges (annualized)
        crypto_vol_distribution = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.5, 2.0]
        
        percentile = sum(1 for vol in crypto_vol_distribution if current_vol > vol)
        return (percentile / len(crypto_vol_distribution)) * 100
    
    def _calculate_forecast_confidence(self, returns: List[float], vol_regime: str) -> float:
        """Calculate confidence in volatility forecast"""
        
        base_confidence = 0.7
        
        # Adjust based on data quality
        if len(returns) > 100:
            base_confidence += 0.1
        elif len(returns) < 30:
            base_confidence -= 0.2
        
        # Adjust based on volatility regime
        regime_adjustments = {
            'low': 0.1,      # More predictable
            'medium': 0.0,   # Baseline
            'high': -0.1,    # Less predictable
            'extreme': -0.2  # Very unpredictable
        }
        
        base_confidence += regime_adjustments.get(vol_regime, 0)
        
        # Adjust based on return characteristics
        if len(returns) > 10:
            vol_of_vol = np.std([np.std(returns[i:i+10]) for i in range(len(returns)-10)])
            if vol_of_vol > 0.05:  # High volatility of volatility
                base_confidence -= 0.1
        
        return np.clip(base_confidence, 0.1, 0.95)
    
    def _create_default_forecast(self, symbol: str) -> VolatilityForecast:
        """Create default forecast for error cases"""
        
        return VolatilityForecast(
            symbol=symbol.upper(),
            current_volatility=50.0,  # 50% annual volatility
            predicted_volatility_1d=50.0,
            predicted_volatility_7d=52.0,
            predicted_volatility_30d=55.0,
            volatility_regime='medium',
            confidence=0.5,
            var_95=5.0,
            var_99=8.0,
            expected_shortfall=10.0,
            volatility_trend='stable',
            risk_metrics={'sharpe_ratio': 0, 'max_drawdown': 20, 'skewness': 0, 'kurtosis': 3}
        )
    
    def forecast_portfolio_volatility(self, symbols: List[str], weights: List[float] = None) -> Dict:
        """Forecast portfolio volatility across multiple assets"""
        
        if not symbols:
            return {'error': 'No symbols provided'}
        
        if weights is None:
            weights = [1/len(symbols)] * len(symbols)
        
        # Ensure weights sum to 1
        weights = np.array(weights)
        weights = weights / np.sum(weights)
        
        # Get individual volatility forecasts
        individual_forecasts = {}
        volatilities_1d = []
        volatilities_7d = []
        volatilities_30d = []
        
        for symbol in symbols:
            forecast = self.forecast_volatility(symbol)
            individual_forecasts[symbol] = forecast
            volatilities_1d.append(forecast.predicted_volatility_1d / 100)  # Convert to decimal
            volatilities_7d.append(forecast.predicted_volatility_7d / 100)
            volatilities_30d.append(forecast.predicted_volatility_30d / 100)
        
        # Simulate correlation matrix (in reality, you'd calculate from historical data)
        n_assets = len(symbols)
        correlation_matrix = self._generate_correlation_matrix(n_assets)
        
        # Calculate portfolio volatilities
        portfolio_vol_1d = self._calculate_portfolio_volatility(volatilities_1d, weights, correlation_matrix)
        portfolio_vol_7d = self._calculate_portfolio_volatility(volatilities_7d, weights, correlation_matrix)
        portfolio_vol_30d = self._calculate_portfolio_volatility(volatilities_30d, weights, correlation_matrix)
        
        return {
            'portfolio_volatility_1d': round(portfolio_vol_1d * 100, 2),
            'portfolio_volatility_7d': round(portfolio_vol_7d * 100, 2),
            'portfolio_volatility_30d': round(portfolio_vol_30d * 100, 2),
            'individual_forecasts': individual_forecasts,
            'weights': weights.tolist(),
            'diversification_benefit': round((np.mean(volatilities_1d) - portfolio_vol_1d) * 100, 2)
        }
    
    def _generate_correlation_matrix(self, n_assets: int) -> np.ndarray:
        """Generate realistic correlation matrix for crypto assets"""
        
        # Start with identity matrix
        corr_matrix = np.eye(n_assets)
        
        # Add realistic correlations (crypto assets are typically positively correlated)
        for i in range(n_assets):
            for j in range(i+1, n_assets):
                # Crypto correlations typically range from 0.3 to 0.8
                correlation = np.random.uniform(0.3, 0.8)
                corr_matrix[i, j] = correlation
                corr_matrix[j, i] = correlation
        
        return corr_matrix
    
    def _calculate_portfolio_volatility(self, volatilities: List[float], 
                                      weights: np.ndarray, correlation_matrix: np.ndarray) -> float:
        """Calculate portfolio volatility using covariance matrix"""
        
        # Create covariance matrix from volatilities and correlations
        vol_matrix = np.outer(volatilities, volatilities)
        covariance_matrix = vol_matrix * correlation_matrix
        
        # Portfolio variance = w^T * Σ * w
        portfolio_variance = np.dot(weights.T, np.dot(covariance_matrix, weights))
        portfolio_volatility = np.sqrt(portfolio_variance)
        
        return portfolio_volatility

def main():
    """Demo the volatility forecasting engine"""
    
    forecaster = CryptoVolatilityForecaster()
    
    # Test with popular cryptocurrencies
    test_symbols = ['BTC', 'ETH', 'SOL', 'DOGE']
    
    print("\n📈 CRYPTOCURRENCY VOLATILITY FORECASTING")
    print("=" * 55)
    
    for symbol in test_symbols:
        forecast = forecaster.forecast_volatility(symbol)
        
        print(f"\n💰 {forecast.symbol}")
        print(f"Current Volatility: {forecast.current_volatility:.1f}% (annual)")
        print(f"Regime: {forecast.volatility_regime.upper()}")
        print(f"Forecasts: 1d={forecast.predicted_volatility_1d:.1f}% | 7d={forecast.predicted_volatility_7d:.1f}% | 30d={forecast.predicted_volatility_30d:.1f}%")
        print(f"VaR 95%: {forecast.var_95:.2f}% | Trend: {forecast.volatility_trend}")
        print(f"Confidence: {forecast.confidence:.3f}")
    
    # Portfolio example
    portfolio_forecast = forecaster.forecast_portfolio_volatility(
        test_symbols, weights=[0.4, 0.3, 0.2, 0.1]
    )
    
    print(f"\n📊 PORTFOLIO VOLATILITY FORECAST")
    print(f"1-day: {portfolio_forecast['portfolio_volatility_1d']:.1f}%")
    print(f"7-day: {portfolio_forecast['portfolio_volatility_7d']:.1f}%")
    print(f"30-day: {portfolio_forecast['portfolio_volatility_30d']:.1f}%")
    print(f"Diversification Benefit: {portfolio_forecast['diversification_benefit']:.1f}%")

if __name__ == "__main__":
    main()