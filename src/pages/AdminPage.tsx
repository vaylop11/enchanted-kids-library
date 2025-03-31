
import React from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminPanel from '@/components/admin/AdminPanel';
import { useAuth } from '@/contexts/AuthContext';

const AdminPage = () => {
  const { user, loading, isAdmin } = useAuth();

  // Redirect to login if not authenticated
  if (!loading && !user) {
    return <Navigate to="/signin" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20 px-4 md:px-6">
        <AdminPanel />
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPage;
