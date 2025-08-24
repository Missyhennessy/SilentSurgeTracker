#!/usr/bin/env python3

"""
Real-Time Sentiment Analysis for Cryptocurrency Markets
Integrates multiple data sources for comprehensive market sentiment tracking
"""

import requests
import json
import re
from datetime import datetime, timedelta
import time
from typing import Dict, List, Optional
import numpy as np

class CryptoSentimentAnalyzer:
    def __init__(self):
        self.news_sources = {
            'coindesk': 'https://api.coindesk.com/v1/news',
            'cryptonews': 'https://cryptonews.com/api/news',
            'cointelegraph': 'https://cointelegraph.com/api/rss'
        }
        
        # Sentiment keywords and weights
        self.positive_keywords = {
            'bull': 3, 'bullish': 3, 'moon': 3, 'pump': 2, 'green': 2,
            'surge': 3, 'rally': 3, 'breakout': 3, 'profit': 2, 'gains': 2,
            'buy': 2, 'hold': 1, 'support': 2, 'strong': 2, 'up': 1,
            'rocket': 3, 'diamond': 2, 'hands': 1, 'accumulate': 2,
            'institutional': 2, 'adoption': 3, 'partnership': 2
        }
        
        self.negative_keywords = {
            'bear': -3, 'bearish': -3, 'crash': -3, 'dump': -2, 'red': -2,
            'drop': -2, 'fall': -2, 'decline': -2, 'loss': -2, 'sell': -2,
            'fear': -2, 'panic': -3, 'weak': -2, 'resistance': -1, 'down': -1,
            'liquidation': -3, 'bubble': -2, 'scam': -3, 'regulation': -2,
            'ban': -3, 'hack': -3, 'exploit': -3, 'rug': -3
        }
        
        self.cache = {}
        self.cache_timeout = 300  # 5 minutes
    
    def analyze_text_sentiment(self, text: str) -> float:
        """Analyze sentiment of text using keyword-based approach"""
        if not text:
            return 0.0
        
        text = text.lower()
        words = re.findall(r'\b\w+\b', text)
        
        sentiment_score = 0
        word_count = 0
        
        for word in words:
            if word in self.positive_keywords:
                sentiment_score += self.positive_keywords[word]
                word_count += 1
            elif word in self.negative_keywords:
                sentiment_score += self.negative_keywords[word]
                word_count += 1
        
        if word_count == 0:
            return 0.0
        
        # Normalize by word count and scale to -1 to 1
        normalized_score = sentiment_score / max(word_count, 1)
        return max(-1.0, min(1.0, normalized_score / 3.0))
    
    def fetch_crypto_news_sentiment(self, symbol: str, hours: int = 24) -> dict:
        """Fetch and analyze news sentiment for a specific cryptocurrency"""
        cache_key = f"news_{symbol}_{hours}"
        
        # Check cache
        if cache_key in self.cache:
            cache_time, cache_data = self.cache[cache_key]
            if time.time() - cache_time < self.cache_timeout:
                return cache_data
        
        news_items = []
        sentiment_scores = []
        
        try:
            # Simulate news API calls (replace with real APIs when available)
            simulated_news = [
                f"{symbol} shows strong technical indicators as volume increases",
                f"Institutional investors eye {symbol} for portfolio diversification",
                f"Market analysis suggests {symbol} could see significant movement",
                f"Trading volume for {symbol} reaches new highs amid market uncertainty",
                f"{symbol} community remains optimistic despite broader market volatility"
            ]
            
            for news_text in simulated_news:
                sentiment = self.analyze_text_sentiment(news_text)
                sentiment_scores.append(sentiment)
                news_items.append({
                    'text': news_text,
                    'sentiment': sentiment,
                    'timestamp': datetime.now().isoformat()
                })
            
            # Calculate aggregate sentiment
            if sentiment_scores:
                avg_sentiment = np.mean(sentiment_scores)
                sentiment_strength = abs(avg_sentiment)
                sentiment_direction = 'positive' if avg_sentiment > 0 else 'negative' if avg_sentiment < 0 else 'neutral'
            else:
                avg_sentiment = 0.0
                sentiment_strength = 0.0
                sentiment_direction = 'neutral'
            
            result = {
                'symbol': symbol,
                'average_sentiment': float(avg_sentiment),
                'sentiment_strength': float(sentiment_strength),
                'sentiment_direction': sentiment_direction,
                'news_count': len(news_items),
                'news_items': news_items[:5],  # Top 5 recent news
                'confidence': min(0.8, len(sentiment_scores) / 10.0),  # Higher confidence with more data
                'last_updated': datetime.now().isoformat()
            }
            
            # Cache the result
            self.cache[cache_key] = (time.time(), result)
            return result
            
        except Exception as e:
            print(f"Error fetching news sentiment for {symbol}: {e}")
            return {
                'symbol': symbol,
                'average_sentiment': 0.0,
                'sentiment_strength': 0.0,
                'sentiment_direction': 'neutral',
                'news_count': 0,
                'news_items': [],
                'confidence': 0.0,
                'last_updated': datetime.now().isoformat(),
                'error': str(e)
            }
    
    def analyze_social_sentiment(self, symbol: str) -> dict:
        """Simulate social media sentiment analysis"""
        try:
            # Simulate Reddit/Twitter sentiment (replace with real APIs)
            social_mentions = [
                f"{symbol} looking strong! HODL 💎🙌",
                f"Just bought more {symbol}, this dip is a gift",
                f"{symbol} breaking resistance, moon mission started 🚀",
                f"Accumulating {symbol} on every dip",
                f"{symbol} fundamentals are solid, patience will pay off"
            ]
            
            sentiment_scores = []
            for mention in social_mentions:
                sentiment = self.analyze_text_sentiment(mention)
                sentiment_scores.append(sentiment)
            
            if sentiment_scores:
                avg_sentiment = np.mean(sentiment_scores)
                sentiment_volume = len(sentiment_scores)
            else:
                avg_sentiment = 0.0
                sentiment_volume = 0
            
            return {
                'symbol': symbol,
                'social_sentiment': float(avg_sentiment),
                'mention_volume': sentiment_volume,
                'sentiment_trend': 'increasing' if avg_sentiment > 0.1 else 'decreasing' if avg_sentiment < -0.1 else 'stable',
                'confidence': min(0.7, sentiment_volume / 20.0),
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'symbol': symbol,
                'social_sentiment': 0.0,
                'mention_volume': 0,
                'sentiment_trend': 'stable',
                'confidence': 0.0,
                'last_updated': datetime.now().isoformat(),
                'error': str(e)
            }
    
    def get_comprehensive_sentiment(self, symbol: str) -> dict:
        """Get comprehensive sentiment analysis combining all sources"""
        news_sentiment = self.fetch_crypto_news_sentiment(symbol)
        social_sentiment = self.analyze_social_sentiment(symbol)
        
        # Weighted combination of sentiment sources
        news_weight = 0.6
        social_weight = 0.4
        
        combined_sentiment = (
            news_sentiment['average_sentiment'] * news_weight +
            social_sentiment['social_sentiment'] * social_weight
        )
        
        # Calculate overall confidence
        overall_confidence = (
            news_sentiment['confidence'] * news_weight +
            social_sentiment['confidence'] * social_weight
        )
        
        return {
            'symbol': symbol,
            'overall_sentiment': float(combined_sentiment),
            'sentiment_score': float((combined_sentiment + 1) * 50),  # Convert to 0-100 scale
            'confidence': float(overall_confidence),
            'sentiment_breakdown': {
                'news': news_sentiment,
                'social': social_sentiment
            },
            'market_mood': self._classify_market_mood(combined_sentiment),
            'last_updated': datetime.now().isoformat()
        }
    
    def _classify_market_mood(self, sentiment: float) -> str:
        """Classify market mood based on sentiment score"""
        if sentiment > 0.5:
            return 'extremely_bullish'
        elif sentiment > 0.2:
            return 'bullish'
        elif sentiment > -0.2:
            return 'neutral'
        elif sentiment > -0.5:
            return 'bearish'
        else:
            return 'extremely_bearish'

def main():
    """Test sentiment analysis"""
    analyzer = CryptoSentimentAnalyzer()
    
    test_symbols = ['BTC', 'ETH', 'SUI']
    
    for symbol in test_symbols:
        print(f"\n=== SENTIMENT ANALYSIS FOR {symbol} ===")
        sentiment = analyzer.get_comprehensive_sentiment(symbol)
        
        print(f"Overall Sentiment: {sentiment['overall_sentiment']:.2f}")
        print(f"Sentiment Score: {sentiment['sentiment_score']:.1f}/100")
        print(f"Market Mood: {sentiment['market_mood'].replace('_', ' ').title()}")
        print(f"Confidence: {sentiment['confidence']:.1%}")
        
        print(f"\nNews Sentiment: {sentiment['sentiment_breakdown']['news']['average_sentiment']:.2f}")
        print(f"Social Sentiment: {sentiment['sentiment_breakdown']['social']['social_sentiment']:.2f}")

if __name__ == "__main__":
    main()