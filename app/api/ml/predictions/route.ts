import { NextRequest, NextResponse } from 'next/server';
import { lstmPredictionService } from '@/server/lstm-prediction-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const asset = searchParams.get('asset');
    const timeframe = searchParams.get('timeframe') || '24h';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const type = searchParams.get('type') || 'all';

    // Handle specific asset prediction
    if (asset) {
      const prediction = lstmPredictionService.getPrediction(asset);
      if (!prediction) {
        return NextResponse.json(
          { error: `Prediction not found for asset: ${asset}` },
          { status: 404 }
        );
      }
      return NextResponse.json(prediction);
    }

    // Handle different types of prediction requests
    switch (type) {
      case 'top':
        const topPredictions = lstmPredictionService.getTopPredictions(timeframe, limit);
        return NextResponse.json(topPredictions);
      
      case 'performance':
        const performanceMetrics = lstmPredictionService.getPerformanceMetrics();
        return NextResponse.json(performanceMetrics);
      
      case 'best':
        const bestModels = lstmPredictionService.getBestPerformingModels();
        return NextResponse.json(bestModels);
      
      case 'all':
      default:
        const allPredictions = lstmPredictionService.getAllPredictions();
        return NextResponse.json({
          predictions: allPredictions,
          timestamp: new Date().toISOString(),
          total: allPredictions.length
        });
    }
  } catch (error) {
    console.error('ML Predictions API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ML predictions' },
      { status: 500 }
    );
  }
}