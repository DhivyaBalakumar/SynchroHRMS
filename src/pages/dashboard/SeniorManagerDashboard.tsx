import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BarChart3, Users, TrendingUp, Target, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const SeniorManagerDashboard = () => {
  const { user, signOut } = useAuth();

  const stats = [
    { label: 'Departments', value: '8', Icon: BarChart3, color: 'text-blue-500' },
    { label: 'Total Employees', value: '247', Icon: Users, color: 'text-green-500' },
    { label: 'Revenue Growth', value: '+24%', Icon: TrendingUp, color: 'text-purple-500' },
    { label: 'Strategic Goals', value: '12/15', Icon: Target, color: 'text-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Senior Manager Dashboard</h1>
            <p className="text-muted-foreground mt-2">Strategic oversight, {user?.email}</p>
          </div>
          <Button onClick={signOut} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.Icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Strategic Initiatives</h2>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                Organization Analytics
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Department Performance
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Strategic Planning
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Launch Company Survey
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Key Metrics</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="font-medium">Employee Satisfaction</p>
                <p className="text-2xl font-bold text-green-500">4.7/5.0</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-medium">Retention Rate</p>
                <p className="text-2xl font-bold text-blue-500">94%</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <p className="font-medium">Productivity Index</p>
                <p className="text-2xl font-bold text-purple-500">+18%</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Department Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Engineering', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance', 'Product', 'Support'].map((dept) => (
              <div key={dept} className="p-4 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
                <p className="font-medium">{dept}</p>
                <p className="text-sm text-muted-foreground">View details →</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SeniorManagerDashboard;
