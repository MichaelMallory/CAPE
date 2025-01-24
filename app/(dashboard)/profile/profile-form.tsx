'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { Textarea } from '@/components/ui/textarea';

const profileSchema = z.object({
  codename: z.string().min(2, 'Codename must be at least 2 characters'),
  real_name: z.string().min(2, 'Real name must be at least 2 characters'),
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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      codename: '',
      real_name: '',
      powers: '',
      team_affiliations: '',
      avatar_url: '',
      bio: '',
    }
  });

  // Load initial profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile) {
          form.reset({
            codename: profile.codename || '',
            real_name: profile.real_name || '',
            powers: Array.isArray(profile.powers) ? profile.powers.join(', ') : '',
            team_affiliations: Array.isArray(profile.team_affiliations) ? profile.team_affiliations.join(', ') : '',
            avatar_url: profile.avatar_url || '',
            bio: profile.bio || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data. Please refresh the page.',
          variant: 'destructive',
        });
      }
    }

    loadProfile();
  }, [user, supabase, form, toast]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          codename: data.codename,
          real_name: data.real_name,
          powers: data.powers?.split(',').map(p => p.trim()).filter(Boolean) || [],
          team_affiliations: data.team_affiliations?.split(',').map(t => t.trim()).filter(Boolean) || [],
          avatar_url: data.avatar_url,
          bio: data.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

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
  }

  const handleAvatarUpload = (url: string) => {
    form.setValue('avatar_url', url);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-center mb-8">
          <AvatarUpload
            currentAvatarUrl={form.watch('avatar_url')}
            onUploadComplete={handleAvatarUpload}
          />
        </div>

        <FormField
          control={form.control}
          name="codename"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Codename</FormLabel>
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
              <FormLabel>Real Name</FormLabel>
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
                  <FormLabel>Powers</FormLabel>
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
                  <FormLabel>Team Affiliations</FormLabel>
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
              <FormLabel>Bio</FormLabel>
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