'use client'

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import Landing from '../pages/landing'
import Dashboard from '../pages/dashboard'

export function AuthChecker() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Silent Surge Tracker</h1>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Landing />
  }

  return <Dashboard />
}