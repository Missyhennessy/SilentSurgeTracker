import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface SubscriptionStatus {
  isPremium: boolean;
  isFounder: boolean;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  subscriptionEndsAt?: string;
}

export function useSubscription() {
  const { isAuthenticated } = useAuth();

  const { data: subscriptionStatus, isLoading, error } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscription/status"],
    enabled: isAuthenticated,
    retry: false,
    staleTime: Infinity, // Never consider stale to prevent refresh cycles
    gcTime: Infinity, // Keep in cache indefinitely
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  });

  const hasPremiumAccess = !!(subscriptionStatus?.isPremium || subscriptionStatus?.isFounder);
  const isFounder = !!subscriptionStatus?.isFounder;

  return {
    subscriptionStatus,
    isLoading,
    error,
    hasPremiumAccess,
    isFounder,
    isAuthenticated,
  };
}