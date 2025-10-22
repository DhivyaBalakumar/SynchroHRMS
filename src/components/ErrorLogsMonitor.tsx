import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ErrorLogsMonitor = () => {
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved'>('unresolved');
  const { toast } = useToast();

  useEffect(() => {
    loadErrors();

    // Refresh every 30 seconds
    const interval = setInterval(loadErrors, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadErrors = async () => {
    try {
      let query = supabase
        .from('automation_error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter === 'unresolved') {
        query = query.eq('resolved', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setErrors(data || []);
    } catch (error: any) {
      console.error('Error loading error logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load error logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markResolved = async (errorId: string) => {
    try {
      const { error } = await supabase
        .from('automation_error_logs')
        .update({ resolved: true })
        .eq('id', errorId);

      if (error) throw error;

      toast({
        title: 'Marked as Resolved',
        description: 'Error has been marked as resolved',
      });

      loadErrors();
    } catch (error: any) {
      console.error('Error marking as resolved:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark as resolved',
        variant: 'destructive',
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-gray-500',
    };
    return colors[severity] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Automation Error Logs</h3>
          <p className="text-sm text-muted-foreground">
            Monitor and resolve automation failures
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'unresolved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unresolved')}
          >
            Unresolved
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
        </div>
      </div>

      {errors.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
          <p>No {filter === 'unresolved' ? 'unresolved ' : ''}errors found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {errors.map((error) => (
            <div
              key={error.id}
              className={`p-4 rounded-lg border ${
                error.resolved ? 'bg-secondary/20' : 'bg-background'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  {getSeverityIcon(error.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getSeverityColor(error.severity)}>
                        {error.severity}
                      </Badge>
                      <Badge variant="outline">{error.error_type}</Badge>
                      {error.resolved && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolved
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-sm mb-1">{error.error_message}</p>
                    {error.context && (
                      <div className="text-xs text-muted-foreground mb-2">
                        Context: {JSON.stringify(error.context)}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(error.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {!error.resolved && (
                  <Button
                    onClick={() => markResolved(error.id)}
                    size="sm"
                    variant="outline"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Resolve
                  </Button>
                )}
              </div>

              {error.error_stack && (
                <details className="mt-3">
                  <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                    View Stack Trace
                  </summary>
                  <pre className="text-xs bg-secondary/20 p-2 rounded mt-2 overflow-x-auto">
                    {error.error_stack}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
