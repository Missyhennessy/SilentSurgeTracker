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
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
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