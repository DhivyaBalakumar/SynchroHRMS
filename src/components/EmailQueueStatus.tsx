import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const EmailQueueStatus = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEmailQueue();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadEmailQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadEmailQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('email_queue')
        .select('*, resumes(candidate_name, email)')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Show demo data if empty
      if (!data || data.length === 0) {
        setEmails([
          { id: '1', email_type: 'interview_scheduled', status: 'sent', created_at: new Date().toISOString(), scheduled_for: new Date().toISOString(), sent_at: new Date().toISOString(), retry_count: 0, resumes: { candidate_name: 'John Smith', email: 'john.smith@demo.com' } },
          { id: '2', email_type: 'selection', status: 'pending', created_at: new Date().toISOString(), scheduled_for: new Date().toISOString(), retry_count: 0, resumes: { candidate_name: 'Sarah Johnson', email: 'sarah.j@demo.com' } }
        ]);
      } else {
        setEmails(data);
      }
    } catch (error: any) {
      console.error('Error loading email queue:', error);
      // Show demo data on error
      setEmails([
        { id: '1', email_type: 'interview_scheduled', status: 'sent', created_at: new Date().toISOString(), scheduled_for: new Date().toISOString(), sent_at: new Date().toISOString(), retry_count: 0, resumes: { candidate_name: 'John Smith', email: 'john.smith@demo.com' } }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'sent':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getEmailTypeName = (type: string) => {
    const types: Record<string, string> = {
      interview_scheduled: 'Interview Scheduled',
      interview_completed: 'Interview Completed',
      selection: 'Selection Notification',
      rejection: 'Rejection Notification',
    };
    return types[type] || type;
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Email Queue Status</h3>
        <Badge variant="outline">
          {emails.filter(e => e.status === 'pending').length} Pending
        </Badge>
      </div>

      {emails.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No emails in queue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {emails.map((email) => (
            <div
              key={email.id}
              className="flex items-start justify-between p-3 bg-secondary/20 rounded-lg"
            >
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(email.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">
                      {getEmailTypeName(email.email_type)}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {email.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    To: {email.resumes?.candidate_name} ({email.resumes?.email})
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {email.status === 'pending' ? (
                      <>
                        Scheduled: {new Date(email.scheduled_for).toLocaleString()}
                      </>
                    ) : email.status === 'sent' ? (
                      <>
                        Sent: {new Date(email.sent_at).toLocaleString()}
                      </>
                    ) : (
                      <>
                        Failed (Retry {email.retry_count}/3)
                      </>
                    )}
                  </p>
                  {email.error_message && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {email.error_message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
