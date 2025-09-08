import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BookOpen, Menu, X, Sparkles } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import UserProfileMenu from './UserProfileMenu';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    direction,
    language,
    t
  } = useLanguage();
  const {
    user
  } = useAuth();
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
  return <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out',
      isScrolled 
        ? 'glass-effect shadow-elegant border-b border-border/20' 
        : 'bg-transparent'
    )}>
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex h-18 items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-3 transition-all duration-300 hover:scale-105 group" 
            aria-label="ChatPDF Home"
          >
            <div className="relative">
              <BookOpen className="h-7 w-7 text-primary transition-all duration-300 group-hover:text-primary-glow" />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-primary-glow opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight gradient-text">
              {language === 'ar' ? 'تشات PDF' : 'ChatPDF'}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu className="z-[49]">
              <NavigationMenuList className={`${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1`}>
                <NavigationMenuItem>
                  <Link to="/">
                    <NavigationMenuLink className={cn(
                      navigationMenuTriggerStyle(), 
                      "px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 hover:scale-105",
                      location.pathname === '/' 
                        ? "bg-primary text-primary-foreground shadow-glow" 
                        : "hover:bg-primary/10 hover:text-primary"
                    )}>
                      {t('home')}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/pdfs">
                    <NavigationMenuLink className={cn(
                      navigationMenuTriggerStyle(), 
                      "px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 hover:scale-105",
                      location.pathname === '/pdfs' 
                        ? "bg-primary text-primary-foreground shadow-glow" 
                        : "hover:bg-primary/10 hover:text-primary"
                    )}>
                      {t('pdfs')}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <div className="flex items-center space-x-4 border-l border-border/20 pl-6">
              <LanguageSwitcher />
              {user ? (
                <UserProfileMenu />
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/signin')} 
                  className="rounded-full px-6 py-2 font-medium transition-all duration-300 hover:scale-105 hover:shadow-card border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                >
                  {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </Button>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-3">
            <LanguageSwitcher />
            {user && <UserProfileMenu />}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-105 p-2"
                >
                  <div className="relative">
                    {isDrawerOpen ? (
                      <X className="h-5 w-5 transition-all duration-300" />
                    ) : (
                      <Menu className="h-5 w-5 transition-all duration-300" />
                    )}
                  </div>
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-[90vh] rounded-t-2xl glass-effect border-t border-border/20">
                <div className="px-6 py-8">
                  <div className="flex flex-col items-center space-y-8 text-center">
                    <Link 
                      to="/" 
                      className="flex flex-col items-center transition-all duration-300 hover:scale-105 group" 
                      onClick={() => setIsDrawerOpen(false)} 
                      aria-label="ChatPDF Home"
                    >
                      <div className="relative mb-3">
                        <BookOpen className="h-10 w-10 text-primary group-hover:text-primary-glow transition-all duration-300" />
                        <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary-glow opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      </div>
                      <span className="font-display text-2xl font-bold gradient-text">
                        {language === 'ar' ? 'تشات PDF' : 'ChatPDF'}
                      </span>
                    </Link>
                    
                    <nav className="flex flex-col items-center space-y-4 w-full max-w-xs">
                      <Link 
                        to="/" 
                        onClick={() => setIsDrawerOpen(false)} 
                        className={cn(
                          "w-full px-6 py-4 text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105",
                          location.pathname === '/' 
                            ? "bg-primary text-primary-foreground shadow-glow" 
                            : "hover:bg-primary/10 hover:text-primary border border-border/20"
                        )}
                      >
                        {t('home')}
                      </Link>
                      <Link 
                        to="/pdfs" 
                        onClick={() => setIsDrawerOpen(false)} 
                        className={cn(
                          "w-full px-6 py-4 text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105",
                          location.pathname === '/pdfs' 
                            ? "bg-primary text-primary-foreground shadow-glow" 
                            : "hover:bg-primary/10 hover:text-primary border border-border/20"
                        )}
                      >
                        {t('pdfs')}
                      </Link>
                    </nav>
                    
                    {!user && (
                      <Button 
                        onClick={() => {
                          navigate('/signin');
                          setIsDrawerOpen(false);
                        }} 
                        className="mt-6 w-full max-w-xs rounded-xl py-3 font-medium transition-all duration-300 hover:scale-105 shadow-card"
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
    </header>;
};
export default Navbar;