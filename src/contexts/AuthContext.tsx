
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, getCurrentUser } from '@/services/authService';
import { setupDatabase } from '@/services/databaseSetup';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  checkUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);

  const checkUser = async () => {
    setLoading(true);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setLoading(false);
    
    // If user is logged in, ensure database is setup
    if (currentUser && !setupComplete) {
      const success = await setupDatabase();
      setSetupComplete(success);
    }
  };

  useEffect(() => {
    checkUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || undefined
        });
        
        // Run database setup when user signs in
        if (!setupComplete) {
          const success = await setupDatabase();
          
          if (success) {
            setSetupComplete(true);
            
            // Check for temporary PDF to save
            const tempPdfData = sessionStorage.getItem('tempPdfFile');
            if (tempPdfData) {
              toast.info('You have a temporary PDF. Save it to your account from the file viewer!');
            }
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [setupComplete]);

  return (
    <AuthContext.Provider value={{ user, loading, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};
