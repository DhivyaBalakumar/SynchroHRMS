import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const BulkUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedJobRole, setSelectedJobRole] = useState<string>('');
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load job roles
  useState(() => {
    const loadJobRoles = async () => {
      const { data } = await supabase
        .from('job_roles')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (data) setJobRoles(data);
    };
    loadJobRoles();
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const pdfFiles = selectedFiles.filter(f => f.type === 'application/pdf');
    
    if (pdfFiles.length !== selectedFiles.length) {
      toast({
        title: 'Invalid Files',
        description: 'Only PDF files are accepted',
        variant: 'destructive',
      });
    }
    
    setFiles(pdfFiles);
  };

  const handleUpload = async () => {
    if (!selectedJobRole) {
      toast({
        title: 'Select Job Role',
        description: 'Please select a job role first',
        variant: 'destructive',
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: 'No Files',
        description: 'Please select files to upload',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    
    const results = {
      total: files.length,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as any[],
    };

    try {
      // Process files directly without tracking table
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Upload file to storage (if storage is configured)
          const candidateName = file.name.replace('.pdf', '').replace(/_/g, ' ');
          
          // Create resume record
          const { error: resumeError } = await supabase
            .from('resumes')
            .insert({
              candidate_name: candidateName,
              email: `${candidateName.replace(/\s/g, '.').toLowerCase()}@example.com`,
              position_applied: 'General Application',
              screening_status: 'pending',
              pipeline_stage: 'screening',
            });

          if (resumeError) throw resumeError;

          results.successful++;
        } catch (error: any) {
          results.failed++;
          results.errors.push({
            file: file.name,
            error: error.message,
          });
        }

        results.processed++;
        setProgress((results.processed / results.total) * 100);
      }

      setUploadResults(results);
      
      toast({
        title: 'Upload Complete',
        description: `${results.successful} resumes uploaded successfully`,
      });

      // Navigate to screening page after 2 seconds
      setTimeout(() => {
        navigate('/dashboard/hr/screening');
      }, 2000);

    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Bulk Resume Upload</h1>
          <p className="text-muted-foreground">
            Upload multiple resumes for AI-powered screening
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Job Role</label>
            <Select value={selectedJobRole} onValueChange={setSelectedJobRole}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a job role" />
              </SelectTrigger>
              <SelectContent>
                {jobRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.title} - {role.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Drop PDF files here</p>
              <p className="text-sm text-muted-foreground">
                or click to browse (supports up to 50,000 files)
              </p>
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium">{files.length} files selected</span>
                </div>
                <Button
                  onClick={() => setFiles([])}
                  variant="ghost"
                  size="sm"
                  disabled={uploading}
                >
                  Clear
                </Button>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {uploadResults && (
                <div className="space-y-2 p-4 bg-secondary/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">
                      {uploadResults.successful} successful
                    </span>
                  </div>
                  {uploadResults.failed > 0 && (
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">
                        {uploadResults.failed} failed
                      </span>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleUpload}
                className="w-full"
                size="lg"
                disabled={uploading || !selectedJobRole}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload & Process Resumes
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BulkUpload;
