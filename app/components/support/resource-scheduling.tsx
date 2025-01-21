import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

const formSchema = z.object({
  resourceType: z.enum(['hero', 'equipment', 'facility']),
  resourceId: z.string(),
  assignmentType: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
});

type FormValues = z.infer<typeof formSchema>;

const MOCK_RESOURCES = {
  hero: [
    { id: 'captain-thunder', name: 'Captain Thunder' },
    { id: 'wind-walker', name: 'Wind Walker' },
    { id: 'shadow-blade', name: 'Shadow Blade' },
  ],
  equipment: [
    { id: 'quantum-suit', name: 'Quantum Suit' },
    { id: 'plasma-cannon', name: 'Plasma Cannon' },
    { id: 'stealth-jet', name: 'Stealth Jet' },
  ],
  facility: [
    { id: 'training-room', name: 'Training Room' },
    { id: 'med-bay', name: 'Medical Bay' },
    { id: 'command-center', name: 'Command Center' },
  ],
};

const MOCK_ASSIGNMENTS = {
  hero: [
    { id: 'downtown-patrol', name: 'Downtown Patrol' },
    { id: 'rescue-ops', name: 'Rescue Operations' },
    { id: 'combat-training', name: 'Combat Training' },
  ],
  equipment: [
    { id: 'maintenance', name: 'Maintenance' },
    { id: 'mission-deployment', name: 'Mission Deployment' },
    { id: 'testing', name: 'Testing & Calibration' },
  ],
  facility: [
    { id: 'active-use', name: 'Active Use' },
    { id: 'maintenance', name: 'Maintenance' },
    { id: 'special-ops', name: 'Special Operations' },
  ],
};

interface ResourceSchedulingProps {
  onSchedule: (values: FormValues) => void;
}

export function ResourceScheduling({ onSchedule }: ResourceSchedulingProps) {
  const [selectedType, setSelectedType] = useState<keyof typeof MOCK_RESOURCES>('hero');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resourceType: 'hero',
      priority: 'MEDIUM',
    },
  });

  const onSubmit = (values: FormValues) => {
    onSchedule(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="resourceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resource Type</FormLabel>
              <Select
                onValueChange={(value: keyof typeof MOCK_RESOURCES) => {
                  field.onChange(value);
                  setSelectedType(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="hero">Hero</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="facility">Facility</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resourceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resource</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MOCK_RESOURCES[selectedType].map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assignmentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignment</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MOCK_ASSIGNMENTS[selectedType].map((assignment) => (
                    <SelectItem key={assignment.id} value={assignment.id}>
                      {assignment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="HIGH">High Priority</SelectItem>
                  <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                  <SelectItem value="LOW">Low Priority</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit">Schedule Resource</Button>
        </div>
      </form>
    </Form>
  );
} 