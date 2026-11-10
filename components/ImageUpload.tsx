import { useState } from 'react';
// SUPABASE PHASED OUT - Using MagicAPI for image uploads
// import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Check } from 'lucide-react';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  productId?: string;
}

export function ImageUpload({ onImageUploaded, currentImage, productId }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId || Date.now()}.${fileExt}`;

      // Upload to MagicAPI (D1 compatible)
      const formData = new FormData();
      formData.append('filename', file);

      const response = await fetch('https://prod.api.market/api/v1/magicapi/image-upload/upload', {
        method: 'POST',
        headers: {
          'x-magicapi-key': 'cmk66u1uw000tl7042sbpqjvq'
        },
        body: formData
      });

      const result = await response.json();
      
      if (!result.url) {
        throw new Error(result.error || 'Upload failed');
      }

      const imageUrl = result.url;
      setPreview(imageUrl);
      onImageUploaded(imageUrl);

    } catch (error) {
      alert('Error uploading image: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageUploaded('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="image/*"
          onChange={uploadImage}
          disabled={uploading}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.querySelector('input[type="file"]')?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </>
          )}
        </Button>
      </div>

      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
            onClick={removeImage}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}