import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Plus, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PDFCard, { PDF } from '@/components/PDFCard';
import PDFPreview from '@/components/PDFPreview';
import { 
  getSavedPDFs, 
  createPDFFromFile, 
  deletePDFById,
  UploadedPDF
} from '@/services/pdfStorage';
import { 
  getUserPDFs, 
  uploadPDFToSupabase, 
  deletePDF, 
  SupabasePDF 
} from '@/services/pdfSupabaseService';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from "@/components/ui/use-toast";

const PDFs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSupabaseStorage, setIsSupabaseStorage] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  const { data: supabasePDFs, refetch: refetchSupabasePDFs, isLoading: isLoadingSupabasePDFs } = useQuery({
    queryKey: ['supabasePDFs', user?.id],
    queryFn: () => getUserPDFs(user!.id),
    enabled: !!user?.id,
    retry: false
  });
  
  const [localPDFs, setLocalPDFs] = useState<UploadedPDF[]>([]);
  const [isLoadingLocalPDFs, setIsLoadingLocalPDFs] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    
    const loadLocalPDFs = () => {
      setIsLoadingLocalPDFs(true);
      try {
        const savedPDFs = getSavedPDFs();
        setLocalPDFs(savedPDFs);
      } catch (error) {
        console.error('Error loading local PDFs:', error);
        toast({
          title: language === 'ar' ? 'فشل في تحميل الملفات' : 'Failed to load PDFs',
          description: language === 'ar' ? 'حدث خطأ أثناء تحميل الملفات المحفوظة محليًا.' : 'An error occurred while loading locally saved PDFs.'
        });
      } finally {
        setIsLoadingLocalPDFs(false);
      }
    };
    
    if (!isSupabaseStorage) {
      loadLocalPDFs();
    }
  }, [navigate, user, language, isSupabaseStorage, toast]);

  useEffect(() => {
    if (isSupabaseStorage) {
      refetchSupabasePDFs();
    }
  }, [isSupabaseStorage, refetchSupabasePDFs]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        
        if (isSupabaseStorage) {
          const newPDF = await uploadPDFToSupabase(file, user!.id, {
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
              setUploadProgress(progress);
            }
          });
          
          if (newPDF) {
            toast({
              title: language === 'ar' ? 'تم رفع الملف بنجاح' : 'File uploaded successfully',
              description: language === 'ar' ? 'تمت إضافة الملف إلى قائمة ملفاتك.' : 'The file has been added to your file list.'
            });
            refetchSupabasePDFs();
          } else {
            toast({
              variant: 'destructive',
              title: language === 'ar' ? 'فشل في رفع الملف' : 'Failed to upload file',
              description: language === 'ar' ? 'حدث خطأ أثناء رفع الملف.' : 'An error occurred while uploading the file.'
            });
          }
        } else {
          createPDFFromFile(file, dataUrl);
          const savedPDFs = getSavedPDFs();
          setLocalPDFs(savedPDFs);
          toast({
            title: language === 'ar' ? 'تم حفظ الملف بنجاح' : 'File saved successfully',
            description: language === 'ar' ? 'تم حفظ الملف محليًا.' : 'The file has been saved locally.'
          });
        }
        
        setIsUploading(false);
        setUploadProgress(0);
      };
      
      reader.onprogress = (event) => {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(progress);
      };
      
      reader.onerror = () => {
        toast({
          variant: 'destructive',
          title: language === 'ar' ? 'فشل في قراءة الملف' : 'Failed to read file',
          description: language === 'ar' ? 'حدث خطأ أثناء قراءة الملف.' : 'An error occurred while reading the file.'
        });
        setIsUploading(false);
        setUploadProgress(0);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'فشل في رفع الملف' : 'Failed to upload file',
        description: language === 'ar' ? 'حدث خطأ غير متوقع أثناء رفع الملف.' : 'An unexpected error occurred while uploading the file.'
      });
      setIsUploading(false);
      setUploadProgress(0);
    } finally {
      event.target.value = ''; // Reset the input
    }
  };

  const handleDeletePDF = async (pdfId: string) => {
    try {
      if (isSupabaseStorage) {
        const success = await deletePDF(pdfId);
        if (success) {
          toast({
            title: language === 'ar' ? 'تم حذف الملف بنجاح' : 'File deleted successfully',
            description: language === 'ar' ? 'تم حذف الملف من قائمة ملفاتك.' : 'The file has been removed from your file list.'
          });
          refetchSupabasePDFs();
        } else {
          toast({
            variant: 'destructive',
            title: language === 'ar' ? 'فشل في حذف الملف' : 'Failed to delete file',
            description: language === 'ar' ? 'حدث خطأ أثناء حذف الملف.' : 'An error occurred while deleting the file.'
          });
        }
      } else {
        const success = deletePDFById(pdfId);
        if (success) {
          const savedPDFs = getSavedPDFs();
          setLocalPDFs(savedPDFs);
          toast({
            title: language === 'ar' ? 'تم حذف الملف بنجاح' : 'File deleted successfully',
            description: language === 'ar' ? 'تم حذف الملف من التخزين المحلي.' : 'The file has been removed from local storage.'
          });
        } else {
          toast({
            variant: 'destructive',
            title: language === 'ar' ? 'فشل في حذف الملف' : 'Failed to delete file',
            description: language === 'ar' ? 'حدث خطأ أثناء حذف الملف من التخزين المحلي.' : 'An error occurred while deleting the file from local storage.'
          });
        }
      }
    } catch (error) {
      console.error('Error deleting PDF:', error);
      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'فشل في حذف الملف' : 'Failed to delete file',
        description: language === 'ar' ? 'حدث خطأ غير متوقع أثناء حذف الملف.' : 'An unexpected error occurred while deleting the file.'
      });
    }
  };

  const handleViewPDF = (pdfId: string) => {
    navigate(`/pdf/${pdfId}`);
  };

  const handlePreviewPDF = (pdfUrl: string) => {
    setPreviewPdfUrl(pdfUrl);
    setShowPreviewModal(true);
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setPreviewPdfUrl(null);
  };

  const filteredPDFs = isSupabaseStorage
    ? supabasePDFs?.filter(pdf => pdf.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) || []
    : localPDFs.filter(pdf => pdf.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

  const convertSupabasePDFtoPDF = (pdf: SupabasePDF): PDF => {
    return {
      id: pdf.id,
      title: pdf.title,
      summary: pdf.summary || '',  // Ensure summary is always a string
      uploadDate: new Date(pdf.uploadDate).toISOString().split('T')[0],
      pageCount: pdf.pageCount || 0,
      fileSize: pdf.fileSize || '0 KB',
      thumbnail: pdf.thumbnail
    };
  };

  return (
    <div className="container mx-auto py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {language === 'ar' ? 'ملفاتي' : 'My PDFs'}
        </h1>
        
        <div className="flex items-center space-x-4">
          <Input
            type="search"
            placeholder={language === 'ar' ? 'ابحث عن ملف PDF...' : 'Search for a PDF...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          
          <input
            type="file"
            id="upload-pdf"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
          
          <label htmlFor="upload-pdf">
            <Button asChild disabled={isUploading}>
              <a className="flex items-center">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === 'ar' ? 'جارٍ الرفع...' : 'Uploading...'} ({uploadProgress}%)
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    {language === 'ar' ? 'رفع ملف PDF' : 'Upload PDF'}
                  </>
                )}
              </a>
            </Button>
          </label>
        </div>
      </header>
      
      <main>
        {isLoadingSupabasePDFs || isLoadingLocalPDFs ? (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filteredPDFs.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            {language === 'ar' 
              ? 'لا توجد ملفات PDF. ابدأ برفع ملف!' 
              : 'No PDFs found. Start by uploading a file!'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPDFs.map(pdf => (
              <PDFCard 
                key={pdf.id} 
                pdf={isSupabaseStorage ? convertSupabasePDFtoPDF(pdf as SupabasePDF) : pdf} 
                onView={handleViewPDF} 
                onDelete={handleDeletePDF} 
                onPreview={() => handlePreviewPDF(isSupabaseStorage ? (pdf as SupabasePDF).fileUrl : (pdf as UploadedPDF).dataUrl)}
              />
            ))}
          </div>
        )}
      </main>
      
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-3xl max-h-[90vh] overflow-auto relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClosePreview}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <XCircle className="h-6 w-6" />
              <span className="sr-only">{language === 'ar' ? 'إغلاق المعاينة' : 'Close Preview'}</span>
            </Button>
            <div className="p-4">
              <PDFPreview pdfUrl={previewPdfUrl} maxHeight={700} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFs;
