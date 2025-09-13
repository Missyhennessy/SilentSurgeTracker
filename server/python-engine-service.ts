import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import type { Express } from 'express';

interface PythonEngineResult {
  token: string;
  sss: number;
  breakout_3d: number;
  breakout_7d: number;
  breakout_14d: number;
  action: string;
  confidence: string;
  risk_level: string;
  reasoning?: string[];
  price_targets?: {
    conservative_target: number;
    upside_target: number;
    aggressive_target: number;
    stop_loss: number;
  };
}

interface PythonEngineAnalysis {
  timestamp: string;
  total_analyzed: number;
  avg_breakout_probability: number;
  strong_signals: number;
  results: PythonEngineResult[];
  market_summary: {
    strong_buy_count: number;
    buy_count: number;
    accumulate_count: number;
    high_risk_count: number;
  };
  top_opportunities: PythonEngineResult[];
  alerts: any[];
}

interface ForecastRequest {
  symbol: string;
  sss: number;
  velocity: number;
  sentiment: number;
  anchor_pressure: number;
  current_price: number;
  price_history: number[];
}

interface DecisionRequest {
  symbol: string;
  sss: number;
  velocity: number;
  social_sentiment: number;
  anchor_pressure: number;
  breakout_3d: number;
  breakout_7d: number;
  breakout_14d: number;
  volume_anomaly: number;
  network_activity: number;
  market_cap: number;
  volume_24h: number;
  btc_correlation: number;
  risk_profile?: 'conservative' | 'moderate' | 'aggressive';
}

class PythonEngineService {
  private pythonPath: string;
  private enginePath: string;
  private isInitialized: boolean = false;

  constructor() {
    this.pythonPath = 'python3';
    this.enginePath = path.join(process.cwd(), 'python_engine');
  }

  async initialize(): Promise<void> {
    try {
      // Check if Python engine directory exists
      await fs.access(this.enginePath);
      
      // Test Python availability
      await this.testPythonEnvironment();
      
      this.isInitialized = true;
      console.log('Python Engine Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Python Engine Service:', error);
      throw new Error('Python Engine Service initialization failed');
    }
  }

  private async testPythonEnvironment(): Promise<void> {
    return new Promise((resolve, reject) => {
      const testProcess = spawn(this.pythonPath, ['-c', 'import sys; print("Python OK")'], {
        cwd: this.enginePath
      });

      let output = '';
      testProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      testProcess.on('close', (code) => {
        if (code === 0 && output.includes('Python OK')) {
          resolve();
        } else {
          reject(new Error('Python environment test failed'));
        }
      });

      testProcess.on('error', (error) => {
        reject(new Error(`Python process error: ${error.message}`));
      });
    });
  }

