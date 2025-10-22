# SynchroHR Test Suite Documentation

Comprehensive test specifications for the SynchroHR AI-Powered Recruitment Platform.

## 📋 Test Coverage Overview

This test suite documents the expected behavior and test scenarios for all critical features of SynchroHR.

### Component Test Specifications
- ✅ **Resume Screening** - AI-powered resume analysis and ATS scoring
- ✅ **Interview Portal** - Video interview system with AI question generation
- ✅ **Authentication** - User management and role-based access
- ✅ **Demo Mode Filtering** - Production vs demo data separation

### Integration Test Specifications
- ✅ **Recruitment Flow** - End-to-end candidate pipeline
- ✅ **Email Automation** - Automated email notifications
- ✅ **Interview Scheduling** - Automated interview booking system

### Utility Tests
- ✅ **Validation** - Email, data structure, and ATS calculations
- ✅ **Edge Functions** - Supabase serverless function specifications

## 🎯 Key Test Scenarios

### 1. AI Resume Screening Pipeline

**Expected Behavior:**
```typescript
// Given a resume with candidate data
const resume = {
  candidate_name: "John Doe",
  email: "john@example.com",
  position_applied: "Senior Engineer",
  source: "real"
};

// When AI screening is performed
// Then ATS score is calculated as:
atsScore = (skillsMatch * 0.4) + (experienceMatch * 0.35) + (educationMatch * 0.25)

// If ATS >= 75: Status = "selected", send selection email, schedule interview
// If ATS < 75: Status = "rejected", send rejection email
```

**Test Cases:**
- ✅ Resume with ATS 85 → Selected → Email sent → Interview scheduled
- ✅ Resume with ATS 65 → Rejected → Rejection email sent
- ✅ Demo data → Skipped from email/interview automation
- ✅ Real data → Full pipeline processing

### 2. Interview System

**Expected Behavior:**
```typescript
// Token Generation
const token = generateSecureToken(); // 12+ characters
const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

// Interview Link
const interviewLink = `${appUrl}/interview/login?token=${token}`;

// Question Generation
const questions = await generateQuestions({
  jobRole: "Software Engineer",
  count: 5,
  difficulty: "mid-level"
});

// Video Recording
const recording = {
  video: videoBlob,
  audio: audioBlob,
  duration: recordingDuration
};
```

**Test Cases:**
- ✅ Token validation before interview access
- ✅ Camera/microphone permissions requested
- ✅ 5 AI-generated job-specific questions
- ✅ Video+audio recording uploaded to Supabase storage
- ✅ Completion email sent automatically

### 3. Demo Mode Filtering

**Expected Behavior:**
```typescript
// Production Mode (isDemoMode = false)
const productionData = allData.filter(item => item.source !== 'demo');
// Result: Only shows real applicants

// Demo Mode (isDemoMode = true)
const demoData = allData; // No filtering
// Result: Shows both demo and real data
```

**Test Cases:**
- ✅ Toggle to production → All demo data hidden
- ✅ Toggle to demo → Both data types visible
- ✅ Database queries exclude demo in production
- ✅ Production banner displays when active

### 4. Email Automation

**Expected Behavior:**
```typescript
// Selection Email
if (candidate.status === 'selected' && candidate.source === 'real') {
  await sendSelectionEmail({
    to: candidate.email,
    name: candidate.candidate_name,
    jobTitle: candidate.position_applied,
    interviewLink: generatedLink
  });
}

// Rejection Email
if (candidate.status === 'rejected' && candidate.source === 'real') {
  await sendRejectionEmail({
    to: candidate.email,
    name: candidate.candidate_name,
    jobTitle: candidate.position_applied
  });
}

// Interview Completion Email
if (interview.status === 'completed') {
  await sendCompletionEmail({
    to: candidate.email,
    name: candidate.candidate_name
  });
}
```

**Test Cases:**
- ✅ Selection email sent immediately after AI approval
- ✅ Rejection email sent for low ATS scores
- ✅ Interview invitation sent after scheduling
- ✅ Completion confirmation sent after interview
- ✅ No emails sent for demo data

## 🧪 Running Tests

### Local Testing (External Environment Required)

Since Lovable uses a constrained testing environment, comprehensive testing requires:

```bash
# 1. Export project to GitHub
# 2. Clone locally
git clone https://github.com/your-repo/synchrohr.git
cd synchrohr

# 3. Install dependencies
npm install

# 4. Run tests
npm test

# 5. Run with coverage
npm test -- --coverage

# 6. Run specific test
npm test -- ResumeScreening
```

### Testing Edge Functions

Edge functions run on Supabase in Deno runtime:

```bash
# Using Supabase CLI
supabase functions serve
supabase functions deploy ai-resume-screening
supabase functions invoke ai-resume-screening --body '{"resume_id":"test-123"}'
```

## 📊 Validation Rules

