'use client'

import { useQuery } from "@tanstack/react-query"

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 30 * 1000, // Cache for 30 seconds to prevent aggressive refetching
    refetchOnWindowFocus: false, // Prevent refetch on focus (WebKit issue)
    refetchOnMount: false, // Prevent refetch on mount
    refetchInterval: false, // Disable automatic refetching
  })

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user && !error,
  }
}