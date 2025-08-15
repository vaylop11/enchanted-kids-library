
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AdSenseScript from "./components/AdSenseScript";
import Index from "./pages/Index";
import PDFs from "./pages/PDFs";
import PDFViewer from "./pages/PDFViewer";
import TranslatePDF from "./pages/TranslatePDF";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import SignIn from "./components/auth/SignIn";
import SignUp from "./components/auth/SignUp";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import ChatPage from "./pages/ChatPage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner 
              position="top-right"
              richColors
              theme="system"
              closeButton
              duration={4000}
            />
            <AdSenseScript />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/pdfs" element={<PDFs />} />
                <Route path="/pdf/:id" element={<PDFViewer />} />
                <Route path="/pdf/temp/:id" element={<PDFViewer />} />
                <Route 
                  path="/translate" 
                  element={
                    <ProtectedRoute>
                      <TranslatePDF />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/translate/:id" element={
                  <ProtectedRoute>
                    <TranslatePDF />
                  </ProtectedRoute>
                } />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/signin" element={<AuthPage><SignIn /></AuthPage>} />
                <Route path="/signup" element={<AuthPage><SignUp /></AuthPage>} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
