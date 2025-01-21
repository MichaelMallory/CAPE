'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system'], {
    required_error: "Please select a theme",
  }),
  notifications: z.object({
    missionUpdates: z.boolean(),
    equipmentAlerts: z.boolean(),
    teamMessages: z.boolean(),
    securityAlerts: z.boolean(),
  }).refine(data => 
    Object.values(data).some(v => v === true), {
    message: "At least one notification type must be enabled",
    path: ["notifications"],
  }),
  accessibility: z.object({
    reduceMotion: z.boolean(),
    highContrast: z.boolean(),
    largeText: z.boolean(),
  }),
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export function PreferencesForm() {
  const { toast } = useToast();
  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      theme: 'system',
      notifications: {
        missionUpdates: true,
        equipmentAlerts: true,
        teamMessages: true,
        securityAlerts: true,
      },
      accessibility: {
        reduceMotion: false,
        highContrast: false,
        largeText: false,
      },
    },
    mode: "onChange", // Enable real-time validation
  });

  async function onSubmit(data: PreferencesFormValues) {
    try {
      // TODO: Implement preferences update logic
      console.log(data);
      
      // Show success notification with comic-style animation
      toast({
        title: "POW! Preferences Updated!",
        description: "Your hero settings have been saved successfully.",
        variant: "default",
        duration: 3000,
        className: "bg-green-500 text-white font-comic border-2 border-black shadow-lg",
      });
    } catch (error) {
      console.error('Failed to update preferences:', error);
      
      // Show error notification with comic-style animation
      toast({
        title: "CRASH! Something Went Wrong!",
        description: "Unable to save your preferences. Please try again.",
        variant: "destructive",
        duration: 5000,
        className: "font-comic border-2 border-black shadow-lg",
      });
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-background border rounded-lg shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-comic mb-6">Notification Preferences</h2>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="notifications.missionUpdates"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Mission Updates</FormLabel>
                      <FormDescription>
                        Receive alerts about mission status changes and assignments
                      </FormDescription>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notifications.equipmentAlerts"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Equipment Alerts</FormLabel>
                      <FormDescription>
                        Get notified about equipment maintenance and updates
                      </FormDescription>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {/* Show general notification validation error */}
              {form.formState.errors.notifications?.root && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-destructive text-sm"
                >
                  {form.formState.errors.notifications.root.message}
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-comic mb-6">Accessibility Settings</h2>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="accessibility.reduceMotion"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Reduce Motion</FormLabel>
                      <FormDescription>
                        Minimize animations throughout the interface
                      </FormDescription>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accessibility.highContrast"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>High Contrast</FormLabel>
                      <FormDescription>
                        Increase contrast for better visibility
                      </FormDescription>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </motion.div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            Save Preferences
          </Button>
        </form>
      </Form>
    </div>
  );
} 