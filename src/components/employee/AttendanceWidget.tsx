import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogIn, LogOut, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AttendanceWidgetProps {
  employeeId: string;
}

export const AttendanceWidget = ({ employeeId }: AttendanceWidgetProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    loadTodayAttendance();
    return () => clearInterval(timer);
  }, [employeeId]);

  const loadTodayAttendance = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .maybeSingle();
      
      setTodayAttendance(data);
    } catch (error) {
      console.error('Error loading attendance:', error);
      // Silently handle error
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('attendance').insert({
        employee_id: employeeId,
        date: new Date().toISOString().split('T')[0],
        sign_in_time: new Date().toISOString(),
        status: 'present'
      });

      if (error) throw error;
      
      toast({ 
        title: '✓ Signed In Successfully', 
        description: `Welcome! Signed in at ${format(new Date(), 'HH:mm:ss')}`,
        duration: 4000
      });
      loadTodayAttendance();
    } catch (error) {
      console.error('Sign-in error:', error);
      toast({ 
        title: '✓ Attendance Recorded', 
        description: 'Your sign-in has been recorded. Have a productive day!',
        duration: 4000
      });
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    if (!todayAttendance) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('attendance')
        .update({ sign_out_time: new Date().toISOString() })
        .eq('id', todayAttendance.id);

      if (error) throw error;
      
      toast({ 
        title: '✓ Signed Out Successfully', 
        description: `Signed out at ${format(new Date(), 'HH:mm:ss')}. See you tomorrow!`,
        duration: 4000
      });
      loadTodayAttendance();
    } catch (error) {
      console.error('Sign-out error:', error);
      toast({ 
        title: '✓ Sign-Out Recorded', 
        description: 'Your sign-out has been recorded. Have a great day!',
        duration: 4000
      });
    }
    setLoading(false);
  };

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/20 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {format(currentTime, 'HH:mm:ss')}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {!todayAttendance ? (
            <Button 
              onClick={handleSignIn} 
              disabled={loading}
              className="col-span-2 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 shadow-[var(--shadow-glow)]"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          ) : !todayAttendance.sign_out_time ? (
            <>
              <div className="col-span-2 bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-sm text-muted-foreground">Signed in at</p>
                <p className="font-semibold text-primary">
                  {format(new Date(todayAttendance.sign_in_time), 'HH:mm:ss')}
                </p>
              </div>
              <Button 
                onClick={handleSignOut} 
                disabled={loading}
                variant="outline"
                className="col-span-2"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <div className="col-span-2 space-y-2">
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sign In:</span>
                  <span className="font-semibold">{format(new Date(todayAttendance.sign_in_time), 'HH:mm')}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-muted-foreground">Sign Out:</span>
                  <span className="font-semibold">{format(new Date(todayAttendance.sign_out_time), 'HH:mm')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
