#!/usr/bin/env python3

"""
Professional Risk Analysis for Cryptocurrency Predictions
Implements institutional-grade risk models and metrics
"""

import numpy as np
import pandas as pd
from scipy import stats
from scipy.optimize import minimize
import warnings
warnings.filterwarnings('ignore')

try:
    from arch import arch_model
    ARCH_AVAILABLE = True
except ImportError:
    ARCH_AVAILABLE = False
    print("ARCH not available, using simplified volatility models")

class ProfessionalRiskAnalyzer:
    def __init__(self):
        self.confidence_levels = [0.95, 0.99]
        self.risk_free_rate = 0.02  # 2% annual risk-free rate
        
    def calculate_returns(self, prices: np.array) -> np.array:
        """Calculate returns from price data"""
        if len(prices) < 2:
            return np.array([])
        return np.diff(np.log(prices))
    
    def value_at_risk(self, returns: np.array, confidence_level: float = 0.95) -> dict:
        """Calculate Value at Risk (VaR) using multiple methods"""
        if len(returns) < 10:
            return {'var': 0, 'method': 'insufficient_data'}
        
        # Historical VaR
        var_historical = np.percentile(returns, (1 - confidence_level) * 100)
        
        # Parametric VaR (assuming normal distribution)
        mean_return = np.mean(returns)
        std_return = np.std(returns)
        var_parametric = mean_return - stats.norm.ppf(confidence_level) * std_return
        
        # Modified Cornish-Fisher VaR (accounts for skewness and kurtosis)
        skewness = stats.skew(returns)
        kurt = stats.kurtosis(returns)
        z_score = stats.norm.ppf(confidence_level)
        
        modified_z = z_score + (z_score**2 - 1) * skewness / 6 + \
                    (z_score**3 - 3*z_score) * kurt / 24 - \
                    (2*z_score**3 - 5*z_score) * skewness**2 / 36
        
        var_modified = mean_return - modified_z * std_return
        
        return {
            'var_historical': float(var_historical),
            'var_parametric': float(var_parametric),
            'var_modified': float(var_modified),
            'confidence_level': confidence_level,
            'method': 'comprehensive'
        }
    
    def conditional_var(self, returns: np.array, confidence_level: float = 0.95) -> float:
        """Calculate Conditional VaR (Expected Shortfall)"""
        if len(returns) < 10:
            return 0.0
        
        var = np.percentile(returns, (1 - confidence_level) * 100)
        cvar = np.mean(returns[returns <= var])
        return float(cvar)
    
    def garch_volatility_forecast(self, returns: np.array, horizon: int = 1) -> dict:
        """GARCH model for volatility forecasting"""
        if not ARCH_AVAILABLE or len(returns) < 30:
            # Fallback to simple volatility
            current_vol = np.std(returns) if len(returns) > 1 else 0.0
            return {
                'forecast_volatility': current_vol,
                'current_volatility': current_vol,
                'confidence': 0.5,
                'model': 'simple_volatility'
            }
        
        try:
            # Convert to percentage returns
            returns_pct = returns * 100
            
            # Fit GARCH(1,1) model
            model = arch_model(returns_pct, vol='GARCH', p=1, q=1)
            fitted_model = model.fit(disp='off')
            
            # Forecast volatility
            forecast = fitted_model.forecast(horizon=horizon)
            forecast_vol = float(np.sqrt(forecast.variance.iloc[-1, 0]) / 100)
            current_vol = float(fitted_model.conditional_volatility[-1] / 100)
            
            return {
                'forecast_volatility': forecast_vol,
                'current_volatility': current_vol,
                'confidence': 0.8,
                'model': 'garch_11'
            }
            
        except Exception as e:
            current_vol = np.std(returns) if len(returns) > 1 else 0.0
            return {
                'forecast_volatility': current_vol,
                'current_volatility': current_vol,
                'confidence': 0.5,
                'model': 'fallback',
                'error': str(e)
            }
    
    def monte_carlo_var(self, returns: np.array, confidence_level: float = 0.95, simulations: int = 10000) -> dict:
        """Monte Carlo simulation for VaR estimation"""
        if len(returns) < 10:
            return {'var': 0, 'confidence': 0}
        
        try:
            mean_return = np.mean(returns)
            std_return = np.std(returns)
            
            # Generate random scenarios
            random_returns = np.random.normal(mean_return, std_return, simulations)
            
            # Calculate VaR
            var_mc = np.percentile(random_returns, (1 - confidence_level) * 100)
            
            return {
                'var_monte_carlo': float(var_mc),
                'simulations': simulations,
                'confidence_level': confidence_level,
                'confidence': 0.8
            }
            
        except Exception as e:
            return {'var_monte_carlo': 0, 'confidence': 0, 'error': str(e)}
    
    def calculate_risk_metrics(self, prices: np.array) -> dict:
        """Calculate comprehensive risk metrics"""
        if len(prices) < 10:
            return {
                'error': 'Insufficient data for risk analysis',
                'data_points': len(prices)
            }
        
        returns = self.calculate_returns(prices)
        
        if len(returns) < 5:
            return {
                'error': 'Insufficient return data for analysis',
                'data_points': len(returns)
            }
        
        # Basic risk metrics
        volatility = np.std(returns)
        mean_return = np.mean(returns)
        
        # Sharpe ratio (annualized)
        excess_return = mean_return * 252 - self.risk_free_rate  # 252 trading days
        annual_volatility = volatility * np.sqrt(252)
        sharpe_ratio = excess_return / annual_volatility if annual_volatility > 0 else 0
        
        # Downside metrics
        downside_returns = returns[returns < 0]
        downside_volatility = np.std(downside_returns) if len(downside_returns) > 0 else 0
        sortino_ratio = excess_return / (downside_volatility * np.sqrt(252)) if downside_volatility > 0 else 0
        
        # Maximum drawdown
        cumulative_returns = np.cumprod(1 + returns)
        peak = np.maximum.accumulate(cumulative_returns)
        drawdown = (cumulative_returns - peak) / peak
        max_drawdown = np.min(drawdown)
        
        # Value at Risk calculations
        var_95 = self.value_at_risk(returns, 0.95)
        var_99 = self.value_at_risk(returns, 0.99)
        
        # Conditional VaR
        cvar_95 = self.conditional_var(returns, 0.95)
        cvar_99 = self.conditional_var(returns, 0.99)
        
        # GARCH volatility forecast
        vol_forecast = self.garch_volatility_forecast(returns)
        
        # Monte Carlo VaR
        mc_var = self.monte_carlo_var(returns, 0.95)
        
        return {
            'volatility': float(volatility),
            'annual_volatility': float(annual_volatility),
            'mean_return': float(mean_return),
            'sharpe_ratio': float(sharpe_ratio),
            'sortino_ratio': float(sortino_ratio),
            'max_drawdown': float(max_drawdown),
            'skewness': float(stats.skew(returns)),
            'kurtosis': float(stats.kurtosis(returns)),
            'var_95': var_95,
            'var_99': var_99,
            'cvar_95': float(cvar_95),
            'cvar_99': float(cvar_99),
            'volatility_forecast': vol_forecast,
            'monte_carlo_var': mc_var,
            'data_quality': {
                'price_points': len(prices),
                'return_points': len(returns),
                'negative_returns': len(downside_returns),
                'analysis_period': f"{len(returns)} periods"
            }
        }
    
    def risk_classification(self, risk_metrics: dict) -> dict:
        """Classify overall risk level based on multiple metrics"""
        if 'error' in risk_metrics:
            return {
                'risk_level': 'unknown',
                'risk_score': 50,
                'confidence': 0.0,
                'reason': risk_metrics['error']
            }
        
        risk_factors = []
        
        # Volatility risk
        annual_vol = risk_metrics.get('annual_volatility', 0)
        if annual_vol > 1.0:  # >100% annual volatility
            risk_factors.append(('high_volatility', 30))
        elif annual_vol > 0.5:  # >50% annual volatility  
            risk_factors.append(('medium_volatility', 15))
        else:
            risk_factors.append(('low_volatility', -5))
        
        # Sharpe ratio risk
        sharpe = risk_metrics.get('sharpe_ratio', 0)
        if sharpe < 0:
            risk_factors.append(('negative_sharpe', 25))
        elif sharpe < 0.5:
            risk_factors.append(('low_sharpe', 10))
        else:
            risk_factors.append(('good_sharpe', -5))
        
        # Drawdown risk
        max_dd = abs(risk_metrics.get('max_drawdown', 0))
        if max_dd > 0.5:  # >50% drawdown
            risk_factors.append(('extreme_drawdown', 35))
        elif max_dd > 0.2:  # >20% drawdown
            risk_factors.append(('high_drawdown', 20))
        else:
            risk_factors.append(('manageable_drawdown', -5))
        
        # VaR risk
        var_95 = risk_metrics.get('var_95', {}).get('var_historical', 0)
        if var_95 < -0.1:  # >10% daily VaR
            risk_factors.append(('extreme_var', 30))
        elif var_95 < -0.05:  # >5% daily VaR
            risk_factors.append(('high_var', 15))
        else:
            risk_factors.append(('moderate_var', 0))
        
        # Calculate total risk score
        total_risk_score = 50 + sum(score for _, score in risk_factors)
        total_risk_score = max(0, min(100, total_risk_score))
        
        # Classify risk level
        if total_risk_score >= 80:
            risk_level = 'extremely_high'
        elif total_risk_score >= 65:
            risk_level = 'high'
        elif total_risk_score >= 45:
            risk_level = 'medium'
        elif total_risk_score >= 25:
            risk_level = 'low'
        else:
            risk_level = 'very_low'
        
        return {
            'risk_level': risk_level,
            'risk_score': int(total_risk_score),
            'confidence': 0.8,
            'risk_factors': risk_factors,
            'recommendation': self._get_risk_recommendation(risk_level, total_risk_score)
        }
    
    def _get_risk_recommendation(self, risk_level: str, risk_score: int) -> str:
        """Get investment recommendation based on risk level"""
        recommendations = {
            'extremely_high': 'AVOID - Extremely high risk. Consider safer alternatives.',
            'high': 'CAUTION - High risk investment. Only for experienced traders with high risk tolerance.',
            'medium': 'MODERATE - Medium risk. Suitable for balanced portfolios with proper position sizing.',
            'low': 'FAVORABLE - Low risk with good potential. Suitable for most investors.',
            'very_low': 'CONSERVATIVE - Very low risk. Good for capital preservation strategies.'
        }
        return recommendations.get(risk_level, 'Unknown risk level')

