'use client'

import React from 'react'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Assets</h3>
            <p className="text-3xl font-bold text-blue-400">1,247</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">High SSS (80+)</h3>
            <p className="text-3xl font-bold text-green-400">23</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Avg SSS Score</h3>
            <p className="text-3xl font-bold text-yellow-400">42.8</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Alerts</h3>
            <p className="text-3xl font-bold text-red-400">5</p>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Asset Scanner</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400">Loading cryptocurrency data...</p>
          </div>
        </div>
      </div>
    </div>
  )
}