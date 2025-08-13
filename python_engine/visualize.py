#!/usr/bin/env python3
"""
Advanced Visualization Engine for Silent Surge Tracker
Generates comprehensive charts and visual analytics
"""

import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from typing import Dict, List, Optional
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import plotly.express as px
from datetime import datetime, timedelta

# Set style
plt.style.use('dark_background')
sns.set_palette("husl")

class SurgeVisualizer:
    """Advanced visualization engine for Silent Surge analytics"""
    
    def __init__(self):
        self.colors = {
            'strong_buy': '#00ff00',
            'buy': '#32cd32', 
            'accumulate': '#ffd700',
            'watchlist': '#ffa500',
            'neutral': '#808080',
            'avoid': '#ff4500',
            'background': '#1e1e1e',
            'text': '#ffffff',
            'grid': '#404040'
        }
        
        # Configure matplotlib for dark theme
        plt.rcParams.update({
            'figure.facecolor': self.colors['background'],
            'axes.facecolor': self.colors['background'],
            'axes.edgecolor': self.colors['grid'],
            'axes.labelcolor': self.colors['text'],
            'text.color': self.colors['text'],
            'xtick.color': self.colors['text'],
            'ytick.color': self.colors['text'],
            'grid.color': self.colors['grid']
        })
    
    def plot_breakout_probabilities(self, df: pd.DataFrame, save_path: str = None) -> str:
        """Create breakout probability visualization"""
        
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10))
        fig.suptitle('🚀 Silent Surge Breakout Analysis', fontsize=20, fontweight='bold')
        
        # Sort by 7-day probability
        df_sorted = df.sort_values('Breakout_7d', ascending=True)
        
        # Top plot - 3D vs 7D probabilities
        tokens = df_sorted['Token'].values
        prob_3d = df_sorted['Breakout_3d'].values
        prob_7d = df_sorted['Breakout_7d'].values
        
        # Color code based on action
        colors = [self._get_action_color(action) for action in df_sorted['Action'].values]
        
        y_pos = np.arange(len(tokens))
        
        # Horizontal bar chart
        bars_3d = ax1.barh(y_pos, prob_3d, height=0.4, alpha=0.7, label='3-Day Probability', color='skyblue')
        bars_7d = ax1.barh(y_pos + 0.4, prob_7d, height=0.4, alpha=0.8, label='7-Day Probability', color=colors)
        
        ax1.set_yticks(y_pos + 0.2)
        ax1.set_yticklabels(tokens)
        ax1.set_xlabel('Breakout Probability (%)')
        ax1.set_title('Breakout Probabilities by Token', fontsize=14, pad=20)
        ax1.legend()
        ax1.grid(True, alpha=0.3)
        
        # Add threshold lines
        ax1.axvline(70, color='red', linestyle='--', alpha=0.7, label='High Probability Threshold')
        ax1.axvline(50, color='orange', linestyle='--', alpha=0.7, label='Medium Probability Threshold')
        
        # Bottom plot - SSS vs Probability scatter
        scatter = ax2.scatter(df['SSS'], df['Breakout_7d'], 
                             c=[self._get_action_color(action) for action in df['Action']], 
                             s=100, alpha=0.8, edgecolors='white', linewidth=1)
        
        ax2.set_xlabel('Silent Surge Score (SSS)')
        ax2.set_ylabel('7-Day Breakout Probability (%)')
        ax2.set_title('SSS vs Breakout Probability Correlation', fontsize=14, pad=20)
        ax2.grid(True, alpha=0.3)
        
        # Add quadrant lines
        ax2.axhline(50, color='gray', linestyle=':', alpha=0.5)
        ax2.axvline(50, color='gray', linestyle=':', alpha=0.5)
        
        # Annotate top performers
        top_performers = df.nlargest(3, 'Breakout_7d')
        for _, token in top_performers.iterrows():
            ax2.annotate(token['Token'], 
                        (token['SSS'], token['Breakout_7d']),
                        xytext=(5, 5), textcoords='offset points',
                        fontsize=10, fontweight='bold')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight', 
                       facecolor=self.colors['background'], edgecolor='none')
        
        plt.show()
        return save_path or "breakout_analysis.png"
    
    def create_comprehensive_dashboard(self, df: pd.DataFrame, save_path: str = None) -> str:
        """Create comprehensive analysis dashboard"""
        
        fig = make_subplots(
            rows=3, cols=2,
            subplot_titles=('Breakout Probability Distribution', 'Action Distribution',
                          'SSS Score Analysis', 'Risk Level Analysis', 
                          'Top Opportunities Heatmap', 'Correlation Matrix'),
            specs=[[{"secondary_y": False}, {"type": "pie"}],
                   [{"secondary_y": False}, {"type": "pie"}],
                   [{"colspan": 2}, None]]
        )
        
        # 1. Breakout probability histogram
        fig.add_trace(
            go.Histogram(x=df['Breakout_7d'], nbinsx=20, name='7-Day Probability',
                        marker_color='lightblue', opacity=0.7),
            row=1, col=1
        )
        
        # 2. Action distribution pie chart
        action_counts = df['Action'].value_counts()
        fig.add_trace(
            go.Pie(labels=action_counts.index, values=action_counts.values,
                  name="Actions", marker_colors=[self._get_action_color(action) for action in action_counts.index]),
            row=1, col=2
        )
        
        # 3. SSS distribution
        fig.add_trace(
            go.Box(y=df['SSS'], name='SSS Distribution', marker_color='gold'),
            row=2, col=1
        )
        
        # 4. Risk level distribution
        risk_counts = df['Risk_Level'].value_counts()
        fig.add_trace(
            go.Pie(labels=risk_counts.index, values=risk_counts.values,
                  name="Risk Levels"),
            row=2, col=2
        )
        
        # 5. Top opportunities heatmap
        top_10 = df.head(10)
        heatmap_data = top_10[['Breakout_3d', 'Breakout_7d', 'SSS', 'Composite_Score']].T
        
        fig.add_trace(
            go.Heatmap(z=heatmap_data.values, 
                      x=top_10['Token'].values,
                      y=heatmap_data.index,
                      colorscale='Viridis',
                      name='Top 10 Opportunities'),
            row=3, col=1
        )
        
        # Update layout
        fig.update_layout(
            title_text="📊 Silent Surge Comprehensive Analysis Dashboard",
            title_font_size=20,
            height=1000,
            showlegend=False,
            paper_bgcolor=self.colors['background'],
            plot_bgcolor=self.colors['background'],
            font_color=self.colors['text']
        )
        
        if save_path:
            fig.write_html(save_path)
        
        fig.show()
        return save_path or "comprehensive_dashboard.html"
    
    def plot_token_analysis(self, token_data: Dict, save_path: str = None) -> str:
        """Create detailed analysis for a single token"""
        
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
        fig.suptitle(f'📈 {token_data["symbol"]} - Detailed Analysis', fontsize=18, fontweight='bold')
        
        # 1. Probability progression (if historical data available)
        timeframes = ['3d', '7d', '14d']
        probabilities = [
            token_data.get('breakout_3d', 0),
            token_data.get('breakout_7d', 0), 
            token_data.get('breakout_14d', 0)
        ]
        
        ax1.plot(timeframes, probabilities, marker='o', linewidth=3, markersize=10, color='lime')
        ax1.fill_between(timeframes, probabilities, alpha=0.3, color='lime')
        ax1.set_title('Breakout Probability by Timeframe')
        ax1.set_ylabel('Probability (%)')
        ax1.grid(True, alpha=0.3)
        ax1.set_ylim(0, 100)
        
        # Add threshold line
        ax1.axhline(70, color='red', linestyle='--', alpha=0.7, label='High Threshold')
        ax1.legend()
        
        # 2. Signal strength radar chart
        signals = ['Technical', 'Fundamental', 'Sentiment', 'Volume', 'Momentum']
        signal_values = [
            token_data.get('technical_score', 50),
            token_data.get('fundamental_score', 50),
            token_data.get('sentiment_score', 50),
            token_data.get('volume_score', 50),
            token_data.get('momentum_score', 50)
        ]
        
        # Radar chart setup
        angles = np.linspace(0, 2 * np.pi, len(signals), endpoint=False).tolist()
        signal_values += signal_values[:1]  # Complete the circle
        angles += angles[:1]
        
        ax2 = plt.subplot(2, 2, 2, projection='polar')
        ax2.plot(angles, signal_values, linewidth=2, color='cyan')
        ax2.fill(angles, signal_values, alpha=0.3, color='cyan')
        ax2.set_xticks(angles[:-1])
        ax2.set_xticklabels(signals)
        ax2.set_ylim(0, 100)
        ax2.set_title('Signal Strength Analysis', pad=20)
        ax2.grid(True)
        
        # 3. Risk analysis
        risk_factors = ['Technical Risk', 'Liquidity Risk', 'Volatility Risk', 'Correlation Risk']
        risk_scores = [
            100 - signal_values[0],  # Technical risk
            token_data.get('liquidity_risk', 50),
            token_data.get('volatility_risk', 50),
            token_data.get('correlation_risk', 50)
        ]
        
        bars = ax3.bar(range(len(risk_factors)), risk_scores, 
                      color=['red' if score > 60 else 'orange' if score > 40 else 'green' for score in risk_scores])
        ax3.set_xticks(range(len(risk_factors)))
        ax3.set_xticklabels(risk_factors, rotation=45, ha='right')
        ax3.set_ylabel('Risk Score')
        ax3.set_title('Risk Factor Analysis')
        ax3.set_ylim(0, 100)
        
        # Add risk threshold lines
        ax3.axhline(60, color='red', linestyle='--', alpha=0.5, label='High Risk')
        ax3.axhline(40, color='orange', linestyle='--', alpha=0.5, label='Medium Risk')
        ax3.legend()
        
        # 4. Price targets visualization (if available)
        if 'price_targets' in token_data:
            targets = token_data['price_targets']
            current_price = token_data.get('current_price', 1.0)
            
            prices = [
                targets.get('stop_loss', current_price * 0.9),
                current_price,
                targets.get('conservative_target', current_price * 1.1),
                targets.get('upside_target', current_price * 1.2),
                targets.get('aggressive_target', current_price * 1.3)
            ]
            labels = ['Stop Loss', 'Current', 'Conservative', 'Upside', 'Aggressive']
            colors = ['red', 'yellow', 'lightgreen', 'green', 'darkgreen']
            
            bars = ax4.barh(range(len(labels)), prices, color=colors)
            ax4.set_yticks(range(len(labels)))
            ax4.set_yticklabels(labels)
            ax4.set_xlabel('Price ($)')
            ax4.set_title('Price Targets')
            
            # Add current price line
            ax4.axvline(current_price, color='white', linestyle='-', linewidth=2, label='Current Price')
            ax4.legend()
        else:
            ax4.text(0.5, 0.5, 'Price targets\nnot available', 
                    ha='center', va='center', transform=ax4.transAxes, fontsize=14)
            ax4.set_title('Price Targets')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight',
                       facecolor=self.colors['background'], edgecolor='none')
        
        plt.show()
        return save_path or f"{token_data['symbol']}_analysis.png"
    
    def create_portfolio_visualization(self, portfolio_data: List[Dict], save_path: str = None) -> str:
        """Create portfolio-level visualization"""
        
        df = pd.DataFrame(portfolio_data)
        
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=('Portfolio Allocation', 'Risk Distribution',
                          'Performance Projection', 'Correlation Analysis'),
            specs=[[{"type": "pie"}, {"type": "bar"}],
                   [{"secondary_y": True}, {"type": "heatmap"}]]
        )
        
        # 1. Portfolio allocation
        fig.add_trace(
            go.Pie(labels=df['symbol'], values=df['allocation'],
                  name="Allocation"),
            row=1, col=1
        )
        
        # 2. Risk distribution
        fig.add_trace(
            go.Bar(x=df['symbol'], y=df['risk_score'], name='Risk Score',
                  marker_color='orange'),
            row=1, col=2
        )
        
        # 3. Performance projection
        fig.add_trace(
            go.Bar(x=df['symbol'], y=df['expected_return'], name='Expected Return',
                  marker_color='green'),
            row=2, col=1
        )
        
        fig.add_trace(
            go.Scatter(x=df['symbol'], y=df['breakout_probability'], 
                      mode='markers+lines', name='Breakout Probability',
                      marker_size=10, line_color='cyan'),
            row=2, col=1, secondary_y=True
        )
        
        # 4. Correlation matrix (if correlation data available)
        if len(df) > 1:
            # Create mock correlation data for visualization
            corr_matrix = np.random.rand(len(df), len(df))
            np.fill_diagonal(corr_matrix, 1.0)
            
            fig.add_trace(
                go.Heatmap(z=corr_matrix, x=df['symbol'], y=df['symbol'],
                          colorscale='RdBu', zmid=0),
                row=2, col=2
            )
        
        fig.update_layout(
            title_text="💼 Portfolio Analysis Dashboard",
            height=800,
            showlegend=True
        )
        
        if save_path:
            fig.write_html(save_path)
        
        fig.show()
        return save_path or "portfolio_dashboard.html"
    
    def _get_action_color(self, action: str) -> str:
        """Get color for trading action"""
        action_colors = {
            'STRONG_BUY': self.colors['strong_buy'],
            'BUY': self.colors['buy'],
            'ACCUMULATE': self.colors['accumulate'], 
            'WATCHLIST': self.colors['watchlist'],
            'NEUTRAL': self.colors['neutral'],
            'AVOID': self.colors['avoid']
        }
        return action_colors.get(action, self.colors['neutral'])
    
    def generate_report_charts(self, analysis_data: Dict, output_dir: str = "./charts/") -> Dict[str, str]:
        """Generate all charts for a comprehensive report"""
        
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        chart_paths = {}
        
        # Main dashboard
        if 'token_data' in analysis_data:
            df = pd.DataFrame(analysis_data['token_data'])
            chart_paths['dashboard'] = self.create_comprehensive_dashboard(
                df, os.path.join(output_dir, "dashboard.html")
            )
            chart_paths['breakout_analysis'] = self.plot_breakout_probabilities(
                df, os.path.join(output_dir, "breakout_analysis.png")
            )
        
        # Individual token analyses
        if 'individual_tokens' in analysis_data:
            for token_data in analysis_data['individual_tokens']:
                symbol = token_data['symbol']
                chart_paths[f'{symbol}_analysis'] = self.plot_token_analysis(
                    token_data, os.path.join(output_dir, f"{symbol}_analysis.png")
                )
        
        # Portfolio analysis
        if 'portfolio' in analysis_data:
            chart_paths['portfolio'] = self.create_portfolio_visualization(
                analysis_data['portfolio'], os.path.join(output_dir, "portfolio.html")
            )
        
        return chart_paths

