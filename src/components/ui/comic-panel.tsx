import * as React from 'react';
import { motion } from 'framer-motion';
import { AnimatedPanel } from './animated-panel';
import { cn } from '../../lib/utils';

interface ComicPanelProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isPowered?: boolean;
  onClick?: () => void;
}

const variantStyles = {
  primary: 'border-primary bg-white/90',
  secondary: 'border-secondary bg-white/90',
  accent: 'border-accent bg-white/90',
};

const sizeStyles = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const ComicPanel: React.FC<ComicPanelProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  isPowered = false,
  onClick,
}) => {
  return (
    <AnimatedPanel
      className={cn(
        'comic-panel',
        variantStyles[variant],
        sizeStyles[size],
        'relative overflow-hidden',
        className
      )}
      isPowered={isPowered}
      onClick={onClick}
    >
      {/* Comic panel corner effects */}
      <motion.div
        className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      />
      <motion.div
        className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3 }}
      />
      <motion.div
        className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4 }}
      />
      <motion.div
        className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      />
      
      {children}
    </AnimatedPanel>
  );
}; 