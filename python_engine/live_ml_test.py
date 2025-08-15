#!/usr/bin/env python3
"""
Live ML Testing Suite
Tests the machine learning integration with real cryptocurrency data
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List
import numpy as np

class LiveMLTester:
    """Live testing of ML capabilities with real data"""
    
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.test_results = []
        
    def test_ml_models_endpoint(self) -> Dict:
        """Test the ML models status endpoint"""
        
        print("🔬 Testing ML Models Endpoint...")
        
        try:
            response = requests.get(f"{self.base_url}/api/python-engine/ml-models")
            
            if response.status_code == 200:
                data = response.json()
                
                result = {
                    'endpoint': 'ml-models',
                    'status': 'SUCCESS',
                    'response_time_ms': response.elapsed.total_seconds() * 1000,
                    'data': data,
                    'ml_ready': data.get('ml_capabilities', {}).get('initialization', {}).get('ml_ready', False),
                    'accuracy': data.get('ml_capabilities', {}).get('ml_ensemble', {}).get('average_accuracy', 0)
                }
                
                print(f"✅ ML Models: {result['ml_ready']} | Accuracy: {result['accuracy']}%")
                return result
                
            else:
                print(f"❌ ML Models endpoint failed: {response.status_code}")
                return {'endpoint': 'ml-models', 'status': 'FAILED', 'error': response.text}
                
        except Exception as e:
            print(f"❌ ML Models test error: {e}")
            return {'endpoint': 'ml-models', 'status': 'ERROR', 'error': str(e)}
    
    def test_enhanced_sss_endpoint(self, test_scenarios: List[Dict]) -> List[Dict]:
        """Test enhanced SSS calculation with various scenarios"""
        
        print("🧮 Testing Enhanced SSS Calculations...")
        results = []
        
        for i, scenario in enumerate(test_scenarios):
            try:
                response = requests.post(
                    f"{self.base_url}/api/python-engine/enhanced-sss",
                    json=scenario['metrics'],
                    headers={'Content-Type': 'application/json'}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    result = {
                        'scenario': scenario['name'],
                        'status': 'SUCCESS',
                        'response_time_ms': response.elapsed.total_seconds() * 1000,
                        'traditional_sss': data.get('sss', 0),
                        'ml_enhanced_sss': data.get('ml_enhanced', {}).get('blended_sss', 0),
                        'ml_confidence': data.get('ml_enhanced', {}).get('ml_confidence', 0),
                        'improvement': 0
                    }
                    
                    # Calculate improvement
                    if result['traditional_sss'] > 0:
                        result['improvement'] = ((result['ml_enhanced_sss'] - result['traditional_sss']) / result['traditional_sss']) * 100
                    
                    results.append(result)
                    print(f"✅ {scenario['name']}: SSS {result['traditional_sss']} → {result['ml_enhanced_sss']} ({result['improvement']:+.1f}%)")
                    
                else:
                    print(f"❌ Enhanced SSS failed for {scenario['name']}: {response.status_code}")
                    results.append({
                        'scenario': scenario['name'],
                        'status': 'FAILED',
                        'error': response.text
                    })
                
                time.sleep(0.1)  # Small delay between requests
                
            except Exception as e:
                print(f"❌ Enhanced SSS error for {scenario['name']}: {e}")
                results.append({
                    'scenario': scenario['name'],
                    'status': 'ERROR',
                    'error': str(e)
                })
        
        return results
    
    def test_breakout_probability_endpoint(self, test_cases: List[Dict]) -> List[Dict]:
        """Test ML breakout probability predictions"""
        
        print("🎯 Testing Breakout Probability Predictions...")
        results = []
        
        for case in test_cases:
            try:
                response = requests.post(
                    f"{self.base_url}/api/python-engine/ml-breakout",
                    json=case['params'],
                    headers={'Content-Type': 'application/json'}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    result = {
                        'case': case['name'],
                        'status': 'SUCCESS',
                        'response_time_ms': response.elapsed.total_seconds() * 1000,
                        'ensemble_probability': data.get('ensemble_probability', 0),
                        'prediction_confidence': data.get('prediction_confidence', 'unknown'),
                        'ml_ensemble': data.get('ml_ensemble', {}),
                        'expected_range': case.get('expected_range', [0, 100])
                    }
                    
                    # Check if result is in expected range
                    prob = result['ensemble_probability']
                    expected_min, expected_max = result['expected_range']
                    in_range = expected_min <= prob <= expected_max
                    
                    results.append(result)
                    range_status = "✅" if in_range else "⚠️"
                    print(f"{range_status} {case['name']}: {prob}% ({result['prediction_confidence']})")
                    
                else:
                    print(f"❌ Breakout probability failed for {case['name']}: {response.status_code}")
                    results.append({
                        'case': case['name'],
                        'status': 'FAILED',
                        'error': response.text
                    })
                
                time.sleep(0.1)
                
            except Exception as e:
                print(f"❌ Breakout probability error for {case['name']}: {e}")
                results.append({
                    'case': case['name'],
                    'status': 'ERROR',
                    'error': str(e)
                })
        
        return results
    
    def test_comprehensive_analysis_endpoint(self, real_crypto_data: List[Dict]) -> List[Dict]:
        """Test comprehensive analysis with real crypto data"""
        
        print("🔍 Testing Comprehensive Analysis...")
        results = []
        
        for crypto in real_crypto_data:
            try:
                response = requests.post(
                    f"{self.base_url}/api/python-engine/comprehensive-analysis",
                    json=crypto,
                    headers={'Content-Type': 'application/json'}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    recommendation = data.get('final_recommendation', {})
                    result = {
                        'symbol': crypto['symbol'],
                        'status': 'SUCCESS',
                        'response_time_ms': response.elapsed.total_seconds() * 1000,
                        'final_sss': recommendation.get('final_sss', 0),
                        'final_probability': recommendation.get('final_probability', 0),
                        'action': recommendation.get('action', 'UNKNOWN'),
                        'confidence': recommendation.get('confidence', 'UNKNOWN'),
                        'reasoning': recommendation.get('reasoning', [])
                    }
                    
                    results.append(result)
                    print(f"✅ {crypto['symbol']}: {result['action']} (SSS: {result['final_sss']}, Prob: {result['final_probability']}%)")
                    
                else:
                    print(f"❌ Comprehensive analysis failed for {crypto['symbol']}: {response.status_code}")
                    results.append({
                        'symbol': crypto['symbol'],
                        'status': 'FAILED',
                        'error': response.text
                    })
                
                time.sleep(0.2)
                
            except Exception as e:
                print(f"❌ Comprehensive analysis error for {crypto['symbol']}: {e}")
                results.append({
                    'symbol': crypto['symbol'],
                    'status': 'ERROR',
                    'error': str(e)
                })
        
        return results
    
    def run_performance_benchmark(self, iterations: int = 20) -> Dict:
        """Run performance benchmark of ML system"""
        
        print(f"⚡ Running Performance Benchmark ({iterations} iterations)...")
        
        response_times = []
        success_count = 0
        
        test_payload = {
            'behavioral_activity': 0.75,
            'velocity_anomaly': 1.3,
            'community_cohesion': 0.68,
            'anchor_pressure': 0.55,
            'hype_to_hold': 0.82,
            'historical_volatility': 0.45
        }
        
        for i in range(iterations):
            try:
                start_time = time.time()
                response = requests.post(
                    f"{self.base_url}/api/python-engine/enhanced-sss",
                    json=test_payload,
                    headers={'Content-Type': 'application/json'}
                )
                end_time = time.time()
                
                if response.status_code == 200:
                    success_count += 1
                    response_times.append((end_time - start_time) * 1000)
                
                if i % 5 == 0:
                    print(f"  Progress: {i+1}/{iterations}")
                
            except Exception as e:
                print(f"  Benchmark error on iteration {i+1}: {e}")
        
        if response_times:
            benchmark_result = {
                'total_requests': iterations,
                'successful_requests': success_count,
                'success_rate': (success_count / iterations) * 100,
                'avg_response_time_ms': np.mean(response_times),
                'min_response_time_ms': np.min(response_times),
                'max_response_time_ms': np.max(response_times),
                'p95_response_time_ms': np.percentile(response_times, 95)
            }
            
            print(f"✅ Benchmark completed:")
            print(f"   Success Rate: {benchmark_result['success_rate']:.1f}%")
            print(f"   Avg Response: {benchmark_result['avg_response_time_ms']:.1f}ms")
            print(f"   P95 Response: {benchmark_result['p95_response_time_ms']:.1f}ms")
            
            return benchmark_result
        else:
            return {'error': 'No successful requests in benchmark'}
    
    def generate_test_scenarios(self) -> List[Dict]:
        """Generate diverse test scenarios for SSS calculation"""
        
        return [
            {
                'name': 'Bullish Breakout',
                'metrics': {
                    'behavioral_activity': 0.85,
                    'velocity_anomaly': 1.8,
                    'community_cohesion': 0.78,
                    'anchor_pressure': 0.65,
                    'hype_to_hold': 0.88,
                    'historical_volatility': 0.35
                }
            },
            {
                'name': 'Bearish Correction',
                'metrics': {
                    'behavioral_activity': 0.25,
                    'velocity_anomaly': 0.4,
                    'community_cohesion': 0.35,
                    'anchor_pressure': 0.85,
                    'hype_to_hold': 0.15,
                    'historical_volatility': 0.75
                }
            },
            {
                'name': 'Accumulation Phase',
                'metrics': {
                    'behavioral_activity': 0.65,
                    'velocity_anomaly': 0.95,
                    'community_cohesion': 0.72,
                    'anchor_pressure': 0.68,
                    'hype_to_hold': 0.58,
                    'historical_volatility': 0.42
                }
            },
            {
                'name': 'High Volatility Speculation',
                'metrics': {
                    'behavioral_activity': 0.92,
                    'velocity_anomaly': 2.3,
                    'community_cohesion': 0.45,
                    'anchor_pressure': 0.25,
                    'hype_to_hold': 0.95,
                    'historical_volatility': 0.88
                }
            }
        ]
    
    def generate_breakout_test_cases(self) -> List[Dict]:
        """Generate test cases for breakout probability"""
        
        return [
            {
                'name': 'Strong Bullish Setup',
                'params': {
                    'sss': 85,
                    'velocity': 1.6,
                    'sentiment': 4.2,
                    'anchor_pressure': 0.7,
                    'timeframe': 7
                },
                'expected_range': [70, 95]
            },
            {
                'name': 'Weak Bearish Setup',
                'params': {
                    'sss': 35,
                    'velocity': 0.6,
                    'sentiment': 2.1,
                    'anchor_pressure': 0.8,
                    'timeframe': 7
                },
                'expected_range': [20, 50]
            },
            {
                'name': 'Neutral Consolidation',
                'params': {
                    'sss': 55,
                    'velocity': 0.9,
                    'sentiment': 3.0,
                    'anchor_pressure': 0.6,
                    'timeframe': 14
                },
                'expected_range': [40, 70]
            }
        ]
    
    def generate_real_crypto_data(self) -> List[Dict]:
        """Generate realistic crypto data for comprehensive testing"""
        
        return [
            {
                'symbol': 'SOL',
                'behavioral_activity': 0.82,
                'velocity_anomaly': 1.4,
                'community_cohesion': 0.75,
                'anchor_pressure': 0.68,
                'hype_to_hold': 0.78,
                'historical_volatility': 0.52,
                'velocity': 1.4,
                'sentiment': 4.1
            },
            {
                'symbol': 'DOGE',
                'behavioral_activity': 0.88,
                'velocity_anomaly': 1.8,
                'community_cohesion': 0.65,
                'anchor_pressure': 0.45,
                'hype_to_hold': 0.92,
                'historical_volatility': 0.68,
                'velocity': 1.8,
                'sentiment': 3.8
            },
            {
                'symbol': 'ADA',
                'behavioral_activity': 0.72,
                'velocity_anomaly': 1.1,
                'community_cohesion': 0.78,
                'anchor_pressure': 0.72,
                'hype_to_hold': 0.65,
                'historical_volatility': 0.38,
                'velocity': 1.1,
                'sentiment': 3.6
            }
        ]
    
    def run_comprehensive_live_test(self) -> Dict:
        """Run comprehensive live testing suite"""
        
        print("\n🚀 LIVE ML TESTING SUITE")
        print("=" * 50)
        print(f"Timestamp: {datetime.now().isoformat()}")
        print(f"Target: {self.base_url}")
        print()
        
        all_results = {
            'timestamp': datetime.now().isoformat(),
            'test_summary': {},
            'detailed_results': {}
        }
        
        # Test 1: ML Models Status
        ml_models_result = self.test_ml_models_endpoint()
        all_results['detailed_results']['ml_models'] = ml_models_result
        
        # Test 2: Enhanced SSS
        sss_scenarios = self.generate_test_scenarios()
        sss_results = self.test_enhanced_sss_endpoint(sss_scenarios)
        all_results['detailed_results']['enhanced_sss'] = sss_results
        
        # Test 3: Breakout Probability
        breakout_cases = self.generate_breakout_test_cases()
        breakout_results = self.test_breakout_probability_endpoint(breakout_cases)
        all_results['detailed_results']['breakout_probability'] = breakout_results
        
        # Test 4: Comprehensive Analysis
        crypto_data = self.generate_real_crypto_data()
        analysis_results = self.test_comprehensive_analysis_endpoint(crypto_data)
        all_results['detailed_results']['comprehensive_analysis'] = analysis_results
        
        # Test 5: Performance Benchmark
        benchmark_result = self.run_performance_benchmark()
        all_results['detailed_results']['performance_benchmark'] = benchmark_result
        
        # Generate summary
        successful_tests = 0
        total_tests = 0
        
        for test_category, results in all_results['detailed_results'].items():
            if test_category == 'performance_benchmark':
                if 'success_rate' in results:
                    successful_tests += 1
                total_tests += 1
            elif isinstance(results, list):
                for result in results:
                    if result.get('status') == 'SUCCESS':
                        successful_tests += 1
                    total_tests += 1
            else:
                if results.get('status') == 'SUCCESS':
                    successful_tests += 1
                total_tests += 1
        
        all_results['test_summary'] = {
            'total_tests': total_tests,
            'successful_tests': successful_tests,
            'success_rate': (successful_tests / total_tests * 100) if total_tests > 0 else 0,
            'ml_system_status': 'OPERATIONAL' if successful_tests > total_tests * 0.8 else 'DEGRADED'
        }
        
        print("\n📊 LIVE TEST SUMMARY")
        print("-" * 30)
        print(f"Total Tests: {all_results['test_summary']['total_tests']}")
        print(f"Successful: {all_results['test_summary']['successful_tests']}")
        print(f"Success Rate: {all_results['test_summary']['success_rate']:.1f}%")
        print(f"ML System Status: {all_results['test_summary']['ml_system_status']}")
        
        return all_results

def main():
    """Run live ML testing"""
    tester = LiveMLTester()
    results = tester.run_comprehensive_live_test()
    
    # Save results
    with open('live_ml_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✅ Live testing complete! Results saved to live_ml_test_results.json")
    
    return results

if __name__ == "__main__":
    main()