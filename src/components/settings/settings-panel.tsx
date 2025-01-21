"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ActionEffect } from '@/components/ui/action-effect';

const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  notifications: z.object({
    missions: z.boolean(),
    equipment: z.boolean(),
    teamUpdates: z.boolean(),
    alerts: z.boolean(),
  }),
  accessibility: z.object({
    reduceMotion: z.boolean(),
    highContrast: z.boolean(),
  }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsPanel() {
  const [showEffect, setShowEffect] = React.useState(false);
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      theme: 'system',
      notifications: {
        missions: true,
        equipment: true,
        teamUpdates: true,
        alerts: true,
      },
      accessibility: {
        reduceMotion: false,
        highContrast: false,
      },
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      // TODO: Implement settings update logic
      console.warn('Settings update not implemented:', data);
      setShowEffect(true);
      setTimeout(() => setShowEffect(false), 1000);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto relative">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-comic">Hero Settings</h2>
        {showEffect && (
          <ActionEffect type="pow" className="absolute -right-4 -top-4" data-testid="settings-effect" />
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="p-6">
            <h3 className="text-xl font-comic-secondary mb-4">Theme Preferences</h3>
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color Theme</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose your preferred color scheme</FormDescription>
                </FormItem>
              )}
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-comic-secondary mb-4">Notification Settings</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="notifications.missions"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>Mission Updates</FormLabel>
                      <FormDescription>Get notified about new missions and updates</FormDescription>
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
                name="notifications.equipment"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>Equipment Status</FormLabel>
                      <FormDescription>Receive alerts about your equipment</FormDescription>
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
                name="notifications.teamUpdates"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>Team Updates</FormLabel>
                      <FormDescription>Stay informed about team activities</FormDescription>
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
                name="notifications.alerts"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>Priority Alerts</FormLabel>
                      <FormDescription>Get immediate notifications for urgent matters</FormDescription>
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
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-comic-secondary mb-4">Accessibility</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="accessibility.reduceMotion"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>Reduce Motion</FormLabel>
                      <FormDescription>Minimize animations and transitions</FormDescription>
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
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>High Contrast</FormLabel>
                      <FormDescription>Enhance visual contrast for better readability</FormDescription>
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
          </Card>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-comic py-2 px-4 rounded-lg transition-colors"
          >
            Save Settings
          </button>
        </form>
      </Form>
    </div>
  );
} 