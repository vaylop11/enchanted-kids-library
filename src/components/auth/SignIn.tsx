
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { signIn } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

const SignIn = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const user = await signIn(email, password);
      if (user) {
        navigate('/pdfs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/pdfs',
        }
      });
      
      if (error) {
        console.error('Error signing in with Google:', error);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
        </CardTitle>
        <CardDescription>
          {language === 'ar' 
            ? 'أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى ملفات PDF الخاصة بك'
            : 'Enter your email and password to access your PDFs'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              {language === 'ar' ? 'كلمة المرور' : 'Password'}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={language === 'ar' ? 'كلمة المرور' : 'Password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin mr-2" />
            ) : null}
            {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </Button>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-muted-foreground text-sm">
                {language === 'ar' ? 'أو' : 'OR'}
              </span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <div className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin mr-2" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {language === 'ar' ? 'تسجيل الدخول باستخدام Google' : 'Sign in with Google'}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-0">
          <div className="text-center text-sm">
            {language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}
            {' '}
            <Button
              variant="link"
              className="p-0"
              onClick={() => navigate('/signup')}
            >
              {language === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignIn;
