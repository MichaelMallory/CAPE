import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import { Button } from './button';
import { ActionEffect } from './action-effect';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onUploadComplete: (url: string) => void;
}

export function AvatarUpload({ currentAvatarUrl, onUploadComplete }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showEffect, setShowEffect] = useState(false);
  const supabase = createClientComponentClient();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    try {
      setIsUploading(true);
      const file = acceptedFiles[0];
      const fileExt = file.name.split('.').pop();
      const { data: { user } } = await supabase.auth.getUser();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);
      setShowEffect(true);
      setTimeout(() => setShowEffect(false), 1000);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setIsUploading(false);
    }
  }, [supabase, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32">
        {currentAvatarUrl ? (
          <Image
            src={currentAvatarUrl}
            alt="Hero avatar"
            width={128}
            height={128}
            className="rounded-full object-cover border-4 border-primary"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-primary">
            <span className="text-4xl">🦸</span>
          </div>
        )}
        {showEffect && (
          <ActionEffect type="pow" className="absolute -right-4 -top-4" data-testid="action-effect" />
        )}
      </div>

      <div
        {...getRootProps()}
        className={`
          mt-4 p-4 border-2 border-dashed rounded-lg text-center cursor-pointer
          transition-colors duration-200 max-w-xs w-full
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}
        `}
      >
        <input {...getInputProps()} />
        <Button
          type="button"
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Choose Avatar'}
        </Button>
        <p className="text-sm mt-2 text-gray-600">
          {isDragActive ? 'Drop your image here!' : 'or drag and drop an image here'}
        </p>
      </div>
    </div>
  );
} 