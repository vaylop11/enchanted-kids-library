
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminPanel from '@/components/admin/AdminPanel';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabaseUntyped } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';

const AdminPage = () => {
  const { user, loading, isAdmin } = useAuth();
  const isMobile = useIsMobile();

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
    
    checkSupabaseConnection();
  }, [user, isAdmin]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-r-transparent rounded-full"></div>
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className={`flex-1 pt-24 pb-20 ${isMobile ? 'px-3' : 'px-4 md:px-6'}`}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
          
          {isMobile ? (
            <Tabs defaultValue="admin">
              <TabsList className="w-full mb-6 grid grid-cols-2 h-auto">
                <TabsTrigger value="admin" className="py-3">Admin Panel</TabsTrigger>
                <TabsTrigger value="advanced" className="py-3">Advanced Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="admin" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
                <AdminPanel />
              </TabsContent>
              <TabsContent value="advanced" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Advanced Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced configuration settings will be available here.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <AdminPanel />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPage;
