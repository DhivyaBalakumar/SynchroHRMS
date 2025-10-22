import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Send, Target, BookOpen, TrendingUp, Star, Sparkles, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const AICareerCoach = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const queryClient = useQueryClient();

  // Fetch skill assessments
  const { data: skills } = useQuery({
    queryKey: ['skill-assessments', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('skill_assessments')
        .select('*')
        .eq('user_id', user?.id)
        .order('assessment_date', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch coaching sessions
  const { data: coachingSessions } = useQuery({
    queryKey: ['coaching-sessions', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('career_coaching_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1);
      return data?.[0] || null;
    },
    enabled: !!user,
  });

  // Get AI recommendation
  const getAIRecommendation = useMutation({
    mutationFn: async (userMessage: string) => {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { 
          message: `As an AI Career Coach, provide personalized career guidance based on this question: "${userMessage}". Consider skills development, career paths, and growth opportunities. Be encouraging and specific.`
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.message, timestamp: new Date() }
      ]);
      
      // Save session
      supabase
        .from('career_coaching_sessions')
        .insert({
          user_id: user?.id,
          session_type: 'career_path',
          ai_recommendations: { messages: chatMessages }
        })
        .then(() => queryClient.invalidateQueries({ queryKey: ['coaching-sessions'] }));
    },
    onError: () => {
      toast.error('Failed to get AI response. Please try again.');
    }
  });

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { role: 'user', content: message, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    setMessage('');

    await getAIRecommendation.mutateAsync(message);
  };

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'];

  const suggestedQuestions = [
    "What skills should I focus on to advance my career?",
    "How can I transition to a leadership role?",
    "What learning resources do you recommend for me?",
    "How do I set effective career goals?"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Skill Assessment Card */}
      <Card className="p-6 lg:col-span-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-purple-600">
            <Target className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold">Your Skills</h3>
        </div>

        <div className="space-y-4">
          {skills && skills.length > 0 ? (
            skills.slice(0, 5).map((skill: any) => (
              <div key={skill.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{skill.skill_name}</span>
                  <Badge variant="outline">{skillLevels[skill.current_level - 1]}</Badge>
                </div>
                <Progress value={skill.current_level * 20} className="h-2" />
                {skill.target_level && skill.target_level > skill.current_level && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: {skillLevels[skill.target_level - 1]}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No skills assessed yet</p>
              <p className="text-xs">Ask the AI coach about skill assessment</p>
            </div>
          )}
        </div>

        {skills && skills.length > 0 && (
          <div className="mt-6 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary">AI Insight</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You're showing strong progress! Focus on {skills[0]?.skill_name} to reach your next milestone.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* AI Chat Interface */}
      <Card className="p-6 lg:col-span-2 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
            <Brain className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold">AI Career Coach</h3>
            <p className="text-xs text-muted-foreground">Personalized guidance powered by AI</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-[300px] max-h-[400px]">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-4">
                <Brain className="h-12 w-12 text-primary" />
              </div>
              <h4 className="font-bold text-lg mb-2">Welcome to Your AI Career Coach!</h4>
              <p className="text-muted-foreground mb-6 max-w-md">
                I'm here to help you grow your career, develop new skills, and achieve your professional goals.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-2xl">
                {suggestedQuestions.map((question, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto py-3"
                    onClick={() => {
                      setMessage(question);
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-xs">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {chatMessages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="h-4 w-4" />
                        <span className="text-xs font-semibold">AI Career Coach</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {getAIRecommendation.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 animate-pulse" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about your career, skills, or growth opportunities..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={getAIRecommendation.isPending}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || getAIRecommendation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Goals & Achievements */}
      <Card className="p-6 lg:col-span-3">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-full bg-gradient-to-br from-green-500 to-green-600">
            <Award className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold">Career Milestones</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
            <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{skills?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Skills Tracked</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {skills?.filter((s: any) => s.target_level && s.current_level < s.target_level).length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Active Goals</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
            <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{chatMessages.length}</p>
            <p className="text-xs text-muted-foreground">Coaching Sessions</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {skills?.filter((s: any) => s.current_level >= 4).length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Expert Skills</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AICareerCoach;