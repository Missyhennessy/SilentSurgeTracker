#!/usr/bin/env python3
"""
Cryptocurrency Sentiment Analysis Engine
Multi-source sentiment aggregation from social media, news, and market indicators
"""

import numpy as np
import pandas as pd
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging
import re
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class SentimentResult:
    """Structured sentiment analysis result"""
    overall_sentiment: float  # -1 to 1 scale
    confidence: float  # 0 to 1 scale
    sentiment_label: str  # positive, negative, neutral
    sources: Dict[str, float]  # sentiment by source
    trending_topics: List[str]
    influencer_sentiment: float
    volume_weighted_sentiment: float
    fear_greed_index: float

class CryptoSentimentAnalyzer:
    """Advanced cryptocurrency sentiment analysis engine"""
    
    def __init__(self):
        # Sentiment keywords and weights
        self.positive_keywords = {
            'bullish': 1.0, 'moon': 0.8, 'pump': 0.7, 'buy': 0.6, 'hodl': 0.5,
            'diamond hands': 0.9, 'to the moon': 0.9, 'rocket': 0.7, 'green': 0.6,
            'profit': 0.7, 'gains': 0.8, 'surge': 0.8, 'breakout': 0.9, 'rally': 0.8
        }
        
        self.negative_keywords = {
            'bearish': -1.0, 'dump': -0.8, 'crash': -0.9, 'sell': -0.6, 'fear': -0.7,
            'paper hands': -0.8, 'fud': -0.9, 'scam': -1.0, 'rug': -1.0, 'red': -0.6,
            'loss': -0.7, 'drop': -0.6, 'decline': -0.7, 'correction': -0.5
        }
        
        # Fear & Greed Index simulation weights
        self.fear_greed_weights = {
            'volatility': 0.25,
            'volume': 0.25,
            'social_sentiment': 0.15,
            'market_momentum': 0.15,
            'dominance': 0.10,
            'trends': 0.10
        }
        
        # Initialize sentiment cache
        self.sentiment_cache = {}
        
    def analyze_crypto_sentiment(self, symbol: str, timeframe: str = '24h') -> SentimentResult:
        """Comprehensive sentiment analysis for a cryptocurrency"""
        
        try:
            # Get multi-source sentiment data
            twitter_sentiment = self._analyze_twitter_sentiment(symbol, timeframe)
            reddit_sentiment = self._analyze_reddit_sentiment(symbol, timeframe)
            news_sentiment = self._analyze_news_sentiment(symbol, timeframe)
            telegram_sentiment = self._analyze_telegram_sentiment(symbol, timeframe)
            
            # Calculate weighted overall sentiment
            source_weights = {
                'twitter': 0.35,
                'reddit': 0.25,
                'news': 0.25,
                'telegram': 0.15
            }
            
            overall_sentiment = (
                twitter_sentiment['sentiment'] * source_weights['twitter'] +
                reddit_sentiment['sentiment'] * source_weights['reddit'] +
                news_sentiment['sentiment'] * source_weights['news'] +
                telegram_sentiment['sentiment'] * source_weights['telegram']
            )
            
            # Calculate confidence based on source agreement
            sentiments = [
                twitter_sentiment['sentiment'],
                reddit_sentiment['sentiment'],
                news_sentiment['sentiment'],
                telegram_sentiment['sentiment']
            ]
            confidence = self._calculate_sentiment_confidence(sentiments)
            
            # Get trending topics
            trending_topics = self._extract_trending_topics([
                twitter_sentiment['topics'],
                reddit_sentiment['topics']
            ])
            
            # Calculate influencer sentiment
            influencer_sentiment = self._calculate_influencer_sentiment(symbol)
            
            # Volume-weighted sentiment
            volume_weighted = self._calculate_volume_weighted_sentiment(
                overall_sentiment, symbol, timeframe
            )
            
            # Fear & Greed Index
            fear_greed = self._calculate_fear_greed_index(symbol)
            
            # Determine sentiment label
            if overall_sentiment > 0.2:
                sentiment_label = "positive"
            elif overall_sentiment < -0.2:
                sentiment_label = "negative"
            else:
                sentiment_label = "neutral"
            
            return SentimentResult(
                overall_sentiment=round(overall_sentiment, 3),
                confidence=round(confidence, 3),
                sentiment_label=sentiment_label,
                sources={
                    'twitter': round(twitter_sentiment['sentiment'], 3),
                    'reddit': round(reddit_sentiment['sentiment'], 3),
                    'news': round(news_sentiment['sentiment'], 3),
                    'telegram': round(telegram_sentiment['sentiment'], 3)
                },
                trending_topics=trending_topics[:5],
                influencer_sentiment=round(influencer_sentiment, 3),
                volume_weighted_sentiment=round(volume_weighted, 3),
                fear_greed_index=round(fear_greed, 1)
            )
            
        except Exception as e:
            logger.error(f"Sentiment analysis error for {symbol}: {e}")
            return self._create_neutral_sentiment()
    
    def _analyze_twitter_sentiment(self, symbol: str, timeframe: str) -> Dict:
        """Analyze Twitter sentiment (simulated with realistic patterns)"""
        
        # Simulate Twitter sentiment based on market patterns
        base_sentiment = np.random.normal(0, 0.3)
        
        # Add volatility-based sentiment shifts
        if symbol.upper() in ['BTC', 'ETH']:
            base_sentiment += 0.1  # Slight positive bias for major coins
        elif 'MEME' in symbol.upper() or symbol.upper() in ['DOGE', 'SHIB', 'PEPE']:
            base_sentiment += np.random.choice([-0.4, 0.4], p=[0.3, 0.7])  # High volatility
        
        # Time-based adjustments
        hour = datetime.now().hour
        if 14 <= hour <= 22:  # Trading hours
            base_sentiment *= 1.2
        
        topics = self._generate_trending_topics(symbol)
        
        return {
            'sentiment': np.clip(base_sentiment, -1, 1),
            'volume': np.random.randint(1000, 50000),
            'topics': topics
        }
    
    def _analyze_reddit_sentiment(self, symbol: str, timeframe: str) -> Dict:
        """Analyze Reddit sentiment (simulated)"""
        
        base_sentiment = np.random.normal(0, 0.25)
        
        # Reddit tends to be more analytical
        if symbol.upper() in ['BTC', 'ETH', 'ADA', 'DOT']:
            base_sentiment += 0.05  # Slight positive for fundamentals
        
        topics = self._generate_trending_topics(symbol, source='reddit')
        
        return {
            'sentiment': np.clip(base_sentiment, -1, 1),
            'volume': np.random.randint(500, 10000),
            'topics': topics
        }
    
    def _analyze_news_sentiment(self, symbol: str, timeframe: str) -> Dict:
        """Analyze news sentiment (simulated)"""
        
        base_sentiment = np.random.normal(0, 0.2)
        
        # News sentiment patterns
        if np.random.random() < 0.1:  # 10% chance of major news
            base_sentiment += np.random.choice([-0.6, 0.6])
        
        return {
            'sentiment': np.clip(base_sentiment, -1, 1),
            'volume': np.random.randint(10, 1000),
            'topics': self._generate_news_topics(symbol)
        }
    
    def _analyze_telegram_sentiment(self, symbol: str, timeframe: str) -> Dict:
        """Analyze Telegram sentiment (simulated)"""
        
        base_sentiment = np.random.normal(0, 0.35)
        
        # Telegram often has insider information bias
        base_sentiment += np.random.normal(0, 0.1)
        
        return {
            'sentiment': np.clip(base_sentiment, -1, 1),
            'volume': np.random.randint(100, 5000),
            'topics': self._generate_trending_topics(symbol, source='telegram')
        }
    
    def _calculate_sentiment_confidence(self, sentiments: List[float]) -> float:
        """Calculate confidence based on sentiment agreement across sources"""
        
        # High agreement = high confidence
        std_dev = np.std(sentiments)
        max_std = 1.0  # Maximum possible standard deviation
        
        # Inverse relationship: lower std = higher confidence
        confidence = 1 - (std_dev / max_std)
        
        # Boost confidence if sentiments are strong and aligned
        mean_sentiment = np.mean(sentiments)
        if abs(mean_sentiment) > 0.5 and std_dev < 0.3:
            confidence = min(1.0, confidence * 1.2)
        
        return max(0.1, confidence)  # Minimum 10% confidence
    
    def _extract_trending_topics(self, topic_lists: List[List[str]]) -> List[str]:
        """Extract trending topics across sources"""
        
        all_topics = []
        for topics in topic_lists:
            all_topics.extend(topics)
        
        # Count topic frequency
        topic_counts = {}
        for topic in all_topics:
            topic_counts[topic] = topic_counts.get(topic, 0) + 1
        
        # Sort by frequency
        trending = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)
        
        return [topic for topic, count in trending[:10]]
    
    def _generate_trending_topics(self, symbol: str, source: str = 'general') -> List[str]:
        """Generate realistic trending topics for a symbol"""
        
        base_topics = [
            f"${symbol.upper()}", f"{symbol.lower()} price", f"{symbol.upper()} analysis",
            "bull run", "market update", "crypto news", "hodl", "diamond hands"
        ]
        
        # Add source-specific topics
        if source == 'reddit':
            base_topics.extend(["technical analysis", "fundamentals", "research", "DD"])
        elif source == 'telegram':
            base_topics.extend(["signals", "pumping", "insider", "alpha"])
        
        # Add random selection
        additional_topics = [
            "moon", "rocket", "breakout", "support", "resistance", "volume",
            "whales", "institutions", "adoption", "partnerships"
        ]
        
        selected_topics = base_topics[:4] + np.random.choice(
            additional_topics, size=3, replace=False
        ).tolist()
        
        return selected_topics
    
    def _generate_news_topics(self, symbol: str) -> List[str]:
        """Generate news-specific topics"""
        
        news_topics = [
            f"{symbol.upper()} partnership announcement",
            f"{symbol.upper()} technical upgrade",
            "institutional adoption",
            "regulatory news",
            "market analysis",
            "blockchain technology",
            "DeFi integration"
        ]
        
        return np.random.choice(news_topics, size=3, replace=False).tolist()
    
    def _calculate_influencer_sentiment(self, symbol: str) -> float:
        """Calculate influencer sentiment (simulated)"""
        
        # Simulate influencer sentiment with some major influencer patterns
        influencer_sentiment = np.random.normal(0, 0.4)
        
        # Major influencers can cause sentiment spikes
        if np.random.random() < 0.05:  # 5% chance of influencer event
            influencer_sentiment += np.random.choice([-0.8, 0.8])
        
        return np.clip(influencer_sentiment, -1, 1)
    
    def _calculate_volume_weighted_sentiment(self, sentiment: float, symbol: str, timeframe: str) -> float:
        """Calculate volume-weighted sentiment"""
        
        # Simulate volume data
        base_volume = np.random.lognormal(15, 1.5)  # Log-normal distribution for volume
        
        # Weight sentiment by volume
        volume_factor = min(base_volume / 1000000, 10)  # Cap volume factor
        volume_weight = 1 + (volume_factor * 0.1)  # Small volume adjustment
        
        weighted_sentiment = sentiment * volume_weight
        
        return np.clip(weighted_sentiment, -1, 1)
    
    def _calculate_fear_greed_index(self, symbol: str) -> float:
        """Calculate Fear & Greed Index (0-100 scale)"""
        
        # Simulate market indicators
        volatility_score = np.random.beta(2, 2) * 100  # 0-100
        volume_score = np.random.beta(2, 2) * 100
        social_score = (np.random.normal(0.5, 0.2)) * 100  # Convert sentiment to 0-100
        momentum_score = np.random.beta(2, 2) * 100
        dominance_score = np.random.uniform(40, 60)  # BTC dominance simulation
        trends_score = np.random.beta(2, 2) * 100
        
        # Calculate weighted Fear & Greed Index
        fear_greed = (
            volatility_score * self.fear_greed_weights['volatility'] +
            volume_score * self.fear_greed_weights['volume'] +
            social_score * self.fear_greed_weights['social_sentiment'] +
            momentum_score * self.fear_greed_weights['market_momentum'] +
            dominance_score * self.fear_greed_weights['dominance'] +
            trends_score * self.fear_greed_weights['trends']
        )
        
        return np.clip(fear_greed, 0, 100)
    
    def _create_neutral_sentiment(self) -> SentimentResult:
        """Create neutral sentiment result for error cases"""
        
        return SentimentResult(
            overall_sentiment=0.0,
            confidence=0.5,
            sentiment_label="neutral",
            sources={'twitter': 0.0, 'reddit': 0.0, 'news': 0.0, 'telegram': 0.0},
            trending_topics=["market analysis", "crypto news"],
            influencer_sentiment=0.0,
            volume_weighted_sentiment=0.0,
            fear_greed_index=50.0
        )
    
    def analyze_market_sentiment(self, symbols: List[str]) -> Dict:
        """Analyze overall market sentiment across multiple symbols"""
        
        market_sentiments = []
        individual_results = {}
        
        for symbol in symbols:
            result = self.analyze_crypto_sentiment(symbol)
            market_sentiments.append(result.overall_sentiment)
            individual_results[symbol] = result
        
        overall_market_sentiment = np.mean(market_sentiments)
        sentiment_std = np.std(market_sentiments)
        
        # Market fear/greed based on sentiment distribution
        if overall_market_sentiment > 0.3:
            market_mood = "Greed"
        elif overall_market_sentiment < -0.3:
            market_mood = "Fear"
        else:
            market_mood = "Neutral"
        
        return {
            'overall_market_sentiment': round(overall_market_sentiment, 3),
            'market_mood': market_mood,
            'sentiment_volatility': round(sentiment_std, 3),
            'individual_sentiments': individual_results,
            'timestamp': datetime.now().isoformat()
        }

