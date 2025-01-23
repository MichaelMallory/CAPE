"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { Settings } from 'lucide-react';
import { MissionStatusCards } from '@/components/hero/mission-status-cards';
import { EquipmentStatus } from '@/components/hero/equipment-status';
import { AlertCenter } from '@/components/hero/alert-center';
import { QuickActions } from '@/components/hero/quick-actions';
import { ActivityFeed } from '@/components/hero/activity-feed';
import { TicketList } from '@/components/hero/ticket-list';
import { CreateTicketForm } from '@/components/hero/create-ticket-form';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase/client';
import { ComicPanel } from '@/components/ui/comic-panel';
import { ComicBackground } from '@/components/ui/comic-background';

interface PanelConfig {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

const defaultPanels: PanelConfig[] = [
  { id: 'mission-status', title: 'Mission Status', visible: true, order: 0 },
  { id: 'equipment-status', title: 'Equipment Status', visible: true, order: 1 },
  { id: 'alert-center', title: 'Alert Center', visible: true, order: 2 },
  { id: 'quick-actions', title: 'Quick Actions', visible: true, order: 3 },
  { id: 'activity-feed', title: 'Activity Feed', visible: true, order: 4 },
  { id: 'ticket-management', title: 'Support Tickets', visible: true, order: 5 }
];

const COMPONENTS = {
  'mission-status': MissionStatusCards,
  'equipment-status': EquipmentStatus,
  'alert-center': AlertCenter,
  'quick-actions': QuickActions,
  'activity-feed': ActivityFeed,
  'ticket-management': () => {
    const [activeTab, setActiveTab] = useState('list');
    
    return (
      <div className="h-[calc(100%-2rem)]">
        <Card className="h-full flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start border-b rounded-none px-2">
              <TabsTrigger value="list">My Tickets</TabsTrigger>
              <TabsTrigger value="create">Create Ticket</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="flex-1 p-2 mt-0 overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Support Tickets</h2>
                <Button onClick={() => setActiveTab('create')}>Create Ticket</Button>
              </div>
              <TicketList />
            </TabsContent>
            <TabsContent value="create" className="flex-1 p-4 mt-0 overflow-auto">
              <CreateTicketForm onSuccess={() => setActiveTab('list')} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    );
  }
} as const;

const panelColors = {
  'mission-status': 'red',
  'equipment-status': 'blue',
  'alert-center': 'yellow',
  'quick-actions': 'purple',
  'activity-feed': 'green',
  'ticket-management': 'blue'
} as const;

export default function HeroDashboard() {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const [panels, setPanels] = useLocalStorage<PanelConfig[]>('hero-dashboard-panels', defaultPanels);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [deviceClass, setDeviceClass] = useState('desktop');
  const [mounted, setMounted] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('🦸 Hero Dashboard - Auth State:', {
      loading,
      hasUser: !!user,
      userId: user?.id,
      role,
      mounted
    });
  }, [loading, user, role, mounted]);

  // Handle responsive layout
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      console.log('📱 Hero Dashboard - Component Mounted');
    }
    
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setDeviceClass('mobile');
      else if (width < 1024) setDeviceClass('tablet');
      else setDeviceClass('desktop');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mounted]);

  // Show loading state while auth is being checked
  if (loading || !mounted) {
    console.log('⌛ Hero Dashboard - Loading State', { loading, mounted });
    return (
      <main className="container mx-auto p-4 space-y-8 relative min-h-screen">
        <ComicBackground variant="blue" />
        
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-comic text-white">Hero Dashboard</h1>
        </div>
        <div className="h-[800px] flex items-center justify-center">
          Loading...
        </div>
      </main>
    );
  }

  // Only redirect if we have a definitive wrong role
  if (!loading && user && role && role !== 'HERO') {
    console.log('🔄 Hero Dashboard - Wrong Role Redirect', { role });
    router.replace(`/dashboard/${role.toLowerCase()}`);
    return null;
  }

  // Only redirect to login if we're sure there's no user
  if (!loading && !user) {
    console.log('🚫 Hero Dashboard - No User Redirect');
    router.replace('/login');
    return null;
  }

  console.log('✅ Hero Dashboard - Rendering', {
    deviceClass,
    panelCount: panels.length,
    visiblePanels: panels.filter(p => p.visible).length
  });

  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(panels);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setPanels(updatedItems);
  };

  // Toggle panel visibility
  const togglePanelVisibility = (panelId: string) => {
    setPanels(panels.map(panel => 
      panel.id === panelId ? { ...panel, visible: !panel.visible } : panel
    ));
  };

  // Reset to default layout
  const resetLayout = () => {
    setPanels(defaultPanels);
  };

  return (
    <>
      <ComicBackground variant="blue" className="bg-red-500" />
      <main className="container mx-auto p-4 space-y-8 bg-transparent relative">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-comic text-white">Hero Dashboard</h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCustomizing(!isCustomizing)}
              aria-label="Customize Dashboard"
            >
              <Settings className="h-5 w-5" />
            </Button>
            {isCustomizing && (
              <Button variant="secondary" onClick={resetLayout}>
                Reset Layout
              </Button>
            )}
          </div>
        </div>

        {/* Customization Panel */}
        {isCustomizing && (
          <div className="bg-card p-4 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-4">Customize Dashboard</h2>
            <div className="space-y-4">
              {panels.map(panel => (
                <div key={panel.id} className="flex items-center justify-between">
                  <span>{panel.title}</span>
                  <Switch
                    checked={panel.visible}
                    onCheckedChange={() => togglePanelVisibility(panel.id)}
                    aria-label={`Show ${panel.title}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard-grid">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={cn(
                  "grid gap-4",
                  deviceClass === 'mobile' && "grid-cols-1",
                  deviceClass === 'tablet' && "grid-cols-2",
                  deviceClass === 'desktop' && "grid-cols-3"
                )}
              >
                {panels
                  .filter(panel => panel.visible)
                  .sort((a, b) => a.order - b.order)
                  .map((panel, index) => {
                    const Component = COMPONENTS[panel.id as keyof typeof COMPONENTS];
                    if (!Component) return null;

                    return (
                      <Draggable 
                        key={panel.id} 
                        draggableId={panel.id} 
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "h-full",
                              (panel.id === 'mission-status' || panel.id === 'ticket-management') && "col-span-2 row-span-2",
                              panel.id === 'ticket-management' && "h-[800px]"
                            )}
                          >
                            <ComicPanel
                              title={panel.title}
                              colorScheme={panelColors[panel.id as keyof typeof panelColors]}
                            >
                              <div className="h-full">
                                <Component />
                              </div>
                            </ComicPanel>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>
    </>
  );
} 