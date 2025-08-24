#!/usr/bin/env python3

"""
Enhanced Financial Analysis Engine for Cryptocurrency Predictions
Incorporates professional-grade financial analysis libraries and methodologies
"""

import numpy as np
import pandas as pd
import talib
import yfinance as yf
import ccxt
from scipy import stats
from scipy.optimize import minimize
import statsmodels.api as sm
from statsmodels.tsa.regime_switching import MarkovRegression
from arch import arch_model
from pykalman import KalmanFilter
from hurst import compute_Hc
import empyrical
import quantlib as ql
from fredapi import Fred
import requests
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class AdvancedCryptoAnalyzer:
    def __init__(self):
        self.fred = None  # Initialize when needed with API key
        self.exchanges = {
            'binance': ccxt.binance(),
            'coinbase': ccxt.coinbasepro(),
            'kraken': ccxt.kraken()
        }
        
    def fetch_comprehensive_data(self, symbol, days=30):
        """Fetch comprehensive market data for analysis"""
        try:
            # Get OHLCV data from multiple exchanges
            data_sources = []
            
            for exchange_name, exchange in self.exchanges.items():
                try:
                    ohlcv = exchange.fetch_ohlcv(f"{symbol}/USDT", '1d', limit=days)
                    df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
                    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
                    df['exchange'] = exchange_name
                    data_sources.append(df)
                except:
                    continue
                    
            if not data_sources:
                return None
                
            # Combine and clean data
            combined_df = pd.concat(data_sources).groupby('timestamp').agg({
                'open': 'mean',
                'high': 'max',
                'low': 'min', 
                'close': 'mean',
                'volume': 'sum'
            }).reset_index()
            
            return combined_df.sort_values('timestamp')
            
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
            return None
    
    def calculate_advanced_technical_indicators(self, df):
        """Calculate professional technical indicators using TA-Lib"""
        if df is None or len(df) < 20:
            return {}
            
        try:
            close = df['close'].values
            high = df['high'].values
            low = df['low'].values
            volume = df['volume'].values
            
            indicators = {
                # Trend Indicators
                'sma_20': talib.SMA(close, timeperiod=20)[-1] if len(close) >= 20 else 0,
                'ema_12': talib.EMA(close, timeperiod=12)[-1] if len(close) >= 12 else 0,
                'bbands_upper': talib.BBANDS(close, timeperiod=20, nbdevup=2, nbdevdn=2, matype=0)[0][-1] if len(close) >= 20 else 0,
                'bbands_middle': talib.BBANDS(close, timeperiod=20, nbdevup=2, nbdevdn=2, matype=0)[1][-1] if len(close) >= 20 else 0,
                'bbands_lower': talib.BBANDS(close, timeperiod=20, nbdevup=2, nbdevdn=2, matype=0)[2][-1] if len(close) >= 20 else 0,
                'parabolic_sar': talib.SAR(high, low, acceleration=0.02, maximum=0.2)[-1] if len(close) >= 2 else 0,
                
                # Momentum Indicators
                'rsi': talib.RSI(close, timeperiod=14)[-1] if len(close) >= 14 else 50,
                'macd': talib.MACD(close, fastperiod=12, slowperiod=26, signalperiod=9)[0][-1] if len(close) >= 26 else 0,
                'macd_signal': talib.MACD(close, fastperiod=12, slowperiod=26, signalperiod=9)[1][-1] if len(close) >= 26 else 0,
                'macd_hist': talib.MACD(close, fastperiod=12, slowperiod=26, signalperiod=9)[2][-1] if len(close) >= 26 else 0,
                'stoch_k': talib.STOCH(high, low, close, fastk_period=5, slowk_period=3, slowk_matype=0, slowd_period=3, slowd_matype=0)[0][-1] if len(close) >= 5 else 50,
                'stoch_d': talib.STOCH(high, low, close, fastk_period=5, slowk_period=3, slowk_matype=0, slowd_period=3, slowd_matype=0)[1][-1] if len(close) >= 5 else 50,
                'williams_r': talib.WILLR(high, low, close, timeperiod=14)[-1] if len(close) >= 14 else -50,
                
                # Volume Indicators
                'ad': talib.AD(high, low, close, volume)[-1] if len(close) >= 1 else 0,
                'adosc': talib.ADOSC(high, low, close, volume, fastperiod=3, slowperiod=10)[-1] if len(close) >= 10 else 0,
                'obv': talib.OBV(close, volume)[-1] if len(close) >= 1 else 0,
                
                # Volatility Indicators
                'atr': talib.ATR(high, low, close, timeperiod=14)[-1] if len(close) >= 14 else 0,
                'natr': talib.NATR(high, low, close, timeperiod=14)[-1] if len(close) >= 14 else 0,
                
                # Pattern Recognition (sample)
                'doji': talib.CDLDOJI(close, high, low, close)[-1] if len(close) >= 1 else 0,
                'hammer': talib.CDLHAMMER(close, high, low, close)[-1] if len(close) >= 1 else 0,
                'engulfing': talib.CDLENGULFING(close, high, low, close)[-1] if len(close) >= 2 else 0,
            }
            
            return indicators
            
        except Exception as e:
            print(f"Error calculating technical indicators: {e}")
            return {}
    
    def calculate_risk_metrics(self, df):
        """Calculate professional risk metrics using empyrical"""
        if df is None or len(df) < 10:
            return {}
            
        try:
            returns = df['close'].pct_change().dropna()
            
            risk_metrics = {
                'sharpe_ratio': empyrical.sharpe_ratio(returns) if len(returns) > 1 else 0,
                'sortino_ratio': empyrical.sortino_ratio(returns) if len(returns) > 1 else 0,
                'max_drawdown': empyrical.max_drawdown(returns) if len(returns) > 1 else 0,
                'calmar_ratio': empyrical.calmar_ratio(returns) if len(returns) > 1 else 0,
                'omega_ratio': empyrical.omega_ratio(returns) if len(returns) > 1 else 0,
                'var_95': np.percentile(returns, 5) if len(returns) > 1 else 0,
                'cvar_95': returns[returns <= np.percentile(returns, 5)].mean() if len(returns) > 1 else 0,
                'volatility': empyrical.annual_volatility(returns) if len(returns) > 1 else 0,
                'skewness': stats.skew(returns) if len(returns) > 2 else 0,
                'kurtosis': stats.kurtosis(returns) if len(returns) > 2 else 0,
            }
            
            return risk_metrics
            
        except Exception as e:
            print(f"Error calculating risk metrics: {e}")
            return {}
    
    def detect_market_regime(self, df):
        """Detect market regime using Markov Regime Switching"""
        if df is None or len(df) < 20:
            return {'regime': 'unknown', 'probability': 0.5}
            
        try:
            returns = df['close'].pct_change().dropna()
            
            if len(returns) < 10:
                return {'regime': 'unknown', 'probability': 0.5}
            
            # Markov Regime Switching Model
            model = MarkovRegression(returns, k_regimes=2, trend='c')
            fitted_model = model.fit()
            
            # Get current regime probability
            current_regime_prob = fitted_model.smoothed_marginal_probabilities[-1]
            current_regime = 'bull' if current_regime_prob[0] > current_regime_prob[1] else 'bear'
            regime_confidence = max(current_regime_prob)
            
            return {
                'regime': current_regime,
                'probability': float(regime_confidence),
                'bull_prob': float(current_regime_prob[0]),
                'bear_prob': float(current_regime_prob[1])
            }
            
        except Exception as e:
            # Fallback to simple volatility-based regime detection
            volatility = df['close'].pct_change().std()
            if volatility > 0.03:  # High volatility threshold
                return {'regime': 'bear', 'probability': 0.7}
            else:
                return {'regime': 'bull', 'probability': 0.6}
    
    def calculate_hurst_exponent(self, df):
        """Calculate Hurst exponent for mean reversion analysis"""
        if df is None or len(df) < 50:
            return 0.5
            
        try:
            prices = df['close'].values
            H, c, data = compute_Hc(prices, kind='change', simplified=True)
            return float(H)
        except:
            return 0.5
    
    def garch_volatility_forecast(self, df, horizon=1):
        """GARCH model for volatility forecasting"""
        if df is None or len(df) < 30:
            return {'forecast': 0, 'confidence': 0}
            
        try:
            returns = df['close'].pct_change().dropna() * 100  # Convert to percentage
            
            if len(returns) < 20:
                return {'forecast': returns.std(), 'confidence': 0.5}
            
            # Fit GARCH(1,1) model
            model = arch_model(returns, vol='Garch', p=1, q=1)
            fitted_model = model.fit(disp='off')
            
            # Forecast volatility
            forecast = fitted_model.forecast(horizon=horizon)
            vol_forecast = float(np.sqrt(forecast.variance.iloc[-1, 0]))
            
            return {
                'forecast': vol_forecast,
                'confidence': 0.8,  # GARCH models are generally reliable for short-term vol
                'current_vol': float(returns.std())
            }
            
        except Exception as e:
            returns = df['close'].pct_change().dropna() * 100
            return {
                'forecast': float(returns.std()),
                'confidence': 0.5,
                'current_vol': float(returns.std())
            }
    
    def comprehensive_analysis(self, symbol, days=30):
        """Run comprehensive financial analysis"""
        print(f"\n=== COMPREHENSIVE ANALYSIS FOR {symbol} ===")
        
        # Fetch data
        df = self.fetch_comprehensive_data(symbol, days)
        if df is None:
            return None
        
        analysis = {
            'symbol': symbol,
            'current_price': float(df['close'].iloc[-1]),
            'technical_indicators': self.calculate_advanced_technical_indicators(df),
            'risk_metrics': self.calculate_risk_metrics(df),
            'market_regime': self.detect_market_regime(df),
            'hurst_exponent': self.calculate_hurst_exponent(df),
            'volatility_forecast': self.garch_volatility_forecast(df),
            'data_quality': {
                'data_points': len(df),
                'date_range': f"{df['timestamp'].min()} to {df['timestamp'].max()}",
                'completeness': 1.0 - (df.isnull().sum().sum() / (len(df) * len(df.columns)))
            }
        }
        
        return analysis

