'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { TicketQueue } from '@/components/support/ticket-queue';
import { ActiveMissions } from '@/components/support/active-missions';
import { ResourceStatus } from '@/components/support/resource-status';
import { PriorityAlerts } from '@/components/support/priority-alerts';
import { TeamChat } from '@/components/support/team-chat';
import { ComicPanel } from '@/components/ui/comic-panel';
import { ComicBackground } from '@/components/ui/comic-background';

interface PanelConfig {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

const defaultPanels: PanelConfig[] = [
  { id: 'ticket-queue', title: 'Ticket Queue', visible: true, order: 0 },
  { id: 'active-missions', title: 'Active Missions', visible: true, order: 1 },
  { id: 'resource-status', title: 'Resource Status', visible: true, order: 2 },
  { id: 'priority-alerts', title: 'Priority Alerts', visible: true, order: 3 },
  { id: 'team-chat', title: 'Team Chat', visible: true, order: 4 }
];

const SECTIONS = ['Overview', 'Tickets', 'Missions', 'Resources', 'Analytics'];

const COMPONENTS = {
  'ticket-queue': TicketQueue,
  'active-missions': ActiveMissions,
  'resource-status': ResourceStatus,
  'priority-alerts': PriorityAlerts,
  'team-chat': TeamChat
} as const;

interface PanelSize {
  width?: number;
  height?: number;
}

const panelColors = {
  'ticket-queue': 'blue',
  'active-missions': 'red',
  'resource-status': 'green',
  'priority-alerts': 'yellow',
  'team-chat': 'purple'
} as const;

export default function SupportDashboard() {
  const router = useRouter();
  const { user, role } = useAuth();
  const [panels, setPanels] = useLocalStorage<PanelConfig[]>('support-dashboard-panels', defaultPanels);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [panelSizes, setPanelSizes] = useLocalStorage<Record<string, PanelSize>>('panel-sizes', {});
  const resizingRef = useRef<{ panelId: string; startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    // Redirect non-support users
    if (user && role !== 'SUPPORT') {
      router.push('/dashboard');
    }
  }, [user, role, router]);

  // Handle panel resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      
      const { panelId, startX, startWidth } = resizingRef.current;
      const diff = e.clientX - startX;
      
      // Calculate container width for max-width constraint
      const container = document.querySelector('[role="main"]');
      const containerWidth = container?.getBoundingClientRect().width || 1200;
      const maxWidth = Math.min(containerWidth * 0.8, 1200); // Max 80% of container or 1200px
      
      // Apply constraints
      const newWidth = Math.max(200, Math.min(maxWidth, startWidth + diff));
      
      setPanelSizes(prev => ({
        ...prev,
        [panelId]: { width: newWidth }
      }));
    };

    const handleMouseUp = () => {
      if (resizingRef.current) {
        document.body.style.cursor = '';
        resizingRef.current = null;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setPanelSizes]);

  if (!user || role !== 'SUPPORT') {
    return null;
  }

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
    setPanelSizes({});
  };

  const startResize = (panelId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const panel = e.currentTarget.closest('[role="region"]');
    if (!panel) return;
    
    const rect = panel.getBoundingClientRect();
    resizingRef.current = {
      panelId,
      startX: e.clientX,
      startWidth: rect.width
    };
    document.body.style.cursor = 'ew-resize';
  };

  return (
    <main 
      role="main"
      aria-label="Support Dashboard"
      className="container mx-auto p-4 space-y-8 grid relative min-h-screen"
    >
      <ComicBackground variant="purple" />
      
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">Support Dashboard</h1>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCustomizing(!isCustomizing)}
            aria-label="Layout"
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePanelVisibility(panel.id)}
                  aria-label={`Toggle ${panel.title}`}
                >
                  {panel.visible ? 'Hide' : 'Show'}
                </Button>
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
                "grid-cols-3",
                "relative",
                "w-full"
              )}
            >
              {panels
                .filter(panel => panel.visible)
                .sort((a, b) => a.order - b.order)
                .map((panel, index) => {
                  const Component = COMPONENTS[panel.id as keyof typeof COMPONENTS];
                  return (
                    <Draggable 
                      key={panel.id} 
                      draggableId={panel.id} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn(
                            "panel-container h-full",
                            "transform",
                            snapshot.isDragging && "scale-105 shadow-xl",
                            panel.id === 'ticket-queue' && "col-span-2 row-span-2"
                          )}
                          style={{ 
                            ...provided.draggableProps.style,
                            width: panelSizes[panel.id]?.width,
                            minWidth: 200,
                            maxWidth: '100%'
                          }}
                        >
                          <ComicPanel
                            title={panel.title}
                            colorScheme={panelColors[panel.id as keyof typeof panelColors]}
                          >
                            <div className="h-full">
                              <Component />
                              <div
                                className="resize-handle absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize hover:bg-primary/20 z-10 transition-colors"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  startResize(panel.id, e);
                                }}
                              />
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
  );
} 