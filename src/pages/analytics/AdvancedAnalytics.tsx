import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Download } from 'lucide-react';
import { PredictiveAnalytics } from '@/components/analytics/PredictiveAnalytics';

const AdvancedAnalytics = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Advanced Analytics Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                AI-powered insights and predictive workforce analytics
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="predictive" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
            <TabsTrigger value="workforce">Workforce Planning</TabsTrigger>
            <TabsTrigger value="performance">Performance Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="predictive">
            <PredictiveAnalytics />
          </TabsContent>

          <TabsContent value="workforce">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Workforce planning analytics coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Performance insights coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
