
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
  const [initialSignInHandled, setInitialSignInHandled] = useState(false);

  const ensureAdminSubscription = async (userId: string) => {
    try {
      // Check if admin already has a subscription
      const { data: existingSub } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'ACTIVE')
        .maybeSingle();

      if (!existingSub) {
        // Create a PRO subscription for admin
        const { data: plans } = await supabase
          .from('subscription_plans')
          .select('*')
          .limit(1)
          .single();

        if (plans) {
          await supabase
            .from('user_subscriptions')
            .insert({
              user_id: userId,
              plan_id: plans.id,
              status: 'ACTIVE',
              paypal_subscription_id: 'ADMIN_PERMANENT',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(2099, 11, 31).toISOString(), // Far future date
            });
          console.log('Created permanent PRO subscription for admin');
        }
      }
    } catch (error) {
      console.error('Error ensuring admin subscription:', error);
    }
  };

  const checkUser = async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      if (currentUser?.email === 'cherifhoucine83@gmail.com') {
        setIsAdmin(true);
        await ensureAdminSubscription(currentUser.id);
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
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const newUser = {
          id: session.user.id,
          email: session.user.email || undefined
        };
        
        setUser(newUser);
        
        if (session.user.email === 'cherifhoucine83@gmail.com') {
          setIsAdmin(true);
          await ensureAdminSubscription(session.user.id);
        } else {
          setIsAdmin(false);
        }

        setTimeout(async () => {
          if (!initialSignInHandled) {
            const { data: subscriptionData } = await supabase
              .from('user_subscriptions')
              .select('*')
              .eq('user_id', session.user.id)
              .eq('status', 'ACTIVE')
              .maybeSingle();

            if (subscriptionData) {
              toast.success(
                language === 'ar' 
                  ? 'مرحباً بك في Gemi PRO!' 
                  : 'Welcome back to Gemi PRO!'
              );
            } else {
              toast.success(
                language === 'ar' 
                  ? 'تم تسجيل الدخول بنجاح' 
                  : 'Signed in successfully'
              );
            }
            setInitialSignInHandled(true);
          }
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        setInitialSignInHandled(false);
        toast.success(
          language === 'ar' 
            ? 'تم تسجيل الخروج بنجاح' 
            : 'Signed out successfully'
        );
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
