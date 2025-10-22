import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Calendar,
  ArrowLeft 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone?: string;
  position?: string;
  department_id?: string;
  hire_date?: string;
  employment_status: string;
}

const EmployeeList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('full_name');

    if (error) {
      toast({
        title: 'Error loading employees',
        description: error.message,
        variant: 'destructive',
      });
    } else if (data) {
      setEmployees(data);
    }
    setLoading(false);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'on_leave': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/hr')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">All Employees</h1>
            <Button onClick={() => navigate('/employees/add')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Card className="p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading employees...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No employees found</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredEmployees.map((employee, idx) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{employee.full_name}</h3>
                        <Badge className={getStatusColor(employee.employment_status)}>
                          {employee.employment_status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">{employee.employee_id}</Badge>
                      </div>
                      
                      {employee.position && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {employee.position}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 mt-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{employee.email}</span>
                        </div>
                        {employee.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{employee.phone}</span>
                          </div>
                        )}
                        {employee.hire_date && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Hired {new Date(employee.hire_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
