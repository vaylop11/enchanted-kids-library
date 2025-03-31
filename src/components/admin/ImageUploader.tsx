
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabaseUntyped } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image, Upload, RefreshCw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  existingImageUrl?: string;
}

const ImageUploader = ({ onImageUploaded, existingImageUrl }: ImageUploaderProps) => {
  const { language } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(existingImageUrl || '');
  const [imageKeywords, setImageKeywords] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        language === 'ar'
          ? 'حجم الملف كبير جدًا، يجب أن يكون أقل من 5 ميجابايت'
          : 'File is too large, must be less than 5MB'
      );
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error(
        language === 'ar'
          ? 'يرجى اختيار ملف صورة صالح'
          : 'Please select a valid image file'
      );
      return;
    }

    setIsUploading(true);

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      // Upload the file to Supabase Storage
      const { data, error } = await supabaseUntyped.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: urlData } = supabaseUntyped.storage
        .from('images')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      setImageUrl(publicUrl);
      onImageUploaded(publicUrl);
      
      toast.success(
        language === 'ar'
          ? 'تم رفع الصورة بنجاح'
          : 'Image uploaded successfully'
      );
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(
        language === 'ar'
          ? 'فشل في رفع الصورة'
          : 'Failed to upload image'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const generateNewImage = () => {
    const keywords = imageKeywords || 'blog post';
    if (keywords) {
      const newImageUrl = `https://source.unsplash.com/featured/?${encodeURIComponent(keywords)}&random=${Date.now()}`;
      setImageUrl(newImageUrl);
      onImageUploaded(newImageUrl);
      toast.success(language === 'ar' ? 'تم تحديث الصورة' : 'Image updated');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'ar' ? 'رفع صورة' : 'Upload Image'}
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'ar' ? 'أو توليد صورة' : 'Or Generate Image'}
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={language === 'ar' ? 'كلمات البحث للصورة' : 'Image keywords'}
                value={imageKeywords}
                onChange={(e) => setImageKeywords(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={generateNewImage}
                disabled={isUploading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {language === 'ar' ? 'توليد' : 'Generate'}
              </Button>
            </div>
          </div>
        </div>

        {isUploading && (
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-r-transparent rounded-full"></div>
          </div>
        )}

        {imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-md border">
            <img 
              src={imageUrl} 
              alt="Blog post image"
              className="h-full w-full object-cover"
              onError={() => {
                toast.error(
                  language === 'ar' 
                    ? 'فشل في تحميل الصورة، يرجى تجربة صورة أخرى' 
                    : 'Failed to load image, please try another one'
                );
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
