import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Bot, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const TelegramSetupGuide = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Telegram Setup Guide
        </CardTitle>
        <CardDescription>
          Follow these steps to set up Telegram notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
              1
            </div>
            <div>
              <h4 className="font-medium">Create a Telegram Bot</h4>
              <p className="text-sm text-muted-foreground">
                Message @BotFather on Telegram and use /newbot command to create your bot
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => window.open('https://t.me/botfather', '_blank')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Open @BotFather
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
              2
            </div>
            <div>
              <h4 className="font-medium">Get Your Bot Token</h4>
              <p className="text-sm text-muted-foreground">
                @BotFather will give you a token like: 1234567890:ABCdefGhIJKlmNoPQRstUVwxyZ
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
              3
            </div>
            <div>
              <h4 className="font-medium">Get Your Chat ID</h4>
              <p className="text-sm text-muted-foreground">
                Send /start to your bot, then message @userinfobot to get your chat ID
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => window.open('https://t.me/userinfobot', '_blank')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Open @userinfobot
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
              4
            </div>
            <div>
              <h4 className="font-medium">Test Your Setup</h4>
              <p className="text-sm text-muted-foreground">
                Enter your bot token and chat ID above, then use the test button
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Important Security Note:</p>
              <p>Your bot token is stored locally in your browser. For production use, consider using a backend service to store credentials securely.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};