  public async executePythonScript(scriptPath: string, args: string[] = [], useInlineScript: boolean = false, inlineScript?: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      let process;
      
      if (useInlineScript && inlineScript) {
        // Execute inline script directly
        process = spawn(this.pythonPath, ['-c', inlineScript, ...args], {
          cwd: this.enginePath,
          stdio: ['pipe', 'pipe', 'pipe']
        });
      } else {
        // Execute script file
        process = spawn(this.pythonPath, [scriptPath, ...args], {
          cwd: this.enginePath,
          stdio: ['pipe', 'pipe', 'pipe']
        });
      }

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          try {
            // Try to parse JSON from the last line of output
            const lines = stdout.trim().split('\n');
            const lastLine = lines[lines.length - 1];
            
            if (lastLine.startsWith('{') || lastLine.startsWith('[')) {
              const result = JSON.parse(lastLine);
              resolve(result);
            } else {
              // If no JSON, return the full output
              resolve({ output: stdout, success: true });
            }
          } catch (parseError) {
            // Return raw output if JSON parsing fails
            resolve({ output: stdout, error: 'JSON parse failed', success: true });
          }
        } else {
          reject(new Error(`Python script failed with code ${code}: ${stderr}`));
        }
      });

      process.on('error', (error: Error) => {
        reject(new Error(`Python process error: ${error.message}`));
      });

      // Add timeout
      setTimeout(() => {
        process.kill();
        reject(new Error('Python script execution timeout'));
      }, 30000); // 30 second timeout
    });
  }

  async runFullAnalysis(tokens?: string[]): Promise<PythonEngineAnalysis> {
    try {
      const args = [];
      if (tokens && tokens.length > 0) {
        args.push('--tokens', tokens.join(','));
      }
      args.push('--no-charts', '--format', 'json');

      const result = await this.executePythonScript('run_analysis.py', args);
      
      return this.formatAnalysisResult(result);
    } catch (error) {
      console.error('Python engine analysis failed:', error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async runRealisticDemo(): Promise<PythonEngineAnalysis> {
    try {
      const result = await this.executePythonScript('realistic_demo.py');
      return this.formatAnalysisResult(result);
    } catch (error) {
      console.error('Python engine demo failed:', error);
      throw new Error(`Demo failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async runForecastAnalysis(tokenData: ForecastRequest): Promise<any> {
    try {
      // Create temporary input file
      const inputFile = path.join(this.enginePath, 'temp_forecast_input.json');
      await fs.writeFile(inputFile, JSON.stringify(tokenData));

      const result = await this.executePythonScript('forecast_analysis.py', [inputFile]);
      
      // Clean up temporary file
      try {
        await fs.unlink(inputFile);
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError);
      }

      return result;
    } catch (error) {
      console.error('Python forecast analysis failed:', error);
      throw new Error(`Forecast failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async runDecisionAnalysis(tokenData: DecisionRequest): Promise<any> {
    try {
      // Create temporary input file
      const inputFile = path.join(this.enginePath, 'temp_decision_input.json');
      await fs.writeFile(inputFile, JSON.stringify(tokenData));

      const args = [inputFile];
      if (tokenData.risk_profile) {
        args.push('--risk-profile', tokenData.risk_profile);
      }

      const result = await this.executePythonScript('decision_analysis.py', args);
      
      // Clean up temporary file
      try {
        await fs.unlink(inputFile);
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError);
      }

      return result;
    } catch (error) {
      console.error('Python decision analysis failed:', error);
      throw new Error(`Decision analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async calculateSSS(tokenData: any): Promise<number> {
    try {
      const inputFile = path.join(this.enginePath, 'temp_sss_input.json');
      await fs.writeFile(inputFile, JSON.stringify(tokenData));

      const result = await this.executePythonScript('calculate_sss.py', [inputFile]);
      
      // Clean up temporary file
      try {
        await fs.unlink(inputFile);
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError);
      }

      return typeof result === 'object' && result.sss ? result.sss : result;
    } catch (error) {
      console.error('Python SSS calculation failed:', error);
      throw new Error(`SSS calculation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private formatAnalysisResult(rawResult: any): PythonEngineAnalysis {
    // Handle different result formats from Python scripts
    if (typeof rawResult === 'string') {
      try {
        rawResult = JSON.parse(rawResult);
      } catch (error) {
        // If parsing fails, create a minimal result structure
        return {
          timestamp: new Date().toISOString(),
          total_analyzed: 0,
          avg_breakout_probability: 0,
          strong_signals: 0,
          results: [],
          market_summary: {
            strong_buy_count: 0,
            buy_count: 0,
            accumulate_count: 0,
            high_risk_count: 0
          },
          top_opportunities: [],
          alerts: []
        };
      }
    }

    // Format the result to match our interface
    return {
      timestamp: rawResult.timestamp || new Date().toISOString(),
      total_analyzed: rawResult.total_analyzed || 0,
      avg_breakout_probability: rawResult.avg_breakout_probability || 0,
      strong_signals: rawResult.strong_signals || 0,
      results: rawResult.results || [],
      market_summary: rawResult.market_summary || {
        strong_buy_count: 0,
        buy_count: 0,
        accumulate_count: 0,
        high_risk_count: 0
      },
      top_opportunities: rawResult.top_opportunities || [],
      alerts: rawResult.alerts || []
    };
  }

  async getEngineStatus(): Promise<any> {
    try {
      const result = await this.executePythonScript('-c', [
        'import sys; print({"python_version": sys.version, "status": "ready"})'
      ]);
      return result;
    } catch (error) {
      return { status: 'error', message: error instanceof Error ? error.message : String(error) };
    }
  }
}

// Create singleton instance
export const pythonEngineService = new PythonEngineService();

// Register API routes
export function registerPythonEngineRoutes(app: Express, requireSubscription?: any): void {
  // Initialize the service
  pythonEngineService.initialize().catch(console.error);

  // Full analysis endpoint
  app.post('/api/python-engine/analysis', async (req, res) => {
    try {
      const { tokens } = req.body;
      
      if (tokens && (!Array.isArray(tokens) || tokens.length > 50)) {
        return res.status(400).json({ error: 'Invalid tokens array (max 50 tokens)' });
      }

      const result = await pythonEngineService.runFullAnalysis(tokens);
      res.json(result);
    } catch (error) {
      console.error('Python engine analysis error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Realistic demo endpoint
  app.get('/api/python-engine/demo', async (req, res) => {
    try {
      const result = await pythonEngineService.runRealisticDemo();
      res.json(result);
    } catch (error) {
      console.error('Python engine demo error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Forecast analysis endpoint
  app.post('/api/python-engine/forecast', async (req, res) => {
    try {
      const tokenData = req.body as ForecastRequest;
      
      // Validate required fields
      const requiredFields = ['symbol', 'sss', 'velocity', 'sentiment', 'anchor_pressure', 'current_price'];
      for (const field of requiredFields) {
        if (!(field in tokenData)) {
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
      }

      const result = await pythonEngineService.runForecastAnalysis(tokenData);
      res.json(result);
    } catch (error) {
      console.error('Python forecast error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Decision analysis endpoint
  app.post('/api/python-engine/decision', async (req, res) => {
    try {
      const tokenData = req.body as DecisionRequest;
      
      // Validate required fields
      const requiredFields = ['symbol', 'sss', 'breakout_7d'];
      for (const field of requiredFields) {
        if (!(field in tokenData)) {
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
      }

      const result = await pythonEngineService.runDecisionAnalysis(tokenData);
      res.json(result);
    } catch (error) {
      console.error('Python decision analysis error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  // SSS calculation endpoint
  app.post('/api/python-engine/sss', async (req, res) => {
    try {
      const tokenData = req.body;
      
      if (!tokenData || typeof tokenData !== 'object') {
        return res.status(400).json({ error: 'Invalid token data' });
      }

      const sss = await pythonEngineService.calculateSSS(tokenData);
      res.json({ sss });
    } catch (error) {
      console.error('Python SSS calculation error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Engine status endpoint
  app.get('/api/python-engine/status', async (req, res) => {
    try {
      const status = await pythonEngineService.getEngineStatus();
      res.json(status);
    } catch (error) {
      console.error('Python engine status error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  // ML Models endpoint (Premium Feature)
  app.get('/api/python-engine/ml-models', requireSubscription || ((req: any, res: any, next: any) => next()), async (req, res) => {
    try {
      const script = `
import sys
import os
sys.path.append('python_engine')
from simple_ml_demo import simple_ml_demo
import json

try:
    result = simple_ml_demo()
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;
      
      const result = await pythonEngineService.executePythonScript('temp_ml_script.py', [], true, script);
      let parsedResult = result;
      
      if (typeof result === 'string') {
        try {
          parsedResult = JSON.parse(result);
        } catch (e) {
          parsedResult = { error: 'Failed to parse ML response', raw_output: result };
        }
      } else if (result && result.output && typeof result.output === 'string') {
        try {
          parsedResult = JSON.parse(result.output);
        } catch (e) {
          parsedResult = { error: 'Failed to parse ML output', raw_output: result.output };
        }
      }
      
      res.json({
        timestamp: new Date().toISOString(),
        ml_capabilities: parsedResult,
        status: 'active'
      });
      
    } catch (error) {
      console.error('ML Models error:', error);
      res.status(500).json({ 
        error: 'ML models failed',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Enhanced SSS with ML (Premium Feature)
  app.post('/api/python-engine/enhanced-sss', requireSubscription || ((req: any, res: any, next: any) => next()), async (req, res) => {
    try {
      const { behavioral_activity, velocity_anomaly, community_cohesion, anchor_pressure, hype_to_hold, historical_volatility } = req.body;
      
      // Validate inputs
      const required = { behavioral_activity, velocity_anomaly, community_cohesion, anchor_pressure, hype_to_hold, historical_volatility };
      for (const [key, value] of Object.entries(required)) {
        if (value === undefined || value === null || isNaN(Number(value))) {
          return res.status(400).json({ error: `Invalid ${key} parameter` });
        }
      }

      const script = `
import sys
import os
sys.path.append('python_engine')
from simple_ml_demo import enhanced_sss_calculation
import json

try:
    metrics = {
        'behavioral_activity': ${parseFloat(behavioral_activity)},
        'velocity_anomaly': ${parseFloat(velocity_anomaly)},
        'community_cohesion': ${parseFloat(community_cohesion)},
        'anchor_pressure': ${parseFloat(anchor_pressure)},
        'hype_to_hold': ${parseFloat(hype_to_hold)},
        'historical_volatility': ${parseFloat(historical_volatility)}
    }
    
    result = enhanced_sss_calculation(metrics)
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;

      const result = await pythonEngineService.executePythonScript('temp_enhanced_sss.py', [], true, script);
      const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
      
      res.json(parsedResult);
      
    } catch (error: any) {
      console.error('Enhanced SSS calculation error:', error);
      res.status(500).json({ 
        error: 'Enhanced SSS calculation failed',
        details: error.message 
      });
    }
  });

  // ML Breakout Probability (Premium Feature)
  app.post('/api/python-engine/ml-breakout', requireSubscription || ((req: any, res: any, next: any) => next()), async (req, res) => {
    try {
      const { sss, velocity, sentiment, anchor_pressure, timeframe = 7 } = req.body;
      
      if (!sss || !velocity || !sentiment || !anchor_pressure) {
        return res.status(400).json({ error: 'Missing required parameters: sss, velocity, sentiment, anchor_pressure' });
      }

      const script = `
import sys
import os
sys.path.append('python_engine')
from simple_ml_demo import ml_breakout_probability
import json

try:
    result = ml_breakout_probability(
        ${parseFloat(sss)}, 
        ${parseFloat(velocity)}, 
        ${parseFloat(sentiment)}, 
        ${parseFloat(anchor_pressure)}, 
        ${parseInt(timeframe)}
    )
    
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;

      const result = await pythonEngineService.executePythonScript('temp_ml_breakout.py', [], true, script);
      const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
      
      res.json(parsedResult);
      
    } catch (error: any) {
      console.error('ML Breakout Probability error:', error);
      res.status(500).json({ 
        error: 'ML breakout probability calculation failed',
        details: error.message 
      });
    }
  });

  // Comprehensive ML Analysis (Premium Feature)
  app.post('/api/python-engine/comprehensive-analysis', requireSubscription || ((req: any, res: any, next: any) => next()), async (req, res) => {
    try {
      const tokenData = req.body;
      
      if (!tokenData.symbol) {
        return res.status(400).json({ error: 'Token symbol is required' });
      }

      const script = `
import sys
import os
sys.path.append('python_engine')
from simple_ml_demo import comprehensive_analysis
import json

try:
    token_data = ${JSON.stringify(tokenData)}
    
    result = comprehensive_analysis(token_data)
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;

      const result = await pythonEngineService.executePythonScript('temp_comprehensive.py', [], true, script);
      const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
      
      res.json(parsedResult);
      
    } catch (error: any) {
      console.error('Comprehensive Analysis error:', error);
      res.status(500).json({ 
        error: 'Comprehensive analysis failed',
        details: error.message 
      });
    }
  });

  // Batch analysis endpoint for multiple tokens
  app.post('/api/python-engine/batch-analysis', async (req, res) => {
    try {
      const { tokens, analysis_type = 'full' } = req.body;
      
      if (!Array.isArray(tokens) || tokens.length === 0 || tokens.length > 100) {
        return res.status(400).json({ error: 'Invalid tokens array (1-100 tokens required)' });
      }

      // Validate each token has required fields
      for (const token of tokens) {
        if (!token.symbol || typeof token.sss !== 'number') {
          return res.status(400).json({ error: 'Each token must have symbol and sss fields' });
        }
      }

      const results = [];
      for (const token of tokens) {
        try {
          let result;
          switch (analysis_type) {
            case 'forecast':
              result = await pythonEngineService.runForecastAnalysis(token);
              break;
            case 'decision':
              result = await pythonEngineService.runDecisionAnalysis(token);
              break;
            default:
              result = { sss: await pythonEngineService.calculateSSS(token) };
          }
          results.push({ symbol: token.symbol, ...result });
        } catch (error) {
          results.push({ symbol: token.symbol, error: error instanceof Error ? error.message : String(error) });
        }
      }

      res.json({ results, total_processed: results.length });
    } catch (error) {
      console.error('Python batch analysis error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
}