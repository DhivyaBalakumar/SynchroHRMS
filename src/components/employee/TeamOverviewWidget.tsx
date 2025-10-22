import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Users, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TeamOverviewWidgetProps {
  employeeId: string;
}

export const TeamOverviewWidget = ({ employeeId }: TeamOverviewWidgetProps) => {
  // Dummy data for display
  const teamData = {
    id: 'team-1',
    name: 'Engineering Team Alpha'
  };

  const project = {
    id: 'project-1',
    name: 'Mobile App Redesign',
    progress: 68
  };

  const teamMembers = [
    {
      id: '1',
      employees: {
        full_name: 'John Manager',
      },
      role: 'team lead'
    },
    {
      id: '2',
      employees: {
        full_name: 'Sarah Johnson',
      },
      role: 'developer'
    },
    {
      id: '3',
      employees: {
        full_name: 'Mike Chen',
      },
      role: 'designer'
    },
    {
      id: '4',
      employees: {
        full_name: 'Emma Davis',
      },
      role: 'qa engineer'
    }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/20 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Team Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {teamData ? (
          <>
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">Team Name</p>
              <p className="font-bold text-lg">{teamData.name}</p>
            </div>

            {project && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Current Project</p>
                  <span className="text-xs text-primary">{project.progress}%</span>
                </div>
                <p className="font-semibold">{project.name}</p>
                <Progress value={project.progress} className="h-2" />
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-3">Team Members</p>
              <div className="grid grid-cols-2 gap-2">
                {teamMembers.slice(0, 4).map((member) => (
                  <div key={member.id} className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2">
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                        {getInitials(member.employees?.full_name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{member.employees?.full_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No team assigned</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
