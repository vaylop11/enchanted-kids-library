
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface User {
  id: string;
  email?: string;
}

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    return {
      id: user.id,
      email: user.email
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const signUp = async (email: string, password: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      toast.error(error.message);
      return null;
    }
    
    if (data.user) {
      toast.success('Verification email sent. Please check your inbox.');
      return {
        id: data.user.id,
        email: data.user.email
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error signing up:', error);
    toast.error('Failed to sign up');
    return null;
  }
};

export const signIn = async (email: string, password: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast.error(error.message);
      return null;
    }
    
    if (data.user) {
      toast.success('Sign in successful');
      return {
        id: data.user.id,
        email: data.user.email
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error signing in:', error);
    toast.error('Failed to sign in');
    return null;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error(error.message);
      return;
    }
    
    toast.success('Signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    toast.error('Failed to sign out');
  }
};

export const resetPassword = async (email: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      toast.error(error.message);
      return false;
    }
    
    toast.success('Password reset email sent');
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    toast.error('Failed to send password reset email');
    return false;
  }
};
