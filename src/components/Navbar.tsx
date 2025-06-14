import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"

const Navbar = () => {
  const { language } = useLanguage();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { 
      href: '/', 
      label: language === 'ar' ? 'الرئيسية' : 'Home' 
    },
    { 
      href: '/pdfs', 
      label: language === 'ar' ? 'ملفات PDF' : 'PDFs' 
    },
    ...(user ? [{
      href: '/chat',
      label: language === 'ar' ? 'الدردشة' : 'Chat'
    }] : []),
    { 
      href: '/translate', 
      label: language === 'ar' ? 'ترجمة PDF' : 'Translate PDF' 
    },
  ];

  return (
    <div className="bg-background border-b">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="font-bold text-xl">
          Gemi ChatPDF
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {menuItems.map((item) => (
            <Link key={item.href} to={item.href} className="hover:text-primary transition-colors">
              {item.label}
            </Link>
          ))}
          
          <ModeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {language === 'ar' ? 'مستخدم مسجل' : 'Logged in'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                  {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/signin">
              {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </Link>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" className="p-2">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Explore Gemi ChatPDF
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              {menuItems.map((item) => (
                <Link key={item.href} to={item.href} className="hover:text-primary transition-colors block py-2">
                  {item.label}
                </Link>
              ))}
              <ModeToggle />
              {user ? (
                <Button variant="destructive" onClick={() => signOut()} className="w-full">
                  {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                </Button>
              ) : (
                <Link to="/signin" className="block py-2">
                  {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Navbar;
