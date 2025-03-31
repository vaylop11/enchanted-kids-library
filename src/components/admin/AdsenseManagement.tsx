
import React, { useState, useEffect } from 'react';
import { supabaseUntyped } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Save } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const adsSettingsSchema = z.object({
  publisherId: z.string().min(1, {
    message: "Publisher ID is required.",
  }),
  adsTxtContent: z.string().optional(),
});

const AdsenseManagement = () => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const form = useForm<z.infer<typeof adsSettingsSchema>>({
    resolver: zodResolver(adsSettingsSchema),
    defaultValues: {
      publisherId: '',
      adsTxtContent: '',
    },
  });

  useEffect(() => {
    fetchAdsenseSettings();
  }, []);

  const fetchAdsenseSettings = async () => {
    setLoading(true);
    try {
      // Fetch the publisher ID from adsense_settings
      const { data: adsenseData, error: adsenseError } = await supabaseUntyped
        .from('adsense_settings')
        .select('*')
        .limit(1)
        .single();

      if (adsenseError && adsenseError.code !== 'PGRST116') {
        console.error('Error fetching AdSense settings:', adsenseError);
        toast.error(language === 'ar' ? 'خطأ في جلب إعدادات AdSense' : 'Error fetching AdSense settings');
      }

      // Fetch the ads.txt content from system_settings
      const { data: systemData, error: systemError } = await supabaseUntyped
        .from('system_settings')
        .select('value')
        .eq('key', 'ads_txt_content')
        .single();

      if (systemError && systemError.code !== 'PGRST116') {
        console.error('Error fetching ads.txt content:', systemError);
        toast.error(language === 'ar' ? 'خطأ في جلب محتوى ads.txt' : 'Error fetching ads.txt content');
      }

      // Update form values
      form.reset({
        publisherId: adsenseData?.publisher_id || '',
        adsTxtContent: systemData?.value || '',
      });
    } catch (error) {
      console.error('Error in fetchAdsenseSettings:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء جلب الإعدادات' : 'Error fetching settings');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof adsSettingsSchema>) => {
    setSaving(true);
    try {
      // Update or insert the publisher ID in adsense_settings
      const { data: existingData, error: fetchError } = await supabaseUntyped
        .from('adsense_settings')
        .select('id')
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing AdSense settings:', fetchError);
        throw fetchError;
      }

      let adsenseError;
      if (existingData?.id) {
        // Update existing record
        const { error } = await supabaseUntyped
          .from('adsense_settings')
          .update({ publisher_id: values.publisherId, updated_at: new Date().toISOString() })
          .eq('id', existingData.id);
        adsenseError = error;
      } else {
        // Insert new record
        const { error } = await supabaseUntyped
          .from('adsense_settings')
          .insert({ publisher_id: values.publisherId });
        adsenseError = error;
      }

      if (adsenseError) {
        console.error('Error saving AdSense settings:', adsenseError);
        throw adsenseError;
      }

      // Update ads.txt content in system_settings
      const { error: systemError } = await supabaseUntyped
        .from('system_settings')
        .update({ value: values.adsTxtContent || '', updated_at: new Date().toISOString() })
        .eq('key', 'ads_txt_content');

      if (systemError) {
        console.error('Error saving ads.txt content:', systemError);
        throw systemError;
      }

      toast.success(language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    } catch (error) {
      console.error('Error in onSubmit:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء حفظ الإعدادات' : 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {language === 'ar' ? 'إعدادات Google AdSense' : 'Google AdSense Settings'}
        </CardTitle>
        <CardDescription>
          {language === 'ar' 
            ? 'قم بإدارة إعدادات الإعلانات وملف ads.txt'
            : 'Manage your AdSense settings and ads.txt file'}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="publisherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === 'ar' ? 'معرّف الناشر' : 'Publisher ID'}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="pub-xxxxxxxxxxxxxxxx" {...field} />
                  </FormControl>
                  <FormDescription>
                    {language === 'ar'
                      ? 'معرّف الناشر الخاص بك من Google AdSense (يبدأ بـ pub-)'
                      : 'Your Google AdSense publisher ID (starts with pub-)'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adsTxtContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === 'ar' ? 'محتوى ملف ads.txt' : 'ads.txt Content'}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`google.com, pub-xxxxxxxxxxxxxxxx, DIRECT, f08c47fec0942fa0`}
                      className="min-h-32 font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {language === 'ar'
                      ? 'محتوى ملف ads.txt. كل سطر يجب أن يتبع تنسيق: النطاق، معرّف الناشر، نوع العلاقة، معرّف التطبيق'
                      : 'Content of your ads.txt file. Each line should follow the format: domain, publisher ID, relationship type, certification ID'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={saving} className="w-full">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default AdsenseManagement;
