import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, File, Settings, MessageCircle, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscription } from '@/hooks/useSubscription';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const UserProfileMenu = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isSubscribed } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = () => {
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 w-10 rounded-full p-0" aria-label="User menu">
          <Avatar className="h-9 w-9 bg-primary/10">
            <AvatarFallback className="text-primary">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {language === 'ar' ? 'حسابي' : 'My Account'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => {
            setIsOpen(false);
            navigate('/pdfs');
          }}
        >
          <File className="mr-2 h-4 w-4" />
          {language === 'ar' ? 'ملفات PDF الخاصة بي' : 'My PDFs'}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => {
            setIsOpen(false);
            navigate('/chat');
          }}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          {language === 'ar' ? 'الدردشة' : 'Chat'}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => {
            setIsOpen(false);
            navigate('/subscribe');
          }}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {isSubscribed 
            ? (language === 'ar' ? 'إدارة الاشتراك' : 'Manage Subscription')
            : (language === 'ar' ? 'اشترك الآن' : 'Subscribe Now')}
        </DropdownMenuItem>
        
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => {
                setIsOpen(false);
                navigate('/admin');
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileMenu;
