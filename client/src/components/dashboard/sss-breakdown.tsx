import { Progress } from "@/components/ui/progress";
import { CryptoAsset } from "@/types/crypto";
import { calculateSSS } from "@/lib/sss-calculator";

interface SSSBreakdownProps {
  asset?: CryptoAsset;
}

export default function SSSBreakdown({ asset }: SSSBreakdownProps) {
  if (!asset) {
    return (
      <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Silent Surge Score Components
        </h3>
        <p className="text-[var(--text-secondary)]">Select an asset to view SSS breakdown</p>
      </div>
    );
  }

  const breakdown = calculateSSS(asset);

  const components = [
    {
      name: "Behavioral Activity (20%)",
      value: breakdown.behavioralActivity,
      color: "bg-[var(--primary-blue)]",
      dotColor: "bg-[var(--primary-blue)]"
    },
    {
      name: "Token Velocity Anomaly (20%)",
      value: breakdown.velocityAnomaly,
      color: "bg-[var(--success-green)]",
      dotColor: "bg-[var(--success-green)]"
    },
    {
      name: "Community Cohesion (20%)",
      value: breakdown.communityCohesion,
      color: "bg-[var(--warning-amber)]",
      dotColor: "bg-[var(--warning-amber)]"
    },
    {
      name: "Anchor Pressure (25%)",
      value: breakdown.anchorPressure,
      color: "bg-purple-500",
      dotColor: "bg-purple-500"
    },
    {
      name: "Hype-to-Hold Ratio (10%)",
      value: breakdown.hypeToHoldRatio,
      color: "bg-pink-500",
      dotColor: "bg-pink-500"
    },
    {
      name: "Historical Volatility (5%)",
      value: breakdown.historicalVolatility,
      color: "bg-gray-500",
      dotColor: "bg-gray-500"
    },
  ];

  return (
    <div className="bg-[var(--dark-panel)] rounded-xl border border-[var(--dark-border)] p-6">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        Silent Surge Score Components
      </h3>
      
      <div className="space-y-4">
        {components.map((component) => (
          <div key={component.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 ${component.dotColor} rounded-full`} />
              <span className="text-[var(--text-secondary)] text-sm">{component.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-24">
                <Progress 
                  value={component.value} 
                  className="h-2"
                />
              </div>
              <span className="text-[var(--text-primary)] font-medium w-8 text-right">
                {Math.round(component.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-[var(--dark-border)]">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-[var(--text-primary)]">Total SSS Score</span>
          <span className="text-2xl font-bold text-[var(--success-green)]">
            {breakdown.totalScore}
          </span>
        </div>
      </div>
    </div>
  );
}
