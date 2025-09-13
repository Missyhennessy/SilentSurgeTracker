import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SimpleTest() {
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ["/api/health"],
    refetchInterval: 5000,
  });

  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ["/api/assets"],
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">API Health Check</CardTitle>
            <CardDescription>Testing basic API connectivity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Health Status</h3>
                {healthLoading ? (
                  <p className="text-gray-400">Loading...</p>
                ) : health ? (
                  <div className="text-green-400">
                    <p>✓ API Connected</p>
                    <p>Timestamp: {health.timestamp}</p>
                  </div>
                ) : (
                  <p className="text-red-400">✗ API Disconnected</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Assets Data</h3>
                {assetsLoading ? (
                  <p className="text-gray-400">Loading...</p>
                ) : assets ? (
                  <div className="text-green-400">
                    <p>✓ Assets loaded: {Array.isArray(assets) ? assets.length : 0} cryptocurrencies</p>
                    {Array.isArray(assets) && assets.length > 0 && (
                      <div className="mt-2">
                        <p className="text-white">Sample assets:</p>
                        <ul className="ml-4 text-sm text-gray-300">
                          {assets.slice(0, 5).map((asset: any) => (
                            <li key={asset.id}>
                              {asset.symbol}: ${asset.price} (SSS: {asset.sssScore})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-red-400">✗ Assets not loaded</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}