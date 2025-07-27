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
import SimpleTest from "@/pages/simple-test";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/protected-route";

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
  // Temporarily disable auth for testing
  // const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={SimpleTest} />
      <Route path="/test" component={SimpleTest} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/phase1" component={Phase1Features} />
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
