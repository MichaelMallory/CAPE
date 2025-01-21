import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SpeechBubbleProps {
  children: React.ReactNode;
  variant?: 'thought' | 'speech' | 'shout';
  position?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

const variantStyles = {
  thought: 'rounded-[50%] border-dashed',
  speech: 'rounded-lg',
  shout: 'rounded-[12px] border-[3px]',
};

const positionStyles = {
  left: 'ml-4',
  right: 'mr-4',
  top: 'mt-4',
  bottom: 'mb-4',
};

const bubbleAnimation = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: 'spring', damping: 12 },
};

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  children,
  variant = 'speech',
  position = 'bottom',
  className,
}) => {
  return (
    <motion.div
      className={cn(
        'speech-bubble',
        variantStyles[variant],
        positionStyles[position],
        'relative inline-block max-w-md',
        variant === 'shout' && 'font-comic uppercase tracking-wider',
        className
      )}
      {...bubbleAnimation}
    >
      {/* Tail for thought bubbles */}
      {variant === 'thought' && (
        <div className="absolute -bottom-8 left-8 flex items-center justify-center space-x-1">
          <motion.div
            className="h-3 w-3 rounded-full bg-white border border-dashed border-bubble-border"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          />
          <motion.div
            className="h-2 w-2 rounded-full bg-white border border-dashed border-bubble-border"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          />
        </div>
      )}

      {/* Extra emphasis for shout bubbles */}
      {variant === 'shout' && (
        <motion.div
          className="absolute inset-0 border-[3px] rounded-[12px] border-bubble-border opacity-50"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {children}
    </motion.div>
  );
}; 