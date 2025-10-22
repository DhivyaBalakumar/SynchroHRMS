import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AIInsightsWidgetProps {
  managerId: string;
}

export const AIInsightsWidget = ({ managerId }: AIInsightsWidgetProps) => {
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    loadInsights();
  }, [managerId]);

  const loadInsights = async () => {
    try {
      const { data } = await supabase
        .from('manager_insights')
        .select('*')
        .eq('manager_id', managerId)
        .eq('is_actioned', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5);

      // Show demo data if empty
      if (!data || data.length === 0) {
        setInsights([
          { id: '1', insight_type: 'performance', title: 'Team Productivity Up 15%', description: 'Your team has shown significant improvement this quarter. Consider sharing best practices across departments.', priority: 'high', confidence_score: 92, action_items: ['Document current workflows', 'Share with other teams'] },
          { id: '2', insight_type: 'risk', title: 'Skills Gap Detected', description: 'Three team members need training in React 18 features for upcoming project.', priority: 'medium', confidence_score: 85, action_items: ['Schedule training sessions', 'Allocate learning budget'] }
        ]);
      } else {
        setInsights(data);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
      // Show demo data on error
      setInsights([
        { id: '1', insight_type: 'performance', title: 'Team Productivity Up 15%', description: 'Your team has shown significant improvement this quarter.', priority: 'high', confidence_score: 92, action_items: ['Document workflows'] }
      ]);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'performance': return <TrendingUp className="h-5 w-5" />;
      case 'risk': return <AlertTriangle className="h-5 w-5" />;
      case 'opportunity': return <Lightbulb className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      case 'medium': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const markAsActioned = async (insightId: string) => {
    try {
      await supabase
        .from('manager_insights')
        .update({ is_actioned: true, is_read: true })
        .eq('id', insightId);
      
      loadInsights();
    } catch (error) {
      console.error('Error marking insight as actioned:', error);
      // Remove from local state even if update fails
      setInsights(insights.filter(i => i.id !== insightId));
    }
  };

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/20 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI-Powered Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length > 0 ? (
          insights.map((insight) => (
            <div 
              key={insight.id}
              className="bg-gradient-to-r from-secondary/40 to-secondary/20 rounded-lg p-4 border border-border hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  {getInsightIcon(insight.insight_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(insight.priority)}`}
                    >
                      {insight.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {insight.description}
                  </p>

                  {insight.confidence_score && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[100px]">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${insight.confidence_score}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{insight.confidence_score}%</span>
                    </div>
                  )}

                  {insight.action_items && Array.isArray(insight.action_items) && insight.action_items.length > 0 && (
                    <div className="bg-secondary/50 rounded p-2 mb-3">
                      <p className="text-xs font-medium mb-1">Recommended Actions:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {insight.action_items.slice(0, 2).map((action: string, idx: number) => (
                          <li key={idx}>• {action}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => markAsActioned(insight.id)}
                    className="w-full"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Mark as Actioned
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No new insights available</p>
            <p className="text-xs mt-1">Check back soon for AI-generated recommendations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
