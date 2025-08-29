#!/usr/bin/env python3
"""
Cryptocurrency Arbitrage Detection Engine
Cross-exchange price monitoring and arbitrage opportunity identification
"""

import numpy as np
import pandas as pd
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging
from dataclasses import dataclass
import time

logger = logging.getLogger(__name__)

@dataclass
class ArbitrageOpportunity:
    """Structured arbitrage opportunity result"""
    symbol: str
    buy_exchange: str
    sell_exchange: str
    buy_price: float
    sell_price: float
    price_difference: float
    profit_percentage: float
    estimated_profit: float
    volume_available: float
    execution_time_estimate: float
    risk_level: str
    opportunity_type: str  # spatial, temporal, triangular
    confidence: float

@dataclass
class ExchangeData:
    """Exchange price and volume data"""
    exchange: str
    price: float
    volume: float
    bid: float
    ask: float
    spread: float
    last_updated: datetime

class CryptoArbitrageDetector:
    """Advanced cryptocurrency arbitrage detection engine"""
    
    def __init__(self):
        # Simulated exchange list with characteristics
        self.exchanges = {
            'Binance': {'fee': 0.001, 'liquidity': 'high', 'latency': 0.05},
            'Coinbase': {'fee': 0.005, 'liquidity': 'high', 'latency': 0.1},
            'Kraken': {'fee': 0.0025, 'liquidity': 'medium', 'latency': 0.08},
            'KuCoin': {'fee': 0.001, 'liquidity': 'medium', 'latency': 0.06},
            'Bybit': {'fee': 0.001, 'liquidity': 'high', 'latency': 0.04},
            'OKX': {'fee': 0.001, 'liquidity': 'high', 'latency': 0.05},
            'Gate.io': {'fee': 0.002, 'liquidity': 'medium', 'latency': 0.07},
            'Huobi': {'fee': 0.002, 'liquidity': 'medium', 'latency': 0.08},
            'Uniswap': {'fee': 0.003, 'liquidity': 'variable', 'latency': 0.15},
            'PancakeSwap': {'fee': 0.0025, 'liquidity': 'variable', 'latency': 0.12}
        }
        
        # Minimum profit thresholds
        self.min_profit_threshold = 0.005  # 0.5% minimum profit
        self.execution_costs = 0.002  # 0.2% execution costs
        
        # Risk assessment parameters
        self.risk_factors = {
            'price_volatility': 0.3,
            'execution_time': 0.2,
            'liquidity_risk': 0.25,
            'exchange_reliability': 0.15,
            'regulatory_risk': 0.1
        }
    
    def detect_arbitrage_opportunities(self, symbol: str, 
                                     investment_amount: float = 10000) -> List[ArbitrageOpportunity]:
        """Detect arbitrage opportunities for a given cryptocurrency"""
        
        try:
            # Get current market data from all exchanges
            market_data = self._fetch_multi_exchange_data(symbol)
            
            if len(market_data) < 2:
                return []
            
            opportunities = []
            
            # Spatial arbitrage (price differences across exchanges)
            spatial_ops = self._detect_spatial_arbitrage(market_data, symbol, investment_amount)
            opportunities.extend(spatial_ops)
            
            # Triangular arbitrage (if applicable)
            triangular_ops = self._detect_triangular_arbitrage(market_data, symbol, investment_amount)
            opportunities.extend(triangular_ops)
            
            # Statistical arbitrage
            statistical_ops = self._detect_statistical_arbitrage(market_data, symbol, investment_amount)
            opportunities.extend(statistical_ops)
            
            # Filter and rank opportunities
            filtered_opportunities = self._filter_opportunities(opportunities)
            ranked_opportunities = self._rank_opportunities(filtered_opportunities)
            
            return ranked_opportunities[:10]  # Return top 10 opportunities
            
        except Exception as e:
            logger.error(f"Arbitrage detection error for {symbol}: {e}")
            return []
    
    def _fetch_multi_exchange_data(self, symbol: str) -> List[ExchangeData]:
        """Simulate fetching real-time data from multiple exchanges"""
        
        market_data = []
        base_price = self._get_base_price(symbol)
        
        for exchange, props in self.exchanges.items():
            # Simulate price variations across exchanges
            price_variation = np.random.normal(0, 0.01)  # 1% standard deviation
            
            # Add exchange-specific biases
            if exchange == 'Coinbase':
                price_variation += 0.005  # Coinbase typically trades at premium
            elif exchange in ['Uniswap', 'PancakeSwap']:
                price_variation += np.random.choice([-0.01, 0.01], p=[0.6, 0.4])  # DEX price swings
            elif props['liquidity'] == 'medium':
                price_variation += np.random.normal(0, 0.005)  # More volatility on smaller exchanges
            
            price = base_price * (1 + price_variation)
            
            # Simulate bid-ask spread
            spread_bp = np.random.uniform(5, 50)  # 5-50 basis points
            spread = price * (spread_bp / 10000)
            
            bid = price - spread / 2
            ask = price + spread / 2
            
            # Simulate volume
            if props['liquidity'] == 'high':
                volume = np.random.uniform(50000, 500000)
            elif props['liquidity'] == 'medium':
                volume = np.random.uniform(10000, 100000)
            else:  # variable (DEX)
                volume = np.random.uniform(5000, 200000)
            
            market_data.append(ExchangeData(
                exchange=exchange,
                price=price,
                volume=volume,
                bid=bid,
                ask=ask,
                spread=spread,
                last_updated=datetime.now()
            ))
        
        return market_data
    
    def _get_base_price(self, symbol: str) -> float:
        """Get base price for simulation"""
        
        price_map = {
            'BTC': 65000,
            'ETH': 3500,
            'SOL': 150,
            'ADA': 0.5,
            'DOT': 7.5,
            'MATIC': 0.8,
            'LINK': 15,
            'UNI': 8,
            'DOGE': 0.08,
            'SHIB': 0.000025
        }
        
        return price_map.get(symbol.upper(), 100)  # Default to $100
    
    def _detect_spatial_arbitrage(self, market_data: List[ExchangeData], 
                                symbol: str, investment_amount: float) -> List[ArbitrageOpportunity]:
        """Detect spatial arbitrage opportunities (price differences across exchanges)"""
        
        opportunities = []
        
        # Compare all exchange pairs
        for i, buy_exchange in enumerate(market_data):
            for j, sell_exchange in enumerate(market_data):
                if i >= j:  # Avoid duplicate comparisons
                    continue
                
                # Calculate potential profit
                buy_price = buy_exchange.ask  # We buy at ask price
                sell_price = sell_exchange.bid  # We sell at bid price
                
                if sell_price <= buy_price:
                    continue  # No arbitrage opportunity
                
                # Calculate fees
                buy_fee = self.exchanges[buy_exchange.exchange]['fee']
                sell_fee = self.exchanges[sell_exchange.exchange]['fee']
                
                # Calculate net profit
                gross_profit = sell_price - buy_price
                total_fees = (buy_price * buy_fee) + (sell_price * sell_fee)
                net_profit = gross_profit - total_fees - (buy_price * self.execution_costs)
                
                profit_percentage = (net_profit / buy_price) * 100
                
                # Check if profitable
                if profit_percentage < self.min_profit_threshold * 100:
                    continue
                
                # Calculate maximum tradeable volume
                max_volume = min(
                    buy_exchange.volume * 0.1,  # Max 10% of exchange volume
                    sell_exchange.volume * 0.1,
                    investment_amount / buy_price
                )
                
                estimated_profit = net_profit * max_volume
                
                # Estimate execution time
                execution_time = self._estimate_execution_time(
                    buy_exchange.exchange, sell_exchange.exchange
                )
                
                # Assess risk
                risk_level = self._assess_arbitrage_risk(
                    buy_exchange, sell_exchange, profit_percentage
                )
                
                # Calculate confidence
                confidence = self._calculate_arbitrage_confidence(
                    profit_percentage, execution_time, risk_level
                )
                
                opportunities.append(ArbitrageOpportunity(
                    symbol=symbol.upper(),
                    buy_exchange=buy_exchange.exchange,
                    sell_exchange=sell_exchange.exchange,
                    buy_price=buy_price,
                    sell_price=sell_price,
                    price_difference=gross_profit,
                    profit_percentage=profit_percentage,
                    estimated_profit=estimated_profit,
                    volume_available=max_volume,
                    execution_time_estimate=execution_time,
                    risk_level=risk_level,
                    opportunity_type='spatial',
                    confidence=confidence
                ))
        
        return opportunities
    
    def _detect_triangular_arbitrage(self, market_data: List[ExchangeData], 
                                   symbol: str, investment_amount: float) -> List[ArbitrageOpportunity]:
        """Detect triangular arbitrage opportunities"""
        
        opportunities = []
        
        # Triangular arbitrage requires at least 3 currencies
        # For simplicity, we'll simulate BTC -> ETH -> USDT -> BTC cycles
        
        if symbol.upper() not in ['BTC', 'ETH']:
            return opportunities  # Only implement for major pairs
        
        for exchange_data in market_data:
            if np.random.random() < 0.1:  # 10% chance of triangular opportunity
                
                # Simulate triangular arbitrage calculation
                initial_amount = investment_amount
                
                # Step 1: Convert initial currency
                step1_amount = initial_amount * 0.998  # After fees
                
                # Step 2: Convert to intermediate currency
                step2_rate = np.random.uniform(0.999, 1.003)  # Small price inefficiency
                step2_amount = step1_amount * step2_rate * 0.998
                
                # Step 3: Convert back to original currency
                step3_rate = np.random.uniform(0.999, 1.003)
                final_amount = step2_amount * step3_rate * 0.998
                
                profit = final_amount - initial_amount
                profit_percentage = (profit / initial_amount) * 100
                
                if profit_percentage > self.min_profit_threshold * 100:
                    opportunities.append(ArbitrageOpportunity(
                        symbol=symbol.upper(),
                        buy_exchange=exchange_data.exchange,
                        sell_exchange=exchange_data.exchange,  # Same exchange triangular
                        buy_price=exchange_data.ask,
                        sell_price=exchange_data.ask * (1 + profit_percentage/100),
                        price_difference=profit,
                        profit_percentage=profit_percentage,
                        estimated_profit=profit,
                        volume_available=investment_amount / exchange_data.ask,
                        execution_time_estimate=0.5,  # Fast on same exchange
                        risk_level='medium',
                        opportunity_type='triangular',
                        confidence=0.7
                    ))
        
        return opportunities
    
    def _detect_statistical_arbitrage(self, market_data: List[ExchangeData], 
                                    symbol: str, investment_amount: float) -> List[ArbitrageOpportunity]:
        """Detect statistical arbitrage opportunities"""
        
        opportunities = []
        
        # Calculate mean price
        prices = [data.price for data in market_data]
        mean_price = np.mean(prices)
        price_std = np.std(prices)
        
        # Look for exchanges significantly above/below mean
        for data in market_data:
            z_score = (data.price - mean_price) / price_std if price_std > 0 else 0
            
            # If price is more than 2 standard deviations from mean, it's a potential opportunity
            if abs(z_score) > 2:
                
                # Predict mean reversion
                expected_price = mean_price
                profit_potential = abs(data.price - expected_price)
                profit_percentage = (profit_potential / data.price) * 100
                
                if profit_percentage > self.min_profit_threshold * 100:
                    
                    # Determine action
                    action = 'sell' if data.price > mean_price else 'buy'
                    
                    opportunities.append(ArbitrageOpportunity(
                        symbol=symbol.upper(),
                        buy_exchange=data.exchange if action == 'sell' else 'market',
                        sell_exchange='market' if action == 'sell' else data.exchange,
                        buy_price=data.price if action == 'buy' else expected_price,
                        sell_price=expected_price if action == 'sell' else data.price,
                        price_difference=profit_potential,
                        profit_percentage=profit_percentage,
                        estimated_profit=profit_potential * (investment_amount / data.price),
                        volume_available=data.volume * 0.05,  # Conservative 5%
                        execution_time_estimate=1.0,  # Statistical arb takes time
                        risk_level='high',  # Statistical opportunities are riskier
                        opportunity_type='statistical',
                        confidence=0.6
                    ))
        
        return opportunities
    
    def _estimate_execution_time(self, buy_exchange: str, sell_exchange: str) -> float:
        """Estimate total execution time for arbitrage"""
        
        buy_latency = self.exchanges[buy_exchange]['latency']
        sell_latency = self.exchanges[sell_exchange]['latency']
        
        # Base execution time
        base_time = buy_latency + sell_latency
        
        # Add transfer time if different exchanges
        if buy_exchange != sell_exchange:
            base_time += 0.5  # Average transfer time
        
        # Add complexity for DEX
        if 'Swap' in buy_exchange or 'Swap' in sell_exchange:
            base_time += 0.3  # DEX confirmation time
        
        return round(base_time, 2)
    
    def _assess_arbitrage_risk(self, buy_exchange: ExchangeData, 
                             sell_exchange: ExchangeData, profit_percentage: float) -> str:
        """Assess risk level of arbitrage opportunity"""
        
        risk_score = 0
        
        # Profit margin risk (higher profit often means higher risk)
        if profit_percentage > 5:
            risk_score += 2
        elif profit_percentage > 2:
            risk_score += 1
        
        # Exchange reliability risk
        reliable_exchanges = ['Binance', 'Coinbase', 'Kraken']
        if buy_exchange.exchange not in reliable_exchanges:
            risk_score += 1
        if sell_exchange.exchange not in reliable_exchanges:
            risk_score += 1
        
        # Liquidity risk
        if buy_exchange.volume < 10000 or sell_exchange.volume < 10000:
            risk_score += 1
        
        # Spread risk
        if buy_exchange.spread > buy_exchange.price * 0.01:  # Spread > 1%
            risk_score += 1
        if sell_exchange.spread > sell_exchange.price * 0.01:
            risk_score += 1
        
        if risk_score <= 1:
            return 'low'
        elif risk_score <= 3:
            return 'medium'
        else:
            return 'high'
    
    def _calculate_arbitrage_confidence(self, profit_percentage: float, 
                                      execution_time: float, risk_level: str) -> float:
        """Calculate confidence in arbitrage opportunity"""
        
        base_confidence = 0.8
        
        # Adjust for profit margin
        if profit_percentage > 3:
            base_confidence += 0.1
        elif profit_percentage < 1:
            base_confidence -= 0.2
        
        # Adjust for execution time
        if execution_time > 1.0:
            base_confidence -= 0.1
        elif execution_time < 0.2:
            base_confidence += 0.1
        
        # Adjust for risk level
        risk_adjustments = {'low': 0.1, 'medium': 0, 'high': -0.2}
        base_confidence += risk_adjustments.get(risk_level, 0)
        
        return np.clip(base_confidence, 0.1, 0.95)
    
    def _filter_opportunities(self, opportunities: List[ArbitrageOpportunity]) -> List[ArbitrageOpportunity]:
        """Filter opportunities based on minimum criteria"""
        
        filtered = []
        
        for opp in opportunities:
            # Minimum profit threshold
            if opp.profit_percentage < self.min_profit_threshold * 100:
                continue
            
            # Maximum execution time
            if opp.execution_time_estimate > 2.0:  # 2 seconds max
                continue
            
            # Minimum volume
            if opp.volume_available < 1:  # At least 1 unit
                continue
            
            # Exclude very high risk unless profit is exceptional
            if opp.risk_level == 'high' and opp.profit_percentage < 3:
                continue
            
            filtered.append(opp)
        
        return filtered
    
    def _rank_opportunities(self, opportunities: List[ArbitrageOpportunity]) -> List[ArbitrageOpportunity]:
        """Rank opportunities by attractiveness score"""
        
        def calculate_score(opp: ArbitrageOpportunity) -> float:
            score = 0
            
            # Profit percentage (40% weight)
            score += opp.profit_percentage * 0.4
            
            # Estimated profit amount (30% weight)
            score += min(opp.estimated_profit / 1000, 10) * 0.3  # Cap at $1000 for scoring
            
            # Confidence (20% weight)
            score += opp.confidence * 10 * 0.2
            
            # Execution time (10% weight, inverse)
            score += (2 - opp.execution_time_estimate) * 5 * 0.1
            
            # Risk penalty
            risk_penalties = {'low': 0, 'medium': -1, 'high': -3}
            score += risk_penalties.get(opp.risk_level, -1)
            
            return score
        
        # Calculate scores and sort
        for opp in opportunities:
            opp.score = calculate_score(opp)
        
        return sorted(opportunities, key=lambda x: x.score, reverse=True)
    
    def monitor_arbitrage_opportunities(self, symbols: List[str], 
                                      duration_minutes: int = 60) -> Dict:
        """Monitor arbitrage opportunities over time"""
        
        monitoring_results = {
            'start_time': datetime.now().isoformat(),
            'duration_minutes': duration_minutes,
            'symbols_monitored': symbols,
            'opportunities_found': 0,
            'best_opportunities': [],
            'average_profit': 0,
            'monitoring_summary': {}
        }
        
        all_opportunities = []
        
        # Simulate monitoring over time (compressed for demo)
        monitoring_intervals = min(duration_minutes, 10)  # Max 10 intervals for demo
        
        for interval in range(monitoring_intervals):
            interval_opportunities = []
            
            for symbol in symbols:
                opportunities = self.detect_arbitrage_opportunities(symbol)
                interval_opportunities.extend(opportunities)
            
            all_opportunities.extend(interval_opportunities)
            
            # Simulate time passing (for demo purposes)
            time.sleep(0.1)  # Very short sleep for demo
        
        # Analyze results
        if all_opportunities:
            monitoring_results['opportunities_found'] = len(all_opportunities)
            monitoring_results['best_opportunities'] = self._rank_opportunities(all_opportunities)[:5]
            monitoring_results['average_profit'] = np.mean([opp.profit_percentage for opp in all_opportunities])
        
        # Summary by symbol
        for symbol in symbols:
            symbol_opps = [opp for opp in all_opportunities if opp.symbol == symbol.upper()]
            monitoring_results['monitoring_summary'][symbol] = {
                'opportunities_count': len(symbol_opps),
                'best_profit': max([opp.profit_percentage for opp in symbol_opps], default=0),
                'avg_execution_time': np.mean([opp.execution_time_estimate for opp in symbol_opps]) if symbol_opps else 0
            }
        
        return monitoring_results

