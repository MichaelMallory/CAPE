import React from 'react';
import { cn } from '@/lib/utils';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  children: React.ReactNode;
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ title, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-800 rounded-lg shadow-lg overflow-hidden',
          'border-2 border-blue-500/20',
          'backdrop-blur-sm backdrop-filter',
          'transition-all duration-200 ease-in-out',
          'hover:border-blue-500/40 hover:shadow-blue-500/10',
          className
        )}
        {...props}
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <div className="w-2 h-2 rounded-full bg-red-400" />
          </div>
        </div>
        <div className="p-4">{children}</div>
      </div>
    );
  }
); 