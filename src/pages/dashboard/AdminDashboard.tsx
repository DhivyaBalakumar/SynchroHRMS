import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Shield, Users, Database, Settings, Activity, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Fetch system stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersRes, employeesRes, resumesRes, interviewsRes] = await Promise.all([
        supabase.from('user_roles').select('*', { count: 'exact', head: true }),
        supabase.from('employees').select('*', { count: 'exact', head: true }),
        supabase.from('resumes').select('*', { count: 'exact', head: true }),
        supabase.from('interviews').select('*', { count: 'exact', head: true }),
      ]);
      return {
        totalUsers: usersRes.count || 0,
        totalEmployees: employeesRes.count || 0,
        totalApplications: resumesRes.count || 0,
        totalInterviews: interviewsRes.count || 0,
      };
    },
  });

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats?.totalUsers || 0, color: 'from-blue-500 to-blue-600' },
    { icon: Users, label: 'Employees', value: stats?.totalEmployees || 0, color: 'from-green-500 to-green-600' },
    { icon: Database, label: 'Applications', value: stats?.totalApplications || 0, color: 'from-purple-500 to-purple-600' },
    { icon: Activity, label: 'Interviews', value: stats?.totalInterviews || 0, color: 'from-orange-500 to-orange-600' },
  ];

  const adminActions = [
    { 
      icon: Users, 
      label: 'User Management', 
      description: 'Manage system users and roles',
      action: () => navigate('/employees'),
      color: 'from-blue-500 to-blue-600'
    },
    { 
      icon: Database, 
      label: 'Data Management', 
      description: 'View and manage all data',
      action: () => navigate('/recruitment/screening'),
      color: 'from-green-500 to-green-600'
    },
    { 
      icon: Activity, 
      label: 'System Analytics', 
      description: 'View system performance',
      action: () => navigate('/analytics/advanced'),
      color: 'from-purple-500 to-purple-600'
    },
    { 
      icon: Settings, 
      label: 'System Settings', 
      description: 'Configure system parameters',
      action: () => {},
      color: 'from-orange-500 to-orange-600'
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
            <div className="p-3 rounded-full bg-gradient-to-br from-red-500 to-red-600">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Management Admin
              </h1>
              <p className="text-muted-foreground">
                {user?.email} • System Administrator
              </p>
            </div>
          </div>
          <Button onClick={signOut} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Admin Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Admin Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card 
                  className="p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={action.action}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-lg bg-gradient-to-br ${action.color}`}>
                      <action.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">{action.label}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">System Health</h3>
              <Badge className="bg-green-500">All Systems Operational</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Database</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">API Services</p>
                  <p className="text-xs text-muted-foreground">Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">AI Services</p>
                  <p className="text-xs text-muted-foreground">Running</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
