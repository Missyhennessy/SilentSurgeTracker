import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon, WalletIcon, ExternalLinkIcon, RefreshCwIcon } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface WhaleTransaction {
  transactionHash: string;
  assetSymbol: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  amountUsd: number;
  transactionType: 'buy' | 'sell' | 'transfer';
  exchangeName?: string;
  blockTimestamp: string;
  sssScoreAtTime?: number;
  priceImpact?: number;
  isSmartMoney: boolean;
  walletLabel?: string;
}

interface ExchangeFlow {
  exchangeName: string;
  assetSymbol: string;
  flowType: 'inflow' | 'outflow';
  amountUsd: number;
  netFlow?: number;
  flowVelocity?: number;
  isAnomaly: boolean;
  anomalyScore: number;
  transactionCount: number;
  timeframe: string;
}

interface SmartMoneyWallet {
  walletAddress: string;
  walletLabel: string;
  walletType: 'institution' | 'whale' | 'smart_trader' | 'exchange';
  balanceUsd?: number;
  successRate?: number;
  riskScore?: number;
  totalTransactions: number;
  profitLoss?: number;
  lastActivityAt?: string;
}

interface FlowSummary {
  totalWhaleTransactions24h: number;
  totalVolumeUsd24h: number;
  topExchangeFlows: any[];
  smartMoneySignals: any[];
  anomalyCount: number;
}

