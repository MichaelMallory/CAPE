import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST /api/profile/avatar - Upload avatar image
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    // Get form data
    const formData = await request.formData();
    const avatarFile = formData.get('avatar') as File;
    
    if (!avatarFile) {
      return new NextResponse(
        'No avatar file provided',
        { status: 400 }
      );
    }

    // Validate file type
    if (!avatarFile.type.startsWith('image/')) {
      return new NextResponse(
        'Invalid file type. Only images are allowed.',
        { status: 400 }
      );
    }

    // Upload to storage
    const fileName = `${user.id}-${Date.now()}-${avatarFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ avatar_url: publicUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return new NextResponse(
      'Failed to upload avatar',
      { status: 500 }
    );
  }
}

// DELETE /api/profile/avatar - Remove avatar
export async function DELETE() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    // Get current avatar URL
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    if (!profile?.avatar_url) {
      return new NextResponse('No avatar to delete', { status: 404 });
    }

    // Extract filename from URL
    const fileName = profile.avatar_url.split('/').pop();
    if (!fileName) throw new Error('Invalid avatar URL');

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove([fileName]);

    if (deleteError) throw deleteError;

    // Update user profile
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: null })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Avatar deletion error:', error);
    return new NextResponse(
      'Failed to delete avatar',
      { status: 500 }
    );
  }
} 