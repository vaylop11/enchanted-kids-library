import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import UserProfileMenu from './UserProfileMenu';
import { 
  NavigationMenu, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList
} from '@/components/ui/navigation-menu';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

const Navbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { direction, language, t } = useLanguage();
  const { user } = useAuth();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`absolute top-0 left-0 right-0 z-50 ${
        isHomePage ? 'bg-transparent border-transparent' : 'bg-white border-b'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-16 sm:h-18 items-center justify-between">
          
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-105 group flex-shrink-0" 
            aria-label="ChatPDF Home"
          >
            <img 
              src="https://res.cloudinary.com/dbjcwigtg/image/upload/v1760474817/LOGO3D_dgrgan.png" 
              alt="Logo" 
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <NavigationMenu className="z-[49]">
              <NavigationMenuList className={`${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                {[{ to: '/', label: t('home') }, { to: '/pdfs', label: t('pdfs') }].map((item) => (
                  <NavigationMenuItem key={item.to}>
                    <Link to={item.to}>
                      <NavigationMenuLink
                        className={cn(
                          "px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 border",
                          location.pathname === item.to
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                            : "bg-white text-gray-700 border-border hover:bg-primary/10 hover:text-primary"
                        )}
                      >
                        {item.label}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
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
                  className="relative rounded-xl bg-white hover:text-primary transition-all duration-300 hover:scale-105 p-2"
                  aria-label={isDrawerOpen ? "Close menu" : "Open menu"}
                >
                  {isDrawerOpen ? <X className="h-5 w-5 transition-all duration-300" /> : <Menu className="h-5 w-5 transition-all duration-300" />}
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
                      <img 
                        src="https://res.cloudinary.com/dbjcwigtg/image/upload/v1760474817/LOGO3D_dgrgan.png" 
                        alt="Logo" 
                        className="h-14 sm:h-16 w-auto object-contain mb-3 sm:mb-4"
                      />
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
  );
};

export default Navbar;
