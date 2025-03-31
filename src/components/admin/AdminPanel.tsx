
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { supabaseUntyped } from '@/integrations/supabase/client';
import { Loader2, RefreshCw, Eye } from 'lucide-react';
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
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      category: '',
      imageUrl: '',
      content: '',
    },
  });

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

  const formatBlogContent = (content: string) => {
    if (!content) return '';
    
    // Ensure paragraphs have proper spacing
    let formattedContent = content.replace(/\n{3,}/g, '\n\n');
    
    // Convert markdown-style headings to HTML
    formattedContent = formattedContent.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    formattedContent = formattedContent.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    formattedContent = formattedContent.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    
    // Convert paragraphs to HTML
    formattedContent = '<p>' + formattedContent.replace(/\n\n/g, '</p><p>') + '</p>';
    
    // Fix any double paragraph tags
    formattedContent = formattedContent.replace(/<\/p><p><h([1-3])>/g, '</p><h$1>');
    formattedContent = formattedContent.replace(/<\/h([1-3])><p>/g, '</h$1><p>');
    
    // Attempt to identify image descriptions to replace with actual images
    formattedContent = formattedContent.replace(/\[Image: (.+?)\]/g, (match, description) => {
      const imageUrl = form.getValues('imageUrl');
      if (imageUrl) {
        return `<img src="${imageUrl}" alt="${description}" class="w-full h-auto rounded-lg my-4" />`;
      }
      return match;
    });
    
    return formattedContent;
  };

  const generateBlogPost = async (title: string) => {
    if (!title) {
      toast.error(language === 'ar' ? 'يرجى إدخال عنوان للمقال' : 'Please enter a blog title');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabaseUntyped.functions.invoke('generate-blog-post', {
        body: { blogTitle: title, language },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.generatedText) {
        form.setValue('content', data.generatedText);
        
        const imageKeyword = title.split(' ').slice(0, 2).join(' ');
        const placeholderImageUrl = `https://source.unsplash.com/featured/?${encodeURIComponent(imageKeyword)}`;
        form.setValue('imageUrl', placeholderImageUrl);
        
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
    if (!user) {
      toast.error('You must be logged in to publish a blog post');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const excerpt = values.content.split('\n')[0].substring(0, 150);
      
      const wordCount = values.content.split(/\s+/).length;
      const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
      const readTime = language === 'ar' 
        ? `${readTimeMinutes} دقائق للقراءة` 
        : `${readTimeMinutes} min read`;
      
      // Format content with proper HTML tags
      const formattedContent = formatBlogContent(values.content);
      
      // Removed .select('id').single() to avoid permission issues
      const { error } = await supabaseUntyped
        .from('blog_posts')
        .insert({
          title: values.title,
          content: formattedContent,
          excerpt: excerpt,
          image_url: values.imageUrl,
          category: values.category,
          read_time: readTime,
          author_id: user.id,
          published: true
        });
      
      if (error) {
        throw error;
      }
      
      toast.success(language === 'ar' ? 'تم نشر المقال بنجاح' : 'Blog post published successfully');
      
      form.reset();
      setPreviewMode(false);
      
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast.error(
        language === 'ar'
          ? 'حدث خطأ أثناء نشر المقال'
          : 'Error publishing blog post'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
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
                    <div className="flex justify-between items-center">
                      <FormLabel>
                        {language === 'ar' ? 'المحتوى' : 'Content'}
                      </FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={togglePreview}
                        className="text-xs flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        {previewMode 
                          ? (language === 'ar' ? 'العودة للتحرير' : 'Edit Mode') 
                          : (language === 'ar' ? 'معاينة' : 'Preview')}
                      </Button>
                    </div>
                    
                    {previewMode ? (
                      <div 
                        className="min-h-[300px] p-4 border rounded-md overflow-auto"
                        dangerouslySetInnerHTML={{ 
                          __html: formatBlogContent(field.value) 
                        }}
                      />
                    ) : (
                      <FormControl>
                        <Textarea
                          placeholder={language === 'ar' ? 'محتوى المقال...' : 'Blog post content...'}
                          className="min-h-[300px]"
                          {...field}
                        />
                      </FormControl>
                    )}
                    
                    <FormDescription>
                      {language === 'ar' 
                        ? 'يمكنك استخدام علامات مثل # و ## و ### للعناوين، و[Image: وصف] لإضافة الصورة'
                        : 'You can use # ## ### for headings, and [Image: description] to add the image'}
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
