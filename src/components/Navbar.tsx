
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BookOpen, Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import UserProfileMenu from './UserProfileMenu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { direction, language, t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled ? 'bg-background/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'
    )}>
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center transition-opacity hover:opacity-80"
            style={{ gap: '0.5rem' }}
            aria-label="ChatPDF Home"
          >
            <BookOpen className="h-6 w-6" />
            <span className="font-display text-lg font-medium">
              {language === 'ar' ? 'تشات PDF' : 'ChatPDF'}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <NavigationMenu className="z-[49]">
              <NavigationMenuList className={`${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                <NavigationMenuItem>
                  <Link to="/">
                    <NavigationMenuLink 
                      className={cn(
                        navigationMenuTriggerStyle(),
                        location.pathname === '/' ? "bg-accent text-accent-foreground" : "hover:bg-muted/50 hover:text-foreground/80",
                        "px-3 py-2 text-sm font-medium rounded-full"
                      )}
                    >
                      {t('home')}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/pdfs">
                    <NavigationMenuLink 
                      className={cn(
                        navigationMenuTriggerStyle(),
                        location.pathname === '/pdfs' ? "bg-accent text-accent-foreground" : "hover:bg-muted/50 hover:text-foreground/80",
                        "px-3 py-2 text-sm font-medium rounded-full"
                      )}
                    >
                      {t('pdfs')}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/blog">
                    <NavigationMenuLink 
                      className={cn(
                        navigationMenuTriggerStyle(),
                        location.pathname === '/blog' ? "bg-accent text-accent-foreground" : "hover:bg-muted/50 hover:text-foreground/80",
                        "px-3 py-2 text-sm font-medium rounded-full"
                      )}
                    >
                      {t('blog')}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              {user ? (
                <UserProfileMenu />
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/signin')}
                  className="rounded-full"
                >
                  {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </Button>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <LanguageSwitcher />
            {user && <UserProfileMenu />}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="text-foreground rounded-full hover:bg-muted transition-colors"
                >
                  {isDrawerOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-[85vh] rounded-t-xl pt-6">
                <div className="px-4">
                  <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <Link 
                      to="/" 
                      className="flex items-center justify-center transition-opacity hover:opacity-80"
                      onClick={() => setIsDrawerOpen(false)}
                      aria-label="ChatPDF Home"
                    >
                      <BookOpen className="h-8 w-8 mb-4" />
                      <span className="font-display text-xl font-medium ml-2 mb-4">
                        {language === 'ar' ? 'تشات PDF' : 'ChatPDF'}
                      </span>
                    </Link>
                    
                    <nav className="flex flex-col items-center space-y-6 w-full">
                      <Link 
                        to="/"
                        onClick={() => setIsDrawerOpen(false)}
                        className={cn(
                          "w-full px-4 py-3 text-lg font-medium rounded-lg transition-colors",
                          location.pathname === '/' ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                        )}
                      >
                        {t('home')}
                      </Link>
                      <Link 
                        to="/pdfs"
                        onClick={() => setIsDrawerOpen(false)}
                        className={cn(
                          "w-full px-4 py-3 text-lg font-medium rounded-lg transition-colors",
                          location.pathname === '/pdfs' ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                        )}
                      >
                        {t('pdfs')}
                      </Link>
                      <Link 
                        to="/blog"
                        onClick={() => setIsDrawerOpen(false)}
                        className={cn(
                          "w-full px-4 py-3 text-lg font-medium rounded-lg transition-colors",
                          location.pathname === '/blog' ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                        )}
                      >
                        {t('blog')}
                      </Link>
                    </nav>
                    
                    {!user && (
                      <Button 
                        onClick={() => {
                          navigate('/signin');
                          setIsDrawerOpen(false);
                        }}
                        className="mt-6 w-full"
                      >
                        {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                      </Button>
                    )}
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
