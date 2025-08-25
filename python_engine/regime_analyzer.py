#!/usr/bin/env python3

"""
Advanced Regime Confidence Calculator and Hybrid Scoring Engine
Integrates market regime detection with dynamic scoring algorithms
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import json

class RegimeAnalyzer:
    """
    Advanced market regime detection and confidence calculation
    """
    
    def __init__(self):
        self.default_thresholds = {
            'atr_thresh': 0.08,
            'macro_thresh': 1.5,
            'anchor_vol_thresh': 0.2,
            'volatility_threshold': 0.5
        }
        
    def compute_regime_confidence(self, data: Dict, **kwargs) -> Tuple[str, float]:
        """
        Determine market regime and confidence level
        
        Args:
            data: Market data dictionary
            **kwargs: Custom threshold overrides
            
        Returns:
            Tuple of (regime, confidence)
        """
        thresholds = {**self.default_thresholds, **kwargs}
        
        atr = data.get("atr", 1)
        volume = max(data.get("volume", 1), 1)  # Prevent division by zero
        macro = data.get("macro_surprise", 0)
        anchor = data.get("anchor_pressure", 0)

        # Calculate ratios and metrics
        vol_ratio = atr / volume
        anchor_vol = abs(anchor - 0.5)

        # Score regime indicators
        score = 0
        score += 1 if vol_ratio > thresholds['atr_thresh'] else 0
        score += 1 if abs(macro) > thresholds['macro_thresh'] else 0
        score += 1 if anchor_vol > thresholds['anchor_vol_thresh'] else 0

        confidence = score / 3
        regime = "volatility" if confidence >= thresholds['volatility_threshold'] else "momentum"
        
        return regime, round(confidence, 2)

    def score_asset_by_regime(self, asset_id: str, data: Dict, regime: str = "momentum") -> Dict:
        """
        Score asset based on specific market regime
        
        Args:
            asset_id: Asset identifier
            data: Market data
            regime: 'momentum' or 'volatility'
            
        Returns:
            Dictionary with score and components
        """
        price = data.get("price", 0)
        volume = max(data.get("volume", 1), 1)
        atr = data.get("atr", 1)
        macro = data.get("macro_surprise", 0)
        anchor = data.get("anchor_pressure", 0)

        base_score = 0
        anchor_boost = 0
        anchor_factor = 0
        vol_penalty = 0
        macro_penalty = 0
        
        if regime == "momentum":
            # Momentum regime: Focus on price action and anchor strength
            base_score = (price / volume) * 100
            anchor_boost = anchor * 0.4
            score = base_score + anchor_boost
            
        elif regime == "volatility":
            # Volatility regime: Account for risk and uncertainty
            vol_penalty = atr / volume
            base_score = (price / volume) * (1 - vol_penalty)
            macro_penalty = abs(macro) * 0.05
            anchor_factor = anchor * 0.2
            score = base_score - macro_penalty + anchor_factor
            
        else:
            score = 0

        return {
            "Score": round(max(0, score), 2),
            "Components": {
                "base_score": round(base_score, 2),
                "anchor_factor": round(anchor_boost if regime == "momentum" else anchor_factor, 2),
                "vol_penalty": round(vol_penalty, 2),
                "macro_penalty": round(macro_penalty, 2)
            }
        }

    def hybrid_score_asset(self, asset_id: str, data: Dict) -> Dict:
        """
        Calculate hybrid score combining momentum and volatility regimes
        
        Args:
            asset_id: Asset identifier
            data: Market data dictionary
            
        Returns:
            Comprehensive scoring result
        """
        # Determine regime and confidence
        regime, confidence = self.compute_regime_confidence(data)
        
        # Calculate scores for both regimes
        momentum_result = self.score_asset_by_regime(asset_id, data, regime="momentum")
        volatility_result = self.score_asset_by_regime(asset_id, data, regime="volatility")
        
        momentum_score = momentum_result["Score"]
        volatility_score = volatility_result["Score"]
        
        # Weight scores based on regime confidence
        hybrid_score = momentum_score * (1 - confidence) + volatility_score * confidence
        
        # Determine signal strength
        signal_strength = "Strong" if hybrid_score > 75 else "Medium" if hybrid_score > 50 else "Weak"
        
        return {
            "Asset": asset_id.upper(),
            "Hybrid_Score": round(hybrid_score, 2),
            "Momentum_Score": round(momentum_score, 2),
            "Volatility_Score": round(volatility_score, 2),
            "Confidence": confidence,
            "Dominant_Regime": regime,
            "Signal_Strength": signal_strength,
            "Components": {
                "momentum": momentum_result["Components"],
                "volatility": volatility_result["Components"]
            },
            "Timestamp": datetime.now().isoformat()
        }

class BacktestEngine:
    """
    Comprehensive backtesting engine for regime-aware strategies
    """
    
    def __init__(self, regime_analyzer: RegimeAnalyzer):
        self.regime_analyzer = regime_analyzer
        
    def backtest_hybrid_strategy(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Backtest the hybrid scoring strategy on historical data
        
        Args:
            df: DataFrame with columns: Date, Asset, price, volume, atr, etc.
            
        Returns:
            DataFrame with backtest results
        """
        results = []
        
        for _, row in df.iterrows():
            # Convert row to dictionary for scoring
            data = {
                "price": row.get("price", 0),
                "volume": row.get("volume", 1),
                "atr": row.get("atr", 1),
                "macro_surprise": row.get("macro_surprise", 0),
                "anchor_pressure": row.get("anchor_pressure", 0)
            }
            
            # Calculate hybrid score
            asset_id = str(row["Asset"]) if "Asset" in row else "UNKNOWN"
            scored = self.regime_analyzer.hybrid_score_asset(asset_id, data)
            
            # Add historical context
            result = {
                "Date": row["Date"],
                "Asset": scored["Asset"],
                "Hybrid_Score": scored["Hybrid_Score"],
                "Momentum_Score": scored["Momentum_Score"],
                "Volatility_Score": scored["Volatility_Score"],
                "Confidence": scored["Confidence"],
                "Dominant_Regime": scored["Dominant_Regime"],
                "Signal_Strength": scored["Signal_Strength"],
                "Actual_Price": row.get("price", 0),
                "Volume": row.get("volume", 0)
            }
            
            results.append(result)
            
        return pd.DataFrame(results)
    
    def calculate_strategy_performance(self, backtest_results: pd.DataFrame) -> Dict:
        """
        Calculate comprehensive performance metrics
        
        Args:
            backtest_results: DataFrame from backtest_hybrid_strategy
            
        Returns:
            Performance metrics dictionary
        """
        if backtest_results.empty:
            return {"error": "No backtest data available"}
            
        total_signals = len(backtest_results)
        strong_signals = len(backtest_results[backtest_results['Signal_Strength'] == 'Strong'])
        
        # Calculate regime distribution
        regime_counts = backtest_results['Dominant_Regime'].value_counts()
        
        # Average scores by regime
        momentum_subset = backtest_results[backtest_results['Dominant_Regime'] == 'momentum']
        volatility_subset = backtest_results[backtest_results['Dominant_Regime'] == 'volatility']
        
        momentum_avg = momentum_subset['Hybrid_Score'].mean() if len(momentum_subset) > 0 else 0
        volatility_avg = volatility_subset['Hybrid_Score'].mean() if len(volatility_subset) > 0 else 0
        
        return {
            "total_signals": total_signals,
            "strong_signals": strong_signals,
            "strong_signal_ratio": round(strong_signals / total_signals, 3) if total_signals > 0 else 0,
            "regime_distribution": regime_counts.to_dict(),
            "average_scores": {
                "overall": round(backtest_results['Hybrid_Score'].mean(), 2),
                "momentum_regime": round(momentum_avg, 2) if not pd.isna(momentum_avg) else 0,
                "volatility_regime": round(volatility_avg, 2) if not pd.isna(volatility_avg) else 0
            },
            "confidence_stats": {
                "mean": round(backtest_results['Confidence'].mean(), 3),
                "median": round(backtest_results['Confidence'].median(), 3),
                "std": round(backtest_results['Confidence'].std(), 3)
            }
        }

