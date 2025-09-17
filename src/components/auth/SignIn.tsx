import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { signIn } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Loader2, AlertCircle, Mail, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Toast
import { 
  Toast, 
  ToastProvider, 
  ToastViewport, 
  SimpleToast,
  useToast 
} from '@/components/ui/toast';

const SignIn = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [generalError, setGeneralError] = useState('');
  const [toasts, setToasts] = useState<Array<{id: string, variant: string, message: string, title?: string}>>([]);

  const addToast = (variant: 'success' | 'destructive', message: string, title?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, variant, message, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.email) {
      newErrors.email = language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = language === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (generalError) setGeneralError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setGeneralError('');
    
    try {
      const user = await signIn(formData.email, formData.password);
      
      if (user) {
        addToast(
          'success',
          language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Successfully signed in',
          language === 'ar' ? 'مرحباً بك' : 'Welcome back'
        );
        navigate('/pdfs');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      let errorMessage = '';
      if (error.message?.includes('Invalid credentials')) {
        errorMessage = language === 'ar' 
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
          : 'Invalid email or password';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = language === 'ar' 
          ? 'يرجى تأكيد بريدك الإلكتروني أولاً' 
          : 'Please confirm your email first';
      } else {
        errorMessage = language === 'ar' 
          ? 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى' 
          : 'An error occurred during sign in. Please try again';
      }
      
      setGeneralError(errorMessage);
      addToast('destructive', errorMessage, language === 'ar' ? 'خطأ' : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setGeneralError('');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/pdfs`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      const errorMessage = language === 'ar' 
        ? 'فشل في تسجيل الدخول باستخدام Google' 
        : 'Failed to sign in with Google';
      
      setGeneralError(errorMessage);
      addToast('destructive', errorMessage, language === 'ar' ? 'خطأ' : 'Error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const isRTL = language === 'ar';

  return (
    <ToastProvider>
      <div className="flex items-center justify-center p-4 bg-white">
        <Card className={cn(
          "w-full max-w-md mx-auto shadow-lg",
          isRTL && "text-right"
        )} dir={isRTL ? 'rtl' : 'ltr'}>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              {language === 'ar' ? 'تسجيل الدخول' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? 'اختر الطريقة التي تناسبك لتسجيل الدخول'
                : 'Choose your preferred sign-in method'}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {generalError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{generalError}</AlertDescription>
                </Alert>
              )}

              {/* Google Sign In أول خيار */}
              <Button
                type="button"
                className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading}
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </>
                ) : (
                  <>
                    <img
                      src="https://www.svgrepo.com/show/355037/google.svg"
                      alt="Google"
                      className="mr-2 h-4 w-4"
                    />
                    {language === 'ar' ? 'تسجيل الدخول باستخدام Google' : 'Sign in with Google'}
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-2 text-muted-foreground text-sm">
                    {language === 'ar' ? 'أو باستخدام البريد' : 'OR with Email'}
                  </span>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={cn(
                    errors.email && "border-red-500 focus:border-red-500",
                    isRTL && "text-right"
                  )}
                  disabled={loading || googleLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={cn(
                      "pr-10",
                      errors.password && "border-red-500 focus:border-red-500",
                      isRTL && "text-right pl-10 pr-3"
                    )}
                    disabled={loading || googleLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "absolute top-0 h-full px-3 py-2 hover:bg-transparent",
                      isRTL ? "left-0" : "right-0"
                    )}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || googleLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...'}
                  </>
                ) : (
                  language === 'ar' ? 'تسجيل الدخول' : 'Sign In'
                )}
              </Button>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-0">
              <div className="text-center text-sm text-muted-foreground">
                {language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium"
                  onClick={() => navigate('/signup')}
                  disabled={loading || googleLoading}
                >
                  {language === 'ar' ? 'إنشاء حساب جديد' : 'Sign up here'}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>

        <ToastViewport />
        
        {toasts.map((toast) => (
          <Toast key={toast.id} variant={toast.variant as any}>
            <SimpleToast 
              variant={toast.variant as any}
              title={toast.title}
              message={toast.message}
            />
          </Toast>
        ))}
      </div>
    </ToastProvider>
  );
};

export default SignIn;
