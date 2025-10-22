import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface SalaryWidgetProps {
  employeeId: string;
}

export const SalaryWidget = ({ employeeId }: SalaryWidgetProps) => {
  // Dummy data for display
  const salaryRecord = {
    net_salary: 8500,
    increment_amount: 500,
    increment_percentage: 6.25
  };

  const recentPayslips = [
    {
      id: '1',
      year: 2025,
      month: 1,
      net_salary: 8500
    },
    {
      id: '2',
      year: 2024,
      month: 12,
      net_salary: 8500
    },
    {
      id: '3',
      year: 2024,
      month: 11,
      net_salary: 8000
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
        {salaryRecord && (
          <>
            <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-4 text-white">
              <p className="text-sm opacity-90">Current Monthly Salary</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(salaryRecord.net_salary)}
              </p>
            </div>

            {salaryRecord.increment_amount && (
              <div className="flex items-center gap-2 bg-green-500/10 rounded-lg p-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Increment</p>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(salaryRecord.increment_amount)} 
                    <span className="text-xs ml-1">
                      ({salaryRecord.increment_percentage}%)
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-2">Recent Payslips</p>
              <div className="space-y-2">
                {recentPayslips.map((payslip) => (
                  <div key={payslip.id} className="flex justify-between items-center bg-secondary/50 rounded-lg p-3">
                    <div>
                      <p className="font-medium">
                        {format(new Date(payslip.year, payslip.month - 1), 'MMMM yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(payslip.net_salary)}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
