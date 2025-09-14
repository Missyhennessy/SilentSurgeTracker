import { Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface HeaderProps {
  alertCount: number;
}

export default function Header({ alertCount }: HeaderProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "dark";
    setIsDark(theme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <header className="bg-[var(--dark-panel)] border-b border-[var(--dark-border)] px-6 py-4 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[var(--primary-blue)] to-[var(--success-green)] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--dark-bg)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Silent Surge Tracker</h1>
            <span className="text-xs bg-[var(--primary-blue)]/20 text-[var(--primary-blue)] px-2 py-1 rounded-full">BETA</span>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="text-[var(--primary-blue)] font-medium">Dashboard</a>
            <a href="/phase1" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Phase 1</a>
            <a href="/phase2" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Phase 2</a>
            <a href="/profile" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Profile</a>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--danger-red)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          
          <div className="w-8 h-8 bg-gradient-to-r from-[var(--primary-blue)] to-[var(--success-green)] rounded-full"></div>
        </div>
      </div>
    </header>
  );
}
