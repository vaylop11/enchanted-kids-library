
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  category: z.string().min(2, {
    message: "Category must be at least 2 characters.",
  }),
  imageUrl: z.string().url({
    message: "Please enter a valid URL for the image.",
  }),
  content: z.string().min(50, {
    message: "Content must be at least 50 characters.",
  }),
});

const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      category: '',
      imageUrl: '',
      content: '',
    },
  });

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

  const generateBlogPost = async (title: string) => {
    if (!title) {
      toast.error(language === 'ar' ? 'يرجى إدخال عنوان للمقال' : 'Please enter a blog title');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-post', {
        body: { blogTitle: title, language },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.generatedText) {
        // Set the generated content in the form
        form.setValue('content', data.generatedText);
        
        // Generate a placeholder image URL based on the title
        const imageKeyword = title.split(' ').slice(0, 2).join(' ');
        const placeholderImageUrl = `https://source.unsplash.com/featured/?${encodeURIComponent(imageKeyword)}`;
        form.setValue('imageUrl', placeholderImageUrl);
        
        // Set a default category
        if (!form.getValues('category')) {
          form.setValue('category', 'AI');
        }
        
        toast.success(
          language === 'ar' 
            ? 'تم إنشاء محتوى المقال بنجاح' 
            : 'Blog content generated successfully'
        );
      }
    } catch (error) {
      console.error('Error generating blog post:', error);
      toast.error(
        language === 'ar'
          ? 'حدث خطأ أثناء إنشاء المقال'
          : 'Error generating blog post'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    // Here we would typically save to a database
    // For now, we'll just simulate success
    setTimeout(() => {
      toast.success(language === 'ar' ? 'تم إنشاء المقال بنجاح' : 'Blog post created successfully');
      form.reset();
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {language === 'ar' ? 'العنوان' : 'Title'}
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          placeholder={language === 'ar' ? 'عنوان المقال' : 'Blog post title'} 
                          {...field} 
                        />
                      </FormControl>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => generateBlogPost(field.value)}
                        disabled={isGenerating || !field.value}
                      >
                        {isGenerating ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        {language === 'ar' ? 'توليد' : 'Generate'}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {language === 'ar' ? 'التصنيف' : 'Category'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={language === 'ar' ? 'تصنيف المقال' : 'Blog category'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {language === 'ar' ? 'رابط الصورة' : 'Image URL'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={language === 'ar' ? 'رابط صورة المقال' : 'Blog image URL'}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {language === 'ar'
                        ? 'يمكنك استخدام رابط صورة من Unsplash أو أي مصدر آخر'
                        : 'You can use an image URL from Unsplash or any other source'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {language === 'ar' ? 'المحتوى' : 'Content'}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={language === 'ar' ? 'محتوى المقال...' : 'Blog post content...'}
                        className="min-h-[300px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {language === 'ar' 
                        ? 'يمكنك استخدام HTML لتنسيق المحتوى'
                        : 'You can use HTML for formatting'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting || isGenerating} className="w-full">
                {isSubmitting && (
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
                )}
                {language === 'ar' ? 'نشر المقال' : 'Publish Post'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default AdminPanel;
