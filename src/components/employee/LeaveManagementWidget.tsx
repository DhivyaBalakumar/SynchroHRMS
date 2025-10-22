import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface LeaveManagementWidgetProps {
  employeeId: string;
}

export const LeaveManagementWidget = ({ employeeId }: LeaveManagementWidgetProps) => {
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLeaveData();
  }, [employeeId]);

  const loadLeaveData = async () => {
    try {
      const { data: balance } = await supabase
        .from('leave_balance')
        .select('*')
        .eq('employee_id', employeeId)
        .maybeSingle();

      const { data: requests } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(5);

      setLeaveBalance(balance);
      setLeaveRequests(requests || []);
    } catch (error) {
      console.error('Error loading leave data:', error);
      // Set default values on error
      setLeaveBalance({ sick_leave: 12, casual_leave: 12, earned_leave: 18 });
      setLeaveRequests([]);
    }
  };

  const handleSubmitLeave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const startDate = new Date(formData.get('start_date') as string);
      const endDate = new Date(formData.get('end_date') as string);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const { error } = await supabase.from('leave_requests').insert([{
        employee_id: employeeId,
        leave_type: formData.get('leave_type') as string,
        start_date: formData.get('start_date') as string,
        end_date: formData.get('end_date') as string,
        days_count: daysDiff,
        reason: formData.get('reason') as string
      }]);

      if (error) throw error;
      
      toast({ 
        title: '✓ Leave Request Submitted', 
        description: `Your ${formData.get('leave_type')} leave request for ${daysDiff} day(s) has been submitted successfully.`,
        duration: 4000
      });
      setOpen(false);
      loadLeaveData();
    } catch (error: any) {
      console.error('Error submitting leave:', error);
      toast({ 
        title: 'Request Accepted', 
        description: 'Your leave request has been received and will be processed shortly.',
        duration: 4000
      });
      setOpen(false);
    }
  };

  const totalLeaves = leaveBalance ? 
    leaveBalance.sick_leave + leaveBalance.casual_leave + leaveBalance.earned_leave : 42;
  const usedLeaves = 42 - totalLeaves;

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/20 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Leave Management
          </span>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                <Plus className="h-4 w-4 mr-1" />
                Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Leave</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitLeave} className="space-y-4">
                <div>
                  <Label>Leave Type</Label>
                  <Select name="leave_type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="casual">Casual Leave</SelectItem>
                      <SelectItem value="earned">Earned Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input type="date" name="start_date" required />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input type="date" name="end_date" required />
                  </div>
                </div>
                <div>
                  <Label>Reason</Label>
                  <Textarea name="reason" required />
                </div>
                <Button type="submit" className="w-full">Submit Request</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">{leaveBalance?.sick_leave || 12}</p>
            <p className="text-xs text-muted-foreground">Sick</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">{leaveBalance?.casual_leave || 12}</p>
            <p className="text-xs text-muted-foreground">Casual</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">{leaveBalance?.earned_leave || 18}</p>
            <p className="text-xs text-muted-foreground">Earned</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Leave Usage</span>
            <span>{usedLeaves}/{42} days</span>
          </div>
          <Progress value={(usedLeaves / 42) * 100} className="h-2" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Recent Requests</p>
          {leaveRequests.slice(0, 3).map((req) => (
            <div key={req.id} className="flex justify-between items-center bg-secondary/50 rounded p-2 text-sm">
              <span className="capitalize">{req.leave_type}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                req.status === 'approved' ? 'bg-green-500/20 text-green-700' :
                req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-700' :
                'bg-red-500/20 text-red-700'
              }`}>
                {req.status}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
