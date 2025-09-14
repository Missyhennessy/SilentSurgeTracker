'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Mail,
  MessageSquare,
  Smartphone,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  name: string;
  asset: string;
  condition: 'above' | 'below' | 'change';
  threshold: number;
  isActive: boolean;
  notifications: string[];
  lastTriggered?: string;
  triggerCount: number;
}

export default function AlertsManagement() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      name: 'BTC High SSS Alert',
      asset: 'BTC',
      condition: 'above',
      threshold: 80,
      isActive: true,
      notifications: ['push', 'email'],
      lastTriggered: '2 hours ago',
      triggerCount: 3
    },
    {
      id: '2',
      name: 'ETH Price Drop',
      asset: 'ETH',
      condition: 'below',
      threshold: 3500,
      isActive: true,
      notifications: ['push'],
      triggerCount: 0
    },
    {
      id: '3',
      name: 'SOL Surge Watch',
      asset: 'SOL',
      condition: 'change',
      threshold: 15,
      isActive: false,
      notifications: ['email', 'sms'],
      triggerCount: 1
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    asset: 'BTC',
    condition: 'above' as const,
    threshold: 70,
    notifications: ['push']
  });

  const { toast } = useToast();

  const createAlert = () => {
    const alert: Alert = {
      id: Date.now().toString(),
      ...newAlert,
      isActive: true,
      triggerCount: 0
    };
    
    setAlerts(prev => [...prev, alert]);
    setIsCreating(false);
    setNewAlert({
      name: '',
      asset: 'BTC',
      condition: 'above',
      threshold: 70,
      notifications: ['push']
    });
    
    toast({
      title: "Alert Created",
      description: `Successfully created alert: ${alert.name}`,
    });
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    toast({
      title: "Alert Deleted",
      description: "Alert has been permanently removed",
    });
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'above': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'below': return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'change': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'push': return <Bell className="w-3 h-3" />;
      case 'email': return <Mail className="w-3 h-3" />;
      case 'sms': return <Smartphone className="w-3 h-3" />;
      case 'discord': return <MessageSquare className="w-3 h-3" />;
      default: return <Bell className="w-3 h-3" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Alerts Management</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Configure and manage your trading alerts and notifications
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-[var(--primary-blue)]">
          <Plus className="w-4 h-4 mr-2" />
          Create Alert
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="space-y-4">
            {/* Active Alerts List */}
            {alerts.map((alert) => (
              <Card key={alert.id} className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getConditionIcon(alert.condition)}
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                          {alert.name}
                        </h3>
                        <Badge variant={alert.isActive ? "default" : "secondary"}>
                          {alert.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                        <span>{alert.asset}</span>
                        <span>•</span>
                        <span>
                          {alert.condition === 'above' && `SSS above ${alert.threshold}`}
                          {alert.condition === 'below' && `Price below $${alert.threshold}`}
                          {alert.condition === 'change' && `Change > ${alert.threshold}%`}
                        </span>
                        <span>•</span>
                        <span>Triggered {alert.triggerCount} times</span>
                        {alert.lastTriggered && (
                          <>
                            <span>•</span>
                            <span>Last: {alert.lastTriggered}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        {alert.notifications.map((type) => (
                          <div key={type} className="flex items-center gap-1 px-2 py-1 bg-[var(--dark-panel)] rounded-md">
                            {getNotificationIcon(type)}
                            <span className="text-xs text-[var(--text-secondary)] capitalize">{type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alert.isActive}
                        onCheckedChange={() => toggleAlert(alert.id)}
                      />
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteAlert(alert.id)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Create New Alert Form */}
            {isCreating && (
              <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
                <CardHeader>
                  <CardTitle className="text-[var(--text-primary)]">Create New Alert</CardTitle>
                  <CardDescription>Configure your custom alert conditions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Alert Name</Label>
                      <Input
                        value={newAlert.name}
                        onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="My Custom Alert"
                        className="bg-[var(--dark-input)]"
                      />
                    </div>
                    <div>
                      <Label>Asset</Label>
                      <Select value={newAlert.asset} onValueChange={(value) => setNewAlert(prev => ({ ...prev, asset: value }))}>
                        <SelectTrigger className="bg-[var(--dark-input)]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                          <SelectItem value="SOL">Solana (SOL)</SelectItem>
                          <SelectItem value="ADA">Cardano (ADA)</SelectItem>
                          <SelectItem value="LINK">Chainlink (LINK)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Condition</Label>
                      <Select value={newAlert.condition} onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, condition: value }))}>
                        <SelectTrigger className="bg-[var(--dark-input)]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="above">SSS Above</SelectItem>
                          <SelectItem value="below">Price Below</SelectItem>
                          <SelectItem value="change">Price Change %</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Threshold</Label>
                      <Input
                        type="number"
                        value={newAlert.threshold}
                        onChange={(e) => setNewAlert(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
                        className="bg-[var(--dark-input)]"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button onClick={createAlert} className="bg-[var(--primary-blue)]">
                      Create Alert
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreating(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Alert History</CardTitle>
              <CardDescription>Recent alert activations and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: '2 hours ago', alert: 'BTC High SSS Alert', message: 'BTC SSS reached 82.1', type: 'success' },
                  { time: '6 hours ago', alert: 'ETH Price Drop', message: 'ETH dropped to $3,650', type: 'warning' },
                  { time: '1 day ago', alert: 'SOL Surge Watch', message: 'SOL increased 18.2%', type: 'info' },
                  { time: '2 days ago', alert: 'BTC High SSS Alert', message: 'BTC SSS reached 81.5', type: 'success' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center p-3 bg-[var(--dark-panel)] rounded-lg">
                    <div className={`h-2 w-2 rounded-full mr-3 ${
                      item.type === 'success' ? 'bg-green-400' :
                      item.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-[var(--text-primary)] text-sm font-medium">{item.message}</p>
                      <p className="text-[var(--text-secondary)] text-xs">{item.alert} • {item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-[var(--dark-card)] border-[var(--dark-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Notification Settings</CardTitle>
              <CardDescription>Configure how you receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Push Notifications</p>
                    <p className="text-sm text-[var(--text-secondary)]">Receive alerts directly in your browser</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Email Notifications</p>
                    <p className="text-sm text-[var(--text-secondary)]">Get alerts sent to your email address</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">SMS Alerts</p>
                    <p className="text-sm text-[var(--text-secondary)]">Receive urgent alerts via text message</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Discord Webhooks</p>
                    <p className="text-sm text-[var(--text-secondary)]">Send alerts to your Discord server</p>
                  </div>
                  <Switch />
                </div>
              </div>
              
              <div className="pt-4 border-t border-[var(--dark-border)]">
                <div className="space-y-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input 
                      type="email" 
                      placeholder="your@email.com"
                      className="bg-[var(--dark-input)]"
                    />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input 
                      type="tel" 
                      placeholder="+1 (555) 123-4567"
                      className="bg-[var(--dark-input)]"
                    />
                  </div>
                  <div>
                    <Label>Discord Webhook URL</Label>
                    <Input 
                      type="url" 
                      placeholder="https://discord.com/api/webhooks/..."
                      className="bg-[var(--dark-input)]"
                    />
                  </div>
                </div>
                
                <Button className="w-full mt-6">
                  <Settings className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}