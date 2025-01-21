"use client"

import { useState, useEffect } from 'react';
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
  { id: 'activity-feed', title: 'Activity Feed', visible: true, order: 4 }
];

const COMPONENTS = {
  'mission-status': MissionStatusCards,
  'equipment-status': EquipmentStatus,
  'alert-center': AlertCenter,
  'quick-actions': QuickActions,
  'activity-feed': ActivityFeed
} as const;

export default function HeroDashboard() {
  const [panels, setPanels] = useLocalStorage<PanelConfig[]>('hero-dashboard-panels', defaultPanels);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [deviceClass, setDeviceClass] = useState('desktop');

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setDeviceClass('mobile');
      else if (width < 1024) setDeviceClass('tablet');
      else setDeviceClass('desktop');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <main className="container mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-comic">Hero Dashboard</h1>
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
                            "bg-card p-6 rounded-lg shadow-lg",
                            "border-2 border-primary/20",
                            "hover:border-primary/40 transition-colors",
                            panel.id === 'mission-status' && "col-span-2 row-span-2"
                          )}
                        >
                          <div 
                            role="region" 
                            aria-label={panel.title}
                            className="h-full"
                          >
                            <h2 className="text-xl font-bold mb-4 text-primary">
                              {panel.title}
                            </h2>
                            <Component />
                          </div>
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
  );
} 