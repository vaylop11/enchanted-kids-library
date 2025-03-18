
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PDFCard from '@/components/PDFCard';
import Navbar from '@/components/Navbar';
import { Search, Filter, X, FileUp, Upload } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { getSavedPDFs, createPDFFromFile } from '@/services/pdfStorage';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const PDFs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [savedPDFs, setSavedPDFs] = useState<any[]>([]);
  const [filteredPDFs, setFilteredPDFs] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load saved PDFs on mount
  useEffect(() => {
    const loadPDFs = async () => {
      setIsLoading(true);
      try {
        const pdfs = await getSavedPDFs();
        setSavedPDFs(pdfs);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading PDFs:', error);
        toast.error(language === 'ar' ? 'حدث خطأ أثناء تحميل الملفات' : 'Error loading PDFs');
        setIsLoading(false);
      }
    };
    
    loadPDFs();
  }, [language]);
  
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

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      toast.error(language === 'ar' ? 'يرجى تحميل ملف PDF فقط' : 'Please upload only PDF files');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(language === 'ar' ? 'حجم الملف كبير جدًا (الحد الأقصى 10 ميجابايت)' : 'File size too large (max 10MB)');
      return;
    }

    try {
      setIsUploading(true);
      
      // Read file as data URL
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        if (event.target && typeof event.target.result === 'string') {
          // Create PDF entry
          const pdf = await createPDFFromFile(file, event.target.result);
          
          // Show success message
          toast.success(language === 'ar' ? 'تم تحميل الملف بنجاح' : 'File uploaded successfully');
          
          // Reset state
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          // Refresh the PDF list
          const updatedPdfs = await getSavedPDFs();
          setSavedPDFs(updatedPdfs);
          
          // Navigate to the PDF viewer
          navigate(`/pdf/${pdf.id}`);
        }
      };
      
      reader.onerror = () => {
        setIsUploading(false);
        toast.error(language === 'ar' ? 'فشل في قراءة الملف' : 'Failed to read file');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء التحميل' : 'Error occurred during upload');
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
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
              className="pl-10 w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
          />
          
          {/* Upload Button */}
          <Button 
            onClick={handleUploadClick}
            className="md:w-auto w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-2" />
                <span className="text-primary-foreground font-medium">
                  {language === 'ar' ? 'جارٍ التحميل...' : 'Uploading...'}
                </span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                <span className="font-medium">{language === 'ar' ? 'تحميل ملف PDF' : 'Upload PDF'}</span>
              </>
            )}
          </Button>
        </div>
        
        {/* PDF Grid */}
        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-12 w-12 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin mb-4" />
              <p className="text-lg font-medium">
                {language === 'ar' ? 'جاري تحميل الملفات...' : 'Loading PDFs...'}
              </p>
            </div>
          ) : filteredPDFs.length > 0 ? (
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
            <div className="text-center py-20 bg-muted/10 rounded-lg border border-border/40">
              <h3 className="heading-3 mb-2 text-foreground">
                {language === 'ar' ? 'لم يتم العثور على ملفات' : 'No PDFs found'}
              </h3>
              <p className="text-foreground/80 mb-6">
                {language === 'ar' 
                  ? 'حاول تعديل البحث أو قم بتحميل ملف جديد.'
                  : 'Try adjusting your search or upload a new PDF.'
                }
              </p>
              <Button
                onClick={handleUploadClick}
                variant="default"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-2" />
                    {language === 'ar' ? 'جارٍ التحميل...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'تحميل ملف' : 'Upload PDF'}
                  </>
                )}
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
