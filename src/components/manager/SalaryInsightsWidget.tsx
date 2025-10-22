import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { useDemoModeFilter } from '@/hooks/useDemoModeFilter';

interface SalaryInsightsWidgetProps {
  teamId: string;
}

export const SalaryInsightsWidget = ({ teamId }: SalaryInsightsWidgetProps) => {
  // Demo data with logical values
  const demoSalaryData = {
    averageSalary: 85000,
    minSalary: 65000,
    maxSalary: 120000,
    totalBudget: 510000,
    recentIncrements: 2
  };
  const [salaryData, setSalaryData] = useState<any>({});
  const { applyFilter } = useDemoModeFilter();

  useEffect(() => {
    loadSalaryData();
  }, [teamId]);

  const loadSalaryData = async () => {
    const { data: members } = await supabase
      .from('team_members')
      .select('employee_id')
      .eq('manager_id', teamId);

    // Extract employee IDs
    const employeeIds = members?.map(m => m.employee_id) || [];

    if (employeeIds.length > 0) {
      const { data: salaries } = await supabase
        .from('salary_records')
        .select('*')
        .in('employee_id', employeeIds);

      if (salaries && salaries.length > 0) {
        const netSalaries = salaries.map(s => s.net_salary);
        const avg = netSalaries.reduce((sum, s) => sum + parseFloat(s.toString()), 0) / netSalaries.length;
        const min = Math.min(...netSalaries.map(s => parseFloat(s.toString())));
        const max = Math.max(...netSalaries.map(s => parseFloat(s.toString())));
        const total = netSalaries.reduce((sum, s) => sum + parseFloat(s.toString()), 0);

        const increments = salaries.filter(s => s.increment_amount && s.increment_amount > 0);

        setSalaryData({
          averageSalary: avg,
          minSalary: min,
          maxSalary: max,
          totalBudget: total,
          recentIncrements: increments.length
        });
        return;
      }
    }

    // Show demo data if empty or no data
    setSalaryData(demoSalaryData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/20 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Salary & Compensation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-3 border border-green-500/20">
            <p className="text-xs text-muted-foreground mb-1">Average Salary</p>
            <p className="text-xl font-bold text-green-700">
              {salaryData.averageSalary ? formatCurrency(salaryData.averageSalary) : '--'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
            <p className="text-xl font-bold text-primary">
              {salaryData.totalBudget ? formatCurrency(salaryData.totalBudget) : '--'}
            </p>
          </div>
        </div>

        {/* Salary Range */}
        <div className="bg-secondary/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Salary Distribution</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Minimum</span>
              <span className="font-semibold">
                {salaryData.minSalary ? formatCurrency(salaryData.minSalary) : '--'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Median</span>
              <span className="font-semibold">
                {salaryData.averageSalary ? formatCurrency(salaryData.averageSalary) : '--'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Maximum</span>
              <span className="font-semibold">
                {salaryData.maxSalary ? formatCurrency(salaryData.maxSalary) : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-2">
          {salaryData.recentIncrements > 0 && (
            <div className="flex items-center gap-2 bg-green-500/10 rounded-lg p-3">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                {salaryData.recentIncrements} team member(s) received recent increments
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-orange-500/10 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <div className="flex-1">
              <span className="text-sm">Appraisal cycle starts in 2 months</span>
              <Badge variant="outline" className="ml-2 text-xs">Q2 2025</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
