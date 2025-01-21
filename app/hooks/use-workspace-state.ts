import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

interface PanelPosition {
  x: number;
  y: number;
}

interface Panel {
  id: string;
  position: PanelPosition;
  visible: boolean;
}

interface WorkspaceLayout {
  panels: Panel[];
  version: number;
}

interface UseWorkspaceStateReturn {
  layout: WorkspaceLayout | null;
  isLoading: boolean;
  error: Error | null;
  saveLayout: (layout: WorkspaceLayout) => Promise<void>;
  resetLayout: () => Promise<void>;
  isOnline: boolean;
}

const defaultLayout: WorkspaceLayout = {
  panels: [
    { id: 'ticket-queue', position: { x: 0, y: 0 }, visible: true },
    { id: 'resource-status', position: { x: 1, y: 0 }, visible: true },
    { id: 'team-chat', position: { x: 0, y: 1 }, visible: true },
  ],
  version: 1,
};

export function useWorkspaceState(): UseWorkspaceStateReturn {
  const supabase = useSupabaseClient();
  const user = useUser();
  const { toast } = useToast();
  const [layout, setLayout] = useState<WorkspaceLayout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null);

  // Load initial layout
  useEffect(() => {
    if (!user) return;

    async function loadLayout() {
      try {
        const { data, error } = await supabase
          .from('workspace_layouts')
          .select('layout')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setLayout(data.layout);
        } else {
          // Create default layout if none exists
          const { error: insertError } = await supabase
            .from('workspace_layouts')
            .insert({ user_id: user.id, layout: defaultLayout });

          if (insertError) throw insertError;
          setLayout(defaultLayout);
        }
      } catch (err) {
        console.error('Error loading workspace layout:', err);
        setError(err instanceof Error ? err : new Error('Failed to load layout'));
        setLayout(defaultLayout); // Fallback to default
      } finally {
        setIsLoading(false);
      }
    }

    loadLayout();
  }, [user, supabase]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`workspace:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workspace_layouts',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && payload.new.layout) {
            setLayout(payload.new.layout as WorkspaceLayout);
          }
        }
      )
      .subscribe();

    setSubscription(channel);

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase]);

  // Handle online/offline status
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      toast({
        title: 'Back online',
        description: 'Changes will now sync automatically',
      });
    }

    function handleOffline() {
      setIsOnline(false);
      toast({
        title: 'Working offline',
        description: 'Changes will sync when you reconnect',
        variant: 'destructive',
      });
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Save layout function
  const saveLayout = async (newLayout: WorkspaceLayout) => {
    if (!user) return;

    try {
      // Save to local state immediately
      setLayout(newLayout);

      if (!isOnline) {
        // Store in localStorage when offline
        localStorage.setItem(`workspace_layout_${user.id}`, JSON.stringify(newLayout));
        toast({
          title: 'Changes saved locally',
          description: 'Will sync when back online',
        });
        return;
      }

      const { error } = await supabase
        .from('workspace_layouts')
        .upsert({ user_id: user.id, layout: newLayout });

      if (error) throw error;

      toast({
        title: 'Layout saved',
        description: 'Your workspace layout has been updated',
      });
    } catch (err) {
      console.error('Error saving workspace layout:', err);
      toast({
        title: 'Error saving layout',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  // Reset layout function
  const resetLayout = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('workspace_layouts')
        .update({ layout: defaultLayout })
        .eq('user_id', user.id);

      if (error) throw error;

      setLayout(defaultLayout);
      toast({
        title: 'Layout reset',
        description: 'Your workspace has been reset to default',
      });
    } catch (err) {
      console.error('Error resetting workspace layout:', err);
      toast({
        title: 'Error resetting layout',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  return {
    layout,
    isLoading,
    error,
    saveLayout,
    resetLayout,
    isOnline,
  };
} 