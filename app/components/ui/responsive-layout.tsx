import * as React from 'react';
import { cn } from '@/lib/utils';
import { comicPatterns, commonPatterns } from '@/lib/breakpoints';
import { comicMixins } from '@/lib/mixins';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  variant?: keyof typeof comicPatterns;
  className?: string;
  reversed?: boolean;
  gapSize?: 'sm' | 'md' | 'lg';
}

const gapSizes = {
  sm: 'gap-4 md:gap-6',
  md: 'gap-6 md:gap-8',
  lg: 'gap-8 md:gap-12',
};

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  variant = 'panelGrid',
  className,
  reversed = false,
  gapSize = 'md',
}) => {
  const pattern = comicPatterns[variant];
  
  // Apply responsive classes based on breakpoints
  const layoutClasses = cn(
    pattern.sm,
    `md:${pattern.md}`,
    `lg:${pattern.lg}`,
    `xl:${pattern.xl}`,
    reversed && variant === 'heroSection' && 'lg:flex-row-reverse',
    className
  );

  return (
    <div className={layoutClasses}>
      {children}
    </div>
  );
};

// Responsive container for consistent page margins
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
}) => {
  const containerPattern = commonPatterns.container;
  
  return (
    <div className={cn(
      containerPattern.sm,
      `md:${containerPattern.md}`,
      `lg:${containerPattern.lg}`,
      `xl:${containerPattern.xl}`,
      'mx-auto px-4',
      className
    )}>
      {children}
    </div>
  );
};

// Responsive stack for vertical layouts
interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

const stackSpacing = {
  sm: 'space-y-2 md:space-y-4',
  md: 'space-y-4 md:space-y-6',
  lg: 'space-y-6 md:space-y-8',
};

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  className,
  spacing = 'md',
}) => {
  return (
    <div className={cn('flex flex-col', stackSpacing[spacing], className)}>
      {children}
    </div>
  );
};

// Responsive grid for card layouts
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
  gapSize?: 'sm' | 'md' | 'lg';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  columns = { sm: 2, md: 3, lg: 4 },
  gapSize = 'md',
}) => {
  const gridClasses = cn(
    'grid grid-cols-1',
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    gapSizes[gapSize],
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}; 