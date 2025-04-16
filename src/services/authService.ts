
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
      console.log("No current user found:", error?.message);
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
  } catch (error: any) {
    console.error('Error signing up:', error);
    toast.error(error.message || 'Failed to sign up');
    return null;
  }
};

export const signIn = async (email: string, password: string): Promise<User | null> => {
  try {
    console.log("Attempting sign in for:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Sign in error:", error.message);
      toast.error(error.message);
      throw error;
    }
    
    if (data.user) {
      console.log("Sign in successful for user:", data.user.id);
      // Let the auth context handle success toast
      return {
        id: data.user.id,
        email: data.user.email
      };
    }
    
    return null;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error(error.message);
      return;
    }
    
    // Auth context will handle toast
  } catch (error: any) {
    console.error('Error signing out:', error);
    toast.error(error.message || 'Failed to sign out');
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
  } catch (error: any) {
    console.error('Error resetting password:', error);
    toast.error(error.message || 'Failed to send password reset email');
    return false;
  }
};
