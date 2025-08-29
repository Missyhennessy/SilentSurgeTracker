import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: Infinity, // Never consider stale to prevent refresh cycles
    gcTime: Infinity, // Keep in cache indefinitely
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
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