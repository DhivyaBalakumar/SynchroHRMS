# API Documentation

## Overview

SynchroHR provides a comprehensive REST API for all HR management operations. The API is built on Supabase with Edge Functions for serverless compute.

## Base URL

```
https://your-project.supabase.co
```

## Authentication

All API requests require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication

#### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "employee",
    "firstName": "John",
    "lastName": "Doe"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1638360000
  }
}
```

#### POST /auth/register
Register a new user account.

#### POST /auth/logout
Logout current user session.

#### POST /auth/refresh
Refresh access token.

### Users

#### GET /users
Get list of users (HR/Admin only).

**Query Parameters:**
- `role`: Filter by role
- `department`: Filter by department
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "employee",
      "department": "Engineering",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### GET /users/{id}
Get user details by ID.

#### PUT /users/{id}
Update user information.

#### DELETE /users/{id}
Deactivate user account (soft delete).

### Jobs & Recruitment

#### GET /jobs
Get list of job postings.

**Query Parameters:**
- `status`: active, inactive, draft
- `department`: Filter by department
- `type`: full-time, part-time, contract, internship

#### POST /jobs
Create new job posting (HR only).

**Request:**
```json
{
  "title": "Senior Software Engineer",
  "description": "We are looking for...",
  "requirements": ["5+ years experience", "React expertise"],
  "location": "New York, NY",
  "type": "full-time",
  "department": "Engineering",
  "salary": {
    "min": 120000,
    "max": 160000,
    "currency": "USD"
  },
  "skills": ["React", "TypeScript", "Node.js"],
  "isActive": true
}
```

#### GET /applications
Get job applications (HR only).

#### POST /applications
Submit job application.

**Request:**
```json
{
  "jobId": "uuid",
  "coverLetter": "I am excited to apply...",
  "expectedSalary": 130000,
  "resume": "base64_encoded_pdf"
}
```

### Interviews

#### GET /interviews
Get interviews (filtered by user role).

#### POST /interviews
Schedule new interview (HR/Manager only).

**Request:**
```json
{
  "candidateId": "uuid",
  "jobId": "uuid",
  "interviewerId": "uuid",
  "scheduledAt": "2023-12-01T10:00:00Z",
  "duration": 60,
  "type": "technical",
  "location": "virtual",
  "meetingLink": "https://meet.google.com/abc-defg-hij"
}
```

#### PUT /interviews/{id}
Update interview details.

#### POST /interviews/{id}/feedback
Submit interview feedback.

### Departments

#### GET /departments
Get all departments.

#### POST /departments
Create new department (HR/Admin only).

#### PUT /departments/{id}
Update department information.

### Performance & Reviews

#### GET /performance/reviews
Get performance reviews.

#### POST /performance/reviews
Create performance review.

#### PUT /performance/reviews/{id}
Update performance review.

### Leave Management

#### GET /leave/requests
Get leave requests.

#### POST /leave/requests
Submit leave request.

**Request:**
```json
{
  "type": "vacation",
  "startDate": "2023-12-20",
  "endDate": "2023-12-24",
  "reason": "Holiday vacation"
}
```

#### PUT /leave/requests/{id}/approve
Approve leave request (Manager/HR only).

#### PUT /leave/requests/{id}/reject
Reject leave request (Manager/HR only).

## Edge Functions

### Resume Processing

#### POST /functions/v1/parse-resume
Parse and analyze resume PDF.

**Request:**
```json
{
  "file": "base64_encoded_pdf",
  "extractText": true,
  "analyzeContent": true
}
```

**Response:**
```json
{
  "text": "extracted text content...",
  "analysis": {
    "candidateName": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": ["Senior Developer at XYZ Corp"],
    "education": ["BS Computer Science"],
    "certifications": ["AWS Certified Developer"]
  }
}
```

### Interview Feedback Generation

#### POST /functions/v1/generate-interview-feedback
Generate AI-powered interview feedback.

**Request:**
```json
{
  "interviewId": "uuid",
  "responses": [
    {
      "question": "Tell me about yourself",
      "answer": "I am a software engineer...",
      "rating": 4
    }
  ],
  "notes": "Candidate showed good technical knowledge"
}
```

### Email Automation

#### POST /functions/v1/process-email-queue
Process automated emails.

**Request:**
```json
{
  "type": "interview_scheduled",
  "recipients": ["candidate@example.com"],
  "data": {
    "candidateName": "John Doe",
    "interviewDate": "2023-12-01T10:00:00Z",
    "meetingLink": "https://meet.google.com/abc-defg-hij"
  }
}
```

## Error Handling

All API endpoints return standardized error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Authentication required
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API endpoints are rate limited based on user role and endpoint type:

- **Public endpoints**: 100 requests per hour per IP
- **Authenticated users**: 1000 requests per hour per user
- **HR/Admin users**: 5000 requests per hour per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1638360000
```

## Webhooks

The system supports webhooks for real-time notifications:

### Supported Events

- `user.created`
- `user.updated`
- `job.created`
- `application.submitted`
- `interview.scheduled`
- `interview.completed`

### Webhook Payload

```json
{
  "event": "application.submitted",
  "timestamp": "2023-12-01T10:00:00Z",
  "data": {
    "applicationId": "uuid",
    "jobId": "uuid",
    "candidateId": "uuid",
    "status": "pending"
  }
}
```

## SDKs & Libraries

### JavaScript/TypeScript SDK

```javascript
import { SynchroHR } from '@synchrohr/sdk';

const client = new SynchroHR({
  apiKey: 'your_api_key',
  baseUrl: 'https://your-project.supabase.co'
});

// Get users
const users = await client.users.list({ department: 'Engineering' });

// Create job posting
const job = await client.jobs.create({
  title: 'Software Engineer',
  department: 'Engineering',
  type: 'full-time'
});
```

## Versioning

API versioning follows semantic versioning:

- **v1**: Current stable version
- Breaking changes will be released as v2, v3, etc.
- Deprecation notices will be provided 6 months before removal

## Support

For API support and questions:

- **API Documentation**: [Swagger UI](/api/docs)
- **Developer Forum**: [GitHub Discussions](https://github.com/your-org/synchrohr/discussions)
- **Issues**: [GitHub Issues](https://github.com/your-org/synchrohr/issues)
