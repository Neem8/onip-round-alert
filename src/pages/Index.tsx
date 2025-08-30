import { OINPMonitor } from '@/components/OINPMonitor';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">OINP Round Monitor</h1>
          <p className="text-xl text-muted-foreground">Get notified when Ontario Immigrant Nominee Program rounds open</p>
        </div>
        <OINPMonitor />
      </div>
    </div>
  );
};

export default Index;
