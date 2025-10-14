import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, MessageSquare, Upload, Sparkles, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { uploadPDFToSupabase } from '@/services/pdfSupabaseService';
import { usePDFLimits } from '@/hooks/usePDFLimits';

const UnifiedPDFInterface = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canUploadPDF, max_file_size_mb, isUnlimited, current_pdf_count, max_pdfs, refreshLimits } = usePDFLimits();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    
    if (file.type !== 'application/pdf') {
      toast.error(language === 'ar' ? 'يرجى تحميل ملف PDF فقط' : 'Please upload only PDF files');
      setUploadError(language === 'ar' ? 'يرجى تحميل ملف PDF فقط' : 'Please upload only PDF files');
      return;
    }

    // For non-logged-in users: enforce 5MB and 1 PDF limit
    if (!user) {
      const fileSizeMB = file.size / (1024 * 1024);
      
      // Check 5MB limit
      if (fileSizeMB > 5) {
        const errorMsg = language === 'ar'
          ? 'حجم الملف كبير جدًا (الحد الأقصى 5 ميجابايت للخطة المجانية)'
          : 'File size too large (max 5MB for free plan)';
        toast.error(errorMsg);
        setUploadError(errorMsg);
        return;
      }
      
      // Check 1 PDF limit using sessionStorage
      const existingPdf = sessionStorage.getItem('tempPdfFile');
      if (existingPdf) {
        const errorMsg = language === 'ar'
          ? 'لقد وصلت إلى الحد الأقصى (1 ملف PDF). سجل الدخول للحصول على المزيد.'
          : 'You have reached the limit (1 PDF). Sign in for more.';
        toast.error(errorMsg);
        setUploadError(errorMsg);
        return;
      }
    }

    // Use usePDFLimits for validation for logged-in users
    if (user) {
      const uploadCheck = canUploadPDF(file.size);
      if (!uploadCheck.canUpload) {
        let errorMsg = '';
        if (uploadCheck.reason === 'file_size') {
          errorMsg = language === 'ar'
            ? `حجم الملف كبير جدًا (الحد الأقصى ${uploadCheck.maxSize} ميجابايت)`
            : `File size too large (max ${uploadCheck.maxSize}MB)`;
        } else if (uploadCheck.reason === 'pdf_limit') {
          errorMsg = language === 'ar'
            ? `لقد وصلت إلى الحد الأقصى لعدد ملفات PDF (${uploadCheck.maxPdfs}). يرجى حذف بعض الملفات لتحميل المزيد.`
            : `You have reached the maximum number of PDFs (${uploadCheck.maxPdfs}). Please delete some files to upload more.`;
        }
        toast.error(errorMsg);
        setUploadError(errorMsg);
        return;
      }
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
          await refreshLimits();
          
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
      icon: <MessageSquare className="h-5 w-5 text-slate-900" />,
      title: language === 'ar' ? 'ابدأ المحادثة' : 'Start Chatting',
      description: language === 'ar' ? 'ارفع الملف وابدأ بطرح الأسئلة فوراً' : 'Upload file and start asking questions instantly',
      action: () => triggerFileInput()
    },
    {
      icon: <Languages className="h-5 w-5 text-slate-900" />,
      title: language === 'ar' ? 'ترجمة فورية' : 'Instant Translation',
      description: language === 'ar' ? 'ترجم ملفات PDF إلى أي لغة' : 'Translate PDF files to any language',
      action: () => navigate('/translate')
    },
    {
      icon: <Sparkles className="h-5 w-5 text-slate-900" />,
      title: language === 'ar' ? 'تحليل ذكي' : 'Smart Analysis',
      description: language === 'ar' ? 'احصل على ملخص وتحليل للمستند' : 'Get summary and analysis of the document',
      action: () => triggerFileInput()
    }
  ];

  return (
    <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-background via-muted/30 to-background text-slate-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
            {language === 'ar' ? 'ابدأ التفاعل مع ملفاتك' : 'Start Interacting with Your Files'}
          </h2>
          <p className="text-lg text-slate-900 max-w-2xl mx-auto">
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
                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
                  <AlertTriangle className="h-8 w-8 text-slate-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-red-700">
                    {language === 'ar' ? 'حدث خطأ أثناء التحميل' : 'Upload Error'}
                  </h3>
                  <p className="text-sm text-slate-900 mb-4">{uploadError}</p>
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
    <div className="relative flex items-center justify-center mx-auto h-24 w-24">
      {/* Progress Circle */}
      <svg className="h-24 w-24 transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r="44"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted"
          fill="transparent"
        />
        <circle
          cx="48"
          cy="48"
          r="44"
          stroke="currentColor"
          strokeWidth="6"
          className="text-primary"
          fill="transparent"
          strokeDasharray={2 * Math.PI * 44}
          strokeDashoffset={2 * Math.PI * 44 - (uploadProgress / 100) * 2 * Math.PI * 44}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-sm font-semibold text-slate-900">
        {uploadProgress}%
      </span>
    </div>
    <p className="text-sm text-center text-slate-900 mt-2">
      {language === 'ar' ? 'جاري التحميل...' : 'Uploading...'}
    </p>
  </div>
) : (
  <div className="space-y-6">
    <div className="h-26 w-26 bg-transparent flex items-center justify-center mx-auto">
      <img 
        src="https://nknrkkzegbrkqtutmafo.supabase.co/storage/v1/object/sign/img/Generated%20Image%20April%2006,%202025%20-%2012_51AM%20(1).png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWcvR2VuZXJhdGVkIEltYWdlIEFwcmlsIDA2LCAyMDI1IC0gMTJfNTFBTSAoMSkucG5nIiwiaWF0IjoxNzQzODk5NDAyLCJleHAiOjE3NzU0MzU0MDJ9.E_gIvYsWG6SPy7xc-wdvo4lXLEWkB4G_AreBPy-xyWY" 
        alt="Upload Icon"
        className="h-26 w-26"
      />
    </div>
    <div>
      <h3 className="text-xl font-semibold mb-2">
        {language === 'ar' ? 'ارفع ملف PDF الخاص بك' : 'Upload Your PDF File'}
      </h3>
      <p className="text-slate-900 mb-4">
        {language === 'ar' 
          ? 'اسحب وأفلت الملف هنا أو انقر للتحديد'
          : 'Drag and drop your file here or click to select'
        }
      </p>
      <Button className="bg-slate-900 hover:bg-slate-800">
        {language === 'ar' ? 'اختر ملف' : 'Choose File'}
      </Button>
      <p className="text-xs text-slate-900 mt-2">
        {language === 'ar' 
          ? `الحد الأقصى ${max_file_size_mb} ميجابايت${isUnlimited ? ' • رفع غير محدود' : ` • ${current_pdf_count}/${max_pdfs} ملفات`}`
          : `Max ${max_file_size_mb}MB${isUnlimited ? ' • Unlimited uploads' : ` • ${current_pdf_count}/${max_pdfs} PDFs`}`
        }
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
                  <div className="p-2 bg-primary/10 rounded-lg text-slate-900">
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{action.title}</h4>
                    <p className="text-sm text-slate-900">{action.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="p-6 text-center glass-effect border-0">
            <div className="text-2xl font-bold text-slate-900 mb-2">
              {language === 'ar' ? '< 30 ثانية' : '< 30 seconds'}
            </div>
            <p className="text-sm text-slate-900">
              {language === 'ar' ? 'متوسط وقت المعالجة' : 'Average processing time'}
            </p>
          </Card>
          
          <Card className="p-6 text-center glass-effect border-0">
            <div className="text-2xl font-bold text-slate-900 mb-2">
              {language === 'ar' ? '30+ لغة' : '30+ Languages'}
            </div>
            <p className="text-sm text-slate-900">
              {language === 'ar' ? 'دعم متعدد اللغات' : 'Multilingual support'}
            </p>
          </Card>
          
          <Card className="p-6 text-center glass-effect border-0">
            <div className="text-2xl font-bold text-slate-900 mb-2">
              {language === 'ar' ? '100% آمن' : '100% Secure'}
            </div>
            <p className="text-sm text-slate-900">
              {language === 'ar' ? 'تشفير من طرف إلى طرف' : 'End-to-end encryption'}
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default UnifiedPDFInterface;
