import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { signUp } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  Mail, 
  Lock, 
  Check, 
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Toast مخصص
import { 
  Toast, 
  ToastProvider, 
  ToastViewport, 
  SimpleToast
} from '@/components/ui/toast';

const SignUp = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [generalError, setGeneralError] = useState('');
  const [step, setStep] = useState<'form' | 'verification'>('form');

  // Toast state
  const [toasts, setToasts] = useState<Array<{
    id: string, 
    variant: 'success' | 'destructive' | 'warning' | 'info', 
    message: string, 
    title?: string
  }>>([]);

  // إضافة Toast
  const addToast = (variant: 'success' | 'destructive' | 'warning' | 'info', message: string, title?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, variant, message, title }]);
    const duration = variant === 'success' && step === 'verification' ? 6000 : 4000;
    setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== id)), duration);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(toast => toast.id !== id));

  // حساب قوة كلمة المرور
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return language === 'ar' ? 'ضعيفة جداً' : 'Very Weak';
    if (passwordStrength < 50) return language === 'ar' ? 'ضعيفة' : 'Weak';
    if (passwordStrength < 75) return language === 'ar' ? 'متوسطة' : 'Medium';
    return language === 'ar' ? 'قوية' : 'Strong';
  };

  // Validation
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.email) newErrors.email = language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format';
    
    if (!formData.password) newErrors.password = language === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required';
    else if (formData.password.length < 6) newErrors.password = language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters';
    
    if (!formData.confirmPassword) newErrors.confirmPassword = language === 'ar' ? 'تأكيد كلمة المرور مطلوب' : 'Password confirmation is required';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (generalError) setGeneralError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setGeneralError('');

    try {
      const result = await signUp(formData.email, formData.password);
      if (result) {
        setStep('verification');
        addToast(
          'success',
          language === 'ar' 
            ? 'تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني'
            : 'Account created! Please check your email for verification',
          language === 'ar' ? 'تم بنجاح' : 'Success'
        );
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      let errorMessage = '';
      let title = language === 'ar' ? 'خطأ' : 'Error';

      if (error.message?.includes('already registered')) {
        errorMessage = language === 'ar' ? 'هذا البريد الإلكتروني مسجل بالفعل' : 'This email is already registered';
        title = language === 'ar' ? 'حساب موجود' : 'Account Exists';
      } else if (error.message?.includes('Password')) {
        errorMessage = language === 'ar' ? 'كلمة المرور ضعيفة. يرجى استخدام كلمة مرور أقوى' : 'Weak password. Please use a stronger password';
        title = language === 'ar' ? 'كلمة مرور ضعيفة' : 'Weak Password';
      } else {
        errorMessage = language === 'ar' ? 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى' : 'An error occurred during sign up. Please try again';
      }

      setGeneralError(errorMessage);
      addToast('destructive', errorMessage, title);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setGeneralError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/pdfs`,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Google sign up error:', error);
      const errorMessage = language === 'ar' ? 'فشل في التسجيل باستخدام Google' : 'Failed to sign up with Google';
      setGeneralError(errorMessage);
      addToast('destructive', errorMessage, language === 'ar' ? 'خطأ Google' : 'Google Error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const isRTL = language === 'ar';

  const VerificationStep = () => (
    <CardContent className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
        <Mail className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="font-semibold text-lg">
        {language === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Check Your Email'}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {language === 'ar' 
          ? `لقد أرسلنا رابط التحقق إلى ${formData.email}. يرجى النقر على الرابط لتفعيل حسابك.`
          : `We've sent a verification link to ${formData.email}. Please click the link to activate your account.`}
      </p>
      <div className="space-y-2">
        <Button variant="outline" onClick={() => navigate('/signin')} className="w-full">
          {language === 'ar' ? 'العودة إلى تسجيل الدخول' : 'Go to Sign In'}
        </Button>
        <Button variant="ghost" onClick={() => setStep('form')} className="w-full">
          {language === 'ar' ? 'العودة للنموذج' : 'Back to Form'}
        </Button>
      </div>
    </CardContent>
  );

  return (
    <ToastProvider>
      <div className="flex items-center justify-center p-4 bg-white min-h-screen">
        <Card className={cn("w-full max-w-md mx-auto shadow-lg", isRTL && "text-right")} dir={isRTL ? 'rtl' : 'ltr'}>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              {language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' ? 'انضم إلينا واستمتع بجميع الميزات' : 'Join us and unlock all features'}
            </CardDescription>
          </CardHeader>

          {step === 'verification' ? (
            <VerificationStep />
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {generalError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{generalError}</AlertDescription>
                  </Alert>
                )}

                {/* Google Sign Up أولًا */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-4"
                  onClick={handleGoogleSignUp}
                  disabled={loading || googleLoading}
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      {language === 'ar' ? 'التسجيل باستخدام Google' : 'Continue with Google'}
                    </>
                  )}
                </Button>

                {/* باقي الحقول مثل Email, Password, Confirm Password كما في الكود الأصلي */}

              </CardContent>

              <CardFooter className="flex flex-col gap-4 pt-0">
                <div className="text-center text-sm text-muted-foreground">
                  {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium"
                    onClick={() => navigate('/signin')}
                    disabled={loading || googleLoading}
                  >
                    {language === 'ar' ? 'تسجيل الدخول هنا' : 'Sign in here'}
                  </Button>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>

        <ToastViewport />
        {toasts.map((toast) => (
          <Toast key={toast.id} variant={toast.variant}>
            <SimpleToast 
              variant={toast.variant}
              title={toast.title}
              message={toast.message}
              showClose={true}
            />
          </Toast>
        ))}
      </div>
    </ToastProvider>
  );
};

export default SignUp;
