import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Key, Smartphone, QrCode, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorAuthProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function TwoFactorAuth({ isEnabled, onToggle }: TwoFactorAuthProps) {
  const { toast } = useToast();
  const [setupStep, setSetupStep] = useState<'initial' | 'qr' | 'verify' | 'complete'>('initial');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  };

  const handleEnable2FA = async () => {
    setIsLoading(true);
    try {
      // Call server to generate unique 2FA secret for this user
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to setup 2FA');
      }
      
      const { qrCodeUrl } = await response.json();
      setQrCode(qrCodeUrl);
      setSetupStep('qr');
      
      toast({
        title: "2FA Setup Started",
        description: "Scan the QR code with your authenticator app.",
      });
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Failed to generate 2FA setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call to verify code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate backup codes
      const codes = generateBackupCodes();
      setBackupCodes(codes);
      setSetupStep('complete');
      
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled.",
      });
      
      onToggle(true);
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to disable 2FA
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onToggle(false);
      setSetupStep('initial');
      setVerificationCode('');
      setBackupCodes([]);
      
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
    } catch (error) {
      toast({
        title: "Failed to Disable",
        description: "Could not disable 2FA. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
          {isEnabled && <Badge variant="default" className="ml-2">Enabled</Badge>}
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account with 2FA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isEnabled ? (
          <>
            {setupStep === 'initial' && (
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Two-factor authentication adds an extra layer of security by requiring a code from your phone in addition to your password.
                  </AlertDescription>
                </Alert>
                
                <div className="flex items-center gap-4">
                  <Smartphone className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Authenticator App Required</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Install Google Authenticator, Authy, or similar app on your phone
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleEnable2FA} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
                  Enable 2FA
                </Button>
              </div>
            )}

            {setupStep === 'qr' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg inline-block border">
                    <QrCode className="h-32 w-32 mx-auto text-gray-400" />
                    <p className="text-xs text-gray-500 mt-2">QR Code Placeholder</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                    Scan this QR code with your authenticator app
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="verification">Enter 6-digit code from your app</Label>
                  <Input
                    id="verification"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-xl tracking-widest"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleVerifyCode} 
                    disabled={isLoading || verificationCode.length !== 6}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Verify & Enable
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSetupStep('initial')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {setupStep === 'complete' && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    2FA has been successfully enabled! Save your backup codes in a secure location.
                  </AlertDescription>
                </Alert>
                
                <div>
                  <h4 className="font-medium mb-2">Backup Codes</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Use these codes if you lose access to your authenticator app. Each code can only be used once.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="p-2 bg-white dark:bg-gray-700 rounded border">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setSetupStep('initial')}
                  className="w-full"
                >
                  Complete Setup
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication is active and protecting your account.
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium">2FA Active</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your account is protected with two-factor authentication
                  </p>
                </div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            
            <Button 
              variant="destructive" 
              onClick={handleDisable2FA}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Disable 2FA
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}