def main():
    """Demo the sentiment analysis engine"""
    
    analyzer = CryptoSentimentAnalyzer()
    
    # Test with popular cryptocurrencies
    test_symbols = ['BTC', 'ETH', 'SOL', 'DOGE', 'PEPE']
    
    print("\n🔍 CRYPTOCURRENCY SENTIMENT ANALYSIS")
    print("=" * 50)
    
    for symbol in test_symbols:
        result = analyzer.analyze_crypto_sentiment(symbol)
        
        print(f"\n💰 {symbol.upper()}")
        print(f"Overall Sentiment: {result.overall_sentiment:.3f} ({result.sentiment_label})")
        print(f"Confidence: {result.confidence:.3f}")
        print(f"Fear & Greed Index: {result.fear_greed_index:.1f}")
        print(f"Trending: {', '.join(result.trending_topics[:3])}")
    
    # Market overview
    market_analysis = analyzer.analyze_market_sentiment(test_symbols)
    print(f"\n📊 MARKET OVERVIEW")
    print(f"Market Sentiment: {market_analysis['overall_market_sentiment']:.3f}")
    print(f"Market Mood: {market_analysis['market_mood']}")
    print(f"Sentiment Volatility: {market_analysis['sentiment_volatility']:.3f}")

if __name__ == "__main__":
    main()