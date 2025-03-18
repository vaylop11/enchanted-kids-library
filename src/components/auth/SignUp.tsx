
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { signUp } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const SignUp = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError(language === 'ar' 
        ? 'كلمات المرور غير متطابقة' 
        : 'Passwords do not match');
      return false;
    }
    
    if (password.length < 6) {
      setPasswordError(language === 'ar' 
        ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' 
        : 'Password must be at least 6 characters');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const user = await signUp(email, password);
      if (user) {
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {language === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
        </CardTitle>
        <CardDescription>
          {language === 'ar' 
            ? 'أنشئ حسابًا جديدًا للوصول إلى خدمات PDF الخاصة بنا'
            : 'Create a new account to access our PDF services'}
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
              onChange={(e) => {
                setPassword(e.target.value);
                if (confirmPassword) validatePasswords();
              }}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (password) validatePasswords();
              }}
              required
              minLength={6}
            />
            {passwordError && (
              <p className="text-sm text-red-500 mt-1">{passwordError}</p>
            )}
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
            {language === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
          </Button>
          <div className="text-center text-sm">
            {language === 'ar' ? 'هل لديك حساب بالفعل؟' : 'Already have an account?'}
            {' '}
            <Button
              variant="link"
              className="p-0"
              onClick={() => navigate('/signin')}
            >
              {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignUp;
