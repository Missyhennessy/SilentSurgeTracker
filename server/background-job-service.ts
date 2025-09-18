import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { log } from './vite';
import { storage } from './storage';

// Redis connection for BullMQ
const redisConnection = new Redis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  onClusterError: () => console.log('BullMQ using fallback processing'),
});

// Job types for ML processing
export interface MLJobData {
  type: 'sss_calculation' | 'lstm_prediction' | 'comprehensive_analysis' | 'bulk_update';
  assetId?: number;
  symbol?: string;
  data?: any;
  userId?: string;
}

export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  processingTime?: number;
}

class BackgroundJobService {
  private mlQueue: Queue;
  private worker: Worker;
  private isRedisConnected: boolean = false;
  private fallbackJobs: Map<string, () => Promise<any>> = new Map();

  constructor() {
    // Initialize BullMQ queue for ML processing
    this.mlQueue = new Queue('ml-processing', {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: 10, // Keep last 10 completed jobs
        removeOnFail: 5,      // Keep last 5 failed jobs
        attempts: 2,          // Retry failed jobs once
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    });

    // Initialize worker to process jobs
    this.worker = new Worker(
      'ml-processing',
      this.processJob.bind(this),
      {
        connection: redisConnection,
        concurrency: 2, // Process 2 jobs simultaneously max
      }
    );

    this.setupEventHandlers();
    this.checkRedisConnection();
  }

  private async checkRedisConnection() {
    try {
      await redisConnection.ping();
      this.isRedisConnected = true;
      log('✅ BullMQ connected - background processing enabled');
    } catch (error) {
      this.isRedisConnected = false;
      log('BullMQ running in fallback mode - processing jobs synchronously');
    }
  }

  private setupEventHandlers() {
    this.worker.on('completed', (job: Job, result: JobResult) => {
      log(`✅ ML job completed: ${job.data.type} (${result.processingTime}ms)`);
    });

    this.worker.on('failed', (job: Job | undefined, err: Error) => {
      console.error(`❌ ML job failed: ${job?.data?.type || 'unknown'}`, err);
    });

    this.worker.on('error', (err) => {
      console.error('BullMQ worker error:', err);
    });
  }

  // Main job processor
  private async processJob(job: Job<MLJobData>): Promise<JobResult> {
    const startTime = Date.now();
    const { type, assetId, symbol, data, userId } = job.data;

    try {
      let result;

      switch (type) {
        case 'sss_calculation':
          result = await this.processSSSCalculation(assetId!, data);
          break;
        case 'lstm_prediction':
          result = await this.processLSTMPrediction(symbol!, data);
          break;
        case 'comprehensive_analysis':
          result = await this.processComprehensiveAnalysis(symbol!, data);
          break;
        case 'bulk_update':
          result = await this.processBulkUpdate(data);
          break;
        default:
          throw new Error(`Unknown job type: ${type}`);
      }

      const processingTime = Date.now() - startTime;
      return {
        success: true,
        data: result,
        processingTime,
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
      };
    }
  }

  // SSS Score calculation in background
  private async processSSSCalculation(assetId: number, inputData: any) {
    // Simulate heavy SSS calculation with multiple factors
    await this.simulateHeavyCalculation(500); // 500ms simulation

    const asset = await storage.getCryptoAsset(assetId);
    if (!asset) throw new Error('Asset not found');

    // Enhanced SSS calculation with weighted factors
    const behavioralActivity = this.calculateBehavioralActivity(asset, inputData);
    const velocityAnomaly = this.calculateVelocityAnomaly(asset, inputData);
    const communitycohesion = this.calculateCommunitycohesion(asset, inputData);
    const anchorPressure = this.calculateAnchorPressure(asset, inputData);
    const hypeToHoldRatio = this.calculateHypeToHoldRatio(asset, inputData);
    const historicalVolatility = this.calculateHistoricalVolatility(asset, inputData);

    // Weighted SSS calculation
    const sssScore = (
      behavioralActivity * 0.25 +
      velocityAnomaly * 0.20 +
      communitycohesion * 0.15 +
      anchorPressure * 0.15 +
      hypeToHoldRatio * 0.15 +
      historicalVolatility * 0.10
    );

    // Update asset with new SSS score
    await storage.updateAsset(assetId, {
      sssScore: Math.round(sssScore * 10) / 10,
      lastCalculated: new Date(),
    });

    return {
      assetId,
      symbol: asset.symbol,
      sssScore,
      components: {
        behavioralActivity,
        velocityAnomaly,
        communitycohesion,
        anchorPressure,
        hypeToHoldRatio,
        historicalVolatility,
      },
    };
  }

  // LSTM Prediction processing
  private async processLSTMPrediction(symbol: string, inputData: any) {
    await this.simulateHeavyCalculation(800); // 800ms simulation

    const asset = await storage.getAssetBySymbol(symbol);
    if (!asset) throw new Error('Asset not found');

    // Simulate LSTM prediction calculation
    const prediction = {
      symbol,
      priceTargets: {
        '24h': asset.price * (0.95 + Math.random() * 0.1),
        '7d': asset.price * (0.90 + Math.random() * 0.2),
        '30d': asset.price * (0.85 + Math.random() * 0.3),
      },
      confidence: 0.75 + Math.random() * 0.2,
      trends: ['bullish', 'neutral', 'bearish'][Math.floor(Math.random() * 3)],
      calculatedAt: new Date(),
    };

    return prediction;
  }

