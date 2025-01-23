'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface AISuggestion {
  id: string;
  text: string;
  confidence: number;
  category: string;
}

interface AISuggestionsProps {
  ticketId: string;
  onSelectSuggestion?: (suggestion: string) => void;
}

// Mock suggestions for now - would be replaced with actual AI integration
const mockSuggestions: AISuggestion[] = [
  {
    id: '1',
    text: 'Based on the equipment logs, this appears to be a calibration issue. I recommend running the diagnostic suite first.',
    confidence: 0.92,
    category: 'Technical'
  },
  {
    id: '2',
    text: 'Similar issues were resolved by updating the firmware. Would you like me to check the current version?',
    confidence: 0.85,
    category: 'Maintenance'
  },
  {
    id: '3',
    text: 'This is a known issue with the Mark VII series. The solution is documented in KB-2547.',
    confidence: 0.78,
    category: 'Knowledge Base'
  }
];

export function AISuggestions({ ticketId, onSelectSuggestion }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadSuggestions = async () => {
      setIsLoading(true);
      try {
        // This would be replaced with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSuggestions(mockSuggestions);
      } catch (error) {
        console.error('Failed to load AI suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, [ticketId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Suggested Responses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Suggested Responses</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4" role="list" aria-label="Suggested Responses">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm">{suggestion.text}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Confidence: {Math.round(suggestion.confidence * 100)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Category: {suggestion.category}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectSuggestion?.(suggestion.text)}
                >
                  Use
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
} 