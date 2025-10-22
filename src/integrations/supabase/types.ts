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
          created_at: string
          date: string
          employee_id: string
          id: string
          notes: string | null
          sign_in_time: string | null
          sign_out_time: string | null
          status: string
        }
        Insert: {
          created_at?: string
          date: string
          employee_id: string
          id?: string
          notes?: string | null
          sign_in_time?: string | null
          sign_out_time?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          notes?: string | null
          sign_in_time?: string | null
          sign_out_time?: string | null
          status?: string
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
          created_at: string
          error_message: string
          error_type: string
          id: string
          process_name: string
          resolved: boolean
          stack_trace: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          error_message: string
          error_type: string
          id?: string
          process_name: string
          resolved?: boolean
          stack_trace?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          error_message?: string
          error_type?: string
          id?: string
          process_name?: string
          resolved?: boolean
          stack_trace?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          manager_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          body: string
          created_at: string
          error_message: string | null
          id: string
          recipient_email: string
          retry_count: number
          sent_at: string | null
          status: Database["public"]["Enums"]["email_status"]
          subject: string
          template_type: string | null
        }
        Insert: {
          body: string
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email: string
          retry_count?: number
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_status"]
          subject: string
          template_type?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          retry_count?: number
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_status"]
          subject?: string
          template_type?: string | null
        }
        Relationships: []
      }
      employee_skills: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          proficiency_level: number | null
          skill_id: string
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          proficiency_level?: number | null
          skill_id: string
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          proficiency_level?: number | null
          skill_id?: string
          updated_at?: string
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
      employees: {
        Row: {
          created_at: string
          department_id: string | null
          email: string
          employee_id: string
          employee_sentiment: Json | null
          employment_status: Database["public"]["Enums"]["employment_status"]
          full_name: string
          hire_date: string
          id: string
          manager_id: string | null
          performance_metrics: Json | null
          phone: string | null
          position: string
          salary_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          email: string
          employee_id: string
          employee_sentiment?: Json | null
          employment_status?: Database["public"]["Enums"]["employment_status"]
          full_name: string
          hire_date: string
          id?: string
          manager_id?: string | null
          performance_metrics?: Json | null
          phone?: string | null
          position: string
          salary_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          email?: string
          employee_id?: string
          employee_sentiment?: Json | null
          employment_status?: Database["public"]["Enums"]["employment_status"]
          full_name?: string
          hire_date?: string
          id?: string
          manager_id?: string | null
          performance_metrics?: Json | null
          phone?: string | null
          position?: string
          salary_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_feedback: {
        Row: {
          comments: string | null
          communication_score: number | null
          created_at: string
          cultural_fit_score: number | null
          id: string
          interview_id: string
          interviewer_id: string | null
          overall_rating: number | null
          recommendation: string | null
          strengths: string | null
          technical_score: number | null
          weaknesses: string | null
        }
        Insert: {
          comments?: string | null
          communication_score?: number | null
          created_at?: string
          cultural_fit_score?: number | null
          id?: string
          interview_id: string
          interviewer_id?: string | null
          overall_rating?: number | null
          recommendation?: string | null
          strengths?: string | null
          technical_score?: number | null
          weaknesses?: string | null
        }
        Update: {
          comments?: string | null
          communication_score?: number | null
          created_at?: string
          cultural_fit_score?: number | null
          id?: string
          interview_id?: string
          interviewer_id?: string | null
          overall_rating?: number | null
          recommendation?: string | null
          strengths?: string | null
          technical_score?: number | null
          weaknesses?: string | null
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
      interviews: {
        Row: {
          ai_evaluation: Json | null
          candidate_email: string
          candidate_name: string
          created_at: string
          feedback: Json | null
          id: string
          interview_type: string | null
          meeting_link: string | null
          overall_score: number | null
          position: string
          recording_url: string | null
          resume_id: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["interview_status"]
          transcript: string | null
          updated_at: string
        }
        Insert: {
          ai_evaluation?: Json | null
          candidate_email: string
          candidate_name: string
          created_at?: string
          feedback?: Json | null
          id?: string
          interview_type?: string | null
          meeting_link?: string | null
          overall_score?: number | null
          position: string
          recording_url?: string | null
          resume_id?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["interview_status"]
          transcript?: string | null
          updated_at?: string
        }
        Update: {
          ai_evaluation?: Json | null
          candidate_email?: string
          candidate_name?: string
          created_at?: string
          feedback?: Json | null
          id?: string
          interview_type?: string | null
          meeting_link?: string | null
          overall_score?: number | null
          position?: string
          recording_url?: string | null
          resume_id?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["interview_status"]
          transcript?: string | null
          updated_at?: string
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
          created_at: string
          department: string | null
          description: string | null
          id: string
          requirements: Json | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          description?: string | null
          id?: string
          requirements?: Json | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          description?: string | null
          id?: string
          requirements?: Json | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leave_balance: {
        Row: {
          annual_leave: number
          casual_leave: number
          created_at: string
          employee_id: string
          id: string
          sick_leave: number
          updated_at: string
        }
        Insert: {
          annual_leave?: number
          casual_leave?: number
          created_at?: string
          employee_id: string
          id?: string
          sick_leave?: number
          updated_at?: string
        }
        Update: {
          annual_leave?: number
          casual_leave?: number
          created_at?: string
          employee_id?: string
          id?: string
          sick_leave?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_balance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          created_at: string
          days_count: number
          employee_id: string
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_status"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string
          days_count: number
          employee_id: string
          end_date: string
          id?: string
          leave_type: string
          reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string
          days_count?: number
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
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
          created_at: string
          description: string | null
          id: string
          insight_type: string
          is_actioned: boolean
          is_read: boolean
          manager_id: string
          priority: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          insight_type: string
          is_actioned?: boolean
          is_read?: boolean
          manager_id: string
          priority?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          insight_type?: string
          is_actioned?: boolean
          is_read?: boolean
          manager_id?: string
          priority?: string | null
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
      pipeline_audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          performed_by: string | null
          resume_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string | null
          resume_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string | null
          resume_id?: string | null
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
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          project_id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
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
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          manager_id: string | null
          name: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          ai_analysis: Json | null
          ai_score: number | null
          candidate_name: string
          created_at: string
          email: string
          file_url: string | null
          id: string
          job_role_id: string | null
          parsed_data: Json | null
          phone: string | null
          position_applied: string
          screening_status: Database["public"]["Enums"]["screening_status"]
          source: string
          updated_at: string
        }
        Insert: {
          ai_analysis?: Json | null
          ai_score?: number | null
          candidate_name: string
          created_at?: string
          email: string
          file_url?: string | null
          id?: string
          job_role_id?: string | null
          parsed_data?: Json | null
          phone?: string | null
          position_applied: string
          screening_status?: Database["public"]["Enums"]["screening_status"]
          source?: string
          updated_at?: string
        }
        Update: {
          ai_analysis?: Json | null
          ai_score?: number | null
          candidate_name?: string
          created_at?: string
          email?: string
          file_url?: string | null
          id?: string
          job_role_id?: string | null
          parsed_data?: Json | null
          phone?: string | null
          position_applied?: string
          screening_status?: Database["public"]["Enums"]["screening_status"]
          source?: string
          updated_at?: string
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
          created_at: string
          deductions: number | null
          effective_date: string
          employee_id: string
          id: string
          increment_amount: number | null
          net_salary: number
          payment_date: string | null
        }
        Insert: {
          allowances?: number | null
          base_salary: number
          created_at?: string
          deductions?: number | null
          effective_date: string
          employee_id: string
          id?: string
          increment_amount?: number | null
          net_salary: number
          payment_date?: string | null
        }
        Update: {
          allowances?: number | null
          base_salary?: number
          created_at?: string
          deductions?: number | null
          effective_date?: string
          employee_id?: string
          id?: string
          increment_amount?: number | null
          net_salary?: number
          payment_date?: string | null
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
          category: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          manager_id: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          manager_id: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          manager_id?: string
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
            foreignKeyName: "team_members_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "hr"
        | "manager"
        | "senior_manager"
        | "employee"
        | "intern"
      email_status: "pending" | "sent" | "failed"
      employment_status: "active" | "on_leave" | "terminated" | "probation"
      interview_status: "scheduled" | "in_progress" | "completed" | "cancelled"
      leave_status: "pending" | "approved" | "rejected" | "cancelled"
      screening_status: "pending" | "selected" | "rejected"
      task_status: "todo" | "in_progress" | "completed" | "cancelled"
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
      app_role: [
        "admin",
        "hr",
        "manager",
        "senior_manager",
        "employee",
        "intern",
      ],
      email_status: ["pending", "sent", "failed"],
      employment_status: ["active", "on_leave", "terminated", "probation"],
      interview_status: ["scheduled", "in_progress", "completed", "cancelled"],
      leave_status: ["pending", "approved", "rejected", "cancelled"],
      screening_status: ["pending", "selected", "rejected"],
      task_status: ["todo", "in_progress", "completed", "cancelled"],
    },
  },
} as const
