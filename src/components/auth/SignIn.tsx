
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { signIn } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const SignIn = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
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
