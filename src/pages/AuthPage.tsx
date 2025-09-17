
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';

interface AuthPageProps {
  children: React.ReactNode;
}

const AuthPage: React.FC<AuthPageProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  
  // If user is already logged in, redirect to PDFs page
  if (!loading && user) {
    return <Navigate to="/pdfs" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20 px-4 md:px-6 container mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h1 className="heading-2 mb-4">
            {language === 'ar' ? 'مرحبًا بك في أداة دردشة PDF' : 'Welcome to PDF Chat Tool'}
          </h1>
          <p className="paragraph max-w-3xl mx-auto">
            {language === 'ar' 
              ? 'سجّل الدخول أو أنشئ حسابًا للوصول إلى ميزات التخزين والدردشة المتقدمة'
              : 'Sign in or create an account to access advanced storage and chat features'
            }
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="h-8 w-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            </div>
          ) : (
            children
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-auto py-10 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p className="text-sm">
            {language === 'ar' 
              ? `© ${new Date().getFullYear()} أداة دردشة PDF. جميع الحقوق محفوظة.`
              : `© ${new Date().getFullYear()} PDF Chat Tool. All rights reserved.`
            }
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
