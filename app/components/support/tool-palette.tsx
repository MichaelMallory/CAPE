import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Layout, 
  Save, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  Grid,
  Eye,
  EyeOff
} from 'lucide-react';
import { useState } from 'react';

interface ToolPaletteProps {
  onSaveLayout: () => void;
  onResetLayout: () => void;
  onToggleGridlines: () => void;
  onTogglePanel: (panelId: string) => void;
  hiddenPanels: string[];
}

export function ToolPalette({
  onSaveLayout,
  onResetLayout,
  onToggleGridlines,
  onTogglePanel,
  hiddenPanels
}: ToolPaletteProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="fixed bottom-6 right-6 bg-gray-800/90 backdrop-blur-sm border-blue-500/20 text-white p-2">
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="hover:bg-blue-500/20"
        >
          <Layout className="h-4 w-4" />
        </Button>

        {isExpanded && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSaveLayout}
              className="hover:bg-blue-500/20"
              title="Save Layout"
            >
              <Save className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onResetLayout}
              className="hover:bg-blue-500/20"
              title="Reset Layout"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleGridlines}
              className="hover:bg-blue-500/20"
              title="Toggle Gridlines"
            >
              <Grid className="h-4 w-4" />
            </Button>

            <div className="h-px bg-blue-500/20 my-2" />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onTogglePanel('ticket-queue')}
              className="hover:bg-blue-500/20"
              title="Toggle Ticket Queue"
            >
              {hiddenPanels.includes('ticket-queue') ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onTogglePanel('active-missions')}
              className="hover:bg-blue-500/20"
              title="Toggle Active Missions"
            >
              {hiddenPanels.includes('active-missions') ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onTogglePanel('resource-status')}
              className="hover:bg-blue-500/20"
              title="Toggle Resource Status"
            >
              {hiddenPanels.includes('resource-status') ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onTogglePanel('priority-alerts')}
              className="hover:bg-blue-500/20"
              title="Toggle Priority Alerts"
            >
              {hiddenPanels.includes('priority-alerts') ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onTogglePanel('team-chat')}
              className="hover:bg-blue-500/20"
              title="Toggle Team Chat"
            >
              {hiddenPanels.includes('team-chat') ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
} 