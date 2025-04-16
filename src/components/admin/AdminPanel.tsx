
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
import { Loader2, RefreshCw, Eye, Bold, Heading1, Heading2, Heading3, Link as LinkIcon, Sparkles, PencilLine } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import BlogManagement from './BlogManagement';
import ImageUploader from './ImageUploader';
import UserManagement from './UserManagement';

// Form schema for blog posts
const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  category: z.string().min(2, {
    message: "Category must be at least 2 characters.",
  }),
  content: z.string().min(50, {
    message: "Content must be at least 50 characters.",
  }),
  slug: z.string().min(2, {
    message: "Slug must be at least 2 characters.",
  }).optional(),
});

// Form schema for API keys
const apiKeySchema = z.object({
  geminiApiKey: z.string().min(10, {
    message: "API key must be at least 10 characters.",
  }),
});

const AdminPanel = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [imageUrl, setImageUrl] = useState('');
  const [titleSlug, setTitleSlug] = useState('');
  const [currentApiKey, setCurrentApiKey] = useState('');

  // Blog post form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      category: '',
      content: '',
      slug: '',
    },
  });

  // API key form
  const apiKeyForm = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      geminiApiKey: '',
    },
  });

  // Fetch current API key on load
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabaseUntyped.functions.invoke('get-gemini-api-key');
        
        if (error) throw error;
        
        if (data && data.apiKey) {
          // Show masked version of the API key
          const maskedKey = data.apiKey.substring(0, 4) + '...' + 
            data.apiKey.substring(data.apiKey.length - 4);
          setCurrentApiKey(maskedKey);
          
          // Don't set the actual key in the form for security reasons
          apiKeyForm.setValue('geminiApiKey', '');
        }
      } catch (error) {
        console.error('Error fetching API key:', error);
        toast.error('Error fetching current API key');
      }
    };
    
    if (isAdmin) {
      fetchApiKey();
    }
  }, [isAdmin]);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Update slug when title changes
  useEffect(() => {
    const title = form.watch('title');
    if (title) {
      const slug = generateSlug(title);
      form.setValue('slug', slug);
      setTitleSlug(slug);
    }
  }, [form.watch('title')]);

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
    
    // Convert bold text to HTML
    formattedContent = formattedContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Convert markdown links to HTML
    formattedContent = formattedContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>');
    
    // Convert paragraphs to HTML
    formattedContent = '<p>' + formattedContent.replace(/\n\n/g, '</p><p>') + '</p>';
    
    // Fix any double paragraph tags
    formattedContent = formattedContent.replace(/<\/p><p><h([1-3])>/g, '</p><h$1>');
    formattedContent = formattedContent.replace(/<\/h([1-3])><p>/g, '</h$1><p>');
    
    // Replace image placeholders with actual images
    formattedContent = formattedContent.replace(/\[Image: (.+?)\]/g, (match, description) => {
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
        
        // Set a default category if none exists
        if (!form.getValues('category')) {
          form.setValue('category', 'AI');
        }
        
        // Set the slug if provided from the API
        if (data.titleSlug) {
          form.setValue('slug', data.titleSlug);
          setTitleSlug(data.titleSlug);
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

  const onImageUploaded = (url: string) => {
    setImageUrl(url);
  };

  const onSubmitBlogPost = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error('You must be logged in to publish a blog post');
      return;
    }
    
    if (!imageUrl) {
      toast.error(
        language === 'ar'
          ? 'يرجى رفع صورة للمقال'
          : 'Please upload an image for the blog post'
      );
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
      
      // Use the current slug or generate one from title
      const slug = values.slug || generateSlug(values.title);
      
      // Format content with proper HTML tags
      const formattedContent = formatBlogContent(values.content);
      
      const { error } = await supabaseUntyped
        .from('blog_posts')
        .insert({
          title: values.title,
          content: formattedContent,
          excerpt: excerpt,
          image_url: imageUrl,
          category: values.category,
          read_time: readTime,
          author_id: user.id,
          slug: slug,
          published: true
        });
      
      if (error) {
        throw error;
      }
      
      toast.success(language === 'ar' ? 'تم نشر المقال بنجاح' : 'Blog post published successfully');
      
      form.reset();
      setImageUrl('');
      setPreviewMode(false);
      setActiveTab('manage'); // Switch to manage tab after successful publish
      
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

  const onSubmitApiKey = async (values: z.infer<typeof apiKeySchema>) => {
    setIsSavingApiKey(true);
    
    try {
      console.log('Updating API key...');
      const { data, error } = await supabaseUntyped.functions.invoke('update-gemini-api-key', {
        body: { apiKey: values.geminiApiKey }
      });
      
      if (error) {
        console.error('Error response:', error);
        throw new Error(`API error: ${error.message || 'Unknown error'}`);
      }

      if (!data || data.error) {
        console.error('Response data error:', data?.error || 'No data returned');
        throw new Error(data?.error || 'Failed to update API key');
      }
      
      console.log('API key update response:', data);
      
      // Update the displayed masked key
      const maskedKey = values.geminiApiKey.substring(0, 4) + '...' + 
        values.geminiApiKey.substring(values.geminiApiKey.length - 4);
      setCurrentApiKey(maskedKey);
      
      // Clear the form
      apiKeyForm.reset();
      
      toast.success(
        language === 'ar'
          ? 'تم تحديث مفتاح API Gemini بنجاح'
          : 'Gemini API key updated successfully'
      );
    } catch (error) {
      console.error('Error updating API key:', error);
      toast.error(
        language === 'ar'
          ? 'حدث خطأ أثناء تحديث مفتاح API'
          : `Error updating API key: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSavingApiKey(false);
    }
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  const insertFormatting = (type: string) => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let formattedText = '';
    let cursorPosition = 0;

    switch (type) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorPosition = start + formattedText.length;
        if (!selectedText) {
          formattedText = '**bold text**';
          cursorPosition = start + 2;
        }
        break;
      case 'h1':
        formattedText = `\n# ${selectedText}\n`;
        cursorPosition = start + formattedText.length;
        if (!selectedText) {
          formattedText = '\n# Heading 1\n';
          cursorPosition = start + 3;
        }
        break;
      case 'h2':
        formattedText = `\n## ${selectedText}\n`;
        cursorPosition = start + formattedText.length;
        if (!selectedText) {
          formattedText = '\n## Heading 2\n';
          cursorPosition = start + 4;
        }
        break;
      case 'h3':
        formattedText = `\n### ${selectedText}\n`;
        cursorPosition = start + formattedText.length;
        if (!selectedText) {
          formattedText = '\n### Heading 3\n';
          cursorPosition = start + 5;
        }
        break;
      case 'link':
        // For internal links, use the blog slug as base
        const linkUrl = `/blog/${titleSlug}-related-topic`;
        formattedText = `[${selectedText || 'link text'}](${linkUrl})`;
        cursorPosition = start + formattedText.length;
        if (!selectedText) {
          cursorPosition = start + 1;
        }
        break;
    }

    // Update the content in the form
    const currentContent = form.getValues('content');
    const newContent = 
      currentContent.substring(0, start) + 
      formattedText + 
      currentContent.substring(end);
    
    form.setValue('content', newContent, { shouldDirty: true });
    
    // After React updates the DOM, set the cursor position
    setTimeout(() => {
      textarea.focus();
      if (!selectedText) {
        textarea.setSelectionRange(
          start + (type === 'bold' ? 2 : (type === 'h1' ? 3 : (type === 'h2' ? 4 : (type === 'h3' ? 5 : (type === 'link' ? 1 : 0))))), 
          cursorPosition
        );
      } else {
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {language === 'ar' ? 'لوحة الإدارة' : 'Admin Dashboard'}
      </h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="mb-6 w-full justify-start overflow-x-auto p-0.5 flex gap-1">
          <TabsTrigger value="settings" className="gap-1.5 items-center">
            <Sparkles className="h-4 w-4" />
            {language === 'ar' ? 'الإعدادات' : 'API Settings'}
          </TabsTrigger>
          <TabsTrigger value="create" className="gap-1.5 items-center">
            <PencilLine className="h-4 w-4" />
            {language === 'ar' ? 'إنشاء مقال' : 'Create Post'}
          </TabsTrigger>
          <TabsTrigger value="manage">
            {language === 'ar' ? 'إدارة المقالات' : 'Manage Posts'}
          </TabsTrigger>
          <TabsTrigger value="users">
            {language === 'ar' ? 'إدارة المستخدمين' : 'Manage Users'}
          </TabsTrigger>
        </TabsList>
        
        {/* API Settings Tab */}
        <TabsContent value="settings">
          <Card className="border-2 border-opacity-50 shadow-md hover:shadow-lg transition-all">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
              <CardTitle>
                {language === 'ar' ? 'إعدادات API' : 'API Settings'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'قم بتكوين مفاتيح API لتمكين وظائف مختلفة.'
                  : 'Configure API keys to enable various functionalities.'}
              </CardDescription>
            </CardHeader>
            <Form {...apiKeyForm}>
              <form onSubmit={apiKeyForm.handleSubmit(onSubmitApiKey)}>
                <CardContent className="space-y-6 pt-6">
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg mb-4">
                    <h3 className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4" />
                      {language === 'ar' ? 'مفتاح Gemini API' : 'Gemini API Key'}
                    </h3>
                    <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                      {language === 'ar'
                        ? 'يُستخدم مفتاح Gemini API لتمكين إنشاء محتوى AI والدردشة مع PDF.'
                        : 'The Gemini API key is used to enable AI content generation and PDF chat functionalities.'}
                    </p>
                  </div>

                  {currentApiKey && (
                    <div className="flex items-center p-3 bg-muted/30 rounded-md mb-2">
                      <p className="text-sm font-mono">
                        {language === 'ar' ? 'المفتاح الحالي: ' : 'Current key: '}
                        <span className="font-semibold">{currentApiKey}</span>
                      </p>
                    </div>
                  )}

                  <FormField
                    control={apiKeyForm.control}
                    name="geminiApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === 'ar' ? 'مفتاح API الجديد' : 'New API Key'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={language === 'ar' ? 'أدخل مفتاح Gemini API الجديد' : 'Enter new Gemini API key'}
                            className="font-mono"
                            autoComplete="off"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {language === 'ar'
                            ? 'أدخل مفتاح API جديد من Google AI Studio'
                            : 'Enter a new API key from Google AI Studio'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={isSavingApiKey || !apiKeyForm.formState.isDirty} 
                    className="w-full"
                  >
                    {isSavingApiKey && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {language === 'ar' ? 'تحديث مفتاح API' : 'Update API Key'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        
        {/* Create Post Tab */}
        <TabsContent value="create">
          <Card className="border-2 border-opacity-50 shadow-md hover:shadow-lg transition-all">
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20">
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
              <form onSubmit={form.handleSubmit(onSubmitBlogPost)}>
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
                            className="shrink-0"
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {language === 'ar' ? 'الرابط المختصر' : 'URL Slug'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={language === 'ar' ? 'الرابط-المختصر' : 'url-slug'}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            {language === 'ar' 
                              ? 'سيتم استخدام هذا في عنوان URL للمقال'
                              : 'This will be used in the post URL'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormItem>
                    <FormLabel>
                      {language === 'ar' ? 'صورة المقال' : 'Post Image'}
                    </FormLabel>
                    <ImageUploader 
                      onImageUploaded={onImageUploaded} 
                      existingImageUrl={imageUrl}
                    />
                    <FormDescription>
                      {language === 'ar'
                        ? 'يمكنك رفع صورة من جهازك'
                        : 'You can upload an image from your device'}
                    </FormDescription>
                  </FormItem>
                  
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
                        
                        {!previewMode && (
                          <div className="mb-2">
                            <ToggleGroup type="multiple" className="justify-start">
                              <ToggleGroupItem value="bold" onClick={() => insertFormatting('bold')} title="Bold">
                                <Bold className="h-4 w-4" />
                              </ToggleGroupItem>
                              <ToggleGroupItem value="h1" onClick={() => insertFormatting('h1')} title="Heading 1">
                                <Heading1 className="h-4 w-4" />
                              </ToggleGroupItem>
                              <ToggleGroupItem value="h2" onClick={() => insertFormatting('h2')} title="Heading 2">
                                <Heading2 className="h-4 w-4" />
                              </ToggleGroupItem>
                              <ToggleGroupItem value="h3" onClick={() => insertFormatting('h3')} title="Heading 3">
                                <Heading3 className="h-4 w-4" />
                              </ToggleGroupItem>
                              <ToggleGroupItem value="link" onClick={() => insertFormatting('link')} title="Internal Link">
                                <LinkIcon className="h-4 w-4" />
                              </ToggleGroupItem>
                            </ToggleGroup>
                          </div>
                        )}
                        
                        {previewMode ? (
                          <div 
                            className="min-h-[300px] p-4 border rounded-md overflow-auto prose max-w-none"
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
                            ? 'يمكنك استخدام علامات مثل # و ## و ### للعناوين، و**النص** للنص العريض، و[النص](الرابط) للروابط'
                            : 'You can use # ## ### for headings, **text** for bold text, and [text](link) for links'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || isGenerating} 
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                  >
                    {isSubmitting && (
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
                    )}
                    {language === 'ar' ? 'نشر المقال' : 'Publish Post'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        
        {/* Manage Posts Tab */}
        <TabsContent value="manage">
          <Card className="border-2 border-opacity-50 shadow-md hover:shadow-lg transition-all">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardTitle>
                {language === 'ar' ? 'إدارة المقالات' : 'Manage Blog Posts'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'استعرض وحرر وحذف المقالات الموجودة'
                  : 'View, edit and delete existing blog posts'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BlogManagement />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Users Tab */}
        <TabsContent value="users">
          <Card className="border-2 border-opacity-50 shadow-md hover:shadow-lg transition-all">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardTitle>
                {language === 'ar' ? 'إدارة المستخدمين' : 'Manage Users'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'استعرض وحظر وحذف المستخدمين'
                  : 'View, ban and delete users'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
