"use client"

import { DragDropContext, Draggable, DropResult } from '@hello-pangea/dnd';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Panel } from '@/components/ui/panel';
import { TicketQueue } from '@/components/support/ticket-queue';
import { ActiveMissions } from '@/components/support/active-missions';
import { ResourceStatus } from '@/components/support/resource-status';
import { PriorityAlerts } from '@/components/support/priority-alerts';
import { TeamChat } from '@/components/support/team-chat';
import { ToolPalette } from '@/components/support/tool-palette';
import { useState, useEffect } from 'react';

interface PanelLayout {
  x: number;
  y: number;
  h?: number;
  w?: number;
}

interface DashboardLayout {
  [key: string]: PanelLayout;
}

const DEFAULT_LAYOUT: DashboardLayout = {
  'ticket-queue': { x: 0, y: 0 },
  'active-missions': { x: 1, y: 0 },
  'resource-status': { x: 0, y: 1 },
  'priority-alerts': { x: 1, y: 1 },
  'team-chat': { x: 2, y: 0, h: 2 }
};

export default function SupportDashboardClient() {
  // Initialize state with undefined and update after mount
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useLocalStorage<DashboardLayout>('support-dashboard-layout', DEFAULT_LAYOUT);
  const [hiddenPanels, setHiddenPanels] = useLocalStorage<string[]>('support-dashboard-hidden-panels', []);
  const [showGridlines, setShowGridlines] = useState(true);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const newLayout = { ...layout };
    const { draggableId } = result;
    
    // Get coordinates from the drag event's client coordinates
    const clientX = (result as any).destination.clientX ?? 0;
    const clientY = (result as any).destination.clientY ?? 0;
    
    // Calculate grid position from pixel coordinates relative to the grid
    const gridX = Math.max(0, Math.floor((clientX - 24) / 400)); // 24px for padding
    const gridY = Math.max(0, Math.floor((clientY - 24) / 300));
    
    // Check for collisions with other panels
    const isPositionOccupied = (Object.entries(newLayout) as [string, PanelLayout][]).some(([id, pos]) => {
      if (id === draggableId) return false;
      return pos.x === gridX && pos.y === gridY;
    });

    if (!isPositionOccupied) {
      newLayout[draggableId] = {
        ...newLayout[draggableId],
        x: gridX,
        y: gridY
      };
      setLayout(newLayout);
    }
  };

  const handleSaveLayout = () => {
    // Save current layout to localStorage
    localStorage.setItem('support-dashboard-saved-layout', JSON.stringify(layout));
  };

  const handleResetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
    setHiddenPanels([]);
  };

  const handleTogglePanel = (panelId: string) => {
    setHiddenPanels((prev: string[]) => 
      prev.includes(panelId) 
        ? prev.filter((id: string) => id !== panelId)
        : [...prev, panelId]
    );
  };

  const COMPONENTS = {
    'ticket-queue': TicketQueue,
    'active-missions': ActiveMissions,
    'resource-status': ResourceStatus,
    'priority-alerts': PriorityAlerts,
    'team-chat': TeamChat
  } as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        Mission Control Center
      </h1>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div 
          className="grid grid-cols-3 gap-4 auto-rows-[300px] relative min-h-[900px]"
          style={{
            backgroundImage: showGridlines ? 'url("/grid-pattern.svg")' : 'none',
            backgroundSize: '40px 40px',
            backgroundRepeat: 'repeat'
          }}
        >
          {(Object.entries(layout) as [string, PanelLayout][])
            .filter(([id]) => !hiddenPanels.includes(id))
            .map(([id, pos], index) => {
              const Component = COMPONENTS[id as keyof typeof COMPONENTS];
              if (!Component) return null;

              return (
                <Draggable key={id} draggableId={id} index={index}>
                  {(provided) => (
                    <Panel
                      title={id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      className={`absolute ${pos.h ? 'row-span-2' : 'row-span-1'}`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        transform: `translate(${pos.x * 400}px, ${pos.y * 300}px)`,
                        width: pos.w ? `${pos.w * 400}px` : '400px',
                        height: pos.h ? `${pos.h * 300}px` : '300px',
                        ...provided.draggableProps.style
                      }}
                    >
                      <Component />
                    </Panel>
                  )}
                </Draggable>
              );
            })}
        </div>
      </DragDropContext>

      <ToolPalette
        onSaveLayout={handleSaveLayout}
        onResetLayout={handleResetLayout}
        onToggleGridlines={() => setShowGridlines(!showGridlines)}
        onTogglePanel={handleTogglePanel}
        hiddenPanels={hiddenPanels}
      />
    </div>
  );
} 