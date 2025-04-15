import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PDFCard from '@/components/PDFCard';
import Navbar from '@/components/Navbar';
import { Search, X, Upload, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPDFs, uploadPDFToSupabase, SupabasePDF, PDF } from '@/services/pdfSupabaseService';

const PDFs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [pdfs, setPdfs] = useState<SupabasePDF[]>([]);
  const [filteredPDFs, setFilteredPDFs] = useState<SupabasePDF[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const handlePDFDelete = (deletedPdfId: string) => {
    setPdfs(prevPdfs => prevPdfs.filter(pdf => pdf.id !== deletedPdfId));
  };

  useEffect(() => {
    const loadPDFs = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate('/signin');
        return;
      }
      
      setIsLoading(true);
      try {
        const loadedPDFs = await getUserPDFs(user.id);
        setPdfs(loadedPDFs);
      } catch (error) {
        console.error('Error loading PDFs:', error);
        toast.error(language === 'ar' ? 'فشل في تحميل الملفات' : 'Failed to load PDFs');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPDFs();
  }, [user, authLoading, navigate, language]);
  
  useEffect(() => {
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      const results = pdfs.filter(
        pdf => 
          pdf.title.toLowerCase().includes(lowercaseSearch) || 
          (pdf.summary && pdf.summary.toLowerCase().includes(lowercaseSearch))
      );
      setFilteredPDFs(results);
    } else {
      setFilteredPDFs(pdfs);
    }
  }, [searchTerm, pdfs]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast.error(language === 'ar' ? 'يرجى تسجيل الدخول لتحميل الملفات' : 'Please sign in to upload files');
      navigate('/signin');
      return;
    }
    
    if (pdfs.length >= 4) {
      toast.error(
        language === 'ar' 
          ? 'لقد وصلت إلى الحد الأقصى لعدد ملفات PDF (4)' 
          : 'You have reached the maximum number of PDFs (4)'
      );
      return;
    }
    
    if (file.type !== 'application/pdf') {
      toast.error(language === 'ar' ? 'يرجى تحميل ملف PDF فقط' : 'Please upload only PDF files');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(language === 'ar' ? 'حجم الملف كبير جدًا (الحد الأقصى 10 ميجابايت)' : 'File size too large (max 10MB)');
      return;
    }

    try {
      setIsUploading(true);
      
      const pdf = await uploadPDFToSupabase(file, user.id);
      
      if (pdf) {
        toast.success(language === 'ar' ? 'تم تحميل الملف بنجاح' : 'File uploaded successfully');
        setPdfs(prevPDFs => [pdf, ...prevPDFs]);
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        navigate(`/pdf/${pdf.id}`);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء التحميل' : 'Error occurred during upload');
    }
  };

  const handleUploadClick = () => {
    if (pdfs.length >= 4) {
      toast.error(
        language === 'ar' 
          ? 'لقد وصلت إلى الحد الأقصى لعدد ملفات PDF (4)' 
          : 'You have reached the maximum number of PDFs (4)'
      );
      return;
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-20 px-4 md:px-6 container mx-auto max-w-7xl flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin" />
        </main>
      </div>
    );
  }
  
  if (!user) {
    navigate('/signin');
    return null;
  }
  
  const hasReachedMaxPDFs = pdfs.length >= 4;
  
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
          {hasReachedMaxPDFs && (
            <div className="mt-4 flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm">
                {language === 'ar' 
                  ? 'لقد وصلت إلى الحد الأقصى لعدد ملفات PDF (4). يرجى حذف بعض الملفات لتحميل المزيد.'
                  : 'You have reached the maximum number of PDFs (4). Please delete some files to upload more.'
                }
              </p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
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
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
          />
          
          <Button 
            onClick={handleUploadClick}
            className="md:w-auto w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isUploading || hasReachedMaxPDFs}
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
        
        <div>
          {isLoading ? (
            <div className="text-center py-20 bg-muted/10 rounded-lg border border-border/40">
              <div className="h-12 w-12 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin mb-4 mx-auto" />
              <p className="text-muted-foreground">
                {language === 'ar' ? 'جارٍ تحميل الملفات...' : 'Loading PDFs...'}
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
                  <PDFCard 
                    key={pdf.id} 
                    pdf={pdf} 
                    index={index} 
                    onDelete={handlePDFDelete}
                  />
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
                disabled={isUploading || hasReachedMaxPDFs}
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
