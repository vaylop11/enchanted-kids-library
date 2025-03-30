
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const NotFound = () => {
  const location = useLocation();
  const { t, direction } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className={cn("text-center", direction === 'rtl' ? 'rtl' : 'ltr')}>
        <h1 className="text-4xl font-bold mb-4">{t('notFound')}</h1>
        <p className="text-xl text-gray-600 mb-4">{t('pageNotFound')}</p>
        <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
          {t('returnToHome')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
