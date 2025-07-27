import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TwoFactorAuth } from "./two-factor-auth";
import { PasswordManagement } from "./password-management";
import { UserActivityLog } from "./user-activity-log";
import { ExternalSecurityDashboard } from "@/components/security/external-security-dashboard";

export function EnhancedSecurityDashboard() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Security Dashboard</CardTitle>
          <CardDescription>
            Comprehensive security management for your Silent Surge Tracker account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="2fa" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="2fa">Two-Factor Auth</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
              <TabsTrigger value="external">External Security</TabsTrigger>
            </TabsList>

            <TabsContent value="2fa">
              <TwoFactorAuth 
                isEnabled={is2FAEnabled} 
                onToggle={setIs2FAEnabled} 
              />
            </TabsContent>

            <TabsContent value="password">
              <PasswordManagement />
            </TabsContent>

            <TabsContent value="activity">
              <UserActivityLog />
            </TabsContent>

            <TabsContent value="external">
              <ExternalSecurityDashboard />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}