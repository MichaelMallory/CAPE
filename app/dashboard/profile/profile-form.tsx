'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState, useRef } from 'react';

const profileSchema = z.object({
  codename: z.string().min(2, 'Codename must be at least 2 characters'),
  real_name: z.string().optional(),
  powers: z.string().optional(),
  team_affiliations: z.string().optional(),
  avatar_url: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedProfile = useRef(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      codename: '',
      real_name: '',
      powers: '',
      team_affiliations: '',
      avatar_url: '',
      bio: '',
    },
    mode: 'onChange'
  });

  // Load profile data only once on mount
  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        console.log('No user found in loadProfile');
        setIsLoading(false);
        return;
      }

      if (hasLoadedProfile.current) {
        console.log('Profile already loaded');
        return;
      }

      console.log('Loading profile for user:', user.id);

      try {
        // First check if we can connect to Supabase
        const { data: testData, error: testError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);

        if (testError) {
          console.error('Connection test failed:', testError);
          throw new Error('Failed to connect to database');
        }

        console.log('Connection test successful');

        // Now load the actual profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Profile fetch error:', error);
          throw error;
        }

        console.log('Fetched profile:', profile);

        if (profile) {
          const formValues = {
            codename: profile.codename || '',
            real_name: profile.real_name || '',
            powers: Array.isArray(profile.powers) ? profile.powers.join(', ') : '',
            team_affiliations: Array.isArray(profile.team_affiliations) ? profile.team_affiliations.join(', ') : '',
            avatar_url: profile.avatar_url || '',
            bio: profile.bio || '',
          };

          console.log('Setting form values:', formValues);
          
          // Set initial form values without triggering rerender
          form.reset(formValues, { 
            keepDefaultValues: true,
            keepDirty: false,
            keepTouched: false,
          });
          
          hasLoadedProfile.current = true;
          console.log('Profile loaded successfully');
        } else {
          console.log('No profile found for user');
          setProfileError('No profile found');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error loading profile:', error);
        setProfileError(errorMessage);
        toast({
          title: 'Error',
          description: `Failed to load profile: ${errorMessage}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [user, supabase, toast]); // Removed form from dependencies

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    try {
      console.log('Submitting form with data:', data);

      const updateData = {
        codename: data.codename,
        real_name: data.real_name,
        powers: data.powers?.split(',').map(p => p.trim()).filter(Boolean) || [],
        team_affiliations: data.team_affiliations?.split(',').map(t => t.trim()).filter(Boolean) || [],
        avatar_url: data.avatar_url,
        bio: data.bio,
        updated_at: new Date().toISOString(),
      };

      console.log('Updating profile with:', updateData);

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      console.log('Profile updated successfully');
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated!',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAvatarUpload = (url: string) => {
    console.log('Avatar URL received:', url);
    form.setValue('avatar_url', url, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    console.log('Current avatar_url value:', form.getValues('avatar_url'));
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (profileError) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">Error loading profile: {profileError}</p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col items-center gap-2">
          <AvatarUpload
            currentAvatarUrl={form.watch('avatar_url')}
            onUploadComplete={handleAvatarUpload}
          />
          {form.watch('avatar_url') && (
            <p className="text-sm text-gray-500">
              Current avatar URL: {form.watch('avatar_url')}
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="codename"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Codename <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Enter your codename" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="real_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Real Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter your real name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {role === 'HERO' && (
          <>
            <FormField
              control={form.control}
              name="powers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Powers (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your powers (comma-separated)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="team_affiliations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Affiliations (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your team affiliations (comma-separated)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about yourself" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Update Profile
        </Button>
      </form>
    </Form>
  );
} 