def create_sample_visualizations():
    """Create sample visualizations with mock data"""
    
    # Sample data
    sample_data = pd.DataFrame({
        'Token': ['SUI', 'PEPE', 'SOL', 'ETH', 'BTC', 'ADA', 'XRP', 'LINK'],
        'SSS': [85, 91, 78, 72, 68, 65, 70, 75],
        'Breakout_3d': [72, 88, 65, 58, 45, 42, 55, 62],
        'Breakout_7d': [78, 92, 70, 65, 52, 48, 61, 68],
        'Action': ['ACCUMULATE', 'STRONG_BUY', 'BUY', 'WATCHLIST', 'NEUTRAL', 'WATCHLIST', 'ACCUMULATE', 'BUY'],
        'Risk_Level': ['Medium', 'Medium', 'Low', 'Medium', 'High', 'Medium', 'Low', 'Medium'],
        'Composite_Score': [82.5, 95.2, 75.8, 68.3, 58.1, 55.7, 63.4, 71.2]
    })
    
    visualizer = SurgeVisualizer()
    
    # Create breakout analysis
    visualizer.plot_breakout_probabilities(sample_data, "sample_breakout_analysis.png")
    
    # Create comprehensive dashboard
    visualizer.create_comprehensive_dashboard(sample_data, "sample_dashboard.html")
    
    # Create individual token analysis
    sample_token = {
        'symbol': 'SUI',
        'breakout_3d': 72,
        'breakout_7d': 78,
        'breakout_14d': 65,
        'technical_score': 85,
        'fundamental_score': 70,
        'sentiment_score': 80,
        'volume_score': 75,
        'momentum_score': 88,
        'current_price': 1.85,
        'price_targets': {
            'stop_loss': 1.60,
            'conservative_target': 2.10,
            'upside_target': 2.40,
            'aggressive_target': 2.80
        }
    }
    
    visualizer.plot_token_analysis(sample_token, "sample_token_analysis.png")
    
    print("Sample visualizations created!")

if __name__ == "__main__":
    create_sample_visualizations()