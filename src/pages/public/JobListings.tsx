import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Search,
  TrendingUp 
} from 'lucide-react';

interface JobRole {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: any;
  vacancies: number;
  urgency: string;
  location?: string;
  experience_required?: string;
  salary_range?: string;
  created_at: string;
}

const JobListings = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const { data, error } = await supabase
      .from('job_roles')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setJobs(data);
    }
    setLoading(false);
  };

  const departments = ['all', ...new Set(jobs.map(j => j.department))];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDepartment === 'all' || job.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent_hiring': return 'bg-destructive';
      case 'hiring': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading opportunities...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold mb-2">Career Opportunities</h1>
          <p className="text-muted-foreground text-lg">
            Join our team and make an impact
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Search & Filter */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Job Cards */}
        <div className="grid gap-6">
          {filteredJobs.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No jobs found matching your criteria</p>
            </Card>
          ) : (
            filteredJobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/jobs/${job.id}/apply`)}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold">{job.title}</h2>
                        <Badge className={getUrgencyColor(job.urgency)}>
                          {job.urgency.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {job.vacancies} {job.vacancies === 1 ? 'position' : 'positions'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{job.department}</p>
                    </div>
                    <Button size="lg">
                      Apply Now
                    </Button>
                  </div>

                  <p className="text-muted-foreground mb-4">{job.description}</p>

                  <div className="flex flex-wrap gap-4 mb-4">
                    {job.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{job.location}</span>
                      </div>
                    )}
                    {job.experience_required && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{job.experience_required}</span>
                      </div>
                    )}
                    {job.salary_range && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{job.salary_range}</span>
                      </div>
                    )}
                  </div>

                  {job.requirements && job.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.slice(0, 5).map((req, idx) => (
                        <Badge key={idx} variant="secondary">{req}</Badge>
                      ))}
                      {job.requirements.length > 5 && (
                        <Badge variant="secondary">+{job.requirements.length - 5} more</Badge>
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListings;
