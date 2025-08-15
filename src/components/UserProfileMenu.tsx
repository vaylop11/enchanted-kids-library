
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, File, Settings, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const UserProfileMenu = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = () => {
    if (user.full_name) {
      const names = user.full_name.split(' ');
      return names.length > 1 
        ? `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
        : names[0].substring(0, 2).toUpperCase();
    }
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
            {user.avatar_url && (
              <AvatarImage 
                src={user.avatar_url} 
                alt={user.full_name || user.email || 'User avatar'} 
              />
            )}
            <AvatarFallback className="text-primary">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {user.full_name || (language === 'ar' ? 'حسابي' : 'My Account')}
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
          <MessageSquare className="mr-2 h-4 w-4" />
          {language === 'ar' ? 'غرفة المحادثة' : 'Chat Room'}
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
