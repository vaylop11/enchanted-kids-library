
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { supabaseUntyped } from '@/integrations/supabase/client';
import { Loader2, Sparkles } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageUploader from './ImageUploader';
import UserManagement from './UserManagement';

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
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [currentApiKey, setCurrentApiKey] = useState('');

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
      }
    };
    
    if (isAdmin) {
      fetchApiKey();
    }
  }, [isAdmin]);

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

  const onSubmitApiKey = async (values: z.infer<typeof apiKeySchema>) => {
    setIsSavingApiKey(true);
    
    try {
      const { error } = await supabaseUntyped.functions.invoke('update-gemini-api-key', {
        body: { apiKey: values.geminiApiKey }
      });
      
      if (error) throw error;
      
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
          : 'Error updating API key'
      );
    } finally {
      setIsSavingApiKey(false);
    }
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
