
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, getCurrentUser } from '@/services/authService';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  checkUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    setLoading(true);
    try {
      // Get current session and user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || undefined
        });
        setSession(session);
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || undefined
          });
          setSession(session);
        } else {
          setUser(null);
          setSession(null);
        }
      }
    );

    // THEN check for existing session
    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};
