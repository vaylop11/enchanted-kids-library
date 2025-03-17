import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { File, Upload, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const UploadZone = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [storedPDF, setStoredPDF] = useState(null);
  const [storedPDFName, setStoredPDFName] = useState(null);

  useEffect(() => {
    const savedPDF = localStorage.getItem('savedPDF');
    const savedPDFName = localStorage.getItem('savedPDFName');
    if (savedPDF) {
      setStoredPDF(savedPDF);
      setStoredPDFName(savedPDFName);
    }
  }, []);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    setUploadError(null);
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
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          localStorage.setItem('savedPDF', event.target.result);
          localStorage.setItem('savedPDFName', file.name);
          setStoredPDF(event.target.result);
          setStoredPDFName(file.name);
          toast.success(language === 'ar' ? 'تم تحميل الملف بنجاح' : 'File uploaded successfully');
          setTimeout(() => {
            setIsUploading(false);
            navigate('/pdf/view');
          }, 500);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء التحميل' : 'Error occurred during upload');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {storedPDF && (
        <div className="mt-6 text-center">
          <h3 className="text-lg font-medium mb-2">
            {language === 'ar' ? 'آخر ملف تم تحميله' : 'Last Uploaded File'}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">{storedPDFName}</p>
          <iframe src={storedPDF} width="100%" height="600px" className="border rounded-md" />
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="outline" onClick={() => navigate('/pdf/view')}>
              {language === 'ar' ? 'عرض الملف' : 'View File'}
            </Button>
            <Button variant="destructive" onClick={() => {
              localStorage.removeItem('savedPDF');
              localStorage.removeItem('savedPDFName');
              setStoredPDF(null);
              setStoredPDFName(null);
            }}>
              {language === 'ar' ? 'حذف الملف' : 'Delete File'}
            </Button>
          </div>
        </div>
      )}
      <div
        className="relative p-8 border-2 border-dashed rounded-xl cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            {isUploading ? (
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-primary" />
            )}
          </div>
          <h3 className="text-lg font-medium mb-1">
            {language === 'ar' ? 'قم بتحميل ملف PDF' : 'Upload PDF File'}
          </h3>
          {isUploading ? (
            <div className="w-full max-w-xs">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {uploadProgress}% {language === 'ar' ? 'تم التحميل' : 'Uploaded'}
              </p>
            </div>
          ) : (
            <Button variant="outline" className="mt-2" onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}>
              <File className="mr-2 h-4 w-4" />
              {language === 'ar' ? 'اختر ملف' : 'Select File'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadZone;
