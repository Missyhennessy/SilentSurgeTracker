# Silent Surge Tracker - Cryptocurrency Analysis Platform

## Overview
Silent Surge Tracker is an advanced cryptocurrency analysis platform designed to identify high-potential crypto assets using the innovative "Silent Surge Score" (SSS) methodology. It integrates behavioral psychology, network theory, and anomaly detection to discover emerging opportunities in the crypto market. The platform aims to provide institutional-grade analysis, real-time market intelligence, and comprehensive risk management, positioning itself as a leading solution for sophisticated crypto investors and traders.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Core Methodology
The platform's core innovation is the Silent Surge Score (SSS), a weighted algorithm analyzing: Behavioral Activity, Token Velocity Anomaly, Community Cohesion, Anchor Pressure, Hype-to-Hold Ratio, and Historical Volatility.

### Technical Stack
- **Frontend**: React with TypeScript (Vite), Shadcn/ui (Radix UI primitives), Tailwind CSS, TanStack Query, Wouter, Recharts.
- **Backend**: Node.js with Express.js (TypeScript, ES modules), WebSocket server for real-time communication.
- **Database**: PostgreSQL with Drizzle ORM.

### Key Components
- **SSS Calculation**: Real-time weighted scoring algorithm.
- **Dashboard Modules**: Asset Scanner, Spike Watchlist, Behavioral Heatmap, Velocity Tracking, Cohesion Analyzer, Anchor Pressure.
- **Real-time Features**: Live data updates via WebSockets, automatic refresh, dynamic score recalculation, alert notifications.
- **Machine Learning Integration**: LSTM-GRU hybrid models for price predictions, ML score optimization system with advanced feature engineering, linear regression models per asset, performance monitoring, and auto-retraining.
- **Advanced Backtesting System**: Predefined and custom strategy builder, historical performance analysis, risk management controls (stop-loss, take-profit, position sizing), and comprehensive analytics.
- **Risk Management System**: Real-time VaR, Sharpe ratio, max drawdown, asset exposure analysis, configurable risk parameters, and alerts.
- **Market Sentiment Analysis**: Multi-source aggregation (Twitter, Reddit, Discord, Telegram, news), Fear & Greed Index, trending topics, influencer impact scoring.
- **Portfolio Optimization Engine**: AI-powered allocation using Modern Portfolio Theory, strategy templates, rebalancing tools, and risk-return analysis.
- **Security System**: Two-Factor Authentication (TOTP), unique secret generation, advanced password management, comprehensive activity logging, IP/location tracking, and device fingerprinting.
- **Blockchain Forensics Service**: Transaction trace analysis, address risk assessment, and cluster analysis.
- **Regulatory Compliance Engine**: Multi-jurisdiction monitoring, AML/KYC rules, automated alert generation, sanction screening.
- **Institutional API Management**: Enterprise client management, custom indicators, advanced risk models.
- **Advanced Alert Management**: Multi-channel notifications (push, email, SMS, Discord webhook), custom alert builder with complex logic, multi-parameter monitoring (price, SSS, volume, sentiment, technical indicators, whale movements).
- **AI-Powered Trading Signals**: Real-time signal generation, performance tracking, risk-adjusted analysis.
- **Advanced Market Scanner**: Anomaly detection, custom scan filters, pattern recognition.
- **Comprehensive Cryptocurrency Coverage**: Dynamic discovery and analysis of thousands of cryptocurrencies, including emerging tokens, with CoinGecko API integration.
- **Cross-Exchange Price Monitoring**: Real-time arbitrage detection across multiple exchanges (CEX and DEX).
- **Macro Economic Integration**: Tracking economic calendars, market correlation analysis (S&P 500, gold, USD index), inflation impact modeling, global risk assessment.

### UI/UX Decisions
The platform features a professional UI with a dark theme, utilizing Shadcn/ui components for a consistent and modern look. Key UX principles include immediate feedback, information density, progressive disclosure, and accessibility. Enhancements include skeleton loading, animated counters, progress rings, hover effects, toast notifications, and mobile responsiveness.

**Navigation System**: Replaced complex sidebar with simplified navigation bar featuring:
- 5 logical feature sections: Market Discovery, Analysis & Insights, Portfolio & Trading, Risk & Security, Advanced Tools
- Smart dropdown with feature descriptions for better user understanding
- Quick access buttons for most-used tools (Scanner, Watchlist, Portfolio, Alerts)
- Mobile-responsive design without sidebar complexity
- Maintains all existing micro-animations and functionality

## External Dependencies

- **Database**: Neon serverless PostgreSQL (`@neondatabase/serverless`)
- **ORM**: Drizzle with Zod for schema validation
- **UI Components**: Radix UI (underlying Shadcn/ui)
- **Charts**: Recharts
- **Real-time Communication**: Native WebSocket implementation
- **Build System**: Vite, ESBuild
- **CSS Framework**: Tailwind CSS with PostCSS
- **TypeScript Execution**: TSX
- **Authentication**: Replit Auth (OpenID Connect)
- **Cryptocurrency Data**: CoinGecko API
- **Threat Detection/Intelligence**: External IP reputation and geolocation services (specific providers not detailed but implied for external security dashboard)