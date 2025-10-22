import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Award, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useDemoModeFilter } from '@/hooks/useDemoModeFilter';

interface PerformanceAnalyticsWidgetProps {
  teamId: string;
}

export const PerformanceAnalyticsWidget = ({ teamId }: PerformanceAnalyticsWidgetProps) => {
  // Dummy data for display
  const teamMetrics = {
    avgScore: 87,
    totalMetrics: 45
  };

  const individualMetrics = [
    { employeeId: 'emp-1', avgScore: 92, metrics: [] },
    { employeeId: 'emp-2', avgScore: 88, metrics: [] },
    { employeeId: 'emp-3', avgScore: 85, metrics: [] },
    { employeeId: 'emp-4', avgScore: 82, metrics: [] },
    { employeeId: 'emp-5', avgScore: 78, metrics: [] }
  ];

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/20 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Performance Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Overview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Team Average</span>
            </div>
            <p className="text-3xl font-bold text-primary">{teamMetrics.avgScore}%</p>
          </div>

          <div className="bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-accent" />
              <span className="text-sm text-muted-foreground">Total Reviews</span>
            </div>
            <p className="text-3xl font-bold">{teamMetrics.totalMetrics}</p>
          </div>
        </div>

        {/* Performance Distribution */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Performance Distribution</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          
          {individualMetrics.slice(0, 5).map((emp, idx) => (
            <div key={emp.employeeId} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Member {idx + 1}</span>
                <span className="font-semibold">{emp.avgScore}%</span>
              </div>
              <Progress value={emp.avgScore} className="h-2" />
            </div>
          ))}
        </div>

        {/* Trend Indicator */}
        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Performance Trend</p>
              <p className="text-xs text-muted-foreground mt-1">
                Team performance is up 12% from last quarter. Keep up the momentum!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
