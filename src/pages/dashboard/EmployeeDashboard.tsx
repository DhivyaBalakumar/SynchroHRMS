import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { AttendanceWidget } from '@/components/employee/AttendanceWidget';
import { LeaveManagementWidget } from '@/components/employee/LeaveManagementWidget';
import { TeamOverviewWidget } from '@/components/employee/TeamOverviewWidget';
import { SalaryWidget } from '@/components/employee/SalaryWidget';
import { PerformanceWidget } from '@/components/employee/PerformanceWidget';
import { NotificationsWidget } from '@/components/employee/NotificationsWidget';
import { FloatingChatbot } from '@/components/FloatingChatbot';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const EmployeeDashboard = () => {
  const { user, signOut } = useAuth();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, position, department_id, email, departments(name)')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching employee:', error);
      } else if (data) {
        setEmployee({
          id: data.id,
          full_name: data.full_name,
          position: data.position,
          department: data.departments?.name || 'Engineering',
          email: data.email
        });
      }
      setLoading(false);
    };

    fetchEmployee();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <Skeleton className="h-20 w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use sample data if no employee record found
  const displayEmployee = employee || {
    id: user?.id || 'sample',
    full_name: user?.email?.split('@')[0] || 'Employee',
    position: 'Software Engineer',
    department: 'Engineering',
    email: user?.email || 'employee@synchrohr.com'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome back, {displayEmployee.full_name}!
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              {displayEmployee.position} • {displayEmployee.department}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-xs md:text-sm">
              <FileText className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Submit Feedback</span>
            </Button>
            <Button onClick={signOut} variant="outline" size="sm" className="text-xs md:text-sm">
              <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - 2 cols */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <AttendanceWidget employeeId={displayEmployee.id} />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <LeaveManagementWidget employeeId={displayEmployee.id} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <TeamOverviewWidget employeeId={displayEmployee.id} />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <SalaryWidget employeeId={displayEmployee.id} />
            </motion.div>
          </div>

          {/* Right Column - 1 col */}
          <div className="space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <NotificationsWidget employeeId={displayEmployee.id} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <PerformanceWidget employeeId={displayEmployee.id} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Chatbot */}
      <FloatingChatbot />
    </div>
  );
};

export default EmployeeDashboard;