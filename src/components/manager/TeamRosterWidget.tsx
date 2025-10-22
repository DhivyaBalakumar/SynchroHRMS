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
  // Dummy data for display
  const teamMembers = [
    {
      id: '1',
      employee_id: 'emp-1',
      role: 'senior developer',
      employees: {
        id: 'emp-1',
        full_name: 'Sarah Johnson',
        position: 'Senior Software Engineer',
        email: 'sarah.j@company.com'
      }
    },
    {
      id: '2',
      employee_id: 'emp-2',
      role: 'developer',
      employees: {
        id: 'emp-2',
        full_name: 'Mike Chen',
        position: 'Software Engineer',
        email: 'mike.c@company.com'
      }
    },
    {
      id: '3',
      employee_id: 'emp-3',
      role: 'designer',
      employees: {
        id: 'emp-3',
        full_name: 'Alex Rivera',
        position: 'UX Designer',
        email: 'alex.r@company.com'
      }
    },
    {
      id: '4',
      employee_id: 'emp-4',
      role: 'qa engineer',
      employees: {
        id: 'emp-4',
        full_name: 'Emma Davis',
        position: 'QA Engineer',
        email: 'emma.d@company.com'
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
          Team Roster
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {teamMembers.map((member) => (
            <div 
              key={member.id} 
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                  {getInitials(member.employees?.full_name || 'U')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold truncate">{member.employees?.full_name}</h4>
                  {getStatusBadge(member.employee_id)}
                </div>
                <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                <p className="text-xs text-muted-foreground">{member.employees?.position}</p>
              </div>

              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <ClipboardList className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <UserCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
