import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Database, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const SeedData = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [count, setCount] = useState(50000);
  const { toast } = useToast();
  const { isDemoMode } = useDemoMode();

  const handleSeed = async () => {
    if (count < 1 || count > 100000) {
      toast({
        title: 'Invalid Count',
        description: 'Please enter a number between 1 and 100,000',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      toast({
        title: 'Starting Data Generation',
        description: `Generating ${count.toLocaleString()} test applicants... This may take a few minutes.`,
      });

      const { data, error } = await supabase.functions.invoke('seed-data', {
        body: { count }
      });

      if (error) throw error;

      setResult(data);
      
      toast({
        title: 'Success!',
        description: `Generated ${data.resumes} resumes across ${data.jobRoles} job roles`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {!isDemoMode && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Production mode is active. Test data generation is only available in Demo Mode. 
              Please enable Demo Mode from the Settings tab in the HR Dashboard to generate test data.
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="p-8 text-center">
          <Database className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-4">Generate Test Data</h1>
          <p className="text-muted-foreground mb-6">
            Generate dummy applicants with resumes for testing the AI screening system (Demo Mode Only)
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Number of Applicants (1 - 100,000)
            </label>
            <Input
              type="number"
              min="1"
              max="100000"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="text-center text-lg"
              disabled={loading || !!result}
            />
          </div>

          {!result && !loading && (
            <Button
              onClick={handleSeed}
              size="lg"
              className="w-full"
              disabled={loading || !isDemoMode}
            >
              <Database className="h-5 w-5 mr-2" />
              Generate {count.toLocaleString()} Applicants
            </Button>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Generating data... This may take 2-3 minutes
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle2 className="h-8 w-8" />
                <span className="text-xl font-bold">Data Generated!</span>
              </div>
              <div className="bg-secondary/20 p-4 rounded-lg">
                <p className="text-lg">
                  <strong>{result.jobRoles}</strong> Job Roles
                </p>
                <p className="text-lg">
                  <strong>{result.resumes}</strong> Resumes
                </p>
              </div>
              <Button
                onClick={() => navigate('/recruitment/screening')}
                size="lg"
                className="w-full"
              >
                Go to Resume Screening
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SeedData;
