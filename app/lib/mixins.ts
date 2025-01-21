// Comic-style UI mixins
export const comicMixins = {
  panel: {
    base: 'rounded-lg border bg-background shadow-md transition-all duration-200',
    hover: 'hover:shadow-lg hover:scale-[1.02] hover:border-primary/50',
    active: 'active:scale-[0.98]',
  },
  text: {
    title: 'font-bold text-xl md:text-2xl text-foreground',
    subtitle: 'text-lg text-muted-foreground',
    body: 'text-sm md:text-base text-foreground/90',
  },
  effects: {
    glow: 'shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]',
    pulse: 'animate-pulse',
    shake: 'animate-shake',
  },
  layout: {
    grid: 'grid gap-4 md:gap-6',
    flex: 'flex items-center space-x-4',
    stack: 'flex flex-col space-y-4',
  },
}; 