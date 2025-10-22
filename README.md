# SynchroHR – Intelligent HR Management System

SynchroHR is an **AI‑powered Human Resource Management System** designed for modern organizations to automate recruitment, conduct AI‑driven video interviews, perform sentiment and emotion analysis, optimize workforce analytics in real time, and manage seamless onboarding and multi-user role-based access.

---

## 🚀 Features

🔐 Authentication & Access Control
Secure multi-role login (Management Admin, HR, Manager, Employee, Intern, Senior Manager)

Email/password with RBAC

Fine-grained Row Level Security via Supabase

Protected client-side & server routes per role

👥 User Roles & Dashboards
Six core roles, each with tailored dashboards, navigation, and permissions

Management/Admin: full control, analytics, user provisioning

HR Recruiter: candidate tracking, compliance, interview management

Manager/Senior Manager: team analytics, goal setting, reviews

Employee: self-service workspace, leave, performance, growth

Intern: onboarding, learning modules, progress tracking

🤖 AI Automation
AI Resume Screening: Bulk CV parsing, ATS scoring with customizable criteria

AI Voice Interviews: Automated question/answer rounds using real-time AI, with sentiment/emotion analysis

AI Interview Analysis: Multimodal assessment (audio, video, text), auto-generated interview reports

AI Career Coach: Personalized learning, growth, and upskilling guidance using Lovable AI

Predictive Analytics: Attrition prediction, team performance insights, and auto-generated recommendations

📊 Recruitment & Hiring
Job boards, applications portal, resume parsing

Candidate pipeline visualization: track every stage

Interview scheduling, token generation, bulk upload

Automated email invitations, selection/rejection notifications

👔 Employee Management
Employee profile system with skills, history, department data

Admin, HR, and Manager UI for role/department management

Skill tracking, search, and organization-wide filtering

🎯 Onboarding Automation
Workflow generator for new hires

Task assignment modules for HR, managers, employees

Equipment/training/document setup tracking

Dedicated dashboard interfaces for onboarding

📈 Performance Management
Review system: periodic and on-demand feedback

Performance wall for ranking and recognition

Goal setting, pulse surveys, badge/award modules

⏰ Attendance & Time
Real-time attendance, leave request workflows

Approval/rejection tracking, leave analytics

Team-wise time logging integration

💰 Payroll & Compensation
Salary data access per role, payslip download

Manager dashboard for salary insights and budgeting

📧 Email Automation
Email queue integration for event-triggered mail

Automated delivery for interview, onboarding, selection/rejection, password reset, and verification workflows

📊 Advanced Analytics & Reporting
Real-time dashboards for team performance, recruitment, department health

Predictive analytics (attrition, growth)

KPI builder and automated report generator

🎓 Learning & Development
Employee upskilling learning paths

Mentorship assignments and tracking

Career growth roadmap and training modules

🔧 System Features
Demo mode toggle with simulated data

Error boundary logging, real-time update notifications

Mobile-first, responsive design with dark/light modes

Floating AI chatbot

📁 Data Management
Bulk data upload, seed data generator for testing/demo

Export and analytics filtering (demo vs. real data)

---

## 🧠 Tech Stack

| Layer       | Technology                                      |
|-------------|------------------------------------------------|
| Frontend    | React + TypeScript + Vite                       |
| Styling     | Tailwind CSS + shadcn/ui                        |
| Backend     | Supabase (Auth, DB, Edge Functions)             |
| AI Layer    | OpenAI-compatible endpoints for parsing & analysis |
| Video       | WebRTC / Video APIs for interviews               |
| Email       | Resend API                                      |
| Hosting     | Vercel                                          |

---

Frontend
React 18.3 + TypeScript – Robust, scalable UI

Vite – Fast build tool & dev server

Tailwind CSS – Utility-first styling framework

Shadcn UI – Accessible UI component library

Framer Motion – Advanced animations

React Router DOM – SPA/MPA routing

TanStack React Query – Smart, cached data fetching & sync

Lucide React – Icon system

Recharts – Powerful data visualizations

React Hook Form + Zod – Flexible, type-safe form validation

Backend & Infrastructure
Supabase (via Lovable Cloud)

PostgreSQL Database (scalable relational DB)

Supabase Auth (login, RBAC, tokens)

Row Level Security (fine-grained access)

Edge Functions (Deno runtime, custom logic)

Storage buckets for files & resumes

Real-time data subscriptions

APIs & Integrations
Lovable AI API – AI interviews, career coaching, analytics

Resend API – Automated email delivery (invitations, notifications, etc.)

OpenAI API (optional) – Extended AI capabilities for resume parsing & interview analysis

Hosting & Automation
Vercel – Serverless hosting, CI/CD, instant preview deployments

Service              |  Why & How Used                                    
---------------------+----------------------------------------------------
Supabase Database    |  All core data, RLS, edge functions, auth          
Supabase Storage     |  Secure file storage for resumes, docs             
Supabase Edge Funcs  |  Custom backend logic, event hooks                 
Resend API           |  Automated mail for recruitment & onboarding       
Lovable AI Gateway   |  All AI-driven features, analytics, recommendations


🗄️ Database Schema
Table Name                              |  Purpose                                        
----------------------------------------+-------------------------------------------------
profiles, user_roles                    |  Users, authentication, access control          
employees, departments                  |  Employee records, department structure         
jobs, job_applications                  |  Recruitment process, candidate tracking        
resumes, interview_tokens               |  Document uploads, interview security/tokens    
interviews, interview_reports           |  All stages and outcomes of AI-driven interviews
performance_reviews, pulse_surveys      |  Feedback, recognition, analytics               
onboarding_workflows, onboarding_tasks  |  HR onboarding automation modules               
career_goals, mentorship                |  Guided employee growth and learning modules    
email_queue, error_logs                 |  System automation, notification, monitoring    


## ⚙️ Environment Variables

Create a `.env` file in the project root:

Supabase
VITE_SUPABASE_URL=https://wapydsvgltbhkvbfaybp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-public-key>

Email + Auth
RESEND_API_KEY=<your-resend-key>



(Use `VITE_` prefixes for client‑side variables.)

---

## 🧩 Setup & Run Locally
git clone https://github.com/DhivyaBalakumar/SynchroHR.git
cd SynchroHR
npm install
npm run dev

Visit [[**http://localhost:5173/**](http://localhost:5173/)](http://localhost:5173/).

---

## 🏁 Deployment

Deployed with **Vercel**  
Custom domain: [synchro-hr.vercel.app](https://synchro-hr.vercel.app/)

Steps:
1. Set environment variables in Vercel.
2. Push to `main` – triggers auto deploy.
3. Verify routing and API integrations.

---

## 💡 Future Enhancements
- Advanced organizational HR analytics  
- Enhanced role‑specific dashboards and OKR tracking  

---

## 👩‍💻 Hackathon Summary

**Goal:** Build an end-to-end AI-driven HRMS with bulk resume screening, AI video interviews with emotion analysis, multi-user role-based access, onboarding automation, and predictive HR analytics.

**Core Differentiator:** AI interviewing combined with seamless recruitment-to-onboarding automation.

---

🛡️ Security & Scalability
All features built for production with enterprise-grade security (Supabase RLS, RBAC, encrypted storage, secure email, audited edge logic) and horizontal scalability for organizations of any size.

---

📚 Documentation
For API usage and advanced configurations, see /docs directory in the repo.



## 🏆 Author

**Dhivya Balakumar**  
Creator & Developer – SynchroHR  
Contact: [dhivyabalakumar28@gmail.com](mailto:dhivyabalakumar28@gmail.com)
