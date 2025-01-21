import { breakpoints, mediaQueries } from './breakpoints';
import { type ClassValue } from 'clsx';
import { cn } from './utils';

// Responsive font size mixin
export const responsiveFontSize = (
  base: number,
  { sm, md, lg }: Partial<Record<'sm' | 'md' | 'lg', number>> = {}
) => {
  return cn(
    `text-[${base}px]`,
    sm && `sm:text-[${sm}px]`,
    md && `md:text-[${md}px]`,
    lg && `lg:text-[${lg}px]`
  );
};

// Responsive spacing mixin
export const responsiveSpacing = (
  property: 'margin' | 'padding',
  direction: 'x' | 'y' | 't' | 'r' | 'b' | 'l',
  sizes: Partial<Record<keyof typeof breakpoints, number>>
) => {
  const prop = property === 'margin' ? 'm' : 'p';
  return Object.entries(sizes).reduce((acc, [breakpoint, size]) => {
    const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`;
    return `${acc} ${prefix}${prop}${direction}-${size}`;
  }, '');
};

// Comic-specific responsive mixins
export const comicMixins = {
  // Panel size adjustments for different screen sizes
  panelSize: (variant: 'sm' | 'md' | 'lg' = 'md') => {
    const sizes = {
      sm: { base: 4, sm: 5, md: 6 },
      md: { base: 6, sm: 8, md: 10 },
      lg: { base: 8, sm: 10, md: 12 },
    };
    return responsiveSpacing('padding', 'x', sizes[variant]);
  },

  // Speech bubble responsive positioning
  bubblePosition: (position: 'left' | 'right' | 'top' | 'bottom') => {
    const positionClasses = {
      left: 'left-0 sm:left-4 md:left-6',
      right: 'right-0 sm:right-4 md:right-6',
      top: 'top-0 sm:top-4 md:top-6',
      bottom: 'bottom-0 sm:bottom-4 md:bottom-6',
    };
    return positionClasses[position];
  },

  // Action effect scaling
  effectScale: (size: 'sm' | 'md' | 'lg' = 'md') => {
    const scales = {
      sm: 'scale-75 sm:scale-100',
      md: 'scale-100 sm:scale-125',
      lg: 'scale-125 sm:scale-150',
    };
    return scales[size];
  },

  // Hero section layout adjustments
  heroLayout: (reversed: boolean = false) => {
    return cn(
      'grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8',
      reversed && 'lg:flex-row-reverse'
    );
  },

  // Status indicator responsive styles
  statusIndicator: (size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizes = {
      sm: 'w-2 h-2 sm:w-3 sm:h-3',
      md: 'w-3 h-3 sm:w-4 sm:h-4',
      lg: 'w-4 h-4 sm:w-5 sm:h-5',
    };
    return sizes[size];
  },
}; 