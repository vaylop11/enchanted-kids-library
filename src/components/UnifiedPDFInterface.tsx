import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, MessageSquare, Upload, Sparkles, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { uploadPDFToSupabase, getUserPDFs } from '@/services/pdfSupabaseService';

const UnifiedPDFInterface = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [userPDFCount, setUserPDFCount] = useState(0);
  
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

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    
    if (user && userPDFCount >= 4) {
      const errorMsg = language === 'ar' 
        ? 'لقد وصلت إلى الحد الأقصى لعدد ملفات PDF (4). يرجى حذف بعض الملفات لتحميل المزيد.'
        : 'You have reached the maximum number of PDFs (4). Please delete some files to upload more.';
      toast.error(errorMsg);
      setUploadError(errorMsg);
      return;
    }
    
    if (file.type !== 'application/pdf') {
      toast.error(language === 'ar' ? 'يرجى تحميل ملف PDF فقط' : 'Please upload only PDF files');
      setUploadError(language === 'ar' ? 'يرجى تحميل ملف PDF فقط' : 'Please upload only PDF files');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(language === 'ar' ? 'حجم الملف كبير جدًا (الحد الأقصى 10 ميجابايت)' : 'File size too large (max 10MB)');
      setUploadError(language === 'ar' ? 'حجم الملف كبير جدًا (الحد الأقصى 10 ميجابايت)' : 'File size too large (max 10MB)');
      return;
    }

    try {
      setIsUploading(true);
      
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
        const pdf = await uploadPDFToSupabase(file, user.id);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (pdf) {
          toast.success(language === 'ar' ? 'تم تحميل الملف بنجاح' : 'File uploaded successfully');
          setUserPDFCount(prev => prev + 1);
          
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            
            navigate(`/pdf/${pdf.id}`);
          }, 500);
        }
      } else {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
          if (event.target && event.target.result) {
            const tempId = `temp-${Date.now()}`;
            const fileData = {
              id: tempId,
              title: file.name,
              summary: `Uploaded on ${new Date().toISOString().split('T')[0]}`,
              uploadDate: new Date().toISOString().split('T')[0],
              pageCount: 0,
              fileSize: formatFileSize(file.size),
              dataUrl: event.target.result as string,
              chatMessages: []
            };
            
            sessionStorage.setItem('tempPdfFile', JSON.stringify({
              fileData: fileData,
              timestamp: Date.now()
            }));
            
            clearInterval(progressInterval);
            setUploadProgress(100);
            
            toast.success(language === 'ar' ? 'تم تحميل الملف بنجاح' : 'File uploaded successfully');
            
            setTimeout(() => {
              setIsUploading(false);
              setUploadProgress(0);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
              
              navigate(`/pdf/temp/${tempId}`);
            }, 500);
          }
        };
        
        fileReader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadError(language === 'ar' ? 'حدث خطأ أثناء التحميل' : 'Error occurred during upload');
      toast.error(language === 'ar' ? 'حدث خطأ أثناء التحميل' : 'Error occurred during upload');
    }
  };

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
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const quickActions = [
    {
      icon: <MessageSquare className="h-5 w-5 text-blue-900" />,
      title: language === 'ar' ? 'ابدأ المحادثة' : 'Start Chatting',
      description: language === 'ar' ? 'ارفع الملف وابدأ بطرح الأسئلة فوراً' : 'Upload file and start asking questions instantly',
      action: () => triggerFileInput()
    },
    {
      icon: <Languages className="h-5 w-5 text-blue-900" />,
      title: language === 'ar' ? 'ترجمة فورية' : 'Instant Translation',
      description: language === 'ar' ? 'ترجم ملفات PDF إلى أي لغة' : 'Translate PDF files to any language',
      action: () => navigate('/translate')
    },
    {
      icon: <Sparkles className="h-5 w-5 text-blue-900" />,
      title: language === 'ar' ? 'تحليل ذكي' : 'Smart Analysis',
      description: language === 'ar' ? 'احصل على ملخص وتحليل للمستند' : 'Get summary and analysis of the document',
      action: () => triggerFileInput()
    }
  ];

  return (
    <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-background via-muted/30 to-background text-blue-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            {language === 'ar' ? 'ابدأ التفاعل مع ملفاتك' : 'Start Interacting with Your Files'}
          </h2>
          <p className="text-lg text-blue-900 max-w-2xl mx-auto">
            {language === 'ar' 
              ? 'ارفع ملف PDF وابدأ المحادثة أو الترجمة أو التحليل فوراً - كل شيء في مكان واحد'
              : 'Upload a PDF file and start chatting, translating, or analyzing instantly - all in one place'
            }
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Upload Zone */}
          <Card className="premium-card p-8 hover-lift">
            {uploadError ? (
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-red-700">
                    {language === 'ar' ? 'حدث خطأ أثناء التحميل' : 'Upload Error'}
                  </h3>
                  <p className="text-sm text-blue-900 mb-4">{uploadError}</p>
                  <Button onClick={() => setUploadError(null)} variant="outline">
                    {language === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                  isDragging 
                    ? 'border-primary bg-primary/10 scale-105' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <div className="space-y-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Upload className="h-8 w-8 text-primary animate-bounce" />
                    </div>
                    <div>
                      <div className="w-full max-w-xs mx-auto h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-blue-900 mt-2">
                        {uploadProgress}% {language === 'ar' ? 'تم التحميل' : 'Uploaded'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto glow-effect">
                      <img 
                        src="https://nknrkkzegbrkqtutmafo.supabase.co/storage/v1/object/sign/img/Generated%20Image%20April%2006,%202025%20-%2012_51AM%20(1).png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWcvR2VuZXJhdGVkIEltYWdlIEFwcmlsIDA2LCAyMDI1IC0gMTJfNTFBTSAoMSkucG5nIiwiaWF0IjoxNzQzODk5NDAyLCJleHAiOjE3NzU0MzU0MDJ9.E_gIvYsWG6SPy7xc-wdvo4lXLEWkB4G_AreBPy-xyWY" 
                        alt="Upload Icon"
                        className="h-8 w-8"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {language === 'ar' ? 'ارفع ملف PDF الخاص بك' : 'Upload Your PDF File'}
                      </h3>
                      <p className="text-blue-900 mb-4">
                        {language === 'ar' 
                          ? 'اسحب وأفلت الملف هنا أو انقر للتحديد'
                          : 'Drag and drop your file here or click to select'
                        }
                      </p>
                      <Button className="bg-primary hover:bg-primary-dark">
                        <img 
                          src="https://nknrkkzegbrkqtutmafo.supabase.co/storage/v1/object/sign/img/Generated%20Image%20April%2006,%202025%20-%2012_51AM%20(1).png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWcvR2VuZXJhdGVkIEltYWdlIEFwcmlsIDA2LCAyMDI1IC0gMTJfNTFBTSAoMSkucG5nIiwiaWF0IjoxNzQzODk5NDAyLCJleHAiOjE3NzU0MzU0MDJ9.E_gIvYsWG6SPy7xc-wdvo4lXLEWkB4G_AreBPy-xyWY" 
                          alt="Upload Icon"
                          className="mr-2 h-4 w-4"
                        />
                        {language === 'ar' ? 'اختر ملف' : 'Choose File'}
                      </Button>
                      <p className="text-xs text-blue-900 mt-2">
                        {language === 'ar' ? 'الحد الأقصى 10 ميجابايت' : 'Max 10MB'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-6">
              {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
            </h3>
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="p-4 cursor-pointer hover-lift premium-card"
                onClick={action.action}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-blue-900">
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{action.title}</h4>
                    <p className="text-sm text-blue-900">{action.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="p-6 text-center glass-effect border-0">
            <div className="text-2xl font-bold text-blue-900 mb-2">
              {language === 'ar' ? '< 30 ثانية' : '< 30 seconds'}
            </div>
            <p className="text-sm text-blue-900">
              {language === 'ar' ? 'متوسط وقت المعالجة' : 'Average processing time'}
            </p>
          </Card>
          
          <Card className="p-6 text-center glass-effect border-0">
            <div className="text-2xl font-bold text-blue-900 mb-2">
              {language === 'ar' ? '30+ لغة' : '30+ Languages'}
            </div>
            <p className="text-sm text-blue-900">
              {language === 'ar' ? 'دعم متعدد اللغات' : 'Multilingual support'}
            </p>
          </Card>
          
          <Card className="p-6 text-center glass-effect border-0">
            <div className="text-2xl font-bold text-blue-900 mb-2">
              {language === 'ar' ? '100% آمن' : '100% Secure'}
            </div>
            <p className="text-sm text-blue-900">
              {language === 'ar' ? 'تشفير من طرف إلى طرف' : 'End-to-end encryption'}
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default UnifiedPDFInterface;
