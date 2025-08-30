import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Bell, Calendar, Users, AlertCircle, CheckCircle, Settings, MessageCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TelegramSetupGuide } from './TelegramSetupGuide';

interface MonitorSettings {
  telegramBotToken: string;
  telegramChatId: string;
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
    telegramBotToken: '',
    telegramChatId: '',
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
      // Send Telegram notification
      if (settings.telegramBotToken && settings.telegramChatId) {
        const message = `🚨 *New OINP Round${rounds.length > 1 ? 's' : ''} Open!*\n\n${rounds.map(round => 
          `📅 *${round.type}*\n` +
          `👥 Invitations: ${round.invitations}\n` +
          `📊 Min Score: ${round.minScore || 'N/A'}\n` +
          `🎯 Streams: ${round.streams.join(', ')}\n`
        ).join('\n')}\n⏰ Detected: ${new Date().toLocaleString()}`;

        const response = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: settings.telegramChatId,
            text: message,
            parse_mode: 'Markdown'
          }),
        });

        if (response.ok) {
          toast({
            title: "✅ Telegram Notification Sent!",
            description: `Notified about ${rounds.length} new round${rounds.length > 1 ? 's' : ''}`,
          });
        } else {
          throw new Error('Failed to send Telegram message');
        }
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send Telegram notification",
        variant: "destructive",
      });
    }
  };

  const testNotification = async () => {
    if (!settings.telegramBotToken || !settings.telegramChatId) {
      toast({
        title: "Error",
        description: "Please enter your Telegram bot token and chat ID first",
        variant: "destructive",
      });
      return;
    }

    try {
      const testMessage = `🧪 *Test Notification*\n\nYour OINP monitor is working correctly!\n\n⏰ ${new Date().toLocaleString()}`;
      
      const response = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: settings.telegramChatId,
          text: testMessage,
          parse_mode: 'Markdown'
        }),
      });

      if (response.ok) {
        toast({
          title: "✅ Test Sent Successfully",
          description: "Check your Telegram for the test message",
        });
      } else {
        throw new Error('Failed to send test message');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test notification. Check your bot token and chat ID.",
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
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
                <MessageCircle className="h-4 w-4" />
                Telegram Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="botToken">Telegram Bot Token</Label>
                <Input
                  id="botToken"
                  type="password"
                  placeholder="1234567890:ABCdefGhIJKlmNoPQRstUVwxyZ..."
                  value={settings.telegramBotToken}
                  onChange={(e) => handleSettingsChange('telegramBotToken', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Create a bot with @BotFather on Telegram and paste the token here
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chatId">Your Telegram Chat ID</Label>
                <Input
                  id="chatId"
                  type="text"
                  placeholder="123456789 or -123456789"
                  value={settings.telegramChatId}
                  onChange={(e) => handleSettingsChange('telegramChatId', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Send /start to your bot, then get your chat ID from @userinfobot
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
        
        <TabsContent value="setup" className="space-y-4">
          <TelegramSetupGuide />
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