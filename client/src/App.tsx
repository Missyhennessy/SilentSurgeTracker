import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import { Phase1Features } from "@/pages/phase1-features";
import { Phase2Features } from "@/pages/phase2-features";
import Phase3Features from "@/pages/phase3-features";
import SimpleTest from "@/pages/simple-test";
import CryptoDetail from "@/pages/crypto-detail";
import PythonEnginePage from "@/pages/python-engine";
import { MLDashboard } from "@/components/MLDashboard";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import SubscriptionPage from "@/pages/SubscriptionPage";

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = stored || "dark";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div className="theme-provider">
      {children}
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/profile">
            {() => (
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/phase1">
            {() => (
              <ProtectedRoute>
                <Phase1Features />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/phase2">
            {() => (
              <ProtectedRoute>
                <Phase2Features />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/phase3">
            {() => (
              <ProtectedRoute>
                <Phase3Features />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/python-engine">
            {() => (
              <ProtectedRoute>
                <PythonEnginePage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/ml-dashboard">
            {() => (
              <ProtectedRoute>
                <MLDashboard />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/subscribe">
            {() => (
              <ProtectedRoute>
                <SubscriptionPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/crypto/:symbol">
            {() => (
              <ProtectedRoute>
                <CryptoDetail />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/test" component={SimpleTest} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
