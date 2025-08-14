#!/usr/bin/env python3
"""
Comprehensive Accuracy Test Suite for Silent Surge Engine
Tests algorithm accuracy against various market scenarios and historical patterns
"""

import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from enhanced_surge_engine import EnhancedSilentSurgeEngine, MarketContext
from market_intelligence import MarketIntelligenceEngine
import logging

logger = logging.getLogger(__name__)

class AccuracyTestSuite:
    """Comprehensive testing suite for algorithm accuracy validation"""
    
    def __init__(self):
        self.enhanced_engine = EnhancedSilentSurgeEngine()
        self.market_intel = MarketIntelligenceEngine()
        self.test_scenarios = self._create_test_scenarios()
        
    def _create_test_scenarios(self) -> List[Dict]:
        """Create comprehensive test scenarios based on real market patterns"""
        
        return [
            {
                'name': 'Bull Market Momentum',
                'description': 'Strong uptrend with high sentiment and volume',
                'market_context': MarketContext(
                    volatility_regime='medium',
                    trend_direction='bullish', 
                    risk_sentiment=0.8,
                    correlation_strength=0.6,
                    volume_profile='increasing'
                ),
                'tokens': [
                    {'symbol': 'ETH', 'sss': 85, 'velocity': 1.5, 'sentiment': 4.2, 'anchor': 0.75, 'expected_outcome': 'strong_positive'},
                    {'symbol': 'SOL', 'sss': 88, 'velocity': 1.8, 'sentiment': 4.5, 'anchor': 0.72, 'expected_outcome': 'strong_positive'},
                    {'symbol': 'AVAX', 'sss': 78, 'velocity': 1.3, 'sentiment': 3.8, 'anchor': 0.68, 'expected_outcome': 'positive'}
                ]
            },
            {
                'name': 'Bear Market Recovery',
                'description': 'Early recovery phase with cautious optimism',
                'market_context': MarketContext(
                    volatility_regime='high',
                    trend_direction='bullish',
                    risk_sentiment=0.4,
                    correlation_strength=0.8,
                    volume_profile='stable'
                ),
                'tokens': [
                    {'symbol': 'BTC', 'sss': 72, 'velocity': 1.1, 'sentiment': 3.2, 'anchor': 0.65, 'expected_outcome': 'cautious_positive'},
                    {'symbol': 'ETH', 'sss': 68, 'velocity': 0.9, 'sentiment': 3.0, 'anchor': 0.58, 'expected_outcome': 'neutral'},
                    {'symbol': 'ADA', 'sss': 65, 'velocity': 0.8, 'sentiment': 2.8, 'anchor': 0.52, 'expected_outcome': 'neutral'}
                ]
            },
            {
                'name': 'Market Correction',
                'description': 'High volatility correction phase',
                'market_context': MarketContext(
                    volatility_regime='high',
                    trend_direction='bearish',
                    risk_sentiment=0.2,
                    correlation_strength=0.9,
                    volume_profile='decreasing'
                ),
                'tokens': [
                    {'symbol': 'LUNA', 'sss': 45, 'velocity': 0.3, 'sentiment': 2.1, 'anchor': 0.35, 'expected_outcome': 'negative'},
                    {'symbol': 'FTM', 'sss': 52, 'velocity': 0.5, 'sentiment': 2.4, 'anchor': 0.42, 'expected_outcome': 'negative'},
                    {'symbol': 'MATIC', 'sss': 58, 'velocity': 0.7, 'sentiment': 2.7, 'anchor': 0.48, 'expected_outcome': 'weak_negative'}
                ]
            },
            {
                'name': 'Altcoin Season',
                'description': 'Strong altcoin performance vs BTC',
                'market_context': MarketContext(
                    volatility_regime='medium',
                    trend_direction='bullish',
                    risk_sentiment=0.7,
                    correlation_strength=0.4,
                    volume_profile='increasing'
                ),
                'tokens': [
                    {'symbol': 'LINK', 'sss': 82, 'velocity': 1.4, 'sentiment': 4.0, 'anchor': 0.7, 'expected_outcome': 'strong_positive'},
                    {'symbol': 'DOT', 'sss': 79, 'velocity': 1.2, 'sentiment': 3.9, 'anchor': 0.68, 'expected_outcome': 'positive'},
                    {'symbol': 'UNI', 'sss': 76, 'velocity': 1.1, 'sentiment': 3.7, 'anchor': 0.65, 'expected_outcome': 'positive'}
                ]
            },
            {
                'name': 'Sideways Consolidation',
                'description': 'Low volatility accumulation phase',
                'market_context': MarketContext(
                    volatility_regime='low',
                    trend_direction='sideways',
                    risk_sentiment=0.5,
                    correlation_strength=0.7,
                    volume_profile='stable'
                ),
                'tokens': [
                    {'symbol': 'XRP', 'sss': 62, 'velocity': 0.6, 'sentiment': 3.1, 'anchor': 0.55, 'expected_outcome': 'neutral'},
                    {'symbol': 'LTC', 'sss': 58, 'velocity': 0.5, 'sentiment': 2.9, 'anchor': 0.52, 'expected_outcome': 'neutral'},
                    {'symbol': 'BCH', 'sss': 54, 'velocity': 0.4, 'sentiment': 2.7, 'anchor': 0.48, 'expected_outcome': 'weak_negative'}
                ]
            }
        ]
    
    def run_comprehensive_tests(self) -> Dict:
        """Run comprehensive accuracy tests across all scenarios"""
        
        print("🧪 RUNNING COMPREHENSIVE ACCURACY TEST SUITE")
        print("=" * 70)
        
        results = {
            'test_timestamp': datetime.now().isoformat(),
            'total_scenarios': len(self.test_scenarios),
            'scenario_results': [],
            'overall_accuracy': 0,
            'model_performance': {},
            'recommendations': []
        }
        
        total_tests = 0
        correct_predictions = 0
        
        for scenario in self.test_scenarios:
            scenario_result = self._test_scenario(scenario)
            results['scenario_results'].append(scenario_result)
            
            total_tests += scenario_result['total_tokens']
            correct_predictions += scenario_result['correct_predictions']
            
            print(f"\n📊 SCENARIO: {scenario['name'].upper()}")
            print(f"Description: {scenario['description']}")
            print(f"Accuracy: {scenario_result['accuracy']:.1f}% ({scenario_result['correct_predictions']}/{scenario_result['total_tokens']})")
            print(f"Average SSS: {scenario_result['avg_sss']:.1f}")
            print(f"Average Probability: {scenario_result['avg_probability']:.1f}%")
            
        # Calculate overall accuracy
        results['overall_accuracy'] = (correct_predictions / total_tests) * 100 if total_tests > 0 else 0
        
        # Generate model performance analysis
        results['model_performance'] = self._analyze_model_performance(results['scenario_results'])
        
        # Generate recommendations
        results['recommendations'] = self._generate_accuracy_recommendations(results)
        
        print(f"\n🎯 OVERALL ACCURACY: {results['overall_accuracy']:.1f}%")
        print(f"Total Tests: {total_tests}")
        print(f"Correct Predictions: {correct_predictions}")
        
        return results
    
    def _test_scenario(self, scenario: Dict) -> Dict:
        """Test a single market scenario"""
        
        tokens = scenario['tokens']
        market_context = scenario['market_context']
        
        scenario_result = {
            'name': scenario['name'],
            'total_tokens': len(tokens),
            'correct_predictions': 0,
            'token_results': [],
            'avg_sss': 0,
            'avg_probability': 0,
            'accuracy': 0
        }
        
        sss_scores = []
        probabilities = []
        
        for token_data in tokens:
            # Calculate enhanced SSS
            metrics = {
                'behavioral_activity': token_data['sss'] / 100 * 0.8 + 0.1,
                'velocity_anomaly': token_data['velocity'] / 2,
                'community_cohesion': token_data['sentiment'] / 5,
                'anchor_pressure': token_data['anchor'],
                'hype_to_hold': token_data['sss'] / 100 * 0.9 + 0.05,
                'historical_volatility': 0.5  # Neutral for testing
            }
            
            sss_result = self.enhanced_engine.calculate_enhanced_sss(metrics, market_context)
            
            # Calculate breakout probability
            prob_result = self.enhanced_engine.enhanced_breakout_probability(
                sss_result['sss'], token_data['velocity'], token_data['sentiment'],
                token_data['anchor'], 7, market_context
            )
            
            # Evaluate prediction accuracy
            prediction_correct = self._evaluate_prediction(
                sss_result, prob_result, token_data['expected_outcome']
            )
            
            if prediction_correct:
                scenario_result['correct_predictions'] += 1
            
            sss_scores.append(sss_result['sss'])
            probabilities.append(prob_result['ensemble_probability'])
            
            scenario_result['token_results'].append({
                'symbol': token_data['symbol'],
                'sss': sss_result['sss'],
                'probability': prob_result['ensemble_probability'],
                'expected': token_data['expected_outcome'],
                'correct': prediction_correct,
                'confidence': sss_result['model_confidence']
            })
        
        scenario_result['avg_sss'] = np.mean(sss_scores)
        scenario_result['avg_probability'] = np.mean(probabilities)
        scenario_result['accuracy'] = (scenario_result['correct_predictions'] / scenario_result['total_tokens']) * 100
        
        return scenario_result
    
    def _evaluate_prediction(self, sss_result: Dict, prob_result: Dict, expected_outcome: str) -> bool:
        """Evaluate if prediction matches expected outcome"""
        
        sss = sss_result['sss']
        probability = prob_result['ensemble_probability']
        
        # Define outcome thresholds
        outcome_mapping = {
            'strong_positive': lambda s, p: s >= 80 and p >= 75,
            'positive': lambda s, p: s >= 70 and p >= 60,
            'cautious_positive': lambda s, p: 60 <= s < 75 and 50 <= p < 70,
            'neutral': lambda s, p: 45 <= s < 70 and 40 <= p < 65,
            'weak_negative': lambda s, p: 35 <= s < 55 and p < 50,
            'negative': lambda s, p: s < 45 and p < 40
        }
        
        if expected_outcome in outcome_mapping:
            return outcome_mapping[expected_outcome](sss, probability)
        
        return False
    
    def _analyze_model_performance(self, scenario_results: List[Dict]) -> Dict:
        """Analyze model performance across scenarios"""
        
        performance = {
            'best_scenario': None,
            'worst_scenario': None,
            'avg_accuracy_by_scenario': {},
            'consistency_score': 0,
            'confidence_correlation': 0
        }
        
        accuracies = []
        for result in scenario_results:
            accuracy = result['accuracy']
            scenario_name = result['name']
            
            performance['avg_accuracy_by_scenario'][scenario_name] = accuracy
            accuracies.append(accuracy)
            
            if performance['best_scenario'] is None or accuracy > performance['best_scenario'][1]:
                performance['best_scenario'] = (scenario_name, accuracy)
            
            if performance['worst_scenario'] is None or accuracy < performance['worst_scenario'][1]:
                performance['worst_scenario'] = (scenario_name, accuracy)
        
        # Calculate consistency (lower std dev = higher consistency)
        if accuracies:
            performance['consistency_score'] = max(0, 100 - np.std(accuracies))
        
        return performance
    
    def _generate_accuracy_recommendations(self, results: Dict) -> List[str]:
        """Generate recommendations for improving accuracy"""
        
        recommendations = []
        overall_accuracy = results['overall_accuracy']
        
        if overall_accuracy < 70:
            recommendations.append("Overall accuracy below 70% - consider recalibrating base coefficients")
        
        if overall_accuracy >= 80:
            recommendations.append("Strong accuracy achieved - maintain current algorithm parameters")
        
        # Analyze scenario-specific performance
        scenario_results = results['scenario_results']
        
        for scenario in scenario_results:
            if scenario['accuracy'] < 60:
                recommendations.append(f"Low accuracy in '{scenario['name']}' scenario - review {scenario['name'].lower()} parameter adjustments")
            elif scenario['accuracy'] >= 90:
                recommendations.append(f"Excellent performance in '{scenario['name']}' scenario - consider applying similar adjustments to other scenarios")
        
        # Model performance recommendations
        performance = results['model_performance']
        if performance.get('consistency_score', 0) < 70:
            recommendations.append("Model consistency is low across scenarios - consider implementing adaptive weighting")
        
        return recommendations
    
    def benchmark_against_baseline(self) -> Dict:
        """Benchmark enhanced algorithm against baseline version"""
        
        print("\n🏁 BENCHMARKING ENHANCED VS BASELINE ALGORITHM")
        print("=" * 60)
        
        from surge_engine import SilentSurgeEngine
        baseline_engine = SilentSurgeEngine()
        
        benchmark_results = {
            'enhanced_accuracy': 0,
            'baseline_accuracy': 0,
            'improvement': 0,
            'detailed_comparison': []
        }
        
        total_enhanced_correct = 0
        total_baseline_correct = 0
        total_tests = 0
        
        for scenario in self.test_scenarios:
            for token_data in scenario['tokens']:
                total_tests += 1
                
                # Test enhanced engine
                metrics = {
                    'behavioral_activity': token_data['sss'] / 100 * 0.8 + 0.1,
                    'velocity_anomaly': token_data['velocity'] / 2,
                    'community_cohesion': token_data['sentiment'] / 5,
                    'anchor_pressure': token_data['anchor'],
                    'hype_to_hold': token_data['sss'] / 100 * 0.9 + 0.05,
                    'historical_volatility': 0.5
                }
                
                enhanced_result = self.enhanced_engine.calculate_enhanced_sss(metrics, scenario['market_context'])
                baseline_result = {'sss': baseline_engine.calculate_sss_score(metrics)}
                
                # Mock probability results for comparison
                enhanced_correct = enhanced_result['sss'] >= 70 if 'positive' in token_data['expected_outcome'] else enhanced_result['sss'] < 70
                baseline_correct = baseline_result['sss'] >= 70 if 'positive' in token_data['expected_outcome'] else baseline_result['sss'] < 70
                
                if enhanced_correct:
                    total_enhanced_correct += 1
                if baseline_correct:
                    total_baseline_correct += 1
                
                benchmark_results['detailed_comparison'].append({
                    'token': token_data['symbol'],
                    'enhanced_sss': enhanced_result['sss'],
                    'baseline_sss': baseline_result['sss'],
                    'enhanced_correct': enhanced_correct,
                    'baseline_correct': baseline_correct
                })
        
        benchmark_results['enhanced_accuracy'] = (total_enhanced_correct / total_tests) * 100
        benchmark_results['baseline_accuracy'] = (total_baseline_correct / total_tests) * 100
        benchmark_results['improvement'] = benchmark_results['enhanced_accuracy'] - benchmark_results['baseline_accuracy']
        
        print(f"Enhanced Algorithm Accuracy: {benchmark_results['enhanced_accuracy']:.1f}%")
        print(f"Baseline Algorithm Accuracy: {benchmark_results['baseline_accuracy']:.1f}%")
        print(f"Improvement: {benchmark_results['improvement']:+.1f}%")
        
        return benchmark_results

def main():
    """Run accuracy testing suite"""
    
    test_suite = AccuracyTestSuite()
    
    # Run comprehensive tests
    accuracy_results = test_suite.run_comprehensive_tests()
    
    # Run benchmark comparison
    benchmark_results = test_suite.benchmark_against_baseline()
    
    # Generate final report
    final_report = {
        'test_timestamp': datetime.now().isoformat(),
        'accuracy_analysis': accuracy_results,
        'benchmark_comparison': benchmark_results,
        'overall_assessment': 'PASS' if accuracy_results['overall_accuracy'] >= 75 else 'NEEDS_IMPROVEMENT'
    }
    
    print(f"\n✅ FINAL ASSESSMENT: {final_report['overall_assessment']}")
    print(f"Overall Accuracy: {accuracy_results['overall_accuracy']:.1f}%")
    print(f"Algorithm Improvement: {benchmark_results['improvement']:+.1f}%")
    
    # Save results
    with open('accuracy_test_results.json', 'w') as f:
        json.dump(final_report, f, indent=2, default=str)
    
    print("\n📊 Results saved to 'accuracy_test_results.json'")
    return final_report

if __name__ == "__main__":
    main()