import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Lock, Eye, EyeOff, Shield, AlertTriangle, CheckCircle, RefreshCw, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
}

export function PasswordManagement() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastChanged, setLastChanged] = useState<Date | null>(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)); // 45 days ago

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const suggestions: string[] = [];

    if (password.length >= 8) score += 20;
    else suggestions.push("Use at least 8 characters");

    if (password.length >= 12) score += 10;
    else suggestions.push("Consider using 12+ characters for better security");

    if (/[a-z]/.test(password)) score += 10;
    else suggestions.push("Include lowercase letters");

    if (/[A-Z]/.test(password)) score += 10;
    else suggestions.push("Include uppercase letters");

    if (/[0-9]/.test(password)) score += 15;
    else suggestions.push("Include numbers");

    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    else suggestions.push("Include special characters (!@#$%^&*)");

    if (password.length >= 16) score += 10;

    if (/(.)\1{2,}/.test(password)) {
      score -= 10;
      suggestions.push("Avoid repeating characters");
    }

    if (/123|abc|qwe|password|admin/.test(password.toLowerCase())) {
      score -= 20;
      suggestions.push("Avoid common patterns and words");
    }

    let label = '';
    let color = '';

    if (score >= 80) {
      label = 'Very Strong';
      color = 'text-green-600';
    } else if (score >= 60) {
      label = 'Strong';
      color = 'text-blue-600';
    } else if (score >= 40) {
      label = 'Moderate';
      color = 'text-yellow-600';
    } else if (score >= 20) {
      label = 'Weak';
      color = 'text-orange-600';
    } else {
      label = 'Very Weak';
      color = 'text-red-600';
    }

    return { score: Math.max(0, score), label, color, suggestions };
  };

  const passwordStrength = calculatePasswordStrength(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const canSubmit = currentPassword && newPassword && passwordsMatch && passwordStrength.score >= 40;

  const handlePasswordChange = async () => {
    if (!canSubmit) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Note: In Replit Auth, password management is handled by Replit
      // This is a demonstration of what password management would look like
      setLastChanged(new Date());
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateStrongPassword = () => {
    const chars = {
      lower: 'abcdefghijklmnopqrstuvwxyz',
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };
    
    let password = '';
    const categories = Object.values(chars);
    
    // Ensure at least one character from each category
    for (const category of categories) {
      password += category[Math.floor(Math.random() * category.length)];
    }
    
    // Fill remaining length with random characters
    const allChars = Object.values(chars).join('');
    for (let i = password.length; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setNewPassword(password);
    setConfirmPassword(password);
  };

  const daysSinceChange = lastChanged ? Math.floor((Date.now() - lastChanged.getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Password Management
        </CardTitle>
        <CardDescription>
          Change your password and manage security settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Replit Auth Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Your account uses Replit authentication. Password management is handled by Replit's secure system. This interface demonstrates password security best practices.
          </AlertDescription>
        </Alert>

        {/* Password Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Password Status</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {lastChanged ? `Last changed ${daysSinceChange} days ago` : 'Never changed'}
              </p>
            </div>
            <Badge variant={daysSinceChange && daysSinceChange > 90 ? "destructive" : "default"}>
              {daysSinceChange && daysSinceChange > 90 ? "Update Recommended" : "Current"}
            </Badge>
          </div>

          {daysSinceChange && daysSinceChange > 90 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your password is over 90 days old. Consider updating it for better security.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Password Change Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="newPassword">New Password</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateStrongPassword}
                className="text-blue-600 hover:text-blue-700"
              >
                <Key className="h-4 w-4 mr-1" />
                Generate
              </Button>
            </div>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Password Strength:</span>
                  <span className={`text-sm font-medium ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <Progress value={passwordStrength.score} className="h-2" />
                {passwordStrength.suggestions.length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-medium">Suggestions:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {passwordStrength.suggestions.slice(0, 3).map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {confirmPassword && (
              <div className="flex items-center gap-2 text-sm">
                {passwordsMatch ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <span className={passwordsMatch ? "text-green-600" : "text-red-600"}>
                  {passwordsMatch ? "Passwords match" : "Passwords don't match"}
                </span>
              </div>
            )}
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={!canSubmit || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Lock className="h-4 w-4 mr-2" />
            )}
            Update Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}