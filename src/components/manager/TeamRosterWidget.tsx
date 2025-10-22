import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Mail, ClipboardList, UserCircle, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useDemoModeFilter } from '@/hooks/useDemoModeFilter';

interface TeamRosterWidgetProps {
  teamId: string;
}

export const TeamRosterWidget = ({ teamId }: TeamRosterWidgetProps) => {
  // Team API - Dummy data for display
  const teamName = 'Team API';
  
  const teamMembers = [
    {
      id: '1',
      employee_id: 'emp-1',
      role: 'team lead',
      experience: '8 years',
      projects: ['API Gateway v2', 'Payment Integration', 'Auth Service'],
      employees: {
        id: 'emp-1',
        full_name: 'Sarah Johnson',
        position: 'Senior Full Stack Developer',
        email: 'sarah.j@company.com'
      }
    },
    {
      id: '2',
      employee_id: 'emp-2',
      role: 'developer',
      experience: '5 years',
      projects: ['REST API Refactor', 'Database Optimization', 'Microservices Migration'],
      employees: {
        id: 'emp-2',
        full_name: 'Mike Chen',
        position: 'Backend Developer',
        email: 'mike.c@company.com'
      }
    },
    {
      id: '3',
      employee_id: 'emp-3',
      role: 'developer',
      experience: '4 years',
      projects: ['Admin Dashboard', 'Customer Portal', 'Mobile API Client'],
      employees: {
        id: 'emp-3',
        full_name: 'Emma Davis',
        position: 'Frontend Developer',
        email: 'emma.d@company.com'
      }
    },
    {
      id: '4',
      employee_id: 'emp-4',
      role: 'devops',
      experience: '6 years',
      projects: ['CI/CD Pipeline', 'AWS Infrastructure', 'Monitoring System'],
      employees: {
        id: 'emp-4',
        full_name: 'Alex Kumar',
        position: 'DevOps Engineer',
        email: 'alex.k@company.com'
      }
    },
    {
      id: '5',
      employee_id: 'emp-5',
      role: 'qa engineer',
      experience: '3 years',
      projects: ['API Testing Suite', 'Load Testing', 'E2E Automation'],
      employees: {
        id: 'emp-5',
        full_name: 'Lisa Park',
        position: 'QA Engineer',
        email: 'lisa.p@company.com'
      }
    },
    {
      id: '6',
      employee_id: 'emp-6',
      role: 'architect',
      experience: '10 years',
      projects: ['API Design Standards', 'GraphQL Implementation', 'API Security'],
      employees: {
        id: 'emp-6',
        full_name: 'Tom Rodriguez',
        position: 'API Architect',
        email: 'tom.r@company.com'
      }
    }
  ];

  const attendance: Record<string, any> = {
    'emp-1': { sign_in_time: '2024-01-15 09:00:00', sign_out_time: null },
    'emp-2': { sign_in_time: '2024-01-15 08:45:00', sign_out_time: null },
    'emp-3': { sign_in_time: '2024-01-15 09:15:00', sign_out_time: '2024-01-15 17:30:00' },
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusBadge = (employeeId: string) => {
    const att = attendance[employeeId];
    if (!att) return <Badge variant="outline" className="bg-gray-500/10">Absent</Badge>;
    if (att.sign_in_time && !att.sign_out_time) {
      return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Online</Badge>;
    }
    return <Badge variant="outline" className="bg-gray-500/10">Offline</Badge>;
  };

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/20 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {teamName}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{teamMembers.length} members</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {teamMembers.map((member) => (
            <div 
              key={member.id} 
              className="bg-gradient-to-r from-secondary/40 to-secondary/20 rounded-lg p-4 hover:shadow-md transition-all border border-border hover:border-primary/30"
            >
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                    {getInitials(member.employees?.full_name || 'U')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm">{member.employees?.full_name}</h4>
                    {getStatusBadge(member.employee_id)}
                  </div>
                  <p className="text-xs text-muted-foreground">{member.employees?.position}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs capitalize">{member.role}</Badge>
                    <span className="text-xs text-muted-foreground">• {member.experience}</span>
                  </div>
                </div>
              </div>

              {/* Recent Projects */}
              <div className="bg-secondary/50 rounded p-2 mb-3">
                <p className="text-xs font-medium mb-1.5 text-muted-foreground">Recent Projects:</p>
                <div className="flex flex-wrap gap-1">
                  {member.projects.slice(0, 3).map((project, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {project}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="flex-1 text-xs">
                  <Mail className="h-3 w-3 mr-1" />
                  Contact
                </Button>
                <Button size="sm" variant="ghost" className="flex-1 text-xs">
                  <ClipboardList className="h-3 w-3 mr-1" />
                  Tasks
                </Button>
                <Button size="sm" variant="ghost" className="flex-1 text-xs">
                  <UserCircle className="h-3 w-3 mr-1" />
                  Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
