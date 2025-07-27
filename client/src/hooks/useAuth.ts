import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Temporarily disable auth for testing
  // const { data: user, isLoading } = useQuery({
  //   queryKey: ["/api/auth/user"],
  //   retry: false,
  // });

  return {
    user: { id: 'test', email: 'test@example.com' },
    isLoading: false,
    isAuthenticated: true,
  };
}