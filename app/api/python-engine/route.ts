import { NextRequest, NextResponse } from 'next/server';
import { pythonEngineService } from '@/server/python-engine-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';

    switch (action) {
      case 'status':
        const status = await pythonEngineService.getEngineStatus();
        return NextResponse.json(status);
      
      case 'demo':
        const demoResult = await pythonEngineService.runRealisticDemo();
        return NextResponse.json(demoResult);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: status, demo' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Python Engine GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to process Python engine request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'analysis';
    const body = await request.json();

    switch (action) {
      case 'analysis':
        const { tokens } = body;
        
        if (tokens && (!Array.isArray(tokens) || tokens.length > 50)) {
          return NextResponse.json(
            { error: 'Invalid tokens array (max 50 tokens)' },
            { status: 400 }
          );
        }

        const analysisResult = await pythonEngineService.runFullAnalysis(tokens);
        return NextResponse.json(analysisResult);
      
      case 'forecast':
        // Validate required fields for forecast
        const requiredForecastFields = ['symbol', 'sss', 'velocity', 'sentiment', 'anchor_pressure', 'current_price'];
        for (const field of requiredForecastFields) {
          if (!(field in body)) {
            return NextResponse.json(
              { error: `Missing required field: ${field}` },
              { status: 400 }
            );
          }
        }

        const forecastResult = await pythonEngineService.runForecastAnalysis(body);
        return NextResponse.json(forecastResult);
      
      case 'decision':
        // Validate required fields for decision analysis
        const requiredDecisionFields = ['symbol', 'sss', 'breakout_7d'];
        for (const field of requiredDecisionFields) {
          if (!(field in body)) {
            return NextResponse.json(
              { error: `Missing required field: ${field}` },
              { status: 400 }
            );
          }
        }

        const decisionResult = await pythonEngineService.runDecisionAnalysis(body);
        return NextResponse.json(decisionResult);
      
      case 'sss':
        if (!body || typeof body !== 'object') {
          return NextResponse.json(
            { error: 'Invalid token data for SSS calculation' },
            { status: 400 }
          );
        }

        const sss = await pythonEngineService.calculateSSS(body);
        return NextResponse.json({ sss });
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: analysis, forecast, decision, sss' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Python Engine POST Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process Python engine request' },
      { status: 500 }
    );
  }
}