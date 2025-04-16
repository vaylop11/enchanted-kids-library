
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminPanel from '@/components/admin/AdminPanel';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabaseUntyped } from '@/integrations/supabase/client';

const AdminPage = () => {
  const { user, loading, isAdmin } = useAuth();
  const [userCount, setUserCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (user && !isAdmin) {
      toast.error("You don't have permission to access the admin panel");
    }

    // Test Supabase connection
    const checkSupabaseConnection = async () => {
      try {
        const { data, error } = await supabaseUntyped
          .from('blog_posts')
          .select('count')
          .single();
          
        if (error) {
          console.error('Supabase connection error:', error);
        } else {
          console.log('Supabase connection successful, blog posts count:', data);
        }
      } catch (error) {
        console.error('Error checking Supabase connection:', error);
      }
    };
    
    // Get total user count
    const fetchUserCount = async () => {
      if (isAdmin) {
        setCountLoading(true);
        try {
          const { data, error } = await supabaseUntyped.functions.invoke('get-user-count');
          
          if (error) {
            console.error('Error fetching user count:', error);
          } else {
            console.log('User count:', data);
            setUserCount(data.count);
          }
        } catch (error) {
          console.error('Error fetching user count:', error);
        } finally {
          setCountLoading(false);
        }
      }
    };
    
    checkSupabaseConnection();
    fetchUserCount();
  }, [user, isAdmin]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-800 border-r-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  // Redirect to home if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95 via-purple-50">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20 px-4 md:px-6">
        <AdminPanel userCount={userCount} countLoading={countLoading} />
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPage;
