import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ActionEffectProps {
  type: 'pow' | 'bam' | 'zap' | 'boom' | 'whoosh';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const effectStyles = {
  pow: 'effect-pow',
  bam: 'effect-starburst',
  zap: 'effect-zap',
  boom: 'effect-pow scale-125',
  whoosh: 'effect-zap rotate-45',
};

const sizeStyles = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-5xl',
};

const effectAnimations = {
  pow: {
    initial: { scale: 0, rotate: -30 },
    animate: { scale: 1, rotate: 0 },
    transition: { type: 'spring', damping: 10 },
  },
  bam: {
    initial: { scale: 2, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'spring', damping: 12 },
  },
  zap: {
    initial: { scaleX: 0 },
    animate: { scaleX: 1 },
    transition: { type: 'spring', damping: 20 },
  },
  boom: {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1.2, opacity: 1 },
    transition: { type: 'spring', damping: 8 },
  },
  whoosh: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { type: 'spring', damping: 15 },
  },
};

const defaultText = {
  pow: 'POW!',
  bam: 'BAM!',
  zap: 'ZAP!',
  boom: 'BOOM!',
  whoosh: 'WHOOSH!',
};

export const ActionEffect: React.FC<ActionEffectProps> = ({
  type,
  size = 'md',
  className,
  text,
}) => {
  return (
    <motion.div
      className={cn(
        'font-comic absolute transform -translate-x-1/2 -translate-y-1/2',
        effectStyles[type],
        sizeStyles[size],
        className
      )}
      {...effectAnimations[type]}
    >
      <div className="relative">
        {/* Background effect */}
        <motion.div
          className="absolute inset-0 bg-white/20 blur-sm rounded-full"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1.2 }}
          transition={{ repeat: Infinity, duration: 0.8, repeatType: 'reverse' }}
        />
        
        {/* Text content */}
        <span className="relative">
          {text || defaultText[type]}
        </span>
      </div>
    </motion.div>
  );
}; 