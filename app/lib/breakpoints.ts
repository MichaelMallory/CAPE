// Comic-style layout patterns
export const comicPatterns = {
  grid: {
    sm: 'grid-cols-1',
    md: 'grid-cols-2',
    lg: 'grid-cols-3',
    xl: 'grid-cols-4',
  },
  panel: {
    sm: 'col-span-1',
    md: 'col-span-2',
    lg: 'col-span-3',
    xl: 'col-span-4',
  },
  panelGrid: {
    sm: 'grid grid-cols-1 gap-4',
    md: 'grid grid-cols-2 gap-6',
    lg: 'grid grid-cols-3 gap-8',
    xl: 'grid grid-cols-4 gap-10',
  },
  heroSection: {
    sm: 'flex flex-col gap-4',
    md: 'flex flex-col gap-6',
    lg: 'flex flex-row gap-8 items-center',
    xl: 'flex flex-row gap-10 items-center',
  },
};

// Common responsive patterns
export const commonPatterns = {
  container: {
    sm: 'max-w-3xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
  },
  spacing: {
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-8',
    xl: 'space-y-10',
  },
  padding: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  },
}; 