  // Comprehensive analysis processing
  private async processComprehensiveAnalysis(symbol: string, inputData: any) {
    await this.simulateHeavyCalculation(1200); // 1.2s simulation

    const sssResult = await this.processSSSCalculation(inputData.assetId, inputData);
    const lstmResult = await this.processLSTMPrediction(symbol, inputData);

    return {
      symbol,
      comprehensive: true,
      sssAnalysis: sssResult,
      lstmPrediction: lstmResult,
      riskMetrics: {
        volatilityIndex: Math.random() * 100,
        liquidityScore: 50 + Math.random() * 50,
        marketCapRisk: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      },
      tradingSignals: {
        signal: ['BUY', 'HOLD', 'SELL'][Math.floor(Math.random() * 3)],
        strength: Math.random() * 100,
        timeframe: '1-7 days',
      },
    };
  }

  // Bulk update processing
  private async processBulkUpdate(data: any) {
    await this.simulateHeavyCalculation(2000); // 2s simulation

    const assets = await storage.getCryptoAssets();
    let processed = 0;

    for (const asset of assets.slice(0, 10)) { // Process first 10
      try {
        await this.processSSSCalculation(asset.id, data);
        processed++;
      } catch (error) {
        console.error(`Failed to process asset ${asset.id}:`, error);
      }
    }

    return {
      processed,
      total: assets.length,
      completedAt: new Date(),
    };
  }

  // Public methods to queue jobs
  async queueSSSCalculation(assetId: number, data: any = {}, userId?: string): Promise<Job | null> {
    if (!this.isRedisConnected) {
      // Fallback: process immediately
      return this.processFallbackJob('sss_calculation', () => 
        this.processSSSCalculation(assetId, data)
      );
    }

    return this.mlQueue.add('sss_calculation', {
      type: 'sss_calculation',
      assetId,
      data,
      userId,
    });
  }

  async queueLSTMPrediction(symbol: string, data: any = {}, userId?: string): Promise<Job | null> {
    if (!this.isRedisConnected) {
      return this.processFallbackJob('lstm_prediction', () => 
        this.processLSTMPrediction(symbol, data)
      );
    }

    return this.mlQueue.add('lstm_prediction', {
      type: 'lstm_prediction',
      symbol,
      data,
      userId,
    });
  }

  async queueComprehensiveAnalysis(symbol: string, assetId: number, data: any = {}, userId?: string): Promise<Job | null> {
    if (!this.isRedisConnected) {
      return this.processFallbackJob('comprehensive_analysis', () => 
        this.processComprehensiveAnalysis(symbol, { ...data, assetId })
      );
    }

    return this.mlQueue.add('comprehensive_analysis', {
      type: 'comprehensive_analysis',
      symbol,
      data: { ...data, assetId },
      userId,
    });
  }

  async queueBulkUpdate(data: any = {}): Promise<Job | null> {
    if (!this.isRedisConnected) {
      return this.processFallbackJob('bulk_update', () => 
        this.processBulkUpdate(data)
      );
    }

    return this.mlQueue.add('bulk_update', {
      type: 'bulk_update',
      data,
    });
  }

  // Fallback processing when Redis is not available
  private async processFallbackJob(type: string, processor: () => Promise<any>): Promise<Job | null> {
    const jobId = `fallback_${type}_${Date.now()}`;
    
    // Process job immediately in fallback mode
    setTimeout(async () => {
      try {
        const result = await processor();
        log(`✅ Fallback job completed: ${type}`);
      } catch (error) {
        console.error(`❌ Fallback job failed: ${type}`, error);
      }
    }, 0);

    return null; // No actual Job object in fallback mode
  }

  // Helper calculation methods
  private calculateBehavioralActivity(asset: any, inputData: any): number {
    return 20 + Math.random() * 60; // 20-80 range
  }

  private calculateVelocityAnomaly(asset: any, inputData: any): number {
    return Math.max(0, asset.change24h + Math.random() * 20);
  }

  private calculateCommunitycohesion(asset: any, inputData: any): number {
    return 30 + Math.random() * 50; // 30-80 range
  }

  private calculateAnchorPressure(asset: any, inputData: any): number {
    return Math.abs(asset.change24h) * 2 + Math.random() * 20;
  }

  private calculateHypeToHoldRatio(asset: any, inputData: any): number {
    return 10 + Math.random() * 70; // 10-80 range
  }

  private calculateHistoricalVolatility(asset: any, inputData: any): number {
    return Math.abs(asset.change24h) * 1.5 + Math.random() * 15;
  }

  // Simulate heavy computation
  private async simulateHeavyCalculation(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get queue status
  async getQueueStatus() {
    if (!this.isRedisConnected) {
      return {
        mode: 'fallback',
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
      };
    }

    const [waiting, active, completed, failed] = await Promise.all([
      this.mlQueue.count(),
      this.mlQueue.getActive(),
      this.mlQueue.getCompleted(),
      this.mlQueue.getFailed(),
    ]);

    return {
      mode: 'redis',
      waiting,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  // Cleanup on shutdown
  async shutdown(): Promise<void> {
    await this.worker.close();
    await this.mlQueue.close();
    await redisConnection.disconnect();
    log('Background job service shutdown complete');
  }
}

// Export singleton instance
export const backgroundJobService = new BackgroundJobService();