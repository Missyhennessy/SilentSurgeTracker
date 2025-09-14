import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  User, 
  Bell, 
  Palette, 
  Database, 
  Shield,
  Download,
  RotateCcw,
  Save,
  HelpCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [settings, setSettings] = useState({
    // Profile Settings
    username: 'CryptoTrader',
    email: 'trader@example.com',
    timezone: 'UTC',
    
    // Notification Settings
    pushNotifications: true,
    emailAlerts: true,
    smsAlerts: false,
    soundEnabled: true,
    
    // Display Settings
    theme: 'dark',
    currency: 'USD',
    chartType: 'candlestick',
    refreshInterval: 30,
    
    // Risk Settings
    defaultStopLoss: 5,
    defaultTakeProfit: 15,
    maxPositionSize: 10,
    riskTolerance: 'medium',
    
    // Advanced Settings
    apiRateLimit: 60,
    dataRetention: 365,
    enableMLFeatures: true,
    debugMode: false
  });

  const { toast } = useToast();

  const handleSave = () => {
    localStorage.setItem('sst-settings', JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully",
    });
    onClose();
  };

  const handleReset = () => {
    localStorage.removeItem('sst-settings');
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults",
    });
  };

  const restartTour = () => {
    localStorage.removeItem('sst-tour-completed');
    toast({
      title: "Tour Reset",
      description: "The onboarding tour will show on next visit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[var(--dark-card)] border-[var(--dark-border)]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-[var(--primary-blue)]" />
              <CardTitle className="text-[var(--text-primary)]">Settings</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
          <CardDescription>
            Configure your Silent Surge Tracker preferences and settings
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="display">Display</TabsTrigger>
              <TabsTrigger value="risk">Risk</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Username</Label>
                    <Input
                      value={settings.username}
                      onChange={(e) => setSettings(prev => ({ ...prev, username: e.target.value }))}
                      className="bg-[var(--dark-input)]"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-[var(--dark-input)]"
                    />
                  </div>
                </div>

                <div>
                  <Label>Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger className="bg-[var(--dark-input)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                      <SelectItem value="JST">Japan Standard Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-6">
              <div className="space-y-4">
                {[
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive alerts in browser' },
                  { key: 'emailAlerts', label: 'Email Alerts', desc: 'Get notifications via email' },
                  { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive urgent alerts via SMS' },
                  { key: 'soundEnabled', label: 'Sound Alerts', desc: 'Play sound for notifications' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-[var(--dark-panel)] rounded-lg">
                    <div>
                      <p className="text-[var(--text-primary)] font-medium">{item.label}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                    </div>
                    <Switch
                      checked={settings[item.key as keyof typeof settings] as boolean}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, [item.key]: checked }))}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="display" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Theme</Label>
                    <Select value={settings.theme} onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}>
                      <SelectTrigger className="bg-[var(--dark-input)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark Theme</SelectItem>
                        <SelectItem value="light">Light Theme</SelectItem>
                        <SelectItem value="auto">Auto (System)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Currency</Label>
                    <Select value={settings.currency} onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger className="bg-[var(--dark-input)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="BTC">BTC (₿)</SelectItem>
                        <SelectItem value="ETH">ETH (Ξ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Chart Type</Label>
                    <Select value={settings.chartType} onValueChange={(value) => setSettings(prev => ({ ...prev, chartType: value }))}>
                      <SelectTrigger className="bg-[var(--dark-input)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="candlestick">Candlestick</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Refresh Interval (seconds)</Label>
                    <Input
                      type="number"
                      value={settings.refreshInterval}
                      onChange={(e) => setSettings(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
                      className="bg-[var(--dark-input)]"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="risk" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Default Stop Loss (%)</Label>
                    <Input
                      type="number"
                      value={settings.defaultStopLoss}
                      onChange={(e) => setSettings(prev => ({ ...prev, defaultStopLoss: parseFloat(e.target.value) }))}
                      className="bg-[var(--dark-input)]"
                    />
                  </div>

                  <div>
                    <Label>Default Take Profit (%)</Label>
                    <Input
                      type="number"
                      value={settings.defaultTakeProfit}
                      onChange={(e) => setSettings(prev => ({ ...prev, defaultTakeProfit: parseFloat(e.target.value) }))}
                      className="bg-[var(--dark-input)]"
                    />
                  </div>

                  <div>
                    <Label>Max Position Size (%)</Label>
                    <Input
                      type="number"
                      value={settings.maxPositionSize}
                      onChange={(e) => setSettings(prev => ({ ...prev, maxPositionSize: parseFloat(e.target.value) }))}
                      className="bg-[var(--dark-input)]"
                    />
                  </div>
                </div>

                <div>
                  <Label>Risk Tolerance</Label>
                  <Select value={settings.riskTolerance} onValueChange={(value) => setSettings(prev => ({ ...prev, riskTolerance: value }))}>
                    <SelectTrigger className="bg-[var(--dark-input)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>API Rate Limit (req/min)</Label>
                    <Input
                      type="number"
                      value={settings.apiRateLimit}
                      onChange={(e) => setSettings(prev => ({ ...prev, apiRateLimit: parseInt(e.target.value) }))}
                      className="bg-[var(--dark-input)]"
                    />
                  </div>

                  <div>
                    <Label>Data Retention (days)</Label>
                    <Input
                      type="number"
                      value={settings.dataRetention}
                      onChange={(e) => setSettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) }))}
                      className="bg-[var(--dark-input)]"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[var(--dark-panel)] rounded-lg">
                    <div>
                      <p className="text-[var(--text-primary)] font-medium">Enable ML Features</p>
                      <p className="text-sm text-[var(--text-secondary)]">Use machine learning optimization</p>
                    </div>
                    <Switch
                      checked={settings.enableMLFeatures}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableMLFeatures: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[var(--dark-panel)] rounded-lg">
                    <div>
                      <p className="text-[var(--text-primary)] font-medium">Debug Mode</p>
                      <p className="text-sm text-[var(--text-secondary)]">Show additional debugging information</p>
                    </div>
                    <Switch
                      checked={settings.debugMode}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, debugMode: checked }))}
                    />
                  </div>
                </div>

                <div className="border-t border-[var(--dark-border)] pt-4">
                  <Button onClick={restartTour} variant="outline" className="w-full">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Restart Onboarding Tour
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between pt-6 border-t border-[var(--dark-border)]">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-[var(--primary-blue)]">
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}