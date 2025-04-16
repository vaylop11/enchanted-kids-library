
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { File, Upload, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { uploadPDFToSupabase, getUserPDFs } from '@/services/pdfSupabaseService';

const UploadZone = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [userPDFCount, setUserPDFCount] = useState(0);
  
  // Check how many PDFs the user has already uploaded
  useEffect(() => {
    if (user) {
      const checkUserPDFs = async () => {
        try {
          const pdfs = await getUserPDFs(user.id);
          setUserPDFCount(pdfs.length);
        } catch (error) {
          console.error('Error checking user PDFs:', error);
        }
      };
      
      checkUserPDFs();
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Reset error state
    setUploadError(null);
    
    // Check if user has reached the maximum PDFs limit (4)
    if (user && userPDFCount >= 4) {
      const errorMsg = language === 'ar' 
        ? 'لقد وصلت إلى الحد الأقصى لعدد ملفات PDF (4). يرجى حذف بعض الملفات لتحميل المزيد.'
        : 'You have reached the maximum number of PDFs (4). Please delete some files to upload more.';
      toast.error(errorMsg);
      setUploadError(errorMsg);
      return;
    }
    
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
      
      // Start upload progress animation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      if (user) {
        // If user is logged in, upload PDF to Supabase
        console.log('Uploading PDF for authenticated user:', user.id);
        const pdf = await uploadPDFToSupabase(file, user.id);
        
        // Clear interval and complete progress
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (pdf) {
          // Show success message
          toast.success(language === 'ar' ? 'تم تحميل الملف بنجاح' : 'File uploaded successfully');
          
          // Update user PDF count
          setUserPDFCount(prev => prev + 1);
          
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
        } else {
          // Handle upload failure
          clearInterval(progressInterval);
          setIsUploading(false);
          setUploadProgress(0);
          setUploadError(language === 'ar' 
            ? 'فشل في تحميل الملف. يرجى المحاولة مرة أخرى.' 
            : 'Failed to upload file. Please try again.');
        }
      } else {
        // If user is not logged in, handle the file in session storage temporarily
        try {
          const fileReader = new FileReader();
          fileReader.onload = (event) => {
            if (event.target && event.target.result) {
              // Store file data in session storage
              const tempId = `temp-${Date.now()}`;
              const fileData = {
                id: tempId,
                title: file.name,
                summary: `Uploaded on ${new Date().toISOString().split('T')[0]}`,
                uploadDate: new Date().toISOString().split('T')[0],
                pageCount: 0, // Will be updated when loaded in the viewer
                fileSize: formatFileSize(file.size),
                dataUrl: event.target.result as string,
                chatMessages: []
              };
              
              // Store in session storage
              sessionStorage.setItem('tempPdfFile', JSON.stringify({
                fileData: fileData,
                timestamp: Date.now()
              }));
              
              // Clear interval and complete progress
              clearInterval(progressInterval);
              setUploadProgress(100);
              
              // Show success message
              toast.success(language === 'ar' ? 'تم تحميل الملف بنجاح' : 'File uploaded successfully');
              
              // Reset state
              setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
                
                // Navigate to the temporary PDF viewer
                navigate(`/pdf/temp/${tempId}`);
              }, 500);
            }
          };
          
          fileReader.readAsDataURL(file);
        } catch (error) {
          console.error('Error reading file:', error);
          clearInterval(progressInterval);
          setIsUploading(false);
          setUploadProgress(0);
          setUploadError(language === 'ar' 
            ? 'فشل في قراءة الملف. يرجى المحاولة مرة أخرى.' 
            : 'Failed to read file. Please try again.');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadError(language === 'ar' ? 'حدث خطأ أثناء التحميل' : 'Error occurred during upload');
      toast.error(language === 'ar' ? 'حدث خطأ أثناء التحميل' : 'Error occurred during upload');
    }
  };

  // Helper function to format file size
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / 1048576).toFixed(2)} MB`;
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
    // Check if user has reached the maximum PDFs limit before opening file selector
    if (user && userPDFCount >= 4) {
      const errorMsg = language === 'ar' 
        ? 'لقد وصلت إلى الحد الأقصى لعدد ملفات PDF (4). يرجى حذف بعض الملفات لتحميل المزيد.'
        : 'You have reached the maximum number of PDFs (4). Please delete some files to upload more.';
      toast.error(errorMsg);
      setUploadError(errorMsg);
      return;
    }
    
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

  const handleSignIn = () => {
    navigate('/signin');
  };

  // Check if user has reached maximum uploads
  const hasReachedMaxPDFs = user && userPDFCount >= 4;

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
                {user && (
                  <Button 
                    variant="default"
                    onClick={handleNavigateToPDFs}
                  >
                    {language === 'ar' ? 'عرض ملفات PDF الخاصة بي' : 'View My PDFs'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`relative p-8 border-2 border-dashed rounded-xl transition-colors duration-200 ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border'
          } hover:border-primary/50 hover:bg-muted/30 ${hasReachedMaxPDFs ? 'opacity-70 pointer-events-none' : ''}`}
          onDragOver={hasReachedMaxPDFs ? undefined : handleDragOver}
          onDragLeave={hasReachedMaxPDFs ? undefined : handleDragLeave}
          onDrop={hasReachedMaxPDFs ? undefined : handleDrop}
          onClick={isUploading || hasReachedMaxPDFs ? undefined : triggerFileInput}
        >
          {hasReachedMaxPDFs && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-xl">
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 max-w-sm text-center">
                <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-500 mx-auto mb-2" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  {language === 'ar' 
                    ? 'لقد وصلت إلى الحد الأقصى لعدد ملفات PDF (4). يرجى حذف بعض الملفات لتحميل المزيد.'
                    : 'You have reached the maximum number of PDFs (4). Please delete some files to upload more.'
                  }
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={handleNavigateToPDFs}
                >
                  {language === 'ar' ? 'إدارة ملفاتي' : 'Manage My Files'}
                </Button>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isUploading || hasReachedMaxPDFs}
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
              {user ? (
                <p className="text-xs text-muted-foreground mt-2">
                  {language === 'ar'
                    ? `${userPDFCount}/4 ملفات تم تحميلها`
                    : `${userPDFCount}/4 PDFs uploaded`
                  }
                </p>
              ) : (
                <p className="text-xs text-amber-600 mt-2">
                  {language === 'ar'
                    ? 'ملاحظة: يمكنك التحدث مع الملف مؤقتًا. سجل الدخول لحفظ الملفات'
                    : 'Note: You can chat with the file temporarily. Sign in to save files'
                  }
                </p>
              )}
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
                disabled={isUploading || hasReachedMaxPDFs}
              >
                <File className="mr-2 h-4 w-4" />
                {language === 'ar' ? 'اختر ملف' : 'Select File'}
              </Button>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          {language === 'ar'
            ? 'يمكنك التحدث مع مستندك بمجرد التحميل'
            : 'You can chat with your document once uploaded'
          }
        </p>
        
        {!user && (
          <Button 
            variant="link" 
            onClick={handleSignIn}
            className="text-xs"
          >
            {language === 'ar'
              ? 'تسجيل الدخول لحفظ ملفات PDF الخاصة بك'
              : 'Sign in to save your PDF files'
            }
          </Button>
        )}
      </div>
    </div>
  );
};

export default UploadZone;
