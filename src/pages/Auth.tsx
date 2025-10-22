import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { validateEmail, validatePassword } from '@/lib/emailValidation';
import { Users, UserCog, Shield, GraduationCap, Briefcase, Mail, Lock, User, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

const roleOptions = [
  { value: 'admin', label: 'Management Admin', Icon: Shield, description: 'Full system administration', color: 'from-red-500 to-red-600' },
  { value: 'senior_manager', label: 'Senior Manager', Icon: Briefcase, description: 'Strategic oversight', color: 'from-indigo-500 to-indigo-600' },
  { value: 'hr', label: 'HR Recruiter', Icon: UserCog, description: 'Recruitment & HR management', color: 'from-green-500 to-green-600' },
  { value: 'manager', label: 'Manager', Icon: Users, description: 'Team management', color: 'from-purple-500 to-purple-600' },
  { value: 'employee', label: 'Employee', Icon: User, description: 'Employee workspace', color: 'from-blue-500 to-blue-600' },
  { value: 'intern', label: 'Intern', Icon: GraduationCap, description: 'Learning & development', color: 'from-orange-500 to-orange-600' },
];

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('employee');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const role = searchParams.get('role');
    if (mode === 'signup') {
      setIsLogin(false);
    }
    if (role && roleOptions.find(r => r.value === role)) {
      setSelectedRole(role);
    }

    // Redirect logged-in users to their dashboard
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        if (roleData?.role) {
          navigate(`/dashboard/${roleData.role}`);
        }
      }
    };
    
    checkSession();
  }, [searchParams, navigate]);

  const handleEmailBlur = () => {
    if (email) {
      const validation = validateEmail(email);
      setEmailError(validation.error || '');
    }
  };

  const handlePasswordBlur = () => {
    if (password && !isLogin) {
      const validation = validatePassword(password);
      setPasswordError(validation.error || '');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const validation = validateEmail(email);
    if (!validation.isValid) {
      setEmailError(validation.error || '');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) throw error;

      // Call edge function to send custom email
      const { error: emailError } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email,
          resetLink: `${window.location.origin}/auth?mode=reset`,
          userName: email.split('@')[0],
        },
      });

      if (emailError) {
        console.error('Error sending custom email:', emailError);
      }

      setResetEmailSent(true);
      toast({
        title: 'Reset Email Sent',
        description: 'Check your inbox for password reset instructions.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reset email',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEmailError('');
    setPasswordError('');

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || '');
      setLoading(false);
      return;
    }

    // Validate password for signup
    if (!isLogin) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setPasswordError(passwordValidation.error || '');
        setLoading(false);
        return;
      }

      if (!fullName.trim()) {
        toast({
          title: 'Error',
          description: 'Please enter your full name',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        const userRole = roleData?.role || 'employee';
        
        toast({
          title: 'Welcome back!',
          description: 'Successfully logged in.',
        });

        navigate(`/dashboard/${userRole}`);
      } else {
        // Check if user already exists with a role
        const { data: existingUsers } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', email)
          .single();

        if (existingUsers) {
          // Check if they have a role assigned
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', existingUsers.id)
            .single();

          if (existingRole) {
            throw new Error(`This email is already registered as ${existingRole.role}. Please log in instead or contact HR to change your role.`);
          }
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert([{
              user_id: data.user.id,
              role: selectedRole as any,
            }]);

          if (roleError) throw roleError;

          // Send verification email (optional with auto-confirm enabled)
          try {
            await supabase.functions.invoke('send-verification-email', {
              body: {
                email,
                verificationLink: `${window.location.origin}/dashboard/${selectedRole}`,
                userName: fullName,
              },
            });
          } catch (emailError) {
            console.error('Error sending verification email:', emailError);
          }

          toast({
            title: 'Account created successfully!',
            description: `Welcome to SynchroHR! Redirecting to your ${selectedRole} dashboard...`,
          });

          // Wait for auth state to fully update before navigation
          setTimeout(() => {
            navigate(`/dashboard/${selectedRole}`, { replace: true });
          }, 500);
        }
      }
    } catch (error: any) {
      if (error.message?.includes('already registered as')) {
        toast({
          title: 'Account Already Exists',
          description: error.message,
          variant: 'destructive',
        });
        setTimeout(() => {
          setIsLogin(true);
          navigate('/auth?mode=login');
        }, 2000);
      } else if (error.message?.includes('User already registered') || error.code === '23505') {
        toast({
          title: 'Account Already Exists',
          description: 'This email is already registered. Please sign in instead.',
        });
        setTimeout(() => {
          setIsLogin(true);
          navigate('/auth?mode=login');
        }, 2000);
      } else if (error.message?.includes('Invalid login credentials')) {
        toast({
          title: 'Invalid Credentials',
          description: 'The email or password you entered is incorrect.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'An error occurred',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div 
          className="fixed inset-0 -z-10 opacity-30"
          style={{ background: 'var(--gradient-mesh)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Logo />
            <h1 className="text-3xl font-bold mt-6 mb-2">Reset Password</h1>
            <p className="text-muted-foreground">
              Enter your email to receive reset instructions
            </p>
          </div>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-2 border-primary/20">
            {resetEmailSent ? (
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="text-xl font-semibold">Check Your Email</h3>
                <p className="text-muted-foreground">
                  We've sent password reset instructions to {email}
                </p>
                <Button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                    setEmail('');
                  }}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={handleEmailBlur}
                      className={`pl-10 ${emailError ? 'border-destructive' : ''}`}
                      required
                    />
                  </div>
                  {emailError && (
                    <p className="text-sm text-destructive">{emailError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </form>
            )}
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div 
        className="fixed inset-0 -z-10 opacity-30"
        style={{ background: 'var(--gradient-mesh)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <Logo />
          <h1 className="text-4xl font-bold mt-6 mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Join SynchroHR'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isLogin ? 'Sign in to access your workspace' : 'Create your account and get started'}
          </p>
        </div>

        <Card className="p-8 bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  onBlur={handleEmailBlur}
                  className={`pl-10 ${emailError ? 'border-destructive' : ''}`}
                  required
                />
              </div>
              {emailError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-destructive"
                >
                  {emailError}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  onBlur={handlePasswordBlur}
                  className={`pl-10 ${passwordError ? 'border-destructive' : ''}`}
                  required
                  minLength={8}
                />
              </div>
              {passwordError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-destructive"
                >
                  {passwordError}
                </motion.p>
              )}
              {!isLogin && !passwordError && (
                <p className="text-xs text-muted-foreground">
                  Min. 8 characters with uppercase, lowercase, and number
                </p>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <Label>Select Your Role</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {roleOptions.map((role) => {
                      const Icon = role.Icon;
                      const isSelected = selectedRole === role.value;
                      return (
                        <motion.button
                          key={role.value}
                          type="button"
                          onClick={() => setSelectedRole(role.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`
                            relative p-4 rounded-xl border-2 transition-all text-left overflow-hidden
                            ${isSelected
                              ? 'border-primary bg-primary/10 shadow-lg'
                              : 'border-border hover:border-primary/50 bg-card'
                            }
                          `}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="role-selected"
                              className="absolute top-2 right-2"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            </motion.div>
                          )}
                          <div className="flex flex-col gap-2">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{role.label}</div>
                              <div className="text-xs text-muted-foreground">{role.description}</div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg h-12"
              disabled={loading || !!emailError || !!passwordError}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setEmailError('');
                setPasswordError('');
                navigate(`/auth?mode=${isLogin ? 'signup' : 'login'}`);
              }}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </Card>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          By continuing, you agree to SynchroHR's Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