def main():
    """Demo the arbitrage detection engine"""
    
    detector = CryptoArbitrageDetector()
    
    # Test with popular cryptocurrencies
    test_symbols = ['BTC', 'ETH', 'SOL']
    
    print("\n💱 CRYPTOCURRENCY ARBITRAGE DETECTION")
    print("=" * 50)
    
    for symbol in test_symbols:
        opportunities = detector.detect_arbitrage_opportunities(symbol, investment_amount=10000)
        
        print(f"\n💰 {symbol.upper()} Arbitrage Opportunities:")
        
        if opportunities:
            for i, opp in enumerate(opportunities[:3], 1):
                print(f"\n  #{i} {opp.opportunity_type.title()} Arbitrage:")
                print(f"    Buy: {opp.buy_exchange} @ ${opp.buy_price:.4f}")
                print(f"    Sell: {opp.sell_exchange} @ ${opp.sell_price:.4f}")
                print(f"    Profit: {opp.profit_percentage:.2f}% (${opp.estimated_profit:.2f})")
                print(f"    Risk: {opp.risk_level.title()} | Confidence: {opp.confidence:.2f}")
                print(f"    Execution Time: {opp.execution_time_estimate:.2f}s")
        else:
            print("    No arbitrage opportunities found")
    
    # Monitoring example
    print(f"\n📊 ARBITRAGE MONITORING (1 minute)")
    monitoring_results = detector.monitor_arbitrage_opportunities(test_symbols, duration_minutes=1)
    
    print(f"Total Opportunities Found: {monitoring_results['opportunities_found']}")
    print(f"Average Profit: {monitoring_results['average_profit']:.2f}%")
    
    if monitoring_results['best_opportunities']:
        best = monitoring_results['best_opportunities'][0]
        print(f"Best Opportunity: {best.symbol} {best.profit_percentage:.2f}% profit")

if __name__ == "__main__":
    main()