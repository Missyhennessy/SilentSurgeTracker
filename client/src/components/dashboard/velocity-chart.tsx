import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CryptoAsset, VelocityDataPoint } from "@/types/crypto";
import { generateVelocityData } from "@/lib/mock-data";
import { useState } from "react";

interface VelocityChartProps {
  asset?: CryptoAsset;
}

export default function VelocityChart({ asset }: VelocityChartProps) {
  const [timeframe, setTimeframe] = useState("24h");

  // Generate mock data since we don't have real velocity API
  const velocityData = asset ? generateVelocityData(asset.id, 24) : [];

  if (!asset) {
    return (
      <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Token Velocity Analysis
        </h3>
        <p className="text-[var(--text-secondary)]">Select an asset to view velocity data</p>
      </div>
    );
  }

  const chartData = velocityData.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    velocity: point.velocity,
    average: point.historicalAverage,
    anomaly: point.anomalyScore,
  }));

  return (
    <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Token Velocity Analysis
        </h3>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-24 bg-[var(--dark-bg)] border-[var(--dark-border)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24H</SelectItem>
            <SelectItem value="7d">7D</SelectItem>
            <SelectItem value="30d">30D</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
            <XAxis 
              dataKey="time" 
              stroke="var(--text-secondary)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--text-secondary)"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--dark-panel)',
                border: '1px solid var(--dark-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="velocity"
              stroke="var(--primary-blue)"
              strokeWidth={2}
              dot={{ fill: 'var(--primary-blue)', strokeWidth: 2, r: 4 }}
              name="Current Velocity"
            />
            <Line
              type="monotone"
              dataKey="average"
              stroke="var(--text-secondary)"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              name="Historical Average"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-[var(--success-green)]">
            +{Math.round(asset.velocityAnomaly)}%
          </div>
          <div className="text-xs text-[var(--text-secondary)]">Velocity Spike</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-[var(--warning-amber)]">
            {(Math.random() * 2 + 2).toFixed(1)}σ
          </div>
          <div className="text-xs text-[var(--text-secondary)]">Anomaly Score</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-[var(--primary-blue)]">High</div>
          <div className="text-xs text-[var(--text-secondary)]">Signal Strength</div>
        </div>
      </div>
    </div>
  );
}
