import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Bell, Calendar, Users, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MonitorSettings {
  zapierWebhook: string;
  emailNotifications: boolean;
  checkInterval: number;
  isActive: boolean;
}

interface RoundData {
  date: string;
  type: string;
  invitations: number;
  streams: string[];
  minScore?: number;
}

export const OINPMonitor = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<MonitorSettings>({
    zapierWebhook: '',
    emailNotifications: false,
    checkInterval: 30,
    isActive: false,
  });
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [recentRounds, setRecentRounds] = useState<RoundData[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const handleSettingsChange = (key: keyof MonitorSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('oinp-monitor-settings', JSON.stringify(newSettings));
  };

  const checkForNewRounds = async () => {
    setIsChecking(true);
    try {
      // Fetch latest OINP updates
      const response = await fetch('/api/check-oinp-updates');
      if (response.ok) {
        const data = await response.json();
        if (data.newRounds?.length > 0) {
          await sendNotification(data.newRounds);
          setRecentRounds(prev => [...data.newRounds, ...prev].slice(0, 10));
        }
      }
      setLastCheck(new Date());
    } catch (error) {
      console.error('Error checking for updates:', error);
      toast({
        title: "Error",
        description: "Failed to check for OINP updates",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const sendNotification = async (rounds: RoundData[]) => {
    try {
      // Send Zapier webhook notification
      if (settings.zapierWebhook) {
        await fetch(settings.zapierWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'no-cors',
          body: JSON.stringify({
            type: 'oinp_round_open',
            timestamp: new Date().toISOString(),
            rounds: rounds,
            message: `🚨 New OINP Round${rounds.length > 1 ? 's' : ''} Open! ${rounds.length} invitation round${rounds.length > 1 ? 's' : ''} detected.`
          }),
        });
      }

      toast({
        title: "🎉 New OINP Round Detected!",
        description: `${rounds.length} new invitation round${rounds.length > 1 ? 's' : ''} found`,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const testNotification = async () => {
    if (!settings.zapierWebhook) {
      toast({
        title: "Error",
        description: "Please enter your Zapier webhook URL first",
        variant: "destructive",
      });
      return;
    }

    try {
      await fetch(settings.zapierWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          type: 'test_notification',
          timestamp: new Date().toISOString(),
          message: '🧪 Test notification from OINP Monitor'
        }),
      });

      toast({
        title: "Test Sent",
        description: "Test notification sent to your Zapier webhook",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive",
      });
    }
  };

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('oinp-monitor-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // Set up monitoring interval
  useEffect(() => {
    if (!settings.isActive) return;

    const interval = setInterval(checkForNewRounds, settings.checkInterval * 60 * 1000);
    return () => clearInterval(interval);
  }, [settings.isActive, settings.checkInterval]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            OINP Round Monitor
          </CardTitle>
          <CardDescription>
            Get notified instantly when new Ontario Immigrant Nominee Program rounds open
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="monitor" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="monitoring">Monitoring Active</Label>
                  <Switch
                    id="monitoring"
                    checked={settings.isActive}
                    onCheckedChange={(checked) => handleSettingsChange('isActive', checked)}
                  />
                </div>
                <Badge variant={settings.isActive ? "default" : "secondary"}>
                  {settings.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Last Check</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lastCheck ? lastCheck.toLocaleString() : 'Never'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Check Interval</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Every {settings.checkInterval} minutes
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Rounds Found</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {recentRounds.length} this session
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button onClick={checkForNewRounds} disabled={isChecking}>
                  {isChecking ? 'Checking...' : 'Check Now'}
                </Button>
                <Button variant="outline" onClick={testNotification}>
                  Test Notification
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook">Zapier Webhook URL</Label>
                <Input
                  id="webhook"
                  type="url"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={settings.zapierWebhook}
                  onChange={(e) => handleSettingsChange('zapierWebhook', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Create a Zapier webhook trigger and paste the URL here to receive notifications
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="interval">Check Interval (minutes)</Label>
                <Input
                  id="interval"
                  type="number"
                  min="5"
                  max="1440"
                  value={settings.checkInterval}
                  onChange={(e) => handleSettingsChange('checkInterval', parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  How often to check for new rounds (5-1440 minutes)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="email"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingsChange('emailNotifications', checked)}
                />
                <Label htmlFor="email">Enable email notifications</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Rounds</CardTitle>
              <CardDescription>Latest OINP invitation rounds detected</CardDescription>
            </CardHeader>
            <CardContent>
              {recentRounds.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No rounds detected yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start monitoring to see new invitation rounds
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRounds.map((round, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{round.type}</h4>
                          <Badge variant="outline">{round.date}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Invitations: {round.invitations}</p>
                          {round.minScore && <p>Min Score: {round.minScore}</p>}
                          {round.streams.length > 0 && (
                            <p>Streams: {round.streams.join(', ')}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};