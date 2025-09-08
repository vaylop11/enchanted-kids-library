import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BookOpen, Menu, X, Sparkles } from 'lucide-react';
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
  navigationMenuTriggerStyle 
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
    <>
      {/* Navbar */}
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out',
        'border-b border-border/10',
        isScrolled 
          ? 'bg-background/95 backdrop-blur-lg shadow-lg border-border/20' 
          : 'bg-background/80 backdrop-blur-sm'
      )}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex h-16 sm:h-18 items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-105 group flex-shrink-0" 
              aria-label="ChatPDF Home"
            >
              <div className="relative">
                <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary transition-all duration-300 group-hover:text-primary group-hover:scale-110" />
                </div>
                <Sparkles className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
              </div>
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                {language === 'ar' ? 'تشات PDF' : 'ChatPDF'}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <NavigationMenu className="z-[49]">
                <NavigationMenuList className={`${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-1`}>
                  <NavigationMenuItem>
                    <Link to="/">
                      <NavigationMenuLink className={cn(
                        navigationMenuTriggerStyle(), 
                        "px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 hover:scale-105",
                        "hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20",
                        location.pathname === '/' 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-primary/20" 
                          : ""
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
                        "hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20",
                        location.pathname === '/pdfs' 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-primary/20" 
                          : ""
                      )}>
                        {t('pdfs')}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              
              <div className="flex items-center space-x-3 xl:space-x-4 border-l border-border/20 pl-4 xl:pl-6">
                <LanguageSwitcher />
                {user ? (
                  <UserProfileMenu />
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/signin')} 
                    className="rounded-full px-4 xl:px-6 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg border-primary/20 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
              {user && (
                <div className="hidden sm:block">
                  <UserProfileMenu />
                </div>
              )}
              
              <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-105 p-2"
                    aria-label={isDrawerOpen ? "Close menu" : "Open menu"}
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
                
                <DrawerContent className="h-[85vh] sm:h-[90vh] rounded-t-3xl bg-background/95 backdrop-blur-lg border-t border-border/20">
                  <div className="px-4 sm:px-6 py-6 sm:py-8 h-full overflow-y-auto">
                    <div className="flex flex-col items-center space-y-6 sm:space-y-8 text-center">
                      {/* Mobile Logo */}
                      <Link 
                        to="/" 
                        className="flex flex-col items-center transition-all duration-300 hover:scale-105 group" 
                        onClick={() => setIsDrawerOpen(false)} 
                        aria-label="ChatPDF Home"
                      >
                        <div className="relative mb-3 sm:mb-4">
                          <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                            <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-primary group-hover:text-primary transition-all duration-300 group-hover:scale-110" />
                          </div>
                          <Sparkles className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
                        </div>
                        <span className="font-display text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                          {language === 'ar' ? 'تشات PDF' : 'ChatPDF'}
                        </span>
                      </Link>
                      
                      {/* Mobile Navigation Links */}
                      <nav className="flex flex-col items-center space-y-3 sm:space-y-4 w-full max-w-sm">
                        <Link 
                          to="/" 
                          onClick={() => setIsDrawerOpen(false)} 
                          className={cn(
                            "w-full px-6 py-3 sm:py-4 text-base sm:text-lg font-medium rounded-2xl transition-all duration-300 hover:scale-105",
                            location.pathname === '/' 
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                              : "hover:bg-primary/10 hover:text-primary border border-border/20 hover:border-primary/30 bg-card/50"
                          )}
                        >
                          {t('home')}
                        </Link>
                        <Link 
                          to="/pdfs" 
                          onClick={() => setIsDrawerOpen(false)} 
                          className={cn(
                            "w-full px-6 py-3 sm:py-4 text-base sm:text-lg font-medium rounded-2xl transition-all duration-300 hover:scale-105",
                            location.pathname === '/pdfs' 
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                              : "hover:bg-primary/10 hover:text-primary border border-border/20 hover:border-primary/30 bg-card/50"
                          )}
                        >
                          {t('pdfs')}
                        </Link>
                      </nav>

                      {/* Mobile Actions */}
                      <div className="flex flex-col items-center space-y-4 w-full max-w-sm pt-4 border-t border-border/20">
                        <div className="sm:hidden flex items-center space-x-4">
                          <LanguageSwitcher />
                          {user && <UserProfileMenu />}
                        </div>
                        
                        {!user && (
                          <Button 
                            onClick={() => {
                              navigate('/signin');
                              setIsDrawerOpen(false);
                            }} 
                            className="w-full rounded-2xl py-3 sm:py-4 text-base font-medium transition-all duration-300 hover:scale-105 shadow-lg"
                          >
                            {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content overlap */}
      <div className="h-16 sm:h-18 mb-4 sm:mb-6" />
    </>
  );
};

export default Navbar;