export default function FlowIntelligencePage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [selectedExchange, setSelectedExchange] = useState<string>("");

  // Fetch flow intelligence summary
  const { data: summary, isLoading: summaryLoading } = useQuery<FlowSummary>({
    queryKey: ["/api/flow/summary"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch whale transactions
  const { data: whaleData, isLoading: whaleLoading, refetch: refetchWhale } = useQuery({
    queryKey: ["/api/flow/whale-transactions", selectedAsset, selectedTimeframe],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Fetch exchange flows
  const { data: exchangeData, isLoading: exchangeLoading } = useQuery({
    queryKey: ["/api/flow/exchange-flows", selectedExchange, selectedAsset, selectedTimeframe],
    refetchInterval: 15000,
  });

  // Fetch smart money wallets
  const { data: smartMoneyData, isLoading: smartMoneyLoading } = useQuery({
    queryKey: ["/api/flow/smart-money"],
    refetchInterval: 60000, // Refresh every minute
  });

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'buy': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'sell': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'transfer': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getWalletTypeColor = (type: string) => {
    switch (type) {
      case 'institution': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'whale': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'smart_trader': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'exchange': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6" data-testid="page-flow-intelligence">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Flow Intelligence</h1>
          <p className="text-gray-400 mt-1">Track smart money movements and on-chain flows</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            refetchWhale();
          }}
          data-testid="button-refresh"
        >
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Whale Transactions (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="text-whale-transactions">
              {summaryLoading ? "..." : summary?.totalWhaleTransactions24h.toLocaleString() || "0"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Total Volume (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="text-total-volume">
              {summaryLoading ? "..." : formatCurrency(summary?.totalVolumeUsd24h || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Flow Anomalies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400" data-testid="text-anomalies">
              {summaryLoading ? "..." : summary?.anomalyCount || "0"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Smart Money Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400" data-testid="text-signals">
              {summaryLoading ? "..." : summary?.smartMoneySignals?.length || "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="whale-transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border-gray-700">
          <TabsTrigger value="whale-transactions" data-testid="tab-whale-transactions">Whale Transactions</TabsTrigger>
          <TabsTrigger value="exchange-flows" data-testid="tab-exchange-flows">Exchange Flows</TabsTrigger>
          <TabsTrigger value="smart-money" data-testid="tab-smart-money">Smart Money</TabsTrigger>
          <TabsTrigger value="cohort-analysis" data-testid="tab-cohort-analysis">Cohort Analysis</TabsTrigger>
        </TabsList>

        {/* Whale Transactions Tab */}
        <TabsContent value="whale-transactions" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
              <SelectTrigger className="w-[200px] bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="All Assets" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="">All Assets</SelectItem>
                <SelectItem value="BTC">BTC</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="SOL">SOL</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-[200px] bg-gray-800/50 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Whale Transactions</CardTitle>
              <CardDescription>Large transactions from known smart money wallets</CardDescription>
            </CardHeader>
            <CardContent>
              {whaleLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-700/50 h-16 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4" data-testid="list-whale-transactions">
                  {whaleData?.transactions?.map((tx: WhaleTransaction, index: number) => (
                    <div key={tx.transactionHash} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${tx.transactionType === 'buy' ? 'bg-green-500/20' : tx.transactionType === 'sell' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                          {tx.transactionType === 'buy' ? 
                            <ArrowUpIcon className="h-4 w-4 text-green-400" /> : 
                            tx.transactionType === 'sell' ?
                            <ArrowDownIcon className="h-4 w-4 text-red-400" /> :
                            <ExternalLinkIcon className="h-4 w-4 text-blue-400" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{formatCurrency(tx.amountUsd)}</span>
                            <Badge className={getTransactionTypeColor(tx.transactionType)}>
                              {tx.transactionType.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {tx.assetSymbol}
                            </Badge>
                            {tx.isSmartMoney && (
                              <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                                Smart Money
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {tx.walletLabel || formatAddress(tx.fromAddress)} 
                            {tx.exchangeName && ` → ${tx.exchangeName}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {formatNumber(tx.amount)} {tx.assetSymbol}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(tx.blockTimestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-gray-400 py-8">
                      No whale transactions found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exchange Flows Tab */}
        <TabsContent value="exchange-flows" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedExchange} onValueChange={setSelectedExchange}>
              <SelectTrigger className="w-[200px] bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="All Exchanges" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="">All Exchanges</SelectItem>
                <SelectItem value="Binance">Binance</SelectItem>
                <SelectItem value="Coinbase">Coinbase</SelectItem>
                <SelectItem value="Kraken">Kraken</SelectItem>
                <SelectItem value="Huobi">Huobi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Exchange Flow Analytics</CardTitle>
              <CardDescription>Real-time deposits and withdrawals across exchanges</CardDescription>
            </CardHeader>
            <CardContent>
              {exchangeLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-700/50 h-16 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4" data-testid="list-exchange-flows">
                  {exchangeData?.flows?.map((flow: ExchangeFlow, index: number) => (
                    <div key={`${flow.exchangeName}-${flow.assetSymbol}-${index}`} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${flow.flowType === 'inflow' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                          {flow.flowType === 'inflow' ? 
                            <ArrowDownIcon className="h-4 w-4 text-red-400" /> : 
                            <ArrowUpIcon className="h-4 w-4 text-green-400" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{flow.exchangeName}</span>
                            <Badge variant="outline" className="text-xs">
                              {flow.assetSymbol}
                            </Badge>
                            <Badge className={flow.flowType === 'inflow' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}>
                              {flow.flowType.toUpperCase()}
                            </Badge>
                            {flow.isAnomaly && (
                              <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                                ANOMALY
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {flow.transactionCount} transactions • {flow.timeframe}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {formatCurrency(flow.amountUsd)}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center">
                          {flow.flowVelocity !== undefined && (
                            <span className={`flex items-center ${flow.flowVelocity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {flow.flowVelocity > 0 ? <TrendingUpIcon className="h-3 w-3 mr-1" /> : <TrendingDownIcon className="h-3 w-3 mr-1" />}
                              {Math.abs(flow.flowVelocity).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-gray-400 py-8">
                      No exchange flows found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Money Tab */}
        <TabsContent value="smart-money" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Smart Money Wallets</CardTitle>
              <CardDescription>Known institutional and whale wallets</CardDescription>
            </CardHeader>
            <CardContent>
              {smartMoneyLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-700/50 h-16 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4" data-testid="list-smart-money">
                  {smartMoneyData?.wallets?.map((wallet: SmartMoneyWallet, index: number) => (
                    <div key={wallet.walletAddress} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full bg-purple-500/20">
                          <WalletIcon className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{wallet.walletLabel}</span>
                            <Badge className={getWalletTypeColor(wallet.walletType)}>
                              {wallet.walletType.toUpperCase().replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-400">
                            {formatAddress(wallet.walletAddress)} • {wallet.totalTransactions.toLocaleString()} transactions
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {wallet.balanceUsd ? formatCurrency(wallet.balanceUsd) : "N/A"}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-4">
                          {wallet.successRate && (
                            <span className="text-green-400">{wallet.successRate.toFixed(0)}% success</span>
                          )}
                          {wallet.riskScore && (
                            <span className={`${wallet.riskScore < 30 ? 'text-green-400' : wallet.riskScore < 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                              Risk: {wallet.riskScore.toFixed(0)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-gray-400 py-8">
                      No smart money wallets found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cohort Analysis Tab - Placeholder */}
        <TabsContent value="cohort-analysis" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Cohort Flow Analysis</CardTitle>
              <CardDescription>Understanding how different investor groups move funds</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="text-gray-400">
                Cohort analysis coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}