# Standalone functions for compatibility
def compute_regime_confidence(data, atr_thresh=0.08, macro_thresh=1.5, anchor_vol_thresh=0.2):
    """Standalone regime confidence calculator"""
    analyzer = RegimeAnalyzer()
    return analyzer.compute_regime_confidence(data, 
                                            atr_thresh=atr_thresh,
                                            macro_thresh=macro_thresh, 
                                            anchor_vol_thresh=anchor_vol_thresh)

def score_asset(asset_id, data, regime="momentum"):
    """Standalone asset scoring function"""
    analyzer = RegimeAnalyzer()
    result = analyzer.score_asset_by_regime(asset_id, data, regime)
    return {"Score": result["Score"]}

def hybrid_score_asset(asset_id, data):
    """Standalone hybrid scoring function"""
    analyzer = RegimeAnalyzer()
    return analyzer.hybrid_score_asset(asset_id, data)

def backtest_hybrid(df):
    """Standalone backtesting function"""
    analyzer = RegimeAnalyzer()
    engine = BacktestEngine(analyzer)
    return engine.backtest_hybrid_strategy(df)

if __name__ == "__main__":
    # Test the regime analyzer
    test_data = {
        "atr": 0.1,
        "volume": 1000000,
        "macro_surprise": 2.0,
        "anchor_pressure": 0.7,
        "price": 1.50
    }
    
    analyzer = RegimeAnalyzer()
    result = analyzer.hybrid_score_asset("TEST", test_data)
    print(json.dumps(result, indent=2))