'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/hooks/use-toast';
import { ActionEffect } from '@/components/ui/action-effect';
import { useAuth } from '@/hooks/use-auth';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onUploadComplete: (url: string) => void;
}

export function AvatarUpload({ currentAvatarUrl, onUploadComplete }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showEffect, setShowEffect] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const { user } = useAuth();

  const deleteOldAvatar = async (url: string) => {
    try {
      // Extract the path from the URL
      const path = url.split('/').pop();
      if (!path) return;

      // Delete the old file
      const { error } = await supabase.storage
        .from('avatars')
        .remove([path]);

      if (error) {
        console.error('Error deleting old avatar:', error);
      }
    } catch (error) {
      console.error('Error in deleteOldAvatar:', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user?.id || acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);

    try {
      // Generate a unique file name using user ID
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Delete old avatar if it exists
      if (currentAvatarUrl) {
        await deleteOldAvatar(currentAvatarUrl);
      }

      // Upload the new file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true // This will overwrite if the file exists
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      onUploadComplete(publicUrl);
      setShowEffect(true);
      setTimeout(() => setShowEffect(false), 1000);

      toast({
        title: 'Avatar Updated!',
        description: 'Your new profile picture has been uploaded.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [currentAvatarUrl, onUploadComplete, supabase, toast, user]);

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
          <ActionEffect type="pow" className="absolute -right-4 -top-4" />
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