def main():
    """Test risk analysis"""
    analyzer = ProfessionalRiskAnalyzer()
    
    # Generate sample price data
    np.random.seed(42)
    days = 60
    initial_price = 100
    
    # Simulate different volatility scenarios
    scenarios = {
        'low_vol': np.random.normal(0.001, 0.02, days),
        'medium_vol': np.random.normal(0.001, 0.05, days),
        'high_vol': np.random.normal(0.001, 0.10, days)
    }
    
    for scenario_name, returns in scenarios.items():
        prices = initial_price * np.cumprod(1 + returns)
        
        print(f"\n=== RISK ANALYSIS - {scenario_name.upper().replace('_', ' ')} ===")
        
        risk_metrics = analyzer.calculate_risk_metrics(prices)
        risk_classification = analyzer.risk_classification(risk_metrics)
        
        if 'error' not in risk_metrics:
            print(f"Annual Volatility: {risk_metrics['annual_volatility']:.1%}")
            print(f"Sharpe Ratio: {risk_metrics['sharpe_ratio']:.2f}")
            print(f"Max Drawdown: {risk_metrics['max_drawdown']:.1%}")
            print(f"VaR (95%): {risk_metrics['var_95']['var_historical']:.1%}")
            print(f"CVaR (95%): {risk_metrics['cvar_95']:.1%}")
            
            print(f"\nRisk Classification: {risk_classification['risk_level'].upper().replace('_', ' ')}")
            print(f"Risk Score: {risk_classification['risk_score']}/100")
            print(f"Recommendation: {risk_classification['recommendation']}")

if __name__ == "__main__":
    main()