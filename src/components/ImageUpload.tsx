import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Image, X } from 'lucide-react';
import { convertToBase64, compressImage, validateImage } from '@/lib/imageUtils';

interface ImageUploadProps {
  onImageUpload: (base64Image: string) => void;
  currentImage?: string;
  aspectRatio?: 'square' | 'cover';
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImage,
  aspectRatio = 'square',
  className = ''
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      validateImage(file);
      setIsUploading(true);

      const base64 = await convertToBase64(file);
      const compressedImage = await compressImage(base64);
      
      setPreview(compressedImage);
      onImageUpload(compressedImage);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error instanceof Error ? error.message : 'Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className={`w-full h-full object-cover rounded-lg ${
              aspectRatio === 'cover' ? 'aspect-[16/9]' : 'aspect-square'
            }`}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button
              variant="destructive"
              size="icon"
              onClick={handleRemoveImage}
              className="mr-2"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors ${
            aspectRatio === 'cover' ? 'aspect-[16/9]' : 'aspect-square'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <Image className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">
            {isUploading ? 'Uploading...' : 'Click to upload image'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 