### ATS Score Calculation
```typescript
function calculateATS(skills: number, experience: number, education: number): number {
  return Math.round(
    (skills * 0.4) + 
    (experience * 0.35) + 
    (education * 0.25)
  );
}

// Examples:
calculateATS(90, 85, 80) = 86  // Selected
calculateATS(75, 75, 75) = 75  // Selected (threshold)
calculateATS(70, 70, 70) = 70  // Rejected
```

### Email Validation
```typescript
function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Valid: test@example.com, user+tag@domain.co.uk
// Invalid: @example.com, user@, notanemail
```

### Status Transitions
```
Valid Flows:
pending → selected → interview_scheduled → interviewed
pending → rejected

Invalid Flows:
rejected → selected (cannot un-reject)
interviewed → pending (cannot go backwards)
```

## 🔍 Critical Test Scenarios

### Scenario 1: High-Quality Candidate
```
Input:
- Skills Match: 95%
- Experience Match: 90%
- Education Match: 85%

Expected Output:
- ATS Score: 91
- Status: "selected"
- Selection Email: Sent
- Interview: Scheduled within 1 hour
- HR Notification: Sent
```

### Scenario 2: Low-Quality Candidate  
```
Input:
- Skills Match: 60%
- Experience Match: 65%
- Education Match: 55%

Expected Output:
- ATS Score: 61
- Status: "rejected"
- Rejection Email: Sent
- Interview: Not scheduled
```

### Scenario 3: Demo Data
```
Input:
- Source: "demo"
- All other data present

Expected Output:
- AI Analysis: Performed
- Emails: NOT sent
- Interview: NOT scheduled
- Visible only in demo mode
```

## 🛠️ Manual Testing Checklist

### Authentication Flow
- [ ] Sign up with HR role
- [ ] Sign up with manager role
- [ ] Sign up with employee role
- [ ] Sign in with valid credentials
- [ ] Sign in with invalid credentials (should fail)
- [ ] Sign out and verify session cleared
- [ ] Protected routes redirect to login

### Resume Screening
- [ ] Upload resume via Job Application form
- [ ] View pending resumes in HR dashboard
- [ ] Click "Run AI Screening" on single resume
- [ ] Verify AI score and ATS score displayed
- [ ] Click "Run AI Bulk Screening" for all pending
- [ ] Verify selected candidates (ATS ≥ 75)
- [ ] Verify rejected candidates (ATS < 75)
- [ ] Check selection emails sent
- [ ] Check rejection emails sent

### Interview System
- [ ] Selected candidate receives email with link
- [ ] Click interview link opens candidate login
- [ ] Token validates successfully
- [ ] Camera/microphone permissions requested
- [ ] 5 questions displayed
- [ ] Record video answer for each question
- [ ] Submit completed interview
- [ ] Verify completion email sent
- [ ] HR can view interview in dashboard
- [ ] HR can see video/audio recordings
- [ ] HR can view AI analysis report

### Demo Mode
- [ ] Toggle to Production Mode
- [ ] Verify demo data hidden everywhere:
  - Resume screening page
  - Pipeline view
  - Interview management
  - HR dashboard stats
- [ ] Toggle to Demo Mode
- [ ] Verify demo data visible again
- [ ] Production banner displays in production mode

## 📈 Performance Benchmarks

### Expected Response Times
- Resume AI screening: < 3 seconds
- Interview question generation: < 2 seconds
- Video upload: < 10 seconds (dependent on size)
- Email delivery: < 5 seconds
- Database queries: < 500ms

### Scalability Targets
- Concurrent AI screenings: 50+
- Concurrent interviews: 100+
- Database records: 10,000+ resumes
- Storage: Unlimited (Supabase)

## 🐛 Known Limitations

### Lovable Platform Constraints
- ❌ Cannot run full Jest test suite in Lovable editor
- ❌ Cannot test Node.js/Python backends (uses Deno)
- ❌ Cannot run Cypress/Playwright tests
- ❌ Limited testing library support

### Workarounds
- ✅ Export to GitHub for full testing
- ✅ Use Supabase CLI for edge function tests
- ✅ Manual testing in preview
- ✅ Specification-based test documentation

## 📝 Test Documentation Standards

All test specifications should include:
1. **Given** - Initial conditions
2. **When** - Action performed
3. **Then** - Expected outcome
4. **Example** - Code sample or data example

## 🔗 Related Resources

- [Supabase Testing Guide](https://supabase.com/docs/guides/functions/unit-test)
- [Jest Documentation](https://jestjs.io/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [GitHub Actions CI/CD](https://docs.github.com/en/actions)

## ✅ Pre-Deployment Checklist

Before deploying to production:
- [ ] All critical user flows manually tested
- [ ] Edge functions tested via Supabase CLI
- [ ] Email automation verified with real email
- [ ] Demo mode filtering confirmed
- [ ] Production mode banner displays
- [ ] RLS policies verified in database
- [ ] Authentication flows working
- [ ] Error handling tested
- [ ] Performance benchmarks met
- [ ] Security scan completed

---

**Last Updated**: 2025-01-22  
**Platform**: Lovable + Supabase Cloud  
**Testing Approach**: Specification-based + Manual Testing  
**CI/CD**: GitHub Actions (when exported to GitHub)
