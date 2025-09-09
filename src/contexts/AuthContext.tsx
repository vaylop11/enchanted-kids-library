import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, getCurrentUser } from '@/services/authService';
import { useToast } from '@/contexts/ToastContext'; // ← النظام الجديد
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
  const [hasShownWelcomeToast, setHasShownWelcomeToast] = useState(false); // ← منع الإشعارات المتكررة
  
  const { success } = useToast(); // ← النظام الجديد
  const { language } = useLanguage();

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
      
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        const newUser = {
          id: session.user.id,
          email: session.user.email || undefined,
          avatar_url: session.user.user_metadata?.avatar_url,
          full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name
        };
        
        setUser(newUser);
        
        // Check if user is admin
        if (session.user.email === 'cherifhoucine83@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        
        // منع إظهار الإشعار إلا في حالة تسجيل الدخول الفعلي (وليس token refresh)
        if (event === 'SIGNED_IN' && !hasShownWelcomeToast) {
          success(
            language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Signed in successfully',
            language === 'ar' ? 'مرحباً بك' : 'Welcome'
          );
          setHasShownWelcomeToast(true);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        setHasShownWelcomeToast(false); // ← إعادة تعيين للمرة القادمة
        
        success(
          language === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Signed out successfully',
          language === 'ar' ? 'وداعاً' : 'Goodbye'
        );
      } else if (event === 'TOKEN_REFRESHED') {
        // Handle token refresh WITHOUT showing toast
        console.log('Auth token refreshed - no toast needed');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [success, language, hasShownWelcomeToast]);

  return (
    <AuthContext.Provider value={{ user, loading, checkUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
