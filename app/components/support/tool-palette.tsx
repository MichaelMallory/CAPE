import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Grid, Eye, EyeOff } from 'lucide-react';

interface ToolPaletteProps {
  onSaveLayout: () => void;
  onResetLayout: () => void;
  onToggleGridlines: () => void;
  onTogglePanel: (panelId: string) => void;
  hiddenPanels: string[];
}

const PANEL_IDS = [
  'ticket-queue',
  'active-missions',
  'resource-status',
  'priority-alerts',
  'team-chat'
];

export function ToolPalette({
  onSaveLayout,
  onResetLayout,
  onToggleGridlines,
  onTogglePanel,
  hiddenPanels
}: ToolPaletteProps) {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-700 flex items-center space-x-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onSaveLayout}
        className="text-gray-300 hover:text-white"
      >
        <Save className="h-4 w-4 mr-2" />
        Save Layout
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onResetLayout}
        className="text-gray-300 hover:text-white"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleGridlines}
        className="text-gray-300 hover:text-white"
      >
        <Grid className="h-4 w-4 mr-2" />
        Toggle Grid
      </Button>

      <div className="h-6 w-px bg-gray-700" />

      <div className="flex items-center space-x-2">
        {PANEL_IDS.map((id) => (
          <Button
            key={id}
            variant="ghost"
            size="sm"
            onClick={() => onTogglePanel(id)}
            className="text-gray-300 hover:text-white"
          >
            {hiddenPanels.includes(id) ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="ml-2">
              {id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
} 