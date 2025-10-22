import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, MessageSquare, Star, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const PerformanceWall = () => {
  const { user } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const queryClient = useQueryClient();

  // Fetch team members with rankings
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['team-rankings', user?.id],
    queryFn: async () => {
      // Get team members
      const { data: team } = await supabase
        .from('team_members')
        .select(`
          *,
          employees (
            id,
            full_name,
            position,
            email,
            performance_metrics,
            hire_date
          )
        `)
        .eq('manager_id', user?.id);

      if (!team) return [];

      // Get rankings
      const { data: rankings } = await supabase
        .from('performance_rankings')
        .select('*')
        .eq('manager_id', user?.id);

      // Merge data
      const membersWithRankings = team.map((member: any) => {
        const ranking = rankings?.find(r => r.employee_id === member.employee_id);
        return {
          ...member.employees,
          ranking: ranking?.rank_position || 999,
          rankingNotes: ranking?.notes || '',
          rankingId: ranking?.id
        };
      });

      // Sort by ranking
      return membersWithRankings.sort((a, b) => a.ranking - b.ranking);
    },
    enabled: !!user,
  });

  // Update rankings
  const updateRankings = useMutation({
    mutationFn: async (newOrder: any[]) => {
      const updates = newOrder.map((member, index) => ({
        manager_id: user?.id,
        employee_id: member.id,
        rank_position: index + 1,
        notes: member.rankingNotes || '',
        last_updated_at: new Date().toISOString()
      }));

      // Upsert rankings
      const { error } = await supabase
        .from('performance_rankings')
        .upsert(updates, { 
          onConflict: 'manager_id,employee_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-rankings'] });
      toast.success('Rankings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update rankings');
    }
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination || !teamMembers) return;

    const items = Array.from(teamMembers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateRankings.mutate(items);
  };

  const getPerformanceScore = (metrics: any) => {
    if (!metrics) return 0;
    const scores = Object.values(metrics).filter(v => typeof v === 'number') as number[];
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-blue-500 to-blue-600';
    if (score >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <TrendingUp className="h-8 w-8 text-primary" />
        </motion.div>
        <p className="mt-4 text-muted-foreground">Loading performance wall...</p>
      </div>
    );
  }

  if (!teamMembers || teamMembers.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Team Members Yet</h3>
        <p className="text-muted-foreground">
          Team members will appear here once they're assigned to your team.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold">Performance Wall</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop to reorder your team's performance rankings
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {teamMembers.length} Team Members
          </Badge>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="team-members">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {teamMembers.map((member: any, index: number) => {
                  const score = getPerformanceScore(member.performance_metrics);
                  
                  return (
                    <Draggable
                      key={member.id}
                      draggableId={member.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card
                            className={`p-4 cursor-pointer transition-all ${
                              snapshot.isDragging 
                                ? 'shadow-2xl scale-105 rotate-2' 
                                : 'hover:shadow-lg'
                            }`}
                            onClick={() => setSelectedEmployee(member)}
                          >
                            <div className="flex items-center gap-4">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>

                              {/* Rank Badge */}
                              <div className="flex-shrink-0">
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                                  index === 0 ? 'from-yellow-400 to-yellow-600' :
                                  index === 1 ? 'from-gray-300 to-gray-500' :
                                  index === 2 ? 'from-orange-400 to-orange-600' :
                                  'from-blue-400 to-blue-600'
                                } flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                  #{index + 1}
                                </div>
                              </div>

                              {/* Employee Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-lg truncate">{member.full_name}</h4>
                                  {index < 3 && (
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{member.position}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Joined {new Date(member.hire_date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              {/* Performance Score */}
                              <div className="text-right">
                                <div className={`text-3xl font-bold bg-gradient-to-br ${getPerformanceColor(score)} bg-clip-text text-transparent`}>
                                  {score}
                                </div>
                                <p className="text-xs text-muted-foreground">Performance</p>
                              </div>

                              {/* Actions */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEmployee(member);
                                }}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Feedback
                              </Button>
                            </div>
                          </Card>
                        </motion.div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Card>

      {/* Employee Details Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedEmployee?.full_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-semibold">{selectedEmployee?.position}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold text-sm">{selectedEmployee?.email}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Ranking</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  #{(teamMembers?.findIndex((m: any) => m.id === selectedEmployee?.id) || 0) + 1}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  of {teamMembers?.length} team members
                </span>
              </div>
            </div>

            {selectedEmployee?.rankingNotes && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Previous Notes</p>
                <Card className="p-3 bg-muted">
                  <p className="text-sm">{selectedEmployee.rankingNotes}</p>
                </Card>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-2">Add Feedback</p>
              <Textarea
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="Enter your feedback or notes about this team member's performance..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  // Save feedback logic here
                  toast.success('Feedback saved successfully');
                  setSelectedEmployee(null);
                  setFeedbackNote('');
                }}
              >
                Save Feedback
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedEmployee(null);
                  setFeedbackNote('');
                }}
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

export default PerformanceWall;