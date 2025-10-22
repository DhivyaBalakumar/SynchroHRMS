export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string | null
          date: string
          employee_id: string
          id: string
          notes: string | null
          sign_in_time: string
          sign_out_time: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string
          employee_id: string
          id?: string
          notes?: string | null
          sign_in_time: string
          sign_out_time?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          employee_id?: string
          id?: string
          notes?: string | null
          sign_in_time?: string
          sign_out_time?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_error_logs: {
        Row: {
          context: Json | null
          created_at: string | null
          error_message: string
          error_stack: string | null
          error_type: string
          id: string
          interview_id: string | null
          resolved: boolean | null
          resume_id: string | null
          severity: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          error_message: string
          error_stack?: string | null
          error_type: string
          id?: string
          interview_id?: string | null
          resolved?: boolean | null
          resume_id?: string | null
          severity?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          error_message?: string
          error_stack?: string | null
          error_type?: string
          id?: string
          interview_id?: string | null
          resolved?: boolean | null
          resume_id?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_error_logs_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_error_logs_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_integrations: {
        Row: {
          access_token: string | null
          access_token_encrypted: string | null
          calendar_id: string | null
          created_at: string | null
          encryption_version: number | null
          id: string
          is_active: boolean | null
          provider: string
          refresh_token: string | null
          refresh_token_encrypted: string | null
          token_expiry: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          access_token_encrypted?: string | null
          calendar_id?: string | null
          created_at?: string | null
          encryption_version?: number | null
          id?: string
          is_active?: boolean | null
          provider: string
          refresh_token?: string | null
          refresh_token_encrypted?: string | null
          token_expiry?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          access_token_encrypted?: string | null
          calendar_id?: string | null
          created_at?: string | null
          encryption_version?: number | null
          id?: string
          is_active?: boolean | null
          provider?: string
          refresh_token?: string | null
          refresh_token_encrypted?: string | null
          token_expiry?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      candidates: {
        Row: {
          created_at: string | null
          hr_decision: string | null
          id: string
          job_role_id: string | null
          notes: string | null
          overall_score: number | null
          resume_id: string | null
          stage: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          hr_decision?: string | null
          id?: string
          job_role_id?: string | null
          notes?: string | null
          overall_score?: number | null
          resume_id?: string | null
          stage?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          hr_decision?: string | null
          id?: string
          job_role_id?: string | null
          notes?: string | null
          overall_score?: number | null
          resume_id?: string | null
          stage?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_job_role_id_fkey"
            columns: ["job_role_id"]
            isOneToOne: false
            referencedRelation: "job_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          head_employee_id: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          head_employee_id?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          head_employee_id?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_head_employee_id_fkey"
            columns: ["head_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          created_at: string | null
          email_data: Json | null
          email_type: string
          error_message: string | null
          id: string
          resume_id: string
          retry_count: number | null
          scheduled_for: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email_data?: Json | null
          email_type: string
          error_message?: string | null
          id?: string
          resume_id: string
          retry_count?: number | null
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email_data?: Json | null
          email_type?: string
          error_message?: string | null
          id?: string
          resume_id?: string
          retry_count?: number | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_audit_logs: {
        Row: {
          action: string
          category: string
          created_at: string | null
          details: Json | null
          employee_id: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          action: string
          category: string
          created_at?: string | null
          details?: Json | null
          employee_id: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          category?: string
          created_at?: string | null
          details?: Json | null
          employee_id?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_audit_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_sentiment: {
        Row: {
          analyzed_at: string | null
          created_at: string | null
          employee_id: string
          engagement_score: number | null
          feedback_text: string | null
          id: string
          period_end: string
          period_start: string
          sentiment_score: number | null
          survey_id: string | null
          wellbeing_score: number | null
        }
        Insert: {
          analyzed_at?: string | null
          created_at?: string | null
          employee_id: string
          engagement_score?: number | null
          feedback_text?: string | null
          id?: string
          period_end: string
          period_start: string
          sentiment_score?: number | null
          survey_id?: string | null
          wellbeing_score?: number | null
        }
        Update: {
          analyzed_at?: string | null
          created_at?: string | null
          employee_id?: string
          engagement_score?: number | null
          feedback_text?: string | null
          id?: string
          period_end?: string
          period_start?: string
          sentiment_score?: number | null
          survey_id?: string | null
          wellbeing_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_sentiment_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_sentiment_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_skills: {
        Row: {
          certification_url: string | null
          certified: boolean | null
          created_at: string | null
          employee_id: string
          id: string
          last_assessed: string | null
          proficiency_level: string
          skill_id: string
          updated_at: string | null
          years_experience: number | null
        }
        Insert: {
          certification_url?: string | null
          certified?: boolean | null
          created_at?: string | null
          employee_id: string
          id?: string
          last_assessed?: string | null
          proficiency_level: string
          skill_id: string
          updated_at?: string | null
          years_experience?: number | null
        }
        Update: {
          certification_url?: string | null
          certified?: boolean | null
          created_at?: string | null
          employee_id?: string
          id?: string
          last_assessed?: string | null
          proficiency_level?: string
          skill_id?: string
          updated_at?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_skills_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_training: {
        Row: {
          certificate_url: string | null
          completed_at: string | null
          created_at: string | null
          employee_id: string
          id: string
          progress_percentage: number | null
          started_at: string | null
          status: string
          training_module_id: string
          updated_at: string | null
        }
        Insert: {
          certificate_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          progress_percentage?: number | null
          started_at?: string | null
          status?: string
          training_module_id: string
          updated_at?: string | null
        }
        Update: {
          certificate_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          progress_percentage?: number | null
          started_at?: string | null
          status?: string
          training_module_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_training_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_training_training_module_id_fkey"
            columns: ["training_module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string | null
          department: string | null
          department_id: string | null
          email: string
          employee_id: string
          full_name: string
          hire_date: string | null
          id: string
          phone: string | null
          position: string | null
          source: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          department_id?: string | null
          email: string
          employee_id: string
          full_name: string
          hire_date?: string | null
          id?: string
          phone?: string | null
          position?: string | null
          source?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          department_id?: string | null
          email?: string
          employee_id?: string
          full_name?: string
          hire_date?: string | null
          id?: string
          phone?: string | null
          position?: string | null
          source?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      encryption_keys: {
        Row: {
          created_at: string | null
          id: string
          key_name: string
          key_value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key_name: string
          key_value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key_name?: string
          key_value?: string
        }
        Relationships: []
      }
      feedback_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string | null
          description: string
          employee_id: string
          id: string
          priority: string
          resolution_notes: string | null
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string | null
          description: string
          employee_id: string
          id?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string | null
          description?: string
          employee_id?: string
          id?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_tickets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_feedback: {
        Row: {
          communication_rating: number | null
          created_at: string | null
          experience_rating: number | null
          feedback_text: string | null
          feedback_type: string
          id: string
          interview_id: string
          overall_impression: string | null
          rating: number | null
          submitted_at: string | null
          submitted_by: string | null
          technical_rating: number | null
        }
        Insert: {
          communication_rating?: number | null
          created_at?: string | null
          experience_rating?: number | null
          feedback_text?: string | null
          feedback_type: string
          id?: string
          interview_id: string
          overall_impression?: string | null
          rating?: number | null
          submitted_at?: string | null
          submitted_by?: string | null
          technical_rating?: number | null
        }
        Update: {
          communication_rating?: number | null
          created_at?: string | null
          experience_rating?: number | null
          feedback_text?: string | null
          feedback_type?: string
          id?: string
          interview_id?: string
          overall_impression?: string | null
          rating?: number | null
          submitted_at?: string | null
          submitted_by?: string | null
          technical_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_feedback_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_slots: {
        Row: {
          calendar_event_id: string | null
          created_at: string | null
          end_time: string
          id: string
          interview_id: string | null
          interviewer_id: string | null
          is_booked: boolean | null
          start_time: string
        }
        Insert: {
          calendar_event_id?: string | null
          created_at?: string | null
          end_time: string
          id?: string
          interview_id?: string | null
          interviewer_id?: string | null
          is_booked?: boolean | null
          start_time: string
        }
        Update: {
          calendar_event_id?: string | null
          created_at?: string | null
          end_time?: string
          id?: string
          interview_id?: string | null
          interviewer_id?: string | null
          is_booked?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_slots_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          interview_completed: boolean | null
          resume_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          interview_completed?: boolean | null
          resume_id: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          interview_completed?: boolean | null
          resume_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_tokens_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          ai_feedback: Json | null
          ai_score: number | null
          ai_summary: string | null
          answers: Json | null
          audio_url: string | null
          candidate_name: string
          communication_score: number | null
          completed_at: string | null
          completed_notification_sent: boolean | null
          conducted_by: string | null
          confidence_score: number | null
          created_at: string | null
          cultural_fit_score: number | null
          duration_seconds: number | null
          emotion_analysis: Json | null
          engagement_metrics: Json | null
          feedback: string | null
          id: string
          interview_link: string | null
          interview_type: string | null
          question_analysis: Json | null
          questions: Json | null
          resume_id: string | null
          scheduled_at: string | null
          scheduled_for: string | null
          sentiment_analysis: Json | null
          status: string | null
          technical_score: number | null
          transcript: Json | null
          transcript_text: string | null
          video_analytics: Json | null
          video_url: string | null
        }
        Insert: {
          ai_feedback?: Json | null
          ai_score?: number | null
          ai_summary?: string | null
          answers?: Json | null
          audio_url?: string | null
          candidate_name: string
          communication_score?: number | null
          completed_at?: string | null
          completed_notification_sent?: boolean | null
          conducted_by?: string | null
          confidence_score?: number | null
          created_at?: string | null
          cultural_fit_score?: number | null
          duration_seconds?: number | null
          emotion_analysis?: Json | null
          engagement_metrics?: Json | null
          feedback?: string | null
          id?: string
          interview_link?: string | null
          interview_type?: string | null
          question_analysis?: Json | null
          questions?: Json | null
          resume_id?: string | null
          scheduled_at?: string | null
          scheduled_for?: string | null
          sentiment_analysis?: Json | null
          status?: string | null
          technical_score?: number | null
          transcript?: Json | null
          transcript_text?: string | null
          video_analytics?: Json | null
          video_url?: string | null
        }
        Update: {
          ai_feedback?: Json | null
          ai_score?: number | null
          ai_summary?: string | null
          answers?: Json | null
          audio_url?: string | null
          candidate_name?: string
          communication_score?: number | null
          completed_at?: string | null
          completed_notification_sent?: boolean | null
          conducted_by?: string | null
          confidence_score?: number | null
          created_at?: string | null
          cultural_fit_score?: number | null
          duration_seconds?: number | null
          emotion_analysis?: Json | null
          engagement_metrics?: Json | null
          feedback?: string | null
          id?: string
          interview_link?: string | null
          interview_type?: string | null
          question_analysis?: Json | null
          questions?: Json | null
          resume_id?: string | null
          scheduled_at?: string | null
          scheduled_for?: string | null
          sentiment_analysis?: Json | null
          status?: string | null
          technical_score?: number | null
          transcript?: Json | null
          transcript_text?: string | null
          video_analytics?: Json | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          department: string
          description: string | null
          experience_required: string | null
          id: string
          location: string | null
          requirements: Json | null
          salary_range: string | null
          status: string
          title: string
          updated_at: string | null
          urgency: string
          vacancies: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          department: string
          description?: string | null
          experience_required?: string | null
          id?: string
          location?: string | null
          requirements?: Json | null
          salary_range?: string | null
          status?: string
          title: string
          updated_at?: string | null
          urgency?: string
          vacancies?: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          department?: string
          description?: string | null
          experience_required?: string | null
          id?: string
          location?: string | null
          requirements?: Json | null
          salary_range?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          urgency?: string
          vacancies?: number
        }
        Relationships: []
      }
      leave_balance: {
        Row: {
          casual_leave: number
          created_at: string | null
          earned_leave: number
          employee_id: string
          id: string
          maternity_leave: number
          paternity_leave: number
          sick_leave: number
          unpaid_leave: number
          updated_at: string | null
          year: number
        }
        Insert: {
          casual_leave?: number
          created_at?: string | null
          earned_leave?: number
          employee_id: string
          id?: string
          maternity_leave?: number
          paternity_leave?: number
          sick_leave?: number
          unpaid_leave?: number
          updated_at?: string | null
          year?: number
        }
        Update: {
          casual_leave?: number
          created_at?: string | null
          earned_leave?: number
          employee_id?: string
          id?: string
          maternity_leave?: number
          paternity_leave?: number
          sick_leave?: number
          unpaid_leave?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          days_count: number
          employee_id: string
          end_date: string
          id: string
          leave_type: string
          reason: string
          rejection_reason: string | null
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days_count: number
          employee_id: string
          end_date: string
          id?: string
          leave_type: string
          reason: string
          rejection_reason?: string | null
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days_count?: number
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string
          rejection_reason?: string | null
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_insights: {
        Row: {
          action_items: Json | null
          affected_employees: string[] | null
          affected_projects: string[] | null
          confidence_score: number | null
          created_at: string | null
          description: string
          id: string
          insight_type: string
          is_actioned: boolean | null
          is_read: boolean | null
          manager_id: string
          priority: string
          title: string
        }
        Insert: {
          action_items?: Json | null
          affected_employees?: string[] | null
          affected_projects?: string[] | null
          confidence_score?: number | null
          created_at?: string | null
          description: string
          id?: string
          insight_type: string
          is_actioned?: boolean | null
          is_read?: boolean | null
          manager_id: string
          priority?: string
          title: string
        }
        Update: {
          action_items?: Json | null
          affected_employees?: string[] | null
          affected_projects?: string[] | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string
          id?: string
          insight_type?: string
          is_actioned?: boolean | null
          is_read?: boolean | null
          manager_id?: string
          priority?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "manager_insights_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          message_id: string
          reaction: string
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          message_id: string
          reaction: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          message_id?: string
          reaction?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "team_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          employee_id: string
          id: string
          is_read: boolean
          message: string
          priority: string
          title: string
          type: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          is_read?: boolean
          message: string
          priority?: string
          title: string
          type: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          is_read?: boolean
          message?: string
          priority?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      payslips: {
        Row: {
          created_at: string | null
          deductions: number
          employee_id: string
          file_url: string | null
          gross_salary: number
          id: string
          month: number
          net_salary: number
          payment_date: string | null
          salary_record_id: string | null
          status: string
          year: number
        }
        Insert: {
          created_at?: string | null
          deductions?: number
          employee_id: string
          file_url?: string | null
          gross_salary: number
          id?: string
          month: number
          net_salary: number
          payment_date?: string | null
          salary_record_id?: string | null
          status?: string
          year: number
        }
        Update: {
          created_at?: string | null
          deductions?: number
          employee_id?: string
          file_url?: string | null
          gross_salary?: number
          id?: string
          month?: number
          net_salary?: number
          payment_date?: string | null
          salary_record_id?: string | null
          status?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "payslips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_salary_record_id_fkey"
            columns: ["salary_record_id"]
            isOneToOne: false
            referencedRelation: "salary_records"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          comments: string | null
          created_at: string | null
          employee_id: string
          evaluated_by: string | null
          id: string
          metric_type: string
          period_end: string
          period_start: string
          score: number
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          employee_id: string
          evaluated_by?: string | null
          id?: string
          metric_type: string
          period_end: string
          period_start: string
          score: number
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          employee_id?: string
          evaluated_by?: string | null
          id?: string
          metric_type?: string
          period_end?: string
          period_start?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_audit_logs: {
        Row: {
          automation_triggered: boolean | null
          changed_at: string | null
          changed_by: string | null
          from_stage: string | null
          id: string
          notes: string | null
          resume_id: string
          to_stage: string
        }
        Insert: {
          automation_triggered?: boolean | null
          changed_at?: string | null
          changed_by?: string | null
          from_stage?: string | null
          id?: string
          notes?: string | null
          resume_id: string
          to_stage: string
        }
        Update: {
          automation_triggered?: boolean | null
          changed_at?: string | null
          changed_by?: string | null
          from_stage?: string | null
          id?: string
          notes?: string | null
          resume_id?: string
          to_stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_audit_logs_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name: string
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          priority: string
          project_id: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string
          project_id: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          progress: number
          source: string
          start_date: string
          status: string
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          progress?: number
          source?: string
          start_date: string
          status?: string
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          progress?: number
          source?: string
          start_date?: string
          status?: string
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          identifier: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          identifier: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      resource_allocations: {
        Row: {
          allocation_percentage: number
          created_at: string | null
          employee_id: string
          end_date: string | null
          id: string
          project_id: string
          role: string | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          allocation_percentage: number
          created_at?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          project_id: string
          role?: string | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          allocation_percentage?: number
          created_at?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          project_id?: string
          role?: string | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_allocations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_uploads: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_log: Json | null
          failed_files: number
          id: string
          job_role_id: string | null
          processed_files: number
          status: string
          total_files: number
          uploaded_by: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_log?: Json | null
          failed_files?: number
          id?: string
          job_role_id?: string | null
          processed_files?: number
          status?: string
          total_files?: number
          uploaded_by?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_log?: Json | null
          failed_files?: number
          id?: string
          job_role_id?: string | null
          processed_files?: number
          status?: string
          total_files?: number
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_uploads_job_role_id_fkey"
            columns: ["job_role_id"]
            isOneToOne: false
            referencedRelation: "job_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          ai_analysis: Json | null
          ai_score: number | null
          automation_enabled: boolean | null
          candidate_name: string
          created_at: string | null
          email: string
          file_url: string | null
          hr_notes: string | null
          id: string
          interview_completed_email_sent: boolean | null
          interview_invitation_sent: boolean | null
          interview_scheduled_at: string | null
          interview_scheduled_email_sent: boolean | null
          job_role_id: string | null
          manual_override: boolean | null
          parsed_data: Json | null
          phone: string | null
          pipeline_stage: string | null
          position_applied: string | null
          rejection_email_sent: boolean | null
          screening_status: string | null
          selection_email_sent: boolean | null
          source: string
          status: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          ai_score?: number | null
          automation_enabled?: boolean | null
          candidate_name: string
          created_at?: string | null
          email: string
          file_url?: string | null
          hr_notes?: string | null
          id?: string
          interview_completed_email_sent?: boolean | null
          interview_invitation_sent?: boolean | null
          interview_scheduled_at?: string | null
          interview_scheduled_email_sent?: boolean | null
          job_role_id?: string | null
          manual_override?: boolean | null
          parsed_data?: Json | null
          phone?: string | null
          pipeline_stage?: string | null
          position_applied?: string | null
          rejection_email_sent?: boolean | null
          screening_status?: string | null
          selection_email_sent?: boolean | null
          source?: string
          status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          ai_score?: number | null
          automation_enabled?: boolean | null
          candidate_name?: string
          created_at?: string | null
          email?: string
          file_url?: string | null
          hr_notes?: string | null
          id?: string
          interview_completed_email_sent?: boolean | null
          interview_invitation_sent?: boolean | null
          interview_scheduled_at?: string | null
          interview_scheduled_email_sent?: boolean | null
          job_role_id?: string | null
          manual_override?: boolean | null
          parsed_data?: Json | null
          phone?: string | null
          pipeline_stage?: string | null
          position_applied?: string | null
          rejection_email_sent?: boolean | null
          screening_status?: string | null
          selection_email_sent?: boolean | null
          source?: string
          status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resumes_job_role_id_fkey"
            columns: ["job_role_id"]
            isOneToOne: false
            referencedRelation: "job_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_records: {
        Row: {
          allowances: number | null
          base_salary: number
          created_at: string | null
          deductions: number | null
          effective_from: string
          effective_to: string | null
          employee_id: string
          id: string
          increment_amount: number | null
          increment_percentage: number | null
          is_current: boolean
          net_salary: number
        }
        Insert: {
          allowances?: number | null
          base_salary: number
          created_at?: string | null
          deductions?: number | null
          effective_from: string
          effective_to?: string | null
          employee_id: string
          id?: string
          increment_amount?: number | null
          increment_percentage?: number | null
          is_current?: boolean
          net_salary: number
        }
        Update: {
          allowances?: number | null
          base_salary?: number
          created_at?: string | null
          deductions?: number | null
          effective_from?: string
          effective_to?: string | null
          employee_id?: string
          id?: string
          increment_amount?: number | null
          increment_percentage?: number | null
          is_current?: boolean
          net_salary?: number
        }
        Relationships: [
          {
            foreignKeyName: "salary_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          id: string
          responses: Json
          submitted_at: string | null
          survey_id: string
          user_id: string
        }
        Insert: {
          id?: string
          responses: Json
          submitted_at?: string | null
          survey_id: string
          user_id: string
        }
        Update: {
          id?: string
          responses?: Json
          submitted_at?: string | null
          survey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          expires_at: string | null
          id: string
          questions: Json
          status: string | null
          target_roles: Database["public"]["Enums"]["app_role"][] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          expires_at?: string | null
          id?: string
          questions: Json
          status?: string | null
          target_roles?: Database["public"]["Enums"]["app_role"][] | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          questions?: Json
          status?: string | null
          target_roles?: Database["public"]["Enums"]["app_role"][] | null
          title?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          is_active: boolean
          joined_at: string
          left_at: string | null
          role: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          is_active?: boolean
          joined_at?: string
          left_at?: string | null
          role?: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          left_at?: string | null
          role?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_messages: {
        Row: {
          created_at: string | null
          id: string
          is_pinned: boolean | null
          message: string
          message_type: string
          metadata: Json | null
          sender_id: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          message: string
          message_type?: string
          metadata?: Json | null
          sender_id: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          message?: string
          message_type?: string
          metadata?: Json | null
          sender_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_messages_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          department_id: string | null
          description: string | null
          id: string
          name: string
          team_leader_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          name: string
          team_leader_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          name?: string
          team_leader_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_team_leader_id_fkey"
            columns: ["team_leader_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          duration_hours: number | null
          id: string
          is_mandatory: boolean
          title: string
          url: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_mandatory?: boolean
          title: string
          url?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_mandatory?: boolean
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      are_tokens_encrypted: {
        Args: { integration_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_identifier: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_interview_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_team_leader: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      validate_interview_token: {
        Args: { input_token: string }
        Returns: {
          candidate_name: string
          is_valid: boolean
          job_title: string
          resume_id: string
        }[]
      }
    }
    Enums: {
      app_role: "hr" | "manager" | "employee" | "intern" | "senior_manager"
      pipeline_stage_enum:
        | "screening"
        | "selected"
        | "interview_scheduled"
        | "interviewed"
        | "hr_round"
        | "technical_round"
        | "final_round"
        | "offer_pending"
        | "offer_sent"
        | "accepted"
        | "rejected"
        | "withdrawn"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["hr", "manager", "employee", "intern", "senior_manager"],
      pipeline_stage_enum: [
        "screening",
        "selected",
        "interview_scheduled",
        "interviewed",
        "hr_round",
        "technical_round",
        "final_round",
        "offer_pending",
        "offer_sent",
        "accepted",
        "rejected",
        "withdrawn",
      ],
    },
  },
} as const
