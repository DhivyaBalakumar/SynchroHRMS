import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { AlertCircle, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const DemoModeToggle = () => {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-primary" />
          <div>
            <Label htmlFor="demo-mode" className="text-base font-semibold cursor-pointer">
              Demo Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              {isDemoMode ? 'Using sample data for demonstration' : 'Using real production data only'}
            </p>
          </div>
        </div>
        <Switch
          id="demo-mode"
          checked={isDemoMode}
          onCheckedChange={toggleDemoMode}
        />
      </div>
      
      {!isDemoMode && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Production mode is active.</strong> Only real data from your database will be displayed. 
            All demo/sample data is hidden. To add real data, use the application features to create 
            employees, job roles, resumes, etc.
          </AlertDescription>
        </Alert>
      )}
      
      {isDemoMode && (
        <Alert className="bg-accent/10 border-accent">
          <AlertCircle className="h-4 w-4 text-accent-foreground" />
          <AlertDescription>
            <strong>Demo mode is active.</strong> Showing both sample data and real data for demonstration 
            and testing purposes. Switch to Production Mode to hide sample data.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
