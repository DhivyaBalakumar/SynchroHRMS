import Joi from 'joi';

// User validation schemas
export const userValidation = {
  createUser: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
    firstName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    }),
    role: Joi.string().valid('employee', 'manager', 'hr', 'intern', 'senior_manager').required().messages({
      'any.only': 'Invalid role specified',
      'any.required': 'Role is required'
    }),
    department: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional().messages({
      'string.pattern.base': 'Please provide a valid phone number'
    })
  }),

  updateUser: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    department: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    isActive: Joi.boolean().optional()
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    rememberMe: Joi.boolean().optional()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required().messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'Passwords do not match'
    })
  })
};

// Job validation schemas
export const jobValidation = {
  createJob: Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(50).max(5000).required(),
    requirements: Joi.array().items(Joi.string()).min(1).required(),
    location: Joi.string().min(2).max(100).required(),
    type: Joi.string().valid('full-time', 'part-time', 'contract', 'internship').required(),
    salary: Joi.object({
      min: Joi.number().min(0).optional(),
      max: Joi.number().min(0).optional(),
      currency: Joi.string().valid('USD', 'EUR', 'GBP', 'INR').optional()
    }).optional(),
    department: Joi.string().min(2).max(100).required(),
    experience: Joi.string().valid('entry', 'mid', 'senior', 'executive').required(),
    skills: Joi.array().items(Joi.string()).optional(),
    benefits: Joi.array().items(Joi.string()).optional(),
    isActive: Joi.boolean().default(true)
  }),

  updateJob: Joi.object({
    title: Joi.string().min(5).max(100).optional(),
    description: Joi.string().min(50).max(5000).optional(),
    requirements: Joi.array().items(Joi.string()).optional(),
    location: Joi.string().min(2).max(100).optional(),
    type: Joi.string().valid('full-time', 'part-time', 'contract', 'internship').optional(),
    salary: Joi.object({
      min: Joi.number().min(0).optional(),
      max: Joi.number().min(0).optional(),
      currency: Joi.string().valid('USD', 'EUR', 'GBP', 'INR').optional()
    }).optional(),
    department: Joi.string().min(2).max(100).optional(),
    experience: Joi.string().valid('entry', 'mid', 'senior', 'executive').optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    benefits: Joi.array().items(Joi.string()).optional(),
    isActive: Joi.boolean().optional()
  }).min(1)
};

// Interview validation schemas
export const interviewValidation = {
  scheduleInterview: Joi.object({
    candidateId: Joi.string().uuid().required(),
    jobId: Joi.string().uuid().required(),
    interviewerId: Joi.string().uuid().required(),
    scheduledAt: Joi.date().min('now').required(),
    duration: Joi.number().min(15).max(180).default(60), // minutes
    type: Joi.string().valid('technical', 'behavioral', 'system_design', 'cultural_fit').required(),
    location: Joi.string().valid('virtual', 'onsite').default('virtual'),
    meetingLink: Joi.string().uri().when('location', {
      is: 'virtual',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    notes: Joi.string().max(1000).optional()
  }),

  updateInterview: Joi.object({
    scheduledAt: Joi.date().min('now').optional(),
    duration: Joi.number().min(15).max(180).optional(),
    status: Joi.string().valid('scheduled', 'completed', 'cancelled', 'no_show').optional(),
    feedback: Joi.string().max(5000).optional(),
    rating: Joi.number().min(1).max(5).optional(),
    notes: Joi.string().max(1000).optional()
  }).min(1)
};

// Application validation schemas
export const applicationValidation = {
  submitApplication: Joi.object({
    jobId: Joi.string().uuid().required(),
    coverLetter: Joi.string().max(2000).optional(),
    expectedSalary: Joi.number().min(0).optional(),
    availability: Joi.date().min('now').optional(),
    resume: Joi.object({
      filename: Joi.string().required(),
      content: Joi.binary().required(),
      contentType: Joi.string().valid('application/pdf').required()
    }).required()
  }),

  updateApplication: Joi.object({
    status: Joi.string().valid('pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'rejected', 'withdrawn').optional(),
    notes: Joi.string().max(1000).optional(),
    rating: Joi.number().min(1).max(5).optional()
  }).min(1)
};

// Department validation schemas
export const departmentValidation = {
  createDepartment: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    managerId: Joi.string().uuid().optional(),
    budget: Joi.number().min(0).optional(),
    location: Joi.string().min(2).max(100).optional()
  }),

  updateDepartment: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).optional(),
    managerId: Joi.string().uuid().optional(),
    budget: Joi.number().min(0).optional(),
    location: Joi.string().min(2).max(100).optional(),
    isActive: Joi.boolean().optional()
  }).min(1)
};

// General validation helpers
export const validateInput = (schema: Joi.ObjectSchema, data: any) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return { isValid: false, errors, value: null };
  }
  return { isValid: true, errors: [], value };
};

export const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters and scripts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};
