import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, User, LogIn, LogOut } from "lucide-react";
import type { User as UserType } from "@shared/schema";

export function LoginStatus() {
  const { user, isAuthenticated, isLoading } = useAuth() as {
    user?: UserType;
    isAuthenticated: boolean;
    isLoading: boolean;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Checking authentication...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          Authentication Status
        </CardTitle>
        <CardDescription>
          Current login state and session information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
          <Badge variant={isAuthenticated ? "default" : "destructive"} className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Authenticated
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Not Authenticated
              </>
            )}
          </Badge>
        </div>

        {isAuthenticated && user && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">User:</span>
              <span className="text-sm font-medium">
                {user.firstName || user.email || 'Unknown User'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
              <span className="text-sm font-medium">{user.email || 'No email'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Provider:</span>
              <Badge variant="outline">Replit Auth</Badge>
            </div>
          </>
        )}

        <div className="pt-2 border-t">
          {isAuthenticated ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => window.location.href = '/api/logout'}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="w-full"
              onClick={() => window.location.href = '/api/login'}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}