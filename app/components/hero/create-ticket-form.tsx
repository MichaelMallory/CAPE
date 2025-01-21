'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const LocationPicker = dynamic(() => import('./location-picker'), { ssr: false });

const PRIORITY_LEVELS = [
  { value: 'OMEGA', label: 'OMEGA - Global Threat' },
  { value: 'ALPHA', label: 'ALPHA - City-wide Emergency' },
  { value: 'BETA', label: 'BETA - Urgent Assistance' },
  { value: 'GAMMA', label: 'GAMMA - Routine Support' },
];

const CATEGORIES = [
  { value: 'MISSION', label: 'Mission Support' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'INTELLIGENCE', label: 'Intelligence' },
];

export function CreateTicketForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const validationErrors: Record<string, string> = {};

    // Validate required fields
    ['title', 'category', 'priority', 'description'].forEach(field => {
      if (!formData.get(field)) {
        validationErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create ticket');

      const data = await response.json();
      router.push(`/hero/tickets/${data.id}`);
    } catch (error) {
      console.error('Error creating ticket:', error);
      setErrors({ submit: 'Failed to create ticket. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="Brief description of the issue"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category">
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select name="priority">
              <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_LEVELS.map(priority => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.priority && <p className="text-sm text-red-500">{errors.priority}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Detailed description of the issue"
            className={`min-h-[150px] ${errors.description ? 'border-red-500' : ''}`}
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="files">Attachments</Label>
          <Input
            id="files"
            name="files"
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('files')?.click()}
          >
            Attach Files
          </Button>
          {files.length > 0 && (
            <ul className="mt-2 space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              Select Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Select Incident Location</DialogTitle>
            </DialogHeader>
            <LocationPicker
              onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
              initialLocation={location}
            />
            {location && (
              <input
                type="hidden"
                name="location"
                value={JSON.stringify(location)}
              />
            )}
          </DialogContent>
        </Dialog>

        {location && (
          <div className="bg-muted p-2 rounded text-sm">
            Location selected: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </div>
        )}

        {errors.submit && (
          <p className="text-sm text-red-500">{errors.submit}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Ticket...' : 'Submit Ticket'}
        </Button>
      </form>
    </Card>
  );
} 