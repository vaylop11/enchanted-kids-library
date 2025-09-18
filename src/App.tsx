import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ToastContextProvider } from "@/contexts/ToastContext";
import AdSenseScript from "./components/AdSenseScript";
import Index from "./pages/Index";
import PDFs from "./pages/PDFs";
import PDFViewer from "./pages/PDFViewer";
import TranslatePDF from "./pages/TranslatePDF";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SubscriptionsPage from "./pages/Subscriptions";  // 👈 استورد الصفحة الجديدة
import TermsOfService from "./pages/TermsOfService";
import SignIn from "./components/auth/SignIn";
import SignUp from "./components/auth/SignUp";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import AppLayout from "@/components/AppLayout";   // 👈 جديد

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
        <ToastContextProvider>
          <AuthProvider>
            <TooltipProvider>
              <AdSenseScript />
              <BrowserRouter>
                <Routes>
                  {/* صفحات داخل AppLayout */}
                  <Route path="/" element={<AppLayout><Index /></AppLayout>} />
                  <Route path="/pdfs" element={<AppLayout><PDFs /></AppLayout>} />
                  <Route path="/pdf/:id" element={<AppLayout><PDFViewer /></AppLayout>} />
                  <Route path="/pdf/temp/:id" element={<AppLayout><PDFViewer /></AppLayout>} />
                     <Route 
      path="/subscriptions" 
      element={
        <ProtectedRoute>
          <AppLayout><SubscriptionsPage /></AppLayout>
        </ProtectedRoute>
      } 
    />
                  <Route 
                    path="/translate" 
                    element={
                      <ProtectedRoute>
                        <AppLayout><TranslatePDF /></AppLayout>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/translate/:id" 
                    element={
                      <ProtectedRoute>
                        <AppLayout><TranslatePDF /></AppLayout>
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/privacy-policy" element={<AppLayout><PrivacyPolicy /></AppLayout>} />
                  <Route path="/terms-of-service" element={<AppLayout><TermsOfService /></AppLayout>} />

                  {/* صفحات بدون Layout */}
                  <Route path="/signin" element={<AuthPage><SignIn /></AuthPage>} />
                  <Route path="/signup" element={<AuthPage><SignUp /></AuthPage>} />
                  <Route path="/admin" element={<AdminPage />} />

                  {/* Not Found */}
                  <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </ToastContextProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
