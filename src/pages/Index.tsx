
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import PDFCard from '@/components/PDFCard';
import Navbar from '@/components/Navbar';
import { FileUp, ChevronRight, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { getSavedPDFs, createPDFFromFile } from '@/services/pdfStorage';
import FeaturesSection from '@/components/FeaturesSection';
import FAQSection from '@/components/FAQSection';
import BlogSection from '@/components/BlogSection';

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { t, language } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [recentPDFs, setRecentPDFs] = useState(getSavedPDFs().slice(0, 3));
  const navigate = useNavigate();
  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Simulate loading to ensure animations trigger correctly
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    // Load saved PDFs
    setRecentPDFs(getSavedPDFs().slice(0, 3));
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            
            // Create a FileReader to convert file to data URL
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
              if (e.target && e.target.result) {
                const fileUrl = e.target.result as string;
                
                // Save the PDF to our storage
                const newPdf = createPDFFromFile(file, fileUrl);
                
                // Update recent PDFs
                setRecentPDFs(getSavedPDFs().slice(0, 3));
                
                // Navigate to the PDF viewer
                navigate(`/pdf/${newPdf.id}`);
              } else {
                toast.error(language === 'ar' ? 'فشل في قراءة الملف' : 'Failed to read the file');
              }
            };
            
            fileReader.onerror = () => {
              toast.error(language === 'ar' ? 'خطأ في قراءة الملف' : 'Error reading file');
              setIsUploading(false);
            };
            
            // Read the file as DataURL
            fileReader.readAsDataURL(file);
            
          }, 500);
        }
        return newProgress;
      });
    }, 300);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        simulateUpload(file);
      } else {
        toast.error(language === 'ar' ? 'يرجى تحميل ملف PDF فقط' : 'Please upload PDF files only');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        simulateUpload(file);
      } else {
        toast.error(language === 'ar' ? 'يرجى تحميل ملف PDF فقط' : 'Please upload PDF files only');
      }
    }
  };

  const handleUploadButtonClick = () => {
    if (uploadInputRef.current) {
      uploadInputRef.current.click();
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-6 container mx-auto max-w-7xl">
        <div className={`transition-all duration-500 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-block rounded-full bg-primary px-3 py-1 text-sm font-medium mb-6 animate-fade-in">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              {language === 'ar' ? 'مرحبًا بك في ChatPDF' : 'Welcome to ChatPDF'}
            </span>
          </div>
          
          <h1 className="heading-1 mb-6 max-w-4xl">
            {language === 'ar' ? 'ChatPDF: تحدث مع ملفات PDF الخاصة بك' : 'ChatPDF: Chat with your PDF documents'}
          </h1>
          
          <p className="paragraph mb-8 max-w-3xl">
            {language === 'ar' 
              ? 'قم بتحميل ملفات PDF الخاصة بك واستخدم ChatPDF لطرح الأسئلة والحصول على إجابات ذكية. استخدم قوة الذكاء الاصطناعي للحصول على إجابات دقيقة من مستنداتك.'
              : 'Upload your PDFs and use ChatPDF to ask questions and get intelligent answers. Leverage the power of AI to get accurate insights from your documents.'
            }
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/pdfs" 
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-3 text-base font-medium text-background shadow-sm transition-colors hover:bg-foreground/90"
            >
              {language === 'ar' ? 'استعرض ملفاتي' : 'Browse My PDFs'}
            </Link>
            <a 
              href="#upload" 
              className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-3 text-base font-medium shadow-sm transition-colors hover:bg-muted"
            >
              {language === 'ar' ? 'تحميل ملف جديد' : 'Upload New PDF'}
            </a>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Upload Section */}
      <section id="upload" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h2 className="heading-2 mb-8 text-center">
            {language === 'ar' ? 'تحميل ملف PDF للدردشة' : 'Upload PDF for ChatPDF'}
          </h2>
          
          {isUploading ? (
            <div className="border-2 rounded-xl p-10 text-center transition-all bg-primary/5">
              <FileUp className="h-12 w-12 mx-auto mb-4 text-primary" />
              
              <h3 className="text-lg font-medium mb-6">
                {language === 'ar' ? 'جاري تحميل الملف...' : 'Uploading PDF...'}
              </h3>
              
              <div className="w-full max-w-md mx-auto mb-4">
                <Progress value={uploadProgress} className="h-2" />
              </div>
              
              <p className="text-sm text-muted-foreground">
                {language === 'ar' 
                  ? `${uploadProgress}% مكتمل` 
                  : `${uploadProgress}% Complete`
                }
              </p>
            </div>
          ) : (
            <div 
              className={cn(
                "border-2 border-dashed rounded-xl p-10 text-center transition-all",
                isDragging ? "border-primary bg-primary/5" : "border-border",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              
              <h3 className="text-lg font-medium mb-2">
                {language === 'ar' ? 'اسحب وأفلت ملف PDF هنا لبدء الدردشة' : 'Drag & Drop PDF Here to Start ChatPDF'}
              </h3>
              
              <p className="text-muted-foreground mb-6">
                {language === 'ar' 
                  ? 'أو اختر ملفًا من جهازك' 
                  : 'Or select a file from your device'
                }
              </p>
              
              <div className="flex justify-center">
                <Input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange}
                  className="hidden"
                  ref={uploadInputRef}
                />
                <Button variant="outline" onClick={handleUploadButtonClick}>
                  {language === 'ar' ? 'اختر ملف' : 'Choose File'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Recent PDFs Section */}
      <section id="recent" className="py-20 px-4 md:px-6 container mx-auto max-w-7xl">
        <div className="flex justify-between items-end mb-10">
          <h2 className="heading-2">
            {language === 'ar' ? 'ملفات ChatPDF الأخيرة' : 'Recent ChatPDF Files'}
          </h2>
          <Link 
            to="/pdfs" 
            className="text-sm font-medium flex items-center hover:underline text-muted-foreground hover:text-foreground transition-colors"
          >
            {language === 'ar' ? 'عرض جميع الملفات' : 'View All PDFs'}
            <ChevronRight className={`h-4 w-4 ${language === 'ar' ? 'mr-1 rotate-180' : 'ml-1'}`} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentPDFs.length > 0 ? (
            recentPDFs.map((pdf, index) => (
              <PDFCard key={pdf.id} pdf={pdf} index={index} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">
                {language === 'ar' ? 'لا توجد ملفات ChatPDF حتى الآن' : 'No ChatPDF Files Yet'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'ar' 
                  ? 'قم بتحميل ملف PDF للبدء في الدردشة' 
                  : 'Upload a PDF to start ChatPDF'
                }
              </p>
            </div>
          )}
        </div>
      </section>
      
      {/* Blog Section */}
      <BlogSection />
      
      {/* FAQ Section */}
      <FAQSection />
      
      {/* Footer */}
      <footer className="mt-auto py-10 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FileText className="h-5 w-5" />
            <span className="font-display text-lg font-medium">
              {language === 'ar' ? 'ChatPDF' : 'ChatPDF'}
            </span>
          </div>
          <p className="text-sm">
            {language === 'ar' 
              ? `© ${new Date().getFullYear()} ChatPDF. جميع الحقوق محفوظة.`
              : `© ${new Date().getFullYear()} ChatPDF. All rights reserved.`
            }
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
