import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRole: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!session?.user) {
          setSession(null);
          setUser(null);
          setUserRole(null);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session.user);

        // Fetch role immediately without setTimeout to avoid race conditions
        try {
          const { data: roles, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (!isMounted) return;
          
          if (error) {
            console.error('Error fetching user role:', error);
            setUserRole(null);
          } else {
            console.log('User role fetched:', roles?.role);
            setUserRole(roles?.role ?? null);
          }
          setLoading(false);
        } catch (error) {
          if (!isMounted) return;
          console.error('Error fetching user role:', error);
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      
      if (!session?.user) {
        setSession(null);
        setUser(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session.user);
      
      try {
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Error fetching user role:', error);
        }
        console.log('Initial user role:', roles?.role);
        setUserRole(roles?.role ?? null);
        setLoading(false);
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching user role:', error);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
