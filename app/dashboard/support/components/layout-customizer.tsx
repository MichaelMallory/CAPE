'use client';

import { useState } from 'react';

interface LayoutCustomizerProps {
  panels: string[];
  onTogglePanel: (panelName: string) => void;
  onResetLayout: () => void;
}

export function LayoutCustomizer({
  panels,
  onTogglePanel,
  onResetLayout,
}: LayoutCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-label="Layout"
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
      >
        Layout
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-popover text-popover-foreground rounded-md shadow-lg p-4">
          <div className="space-y-2">
            {panels.map((panel) => (
              <button
                key={panel}
                onClick={() => onTogglePanel(panel)}
                aria-label={`Toggle ${panel}`}
                className="w-full text-left px-2 py-1 hover:bg-accent rounded"
              >
                {panel}
              </button>
            ))}
            <hr className="my-2" />
            <button
              onClick={onResetLayout}
              aria-label="Reset Layout"
              className="w-full text-left px-2 py-1 text-destructive hover:bg-accent rounded"
            >
              Reset Layout
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 