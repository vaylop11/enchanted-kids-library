import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { File, Upload, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { createPDFFromFile } from '@/services/pdfStorage';
import { useNavigate } from 'react-router-dom';

const UploadZone = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Reset error state
    setUploadError(null);
    
    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      toast.error(language === 'ar' ? 'يرجى تحميل ملف PDF فقط' : 'Please upload only PDF files');
      setUploadError(language === 'ar' ? 'يرجى تحميل ملف PDF فقط' : 'Please upload only PDF files');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(language === 'ar' ? 'حجم الملف كبير جدًا (الحد الأقصى 10 ميجابايت)' : 'File size too large (max 10MB)');
      setUploadError(language === 'ar' ? 'حجم الملف كبير جدًا (الحد الأقصى 10 ميجابايت)' : 'File size too large (max 10MB)');
      return;
    }

    try {
      setIsUploading(true);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Read file as data URL
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        if (event.target && typeof event.target.result === 'string') {
          try {
            // Create PDF entry
            const pdf = createPDFFromFile(file, event.target.result);
            
            // Clear interval and complete progress
            clearInterval(progressInterval);
            setUploadProgress(100);
            
            // Check if PDF was successfully created with dataUrl
            if (!pdf.dataUrl) {
              throw new Error('PDF data could not be stored');
            }
            
            // Show success message
            toast.success(language === 'ar' ? 'تم تحميل الملف بنجاح' : 'File uploaded successfully');
            
            // Reset state
            setTimeout(() => {
              setIsUploading(false);
              setUploadProgress(0);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
              
              // Navigate to the PDF viewer
              navigate(`/pdf/${pdf.id}`);
            }, 500);
          } catch (error) {
            console.error('Error storing PDF:', error);
            clearInterval(progressInterval);
            setIsUploading(false);
            setUploadProgress(0);
            setUploadError(language === 'ar' 
              ? 'حدث خطأ أثناء تخزين الملف. قد يكون المتصفح ممتلئًا، حاول حذف بعض الملفات أولاً.'
              : 'Error storing the file. Your browser storage might be full, try deleting some files first.');
            toast.error(language === 'ar' 
              ? 'فشل في تخزين الملف'
              : 'Failed to store file');
          }
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        clearInterval(progressInterval);
        setIsUploading(false);
        setUploadProgress(0);
        setUploadError(language === 'ar' ? 'فشل في قراءة الملف' : 'Failed to read file');
        toast.error(language === 'ar' ? 'فشل في قراءة الملف' : 'Failed to read file');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadError(language === 'ar' ? 'حدث خطأ أثناء التحميل' : 'Error occurred during upload');
      toast.error(language === 'ar' ? 'حدث خطأ أثناء التحميل' : 'Error occurred during upload');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClearError = () => {
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleNavigateToPDFs = () => {
    navigate('/pdfs');
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {uploadError ? (
        <div className="p-8 border-2 border-amber-300 rounded-xl bg-amber-50 dark:bg-amber-950/20">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-500" />
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-1">
                {language === 'ar' ? 'حدث خطأ أثناء التحميل' : 'Upload Error'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {uploadError}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleClearError}
                >
                  {language === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
                </Button>
                <Button 
                  variant="default"
                  onClick={handleNavigateToPDFs}
                >
                  {language === 'ar' ? 'عرض ملفات PDF الخاصة بي' : 'View My PDFs'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`relative p-8 border-2 border-dashed rounded-xl transition-colors duration-200 ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border'
          } hover:border-primary/50 hover:bg-muted/30`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={isUploading ? undefined : triggerFileInput}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              {isUploading ? (
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-primary" />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-1">
                {language === 'ar' ? 'قم بتحميل ملف PDF' : 'Upload PDF File'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar'
                  ? 'اسحب وأفلت أو انقر لاختيار ملف (بحد أقصى 10 ميجابايت)'
                  : 'Drag and drop or click to select a file (max 10MB)'
                }
              </p>
            </div>
            
            {isUploading ? (
              <div className="w-full max-w-xs">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {uploadProgress}% {language === 'ar' ? 'تم التحميل' : 'Uploaded'}
                </p>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileInput();
                }}
                disabled={isUploading}
              >
                <File className="mr-2 h-4 w-4" />
                {language === 'ar' ? 'اختر ملف' : 'Select File'}
              </Button>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        {language === 'ar'
          ? 'يمكنك التحدث مع مستندك بمجرد التحميل'
          : 'You can chat with your document once uploaded'
        }
      </div>
    </div>
  );
};

export default UploadZone;
