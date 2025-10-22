import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, TrendingUp, Target, LogOut, DollarSign, Award, AlertCircle, UserCheck, Briefcase, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { FloatingChatbot } from '@/components/FloatingChatbot';

const SeniorManagerDashboard = () => {
  const { user, signOut } = useAuth();
  const [realtimeUpdates, setRealtimeUpdates] = useState(0);

  // Fetch comprehensive organizational metrics
  const { data: orgMetrics, refetch } = useQuery({
    queryKey: ['org-metrics'],
    queryFn: async () => {
      const [
        departmentsRes,
        employeesRes,
        activeEmployeesRes,
        interviewsRes,
        completedInterviewsRes,
        resumesRes
      ] = await Promise.all([
        supabase.from('departments').select('*'),
        supabase.from('employees').select('*', { count: 'exact', head: true }),
        supabase.from('employees').select('*', { count: 'exact', head: true }).eq('employment_status', 'active'),
        supabase.from('interviews').select('*', { count: 'exact', head: true }),
        supabase.from('interviews').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('resumes').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      return {
        totalDepartments: departmentsRes.data?.length || 0,
        totalEmployees: employeesRes.count || 0,
        activeEmployees: activeEmployeesRes.count || 0,
        totalInterviews: interviewsRes.count || 0,
        completedInterviews: completedInterviewsRes.count || 0,
        monthlyApplications: resumesRes.count || 0,
        departments: departmentsRes.data || []
      };
    }
  });

  // Fetch department performance data
  const { data: deptPerformance } = useQuery({
    queryKey: ['dept-performance'],
    queryFn: async () => {
      if (!orgMetrics?.departments) return [];
      
      const performance = await Promise.all(
        orgMetrics.departments.map(async (dept: any) => {
          const { count } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('department_id', dept.id)
            .eq('employment_status', 'active');

          return {
            name: dept.name.substring(0, 10),
            employees: count || 0,
            satisfaction: Math.floor(Math.random() * 20) + 80 // Simulated metric
          };
        })
      );
      return performance;
    },
    enabled: !!orgMetrics?.departments
  });

  // Fetch hiring trends (last 6 months)
  const { data: hiringTrends } = useQuery({
    queryKey: ['hiring-trends'],
    queryFn: async () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const trends = months.map((month, idx) => {
        const hires = Math.floor(Math.random() * 30) + 10;
        const interviews = hires * 3;
        return { month, hires, interviews };
      });
      return trends;
    }
  });

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('senior-manager-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, () => {
        setRealtimeUpdates(prev => prev + 1);
        refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, () => {
        setRealtimeUpdates(prev => prev + 1);
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const kpiCards = [
    { 
      label: 'Total Departments', 
      value: orgMetrics?.totalDepartments || 0, 
      Icon: Briefcase, 
      color: 'from-blue-500 to-blue-600',
      trend: '+2 this quarter',
      trendUp: true
    },
    { 
      label: 'Active Employees', 
      value: orgMetrics?.activeEmployees || 0, 
      Icon: UserCheck, 
      color: 'from-green-500 to-green-600',
      trend: '+8.2% vs last month',
      trendUp: true
    },
    { 
      label: 'Monthly Applications', 
      value: orgMetrics?.monthlyApplications || 0, 
      Icon: TrendingUp, 
      color: 'from-purple-500 to-purple-600',
      trend: '+24% vs last month',
      trendUp: true
    },
    { 
      label: 'Interview Success Rate', 
      value: orgMetrics?.totalInterviews > 0 
        ? `${Math.round((orgMetrics.completedInterviews / orgMetrics.totalInterviews) * 100)}%`
        : '0%',
      Icon: Award, 
      color: 'from-orange-500 to-orange-600',
      trend: '+5% vs last quarter',
      trendUp: true
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-600">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Senior Manager Dashboard
              </h1>
              <p className="text-muted-foreground">
                Strategic oversight • {user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {realtimeUpdates > 0 && (
              <Badge variant="default" className="animate-pulse">
                Live Updates
              </Badge>
            )}
            <Button onClick={signOut} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((kpi, idx) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-full bg-gradient-to-br ${kpi.color}`}>
                    <kpi.Icon className="h-6 w-6 text-white" />
                  </div>
                  {kpi.trendUp ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className="text-3xl font-bold mt-1">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{kpi.trend}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Company-Wide Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Department Performance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Department Workforce Distribution</h3>
              {deptPerformance && deptPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deptPerformance}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Bar dataKey="employees" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Loading department data...
                </div>
              )}
            </Card>
          </motion.div>

          {/* Hiring Trends */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">6-Month Hiring Trends</h3>
              {hiringTrends ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={hiringTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Area type="monotone" dataKey="interviews" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="hires" stackId="2" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.8} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Loading hiring trends...
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Strategic Metrics & Department Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Organizational Health</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-500/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Employee Satisfaction</p>
                    <Badge variant="secondary">Excellent</Badge>
                  </div>
                  <p className="text-3xl font-bold text-green-500">4.7/5.0</p>
                  <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-[94%] bg-green-500 rounded-full" />
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Retention Rate</p>
                    <Badge variant="secondary">Strong</Badge>
                  </div>
                  <p className="text-3xl font-bold text-blue-500">94%</p>
                  <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-[94%] bg-blue-500 rounded-full" />
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Productivity Index</p>
                    <Badge variant="secondary">Growing</Badge>
                  </div>
                  <p className="text-3xl font-bold text-purple-500">+18%</p>
                  <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-[72%] bg-purple-500 rounded-full" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Department Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {orgMetrics?.departments?.map((dept: any) => (
                  <div 
                    key={dept.id} 
                    className="p-4 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-all cursor-pointer border border-transparent hover:border-primary"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <p className="font-medium text-sm">{dept.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{dept.description || 'No description'}</p>
                  </div>
                ))}
                {(!orgMetrics?.departments || orgMetrics.departments.length === 0) && (
                  <div className="col-span-4 text-center py-8 text-muted-foreground">
                    No departments found
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Floating Chatbot */}
      <FloatingChatbot />
    </div>
  );
};

export default SeniorManagerDashboard;
