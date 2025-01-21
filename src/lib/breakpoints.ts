// Breakpoint values in pixels
export const breakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Media query strings for use in styled-components or CSS-in-JS
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  '2xl': `@media (min-width: ${breakpoints['2xl']}px)`,
} as const;

// Tailwind-style responsive class generator
export const responsive = (base: string, breakpointStyles: Partial<Record<keyof typeof breakpoints, string>>) => {
  return Object.entries(breakpointStyles).reduce((acc, [breakpoint, style]) => {
    const key = breakpoint as keyof typeof breakpoints;
    return `${acc} ${mediaQueries[key]} { ${style} }`;
  }, base);
};

// Grid column configurations for different screen sizes
export const gridColumns = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 6,
  '2xl': 8,
} as const;

// Common responsive patterns
export const commonPatterns = {
  container: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  grid: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
  stack: 'flex flex-col space-y-4 md:space-y-6 lg:space-y-8',
  sidebar: 'flex flex-col md:flex-row md:space-x-6 lg:space-x-8',
} as const;

// Comic-specific responsive patterns
export const comicPatterns = {
  panelGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8',
  heroSection: 'grid grid-cols-1 lg:grid-cols-2 gap-8 items-center',
  actionBar: 'flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0',
  statusDisplay: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4',
} as const; 