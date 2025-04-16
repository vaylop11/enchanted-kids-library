
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, getCurrentUser } from '@/services/authService';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  checkUser: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  checkUser: async () => {},
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { language } = useLanguage();
  // Track if user was already signed in to prevent multiple toasts
  const [initialSignInHandled, setInitialSignInHandled] = useState(false);

  const checkUser = async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      // Check if user is admin (has the specified email)
      if (currentUser?.email === 'cherifhoucine83@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // First check for current user
    checkUser();

    // Then set up the auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const newUser = {
          id: session.user.id,
          email: session.user.email || undefined
        };
        
        setUser(newUser);
        
        // Check if user is admin
        if (session.user.email === 'cherifhoucine83@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }

        // Use setTimeout to avoid potential deadlocks with Supabase client
        setTimeout(async () => {
          // Check subscription status
          const { data: subscriptionData } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('status', 'ACTIVE')
            .maybeSingle();

          // Only show toast on an actual sign-in event - not on page refreshes or navigation
          if (!initialSignInHandled) {
            if (subscriptionData) {
              toast.success(
                language === 'ar' 
                  ? 'مرحباً بك في Gemi PRO!' 
                  : 'Welcome back to Gemi PRO!'
              );
            } else {
              toast.success(language === 'ar' 
                ? 'تم تسجيل الدخول بنجاح' 
                : 'Signed in successfully');
            }
            
            // Mark initial sign-in as handled
            setInitialSignInHandled(true);
          }
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        // Reset the initial sign-in state
        setInitialSignInHandled(false);
        toast.success(language === 'ar' 
          ? 'تم تسجيل الخروج بنجاح' 
          : 'Signed out successfully');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [language, initialSignInHandled]);

  return (
    <AuthContext.Provider value={{ user, loading, checkUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
