'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQueueSystem, TicketPriority } from '@/hooks/use-queue-system';
import { useToast } from '@/components/ui/use-toast';

const ticketSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['OMEGA', 'ALPHA', 'BETA', 'GAMMA'] as const),
  type: z.enum(['MISSION', 'EQUIPMENT', 'INTELLIGENCE'] as const),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface CreateTicketFormProps {
  onSuccess?: () => void;
}

export function CreateTicketForm({ onSuccess }: CreateTicketFormProps) {
  const { createTicket } = useQueueSystem();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'BETA',
      type: 'MISSION',
    },
  });

  const onSubmit = async (data: TicketFormData) => {
    console.log('🎫 CreateTicketForm - Submit Triggered', { data });
    try {
      setIsSubmitting(true);
      console.log('🎫 CreateTicketForm - Creating Ticket...');
      const ticket = await createTicket({
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: 'NEW',
        type: data.type,
        metadata: {
          created_at: new Date().toISOString(),
        }
      });
      console.log('🎫 CreateTicketForm - Ticket Created Successfully', { ticket });

      toast({
        title: 'Ticket created',
        description: 'Your support ticket has been submitted successfully.',
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('🎫 CreateTicketForm - Error Creating Ticket:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create ticket. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      console.log('🎫 CreateTicketForm - Submission Complete');
    }
  };

  console.log('🎫 CreateTicketForm - Form State:', {
    isSubmitting,
    formValues: form.getValues(),
    formErrors: form.formState.errors,
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid
  });

  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          console.log('🎫 CreateTicketForm - Form Submit Event', e);
          form.handleSubmit(onSubmit)(e);
        }} 
        className="space-y-6 max-w-4xl mx-auto p-4"
      >
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of the issue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OMEGA">Omega (Critical)</SelectItem>
                        <SelectItem value="ALPHA">Alpha (High)</SelectItem>
                        <SelectItem value="BETA">Beta (Medium)</SelectItem>
                        <SelectItem value="GAMMA">Gamma (Low)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MISSION">Mission Support</SelectItem>
                        <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                        <SelectItem value="INTELLIGENCE">Intelligence</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed explanation of the issue"
                    className="min-h-[200px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating...' : 'Create Ticket'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 