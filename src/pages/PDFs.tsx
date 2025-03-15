
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PDFCard from '@/components/PDFCard';
import Navbar from '@/components/Navbar';
import { Search, Filter, X, FileUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { getSavedPDFs } from '@/services/pdfStorage';

const PDFs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [savedPDFs, setSavedPDFs] = useState(getSavedPDFs());
  const [filteredPDFs, setFilteredPDFs] = useState(savedPDFs);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Load saved PDFs on mount
  useEffect(() => {
    setSavedPDFs(getSavedPDFs());
  }, []);
  
  // Update filtered PDFs when search changes or when savedPDFs changes
  useEffect(() => {
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      const results = savedPDFs.filter(
        pdf => 
          pdf.title.toLowerCase().includes(lowercaseSearch) || 
          pdf.summary.toLowerCase().includes(lowercaseSearch)
      );
      setFilteredPDFs(results);
    } else {
      setFilteredPDFs(savedPDFs);
    }
  }, [searchTerm, savedPDFs]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20 px-4 md:px-6 container mx-auto max-w-7xl animate-fade-in">
        <div className="mb-10">
          <h1 className="heading-2 mb-4">{language === 'ar' ? 'ملفات PDF الخاصة بي' : 'My PDFs'}</h1>
          <p className="paragraph max-w-3xl">
            {language === 'ar' 
              ? 'استعرض جميع ملفات PDF التي قمت بتحميلها. يمكنك البحث عن ملف معين أو تحميل ملف جديد.'
              : 'Browse all PDFs you have uploaded. You can search for a specific file or upload a new one.'
            }
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
          {/* Search Bar */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'البحث عن ملفات...' : 'Search for PDFs...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                aria-label={language === 'ar' ? 'مسح البحث' : 'Clear search'}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          
          {/* Upload Button */}
          <Button onClick={() => navigate('/')} className="md:w-auto w-full">
            <FileUp className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'تحميل ملف PDF' : 'Upload PDF'}
          </Button>
        </div>
        
        {/* PDF Grid */}
        <div>
          {filteredPDFs.length > 0 ? (
            <>
              <div className="text-sm text-muted-foreground mb-6">
                {language === 'ar' 
                  ? `عرض ${filteredPDFs.length} ${filteredPDFs.length === 1 ? 'ملف' : 'ملفات'}`
                  : `Showing ${filteredPDFs.length} ${filteredPDFs.length === 1 ? 'PDF' : 'PDFs'}`
                }
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPDFs.map((pdf, index) => (
                  <PDFCard key={pdf.id} pdf={pdf} index={index} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <h3 className="heading-3 mb-2">
                {language === 'ar' ? 'لم يتم العثور على ملفات' : 'No PDFs found'}
              </h3>
              <p className="paragraph">
                {language === 'ar' 
                  ? 'حاول تعديل البحث أو قم بتحميل ملف جديد.'
                  : 'Try adjusting your search or upload a new PDF.'
                }
              </p>
              <Button
                onClick={() => navigate('/')}
                className="mt-4"
              >
                {language === 'ar' ? 'تحميل ملف' : 'Upload PDF'}
              </Button>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-auto py-10 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p className="text-sm">
            {language === 'ar' 
              ? `© ${new Date().getFullYear()} أداة دردشة PDF. جميع الحقوق محفوظة.`
              : `© ${new Date().getFullYear()} PDF Chat Tool. All rights reserved.`
            }
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PDFs;
