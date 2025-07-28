import { useState, useEffect } from 'react';
import { Bell, Settings, User as UserIcon, TrendingUp, AlertTriangle, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RealTimeIndicator } from '@/components/real-time-indicator';
import { AnimatedCounter } from '@/components/ui/animated-counter';

interface EnhancedHeaderProps {
  isConnected: boolean;
  totalAssets?: number;
  activeAlerts?: number;
}

export function EnhancedHeader({ isConnected, totalAssets = 0, activeAlerts = 0 }: EnhancedHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useAuth() as { user?: User };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Silent Surge Tracker</h1>
              <p className="text-xs text-gray-400">
                {currentTime.toLocaleTimeString()} • Real-time Analysis
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-4 ml-6">
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                <AnimatedCounter value={totalAssets} />
              </div>
              <div className="text-xs text-gray-400">Assets</div>
            </div>
            <div className="w-px h-8 bg-gray-700"></div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">
                <AnimatedCounter value={activeAlerts} />
              </div>
              <div className="text-xs text-gray-400">Alerts</div>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Real-time indicator */}
          <RealTimeIndicator />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {activeAlerts > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {activeAlerts > 9 ? '9+' : activeAlerts}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-4 border-b">
                <h4 className="font-semibold">Notifications</h4>
                <p className="text-sm text-gray-500">Recent alerts and updates</p>
              </div>
              {activeAlerts > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  {Array.from({ length: Math.min(activeAlerts, 5) }).map((_, i) => (
                    <DropdownMenuItem key={i} className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">SSS Alert Triggered</p>
                          <p className="text-xs text-gray-500">
                            Asset showing unusual behavior patterns
                          </p>
                          <p className="text-xs text-gray-400 mt-1">2 min ago</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">No new notifications</p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Phase Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.location.href = '/phase1'}
              className="text-xs"
            >
              Phase 1
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.location.href = '/phase2'}
              className="text-xs"
            >
              Phase 2
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.location.href = '/phase3'}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
            >
              Phase 3
            </Button>
          </div>

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="h-5 w-5" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user && (
                <>
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium">{user.firstName || 'User'} {user.lastName || ''}</div>
                    <div className="text-gray-500">{user.email || 'No email'}</div>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}