
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabaseUntyped } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image, Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  existingImageUrl?: string;
}

const ImageUploader = ({ onImageUploaded, existingImageUrl }: ImageUploaderProps) => {
  const { language } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(existingImageUrl || '');

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

      console.log('Uploading to bucket: images, path:', filePath);
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabaseUntyped.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Get the public URL
      const { data: urlData } = supabaseUntyped.storage
        .from('images')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      console.log('Public URL:', publicUrl);
      
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div>
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
