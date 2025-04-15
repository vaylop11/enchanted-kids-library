
import React from 'react';
import { MoreVertical, FileText, Trash, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { deletePDF, SupabasePDF, PDF } from '@/services/pdfSupabaseService';

type PDFCardProps = {
  pdf: PDF | SupabasePDF;
  index: number;
  onDelete?: (id: string) => void;
};

const PDFCard: React.FC<PDFCardProps> = ({ pdf, index, onDelete }) => {
  const { language } = useLanguage();

  const handleDelete = async () => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الملف؟' : 'Are you sure you want to delete this PDF?')) {
      try {
        const success = await deletePDF(pdf.id);
        if (success) {
          toast.success(language === 'ar' ? 'تم حذف الملف بنجاح' : 'PDF deleted successfully');
          if (onDelete) {
            onDelete(pdf.id);
          }
        } else {
          toast.error(language === 'ar' ? 'فشل في حذف الملف' : 'Failed to delete PDF');
        }
      } catch (error) {
        console.error('Error deleting PDF:', error);
        toast.error(language === 'ar' ? 'حدث خطأ أثناء حذف الملف' : 'Error deleting PDF');
      }
    }
  };

  // Get the upload date from either PDF or SupabasePDF
  const uploadDate = 'uploadDate' in pdf ? pdf.uploadDate : 
                     'upload_date' in pdf ? pdf.upload_date : 
                     new Date().toISOString().split('T')[0];

  // Determine thumbnail, use a default if not available
  const thumbnailUrl = 'thumbnail' in pdf && pdf.thumbnail ? pdf.thumbnail : 
                       'fileUrl' in pdf && pdf.fileUrl ? `${pdf.fileUrl}?page=1&width=300` : 
                       '/placeholder.svg';

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
      {/* Thumbnail Section */}
      <div className="relative w-full aspect-video overflow-hidden">
        <img 
          src={thumbnailUrl} 
          alt={`${pdf.title} thumbnail`} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>
      
      <CardContent className="pt-6 pb-2 flex flex-col flex-1">
        <div className="mb-2 flex items-start justify-between">
          <Link 
            to={`/pdf/${pdf.id}`} 
            className="font-display text-lg font-medium hover:text-primary transition-colors line-clamp-2"
          >
            {pdf.title}
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="-mr-3 h-8 w-8 flex-shrink-0"
                aria-label={language === 'ar' ? 'خيارات' : 'Options'}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-destructive cursor-pointer">
                <Trash className="mr-2 h-4 w-4" />
                {language === 'ar' ? 'حذف' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-3 mb-2 flex-1">
          {pdf.summary}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {uploadDate}
          </div>
          <span>{pdf.pageCount} {language === 'ar' ? 'صفحات' : 'pages'}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-2 flex justify-between">
        <Link 
          to={`/pdf/${pdf.id}`}
          className="w-full"
        >
          <Button 
            variant="default" 
            className="w-full"
          >
            {language === 'ar' ? 'عرض الملف' : 'View PDF'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PDFCard;
