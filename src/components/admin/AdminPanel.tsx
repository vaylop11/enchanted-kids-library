
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold mb-4">
          {language === 'ar' ? 'غير مصرح بالوصول' : 'Access Denied'}
        </h2>
        <p className="text-muted-foreground mb-6">
          {language === 'ar' 
            ? 'ليس لديك صلاحيات للوصول إلى لوحة الإدارة'
            : 'You do not have permission to access the admin panel'}
        </p>
        <Button onClick={() => navigate('/')}>
          {language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
        </Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Here we would typically save to a database
    // For now, we'll just simulate success
    setTimeout(() => {
      toast.success(language === 'ar' ? 'تم إنشاء المقال بنجاح' : 'Blog post created successfully');
      setTitle('');
      setContent('');
      setCategory('');
      setImageUrl('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-8">
        {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
      </h1>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ar' ? 'إنشاء مقال جديد' : 'Create New Blog Post'}
          </CardTitle>
          <CardDescription>
            {language === 'ar' 
              ? 'أضف مقالًا جديدًا إلى المدونة'
              : 'Add a new post to the blog'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                {language === 'ar' ? 'العنوان' : 'Title'}
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={language === 'ar' ? 'عنوان المقال' : 'Blog post title'}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                {language === 'ar' ? 'التصنيف' : 'Category'}
              </label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={language === 'ar' ? 'تصنيف المقال' : 'Blog category'}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="imageUrl" className="text-sm font-medium">
                {language === 'ar' ? 'رابط الصورة' : 'Image URL'}
              </label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={language === 'ar' ? 'رابط صورة المقال' : 'Blog image URL'}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                {language === 'ar' ? 'المحتوى' : 'Content'}
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={language === 'ar' ? 'محتوى المقال...' : 'Blog post content...'}
                className="min-h-[200px]"
                required
              />
              <p className="text-xs text-muted-foreground">
                {language === 'ar' 
                  ? 'يمكنك استخدام HTML لتنسيق المحتوى'
                  : 'You can use HTML for formatting'}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
              )}
              {language === 'ar' ? 'نشر المقال' : 'Publish Post'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminPanel;
