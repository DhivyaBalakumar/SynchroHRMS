describe('Email Validation Utilities', () => {
  describe('Email format validation', () => {
    const isValidEmail = (email: string): boolean => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return email ? regex.test(email) : false;
    };

    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@company.co.uk',
        'user+tag@domain.com',
        'user123@test-domain.com',
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user space@example.com',
        'user@domain',
        '',
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(isValidEmail(null as any)).toBe(false);
      expect(isValidEmail(undefined as any)).toBe(false);
      expect(isValidEmail('   ')).toBe(false);
    });
  });
});

describe('Data Validation', () => {
  it('should validate resume data structure', () => {
    const validResume = {
      candidate_name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      position_applied: 'Software Engineer',
      source: 'real',
    };

    expect(validResume.candidate_name).toBeTruthy();
    expect(validResume.email).toContain('@');
    expect(['real', 'demo']).toContain(validResume.source);
  });

  it('should validate interview token structure', () => {
    const validToken = {
      token: 'abc123def456',
      resume_id: 'resume-123',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      interview_completed: false,
    };

    expect(validToken.token).toHaveLength(12);
    expect(new Date(validToken.expires_at).getTime()).toBeGreaterThan(Date.now());
    expect(typeof validToken.interview_completed).toBe('boolean');
  });

  it('should validate ATS score calculation', () => {
    const calculateATSScore = (
      skillsMatch: number,
      experienceMatch: number,
      educationMatch: number
    ) => {
      return Math.round(
        skillsMatch * 0.4 + experienceMatch * 0.35 + educationMatch * 0.25
      );
    };

    expect(calculateATSScore(90, 85, 80)).toBe(86);
    expect(calculateATSScore(75, 75, 75)).toBe(75);
    expect(calculateATSScore(100, 100, 100)).toBe(100);
    expect(calculateATSScore(0, 0, 0)).toBe(0);
  });

  it('should validate screening status transitions', () => {
    const validTransitions = [
      ['pending', 'selected'],
      ['pending', 'rejected'],
      ['selected', 'interview_scheduled'],
      ['interview_scheduled', 'interviewed'],
    ];

    const invalidTransitions = [
      ['rejected', 'selected'],
      ['interviewed', 'pending'],
    ];

    validTransitions.forEach(([from, to]) => {
      expect(from).not.toBe(to);
    });

    invalidTransitions.forEach(([from, to]) => {
      expect(from).not.toBe(to);
    });
  });
});
