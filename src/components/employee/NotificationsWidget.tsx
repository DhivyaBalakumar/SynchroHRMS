import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsWidgetProps {
  employeeId: string;
}

export const NotificationsWidget = ({ employeeId }: NotificationsWidgetProps) => {
  // Dummy notifications data
  const notifications = [
    {
      id: '1',
      title: 'Leave Approved',
      message: 'Your leave request for Dec 25-27 has been approved',
      priority: 'high',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      is_read: false
    },
    {
      id: '2',
      title: 'New Task Assigned',
      message: 'Complete Q4 performance review',
      priority: 'medium',
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      is_read: false
    },
    {
      id: '3',
      title: 'Payslip Available',
      message: 'December payslip is now available',
      priority: 'low',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      is_read: true
    },
    {
      id: '4',
      title: 'Training Reminder',
      message: 'Mandatory security training due in 3 days',
      priority: 'medium',
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      is_read: true
    },
    {
      id: '5',
      title: 'Team Meeting',
      message: 'Weekly sync scheduled for tomorrow 10am',
      priority: 'low',
      created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      is_read: true
    }
  ];

  const markAsRead = (notificationId: string) => {
    console.log('Marking notification as read:', notificationId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/20 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base md:text-lg">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Notifications
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs md:text-sm">{unreadCount} new</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 md:space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-2 md:p-3 rounded-lg border transition-all ${
                  notification.is_read 
                    ? 'bg-muted/30 border-muted' 
                    : 'bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-xs md:text-sm font-semibold ${!notification.is_read && 'text-primary'}`}>
                        {notification.title}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`${getPriorityColor(notification.priority)} text-[10px] md:text-xs`}
                      >
                        {notification.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 md:h-7 md:w-7 p-0 flex-shrink-0"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <X className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4 md:py-8 text-xs md:text-sm">
              No notifications
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};