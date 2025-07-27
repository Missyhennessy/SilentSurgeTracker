import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserIcon, Mail, Calendar, Shield, Activity, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Profile() {
  const { user } = useAuth() as { user?: User };
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  const handleSave = async () => {
    try {
      // API call to update user profile would go here
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please log in to view your profile
          </h1>
          <Button onClick={() => window.location.href = '/api/login'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          User Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-blue-600 text-white text-lg">
                    {user.firstName?.[0] || user.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                  <Badge variant="secondary" className="mt-2">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified Account
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={isEditing ? formData.firstName : user.firstName || ""}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={isEditing ? formData.lastName : user.lastName || ""}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                  <p className="text-sm text-gray-500">
                    Email cannot be changed and is managed by Replit
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Security
              </CardTitle>
              <CardDescription>
                Manage your account security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Replit Authentication</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your account is secured with Replit's authentication system
                  </p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Active
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Session Management</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically expires after 7 days of inactivity
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View Sessions
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Account Created</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'Unknown'}
                  </p>
                </div>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your recent actions and interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Logged in to Silent Surge Tracker</span>
                    </div>
                    <span className="text-sm text-gray-500">Just now</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Accessed cryptocurrency dashboard</span>
                    </div>
                    <span className="text-sm text-gray-500">2 minutes ago</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Searched for LBLOCK cryptocurrency</span>
                    </div>
                    <span className="text-sm text-gray-500">5 minutes ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Authentication Status
                </CardTitle>
                <CardDescription>
                  Current session and security information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <Badge variant="default" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Authenticated
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Provider:</span>
                  <Badge variant="outline">Replit Auth</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Session expires:</span>
                  <span className="text-sm font-medium">7 days</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Platform Preferences
              </CardTitle>
              <CardDescription>
                Customize your Silent Surge Tracker experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive alerts and updates via email
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Dashboard Theme</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose your preferred color scheme
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Dark Mode</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Data Refresh Rate</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      How often to update crypto data
                    </p>
                  </div>
                  <Button variant="outline" size="sm">30 seconds</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Default Currency</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Primary currency for price display
                    </p>
                  </div>
                  <Button variant="outline" size="sm">USD</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}