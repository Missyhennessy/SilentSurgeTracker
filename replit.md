# Silent Surge Tracker - Cryptocurrency Analysis Platform

## Overview

Silent Surge Tracker is a sophisticated cryptocurrency analysis platform that implements the innovative "Silent Surge Score" (SSS) methodology for identifying high-potential crypto assets before they gain mainstream attention. The platform combines behavioral psychology, network theory, and anomaly detection to discover hidden gems in the crypto market.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSocket server for live updates
- **Development**: Vite middleware integration for hot reloading

### Database Design
The application uses Drizzle ORM with PostgreSQL, featuring three main tables:
- `crypto_assets`: Core asset data including SSS scores and component metrics
- `alerts`: User-defined threshold alerts for monitoring
- `velocity_data`: Historical token velocity tracking data

## Key Components

### Silent Surge Score (SSS) Calculation
The core innovation is a weighted scoring algorithm that analyzes:
- **Behavioral Activity (20%)**: Tracks influential wallet behavior deviations
- **Token Velocity Anomaly (20%)**: Detects unusual token movement patterns
- **Community Cohesion (20%)**: Measures sentiment unity among holders
- **Anchor Pressure (25%)**: Stability from long-term holders
- **Hype-to-Hold Ratio (10%)**: Social buzz vs. actual conviction
- **Historical Volatility (5%)**: Dampening factor for erratic patterns

### Dashboard Modules
- **Asset Scanner**: Real-time crypto asset discovery with SSS scoring
- **Spike Watchlist**: Monitored assets with customizable alerts
- **Behavioral Heatmap**: Visual representation of market anomalies
- **Velocity Tracking**: Token movement analysis over time
- **Cohesion Analyzer**: Community sentiment analysis
- **Anchor Pressure**: Long-term holder influence metrics

### Real-time Features
- WebSocket connections for live data updates
- Automatic refresh intervals (30-second cycles)
- Real-time alert notifications
- Dynamic score recalculation

## Data Flow

1. **Data Ingestion**: External crypto data feeds (simulated with mock data currently)
2. **SSS Calculation**: Real-time score computation using weighted algorithms
3. **Storage**: Drizzle ORM manages PostgreSQL interactions
4. **API Layer**: Express routes serve processed data to frontend
5. **Real-time Updates**: WebSocket broadcasts keep clients synchronized
6. **User Interface**: React components display interactive dashboards

## External Dependencies

### Core Technologies
- **Database**: Neon serverless PostgreSQL (@neondatabase/serverless)
- **ORM**: Drizzle with Zod schema validation
- **UI Components**: Comprehensive Radix UI component library
- **Charts**: Recharts for financial data visualization
- **WebSockets**: Native WebSocket implementation for real-time updates

### Development Tools
- **Build System**: Vite with TypeScript support
- **CSS Framework**: Tailwind with PostCSS processing
- **Development**: TSX for TypeScript execution
- **Code Quality**: ESBuild for production builds

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React application to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Assets**: Static assets served from build output

### Environment Configuration
- **Development**: `npm run dev` starts TSX development server
- **Production**: `npm run build && npm start` for optimized deployment
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection

### Hosting Considerations
- Server supports both development (Vite middleware) and production (static serving)
- WebSocket server integrated with HTTP server for unified deployment
- Database migrations managed through Drizzle Kit (`npm run db:push`)

The architecture prioritizes real-time performance, scalable data processing, and intuitive user experience while maintaining the flexibility to expand analysis modules and integrate additional data sources.