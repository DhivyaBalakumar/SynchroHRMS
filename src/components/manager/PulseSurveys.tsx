import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Plus, BarChart3, Users, CheckCircle, Clock, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const PulseSurveys = () => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    target_audience: 'all',
    questions: [{ text: '', type: 'rating' }]
  });
  const queryClient = useQueryClient();

  // Fetch surveys
  const { data: surveys } = useQuery({
    queryKey: ['pulse-surveys', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('pulse_surveys')
        .select(`
          *,
          pulse_questions (count),
          pulse_responses (count)
        `)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // Create survey mutation
  const createSurvey = useMutation({
    mutationFn: async () => {
      // Create survey
      const { data: survey, error: surveyError } = await supabase
        .from('pulse_surveys')
        .insert({
          title: newSurvey.title,
          description: newSurvey.description,
          created_by: user?.id,
          target_audience: newSurvey.target_audience,
          status: 'active',
          start_date: new Date().toISOString()
        })
        .select()
        .single();

      if (surveyError) throw surveyError;

      // Create questions
      const questions = newSurvey.questions.map((q, idx) => ({
        survey_id: survey.id,
        question_text: q.text,
        question_type: q.type,
        order_index: idx
      }));

      const { error: questionsError } = await supabase
        .from('pulse_questions')
        .insert(questions);

      if (questionsError) throw questionsError;

      return survey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pulse-surveys'] });
      toast.success('Survey created and sent to team!');
      setIsCreating(false);
      setNewSurvey({
        title: '',
        description: '',
        target_audience: 'all',
        questions: [{ text: '', type: 'rating' }]
      });
    },
    onError: () => {
      toast.error('Failed to create survey');
    }
  });

  const addQuestion = () => {
    setNewSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', type: 'rating' }]
    }));
  };

  const removeQuestion = (index: number) => {
    setNewSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    setNewSurvey(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-pink-600">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Pulse Surveys</h3>
              <p className="text-sm text-muted-foreground">
                Real-time team sentiment with instant insights
              </p>
            </div>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Survey
          </Button>
        </div>
      </Card>

      {/* Surveys List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys && surveys.length > 0 ? (
          surveys.map((survey: any, index: number) => (
            <motion.div
              key={survey.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-bold text-lg line-clamp-2">{survey.title}</h4>
                  <Badge variant={
                    survey.status === 'active' ? 'default' :
                    survey.status === 'closed' ? 'secondary' :
                    'outline'
                  }>
                    {survey.status}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {survey.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-blue-500/10">
                    <BarChart3 className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">
                      {Array.isArray(survey.pulse_questions) ? survey.pulse_questions.length : survey.pulse_questions?.[0]?.count || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Questions</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-500/10">
                    <Users className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">
                      {Array.isArray(survey.pulse_responses) ? new Set(survey.pulse_responses.map((r: any) => r.respondent_id)).size : survey.pulse_responses?.[0]?.count || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Responses</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Results
                  </Button>
                  {survey.status === 'active' && (
                    <Button variant="outline" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="col-span-full p-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Surveys Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first pulse survey to gather team sentiment
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Survey
            </Button>
          </Card>
        )}
      </div>

      {/* Create Survey Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Pulse Survey</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Survey Title</label>
              <Input
                value={newSurvey.title}
                onChange={(e) => setNewSurvey(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Weekly Team Pulse Check"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={newSurvey.description}
                onChange={(e) => setNewSurvey(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this survey..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Target Audience</label>
              <Select
                value={newSurvey.target_audience}
                onValueChange={(value) => setNewSurvey(prev => ({ ...prev, target_audience: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Team Members</SelectItem>
                  <SelectItem value="team">My Team Only</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Questions</label>
                <Button variant="outline" size="sm" onClick={addQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>

              <div className="space-y-3">
                {newSurvey.questions.map((question, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <Input
                          value={question.text}
                          onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                          placeholder={`Question ${index + 1}`}
                        />
                        <Select
                          value={question.type}
                          onValueChange={(value) => updateQuestion(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rating">Rating (1-5)</SelectItem>
                            <SelectItem value="yes_no">Yes/No</SelectItem>
                            <SelectItem value="text">Text Response</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {newSurvey.questions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                onClick={() => createSurvey.mutate()}
                disabled={
                  !newSurvey.title || 
                  newSurvey.questions.some(q => !q.text) ||
                  createSurvey.isPending
                }
              >
                {createSurvey.isPending ? 'Creating...' : 'Create & Send Survey'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreating(false)}
                disabled={createSurvey.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PulseSurveys;