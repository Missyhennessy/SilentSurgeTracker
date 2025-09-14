'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useQuery } from "@tanstack/react-query"
import { TrendingUp, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState("scanner")
  const [alertCount] = useState(3)

  // Get total assets for header
  const { data: assets } = useQuery<any[]>({
    queryKey: ["/api/assets"],
    refetchInterval: 30000,
  })

  const totalAssets = Array.isArray(assets) ? assets.length : 0

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Combined Header and Navigation */}
      <div className="bg-gray-900 border-b border-gray-700 sticky top-0 z-30">
        {/* Top Header Row */}
        <div className="px-6 py-3 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            {/* Left section */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Silent Surge Tracker</h1>
                  <p className="text-xs text-gray-400">
                    {new Date().toLocaleTimeString()} • Real-time Analysis
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="hidden lg:flex items-center gap-4 ml-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    {totalAssets || 0}
                  </div>
                  <div className="text-xs text-gray-400">Assets</div>
                </div>
                <div className="w-px h-8 bg-gray-700"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">
                    {alertCount}
                  </div>
                  <div className="text-xs text-gray-400">Alerts</div>
                </div>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Live Data</span>
              </div>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {alertCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {alertCount > 9 ? '9+' : alertCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Navigation Bar Row */}
        <div className="px-6 py-3">
          <div className="flex items-center gap-8">
            <button 
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                activeModule === 'scanner' 
                  ? 'text-blue-400 bg-blue-500/10' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveModule('scanner')}
            >
              Scanner
            </button>
            <button 
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                activeModule === 'watchlist' 
                  ? 'text-blue-400 bg-blue-500/10' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveModule('watchlist')}
            >
              Watchlist
            </button>
            <button 
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                activeModule === 'heatmap' 
                  ? 'text-blue-400 bg-blue-500/10' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveModule('heatmap')}
            >
              Heatmap
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {activeModule === 'scanner' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Asset Scanner</h2>
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-2 text-white">Total Assets</h3>
                <p className="text-3xl font-bold text-blue-400">{totalAssets || 0}</p>
                <p className="text-sm text-gray-400 mt-1">Monitored assets</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-2 text-white">High SSS (80+)</h3>
                <p className="text-3xl font-bold text-green-400">23</p>
                <p className="text-sm text-gray-400 mt-1">Strong surge potential</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-2 text-white">Avg SSS Score</h3>
                <p className="text-3xl font-bold text-yellow-400">42.8</p>
                <p className="text-sm text-gray-400 mt-1">Market average</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-2 text-white">Top Performer</h3>
                <p className="text-3xl font-bold text-purple-400">BTC</p>
                <p className="text-sm text-gray-400 mt-1">SSS: 89.5</p>
              </div>
            </div>
            
            {/* Asset List */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Crypto Data</h3>
                <div className="space-y-3">
                  {assets && assets.length > 0 ? (
                    assets.slice(0, 5).map((asset, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {asset.symbol?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{asset.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-400">{asset.symbol || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white">
                            ${asset.price?.toFixed(2) || '0.00'}
                          </div>
                          <div className="text-sm text-blue-400">
                            SSS: {asset.sssScore?.toFixed(1) || '0.0'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      Loading cryptocurrency data...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeModule === 'watchlist' && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-white mb-4">Watchlist</h2>
            <p className="text-gray-400">Your personalized cryptocurrency watchlist</p>
          </div>
        )}

        {activeModule === 'heatmap' && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-white mb-4">Behavioral Heatmap</h2>
            <p className="text-gray-400">Visual representation of market behavior</p>
          </div>
        )}
      </div>
    </div>
  )
}