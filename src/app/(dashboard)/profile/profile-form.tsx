import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AvatarUpload } from '@/components/ui/avatar-upload';

const profileSchema = z.object({
  codename: z.string().min(2, 'Codename must be at least 2 characters'),
  real_name: z.string().min(2, 'Real name must be at least 2 characters'),
  powers: z.string().min(2, 'Powers must be at least 2 characters'),
  team_affiliations: z.string().optional(),
  avatar_url: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('heroes')
        .select()
        .eq('id', user?.id)
        .single();
      
      return {
        codename: profile?.codename || '',
        real_name: profile?.real_name || '',
        powers: profile?.powers?.join(', ') || '',
        team_affiliations: profile?.team_affiliations?.join(', ') || '',
        avatar_url: profile?.avatar_url || '',
      };
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('heroes')
        .update({
          codename: data.codename,
          real_name: data.real_name,
          powers: data.powers.split(',').map(p => p.trim()),
          team_affiliations: data.team_affiliations?.split(',').map(t => t.trim()) || [],
          avatar_url: data.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your hero profile has been successfully updated!',
        variant: 'default',
      });
    } catch (error) {
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
                <Input placeholder="Enter your hero codename" {...field} />
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

        <Button type="submit" className="w-full">
          Update Profile
        </Button>
      </form>
    </Form>
  );
} 