def main():
    """Test the enhanced analyzer"""
    analyzer = AdvancedCryptoAnalyzer()
    
    # Test with major cryptocurrencies
    symbols = ['BTC', 'ETH', 'SUI']
    
    for symbol in symbols:
        try:
            analysis = analyzer.comprehensive_analysis(symbol, days=60)
            if analysis:
                print(f"\n{'='*50}")
                print(f"SYMBOL: {analysis['symbol']}")
                print(f"Current Price: ${analysis['current_price']:.6f}")
                print(f"Market Regime: {analysis['market_regime']['regime'].upper()} ({analysis['market_regime']['probability']:.1%} confidence)")
                print(f"Hurst Exponent: {analysis['hurst_exponent']:.3f} ({'Mean Reverting' if analysis['hurst_exponent'] < 0.5 else 'Trending' if analysis['hurst_exponent'] > 0.5 else 'Random Walk'})")
                print(f"Sharpe Ratio: {analysis['risk_metrics'].get('sharpe_ratio', 'N/A'):.2f}" if isinstance(analysis['risk_metrics'].get('sharpe_ratio'), (int, float)) else "Sharpe Ratio: N/A")
                print(f"Max Drawdown: {analysis['risk_metrics'].get('max_drawdown', 'N/A'):.1%}" if isinstance(analysis['risk_metrics'].get('max_drawdown'), (int, float)) else "Max Drawdown: N/A")
                print(f"Volatility Forecast: {analysis['volatility_forecast']['forecast']:.2f}%")
                print(f"RSI: {analysis['technical_indicators'].get('rsi', 'N/A'):.1f}" if isinstance(analysis['technical_indicators'].get('rsi'), (int, float)) else "RSI: N/A")
        except Exception as e:
            print(f"Error analyzing {symbol}: {e}")

if __name__ == "__main__":
    main()