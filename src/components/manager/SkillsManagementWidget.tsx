import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useDemoModeFilter } from '@/hooks/useDemoModeFilter';

interface SkillsManagementWidgetProps {
  teamId: string;
}

export const SkillsManagementWidget = ({ teamId }: SkillsManagementWidgetProps) => {
  const [teamSkills, setTeamSkills] = useState<any[]>([]);
  const [skillGaps, setSkillGaps] = useState<any[]>([]);
  const { applyFilter } = useDemoModeFilter();

  useEffect(() => {
    loadSkillsData();
  }, [teamId]);

  const loadSkillsData = async () => {
    const { data: members } = await supabase
      .from('team_members')
      .select('employee_id, employees!team_members_employee_id_fkey(*)')
      .eq('manager_id', teamId);

    const employeeIds = members?.map(m => m.employee_id) || [];

    if (employeeIds.length > 0) {
      const { data: skills } = await supabase
        .from('employee_skills')
        .select('*, skills(*), employees(*)')
        .in('employee_id', employeeIds);

      setTeamSkills(skills || []);

      // Identify skill gaps (skills that less than 50% of team has)
      const skillCounts: Record<string, number> = {};
      skills?.forEach(s => {
        if (s.skills?.name) {
          skillCounts[s.skills.name] = (skillCounts[s.skills.name] || 0) + 1;
        }
      });

      const gaps = Object.entries(skillCounts)
        .filter(([_, count]) => count < employeeIds.length * 0.5)
        .map(([skill, count]) => ({
          skill,
          coverage: Math.round((count / employeeIds.length) * 100)
        }));

      setSkillGaps(gaps);
    }
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      case 'advanced': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'intermediate': return 'bg-green-500/10 text-green-700 border-green-500/20';
      default: return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
    }
  };

  // Group skills by category
  const skillsByCategory = teamSkills.reduce((acc, skill) => {
    const category = skill.skills?.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/20 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Skills & Development
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Skill Gaps Alert */}
        {skillGaps.length > 0 && (
          <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Skill Gaps Identified</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {skillGaps.length} skill(s) need broader team coverage
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Skills by Category */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {Object.entries(skillsByCategory).map(([category, skills]) => (
            <div key={category} className="bg-secondary/30 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(skills) && skills.slice(0, 6).map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="outline"
                    className={getProficiencyColor(skill.proficiency_level)}
                  >
                    {skill.skills?.name}
                    {skill.certified && ' ✓'}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Training Recommendations */}
        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Recommended Training</p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>• Advanced React Patterns - 3 members</li>
                <li>• Cloud Architecture - 5 members</li>
                <li>• Leadership Development - 2 members</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Skill Coverage */}
        {skillGaps.slice(0, 3).map((gap) => (
          <div key={gap.skill} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{gap.skill}</span>
              <span className="text-muted-foreground">{gap.coverage}% coverage</span>
            </div>
            <Progress value={gap.coverage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
