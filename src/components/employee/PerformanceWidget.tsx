import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, Award, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface PerformanceWidgetProps {
  employeeId: string;
}

export const PerformanceWidget = ({ employeeId }: PerformanceWidgetProps) => {
  // Dummy performance data
  const metrics = [
    { metric_type: 'productivity', score: 85 },
    { metric_type: 'quality', score: 92 },
    { metric_type: 'collaboration', score: 88 },
    { metric_type: 'innovation', score: 78 }
  ];

  const performanceTrend = [
    { month: 'Jul', score: 75 },
    { month: 'Aug', score: 78 },
    { month: 'Sep', score: 82 },
    { month: 'Oct', score: 85 },
    { month: 'Nov', score: 87 },
    { month: 'Dec', score: 89 }
  ];

  const skillsData = [
    { skill: 'Technical', score: 88 },
    { skill: 'Communication', score: 85 },
    { skill: 'Leadership', score: 75 },
    { skill: 'Problem Solving', score: 92 }
  ];

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'productivity': return TrendingUp;
      case 'quality': return Star;
      case 'collaboration': return Award;
      default: return Target;
    }
  };

  const getMetricColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/20 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          Your Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {metrics.map((metric) => {
            const Icon = getMetricIcon(metric.metric_type);
            const colorClass = getMetricColor(metric.score);
            
            return (
              <div key={metric.metric_type} className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-2 md:p-3">
                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                  <Icon className={`h-3 w-3 md:h-4 md:w-4 ${colorClass}`} />
                  <span className="text-xs font-medium capitalize">{metric.metric_type}</span>
                </div>
                <p className={`text-xl md:text-2xl font-bold ${colorClass}`}>{metric.score}%</p>
              </div>
            );
          })}
        </div>

        {/* Performance Trend Chart */}
        <div className="space-y-2">
          <h4 className="text-xs md:text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            6-Month Performance Trend
          </h4>
          <ChartContainer config={chartConfig} className="h-[120px] md:h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Skills Bar Chart */}
        <div className="space-y-2">
          <h4 className="text-xs md:text-sm font-semibold flex items-center gap-2">
            <Award className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            Skills Assessment
          </h4>
          <ChartContainer config={chartConfig} className="h-[120px] md:h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillsData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="skill" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Overall Performance */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-3 md:p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs md:text-sm font-medium">Overall Performance</span>
            <span className="text-xl md:text-2xl font-bold text-primary">
              {Math.round(metrics.reduce((acc, m) => acc + m.score, 0) / metrics.length)}%
            </span>
          </div>
          <Progress 
            value={Math.round(metrics.reduce((acc, m) => acc + m.score, 0) / metrics.length)} 
            className="h-2 md:h-3"
          />
        </div>

        {/* AI Suggestion */}
        <div className="bg-blue-500/10 rounded-lg p-2 md:p-3 border border-blue-500/20">
          <div className="flex items-start gap-2">
            <Target className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs md:text-sm font-medium">AI Suggestion</p>
              <p className="text-xs text-muted-foreground mt-1">
                Great progress! Focus on innovation skills to reach 90%+ overall performance.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};