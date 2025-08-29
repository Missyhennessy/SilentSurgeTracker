import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: true, // Only fetch once on mount
    retry: false,
    staleTime: Infinity, // Never consider stale to prevent refresh cycles
    gcTime: Infinity, // Keep in cache indefinitely
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    refetchOnReconnect: false, // Don't refetch when network reconnects
    retryOnMount: false,
    notifyOnChangeProps: ['data', 'error'], // Only notify when data or error changes
  });

  // Only consider authenticated if we have user data and no error
  const isAuthenticated = !!user && !error;

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
  };
}