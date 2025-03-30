
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, getCurrentUser } from '@/services/authService';
import { toast } from 'sonner';
import { deleteAllChatMessagesForPDF } from '@/services/pdfChatService';

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

  const checkUser = async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      console.log('Current user:', currentUser);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      // For both sign in and sign out events, ensure any active PDF chat messages are cleared
      if (event === 'SIGNED_IN' && session?.user) {
        // Clean messages when signing in
        try {
          const activePdfId = localStorage.getItem('activePdfId');
          if (activePdfId) {
            console.log('Cleaning messages for active PDF on sign in:', activePdfId);
            await deleteAllChatMessagesForPDF(activePdfId);
          }
          
          setUser({
            id: session.user.id,
            email: session.user.email || undefined
          });
          toast.success('Signed in successfully');
        } catch (error) {
          console.error('Error handling sign in:', error);
          setUser({
            id: session.user.id,
            email: session.user.email || undefined
          });
        }
      } else if (event === 'SIGNED_OUT') {
        // Clean messages when signing out (already implemented behavior)
        try {
          const activePdfId = localStorage.getItem('activePdfId');
          if (activePdfId) {
            console.log('Cleaning messages for active PDF on sign out:', activePdfId);
            await deleteAllChatMessagesForPDF(activePdfId);
          }
        } catch (error) {
          console.error('Error cleaning messages on sign out:', error);
        } finally {
          setUser(null);
          toast.success('Signed out successfully');
        }
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};
