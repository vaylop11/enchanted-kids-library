import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import UserProfileMenu from './UserProfileMenu';
import LanguageSwitcher from './LanguageSwitcher';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { user } = useAuth();

  // قفل التمرير لما القائمة مفتوحة
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
    };
  }, [isMobileMenuOpen]);

  // Framer Motion animations
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3, delay: 0.2 } },
  };

  const menuVariants = {
    hidden: { x: '100%', transition: { type: 'tween', duration: 0.3 } },
    visible: { x: 0, transition: { type: 'tween', duration: 0.4 } },
    exit: { x: '100%', transition: { type: 'tween', duration: 0.3 } },
  };

  return (
    <>
      {/* Navbar */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          'bg-transparent'
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img
                src="https://nknrkkzegbrkqtutmafo.supabase.co/storage/v1/object/sign/img/LOGO3D.png"
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link
                to="/"
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  location.pathname === '/'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'hover:bg-primary/10 hover:text-primary'
                )}
              >
                {t('home')}
              </Link>
              <Link
                to="/pdfs"
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  location.pathname === '/pdfs'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'hover:bg-primary/10 hover:text-primary'
                )}
              >
                {t('pdfs')}
              </Link>

              <LanguageSwitcher />

              {user ? (
                <UserProfileMenu />
              ) : (
                <Button
                  variant="outline"
                  onClick={() => navigate('/signin')}
                  className="rounded-full px-4 py-2 text-sm font-medium hover:bg-primary/10 hover:text-primary"
                >
                  {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </Button>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center space-x-2">
              <LanguageSwitcher />
              {user && <UserProfileMenu />}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-xl"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* AnimatePresence Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            />

            {/* Sliding Menu */}
            <motion.div
              className="fixed top-0 right-0 h-full w-72 bg-background/80 backdrop-blur-xl shadow-xl z-50"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="p-6 flex flex-col space-y-4">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-medium hover:text-primary"
                >
                  {t('home')}
                </Link>
                <Link
                  to="/pdfs"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-medium hover:text-primary"
                >
                  {t('pdfs')}
                </Link>

                {!user && (
                  <Button
                    onClick={() => {
                      navigate('/signin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="mt-4 w-full"
                  >
                    {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent overlap */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;
