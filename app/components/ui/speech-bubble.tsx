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
  speech: '',
  shout: 'rounded-[12px] border-[3px]',
};

const positionStyles = {
  left: 'ml-8',
  right: 'mr-8',
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
        'speech-bubble relative',
        variantStyles[variant],
        positionStyles[position],
        'relative inline-block max-w-md',
        variant === 'shout' && 'font-comic uppercase tracking-wider',
        className
      )}
      {...bubbleAnimation}
    >
      {/* Main bubble with shadow */}
      <div className="relative">
        {/* Shadow */}
        <div 
          className="absolute top-2 left-2 w-full h-full bg-black opacity-10 rounded-lg"
          style={{
            backgroundImage: 'radial-gradient(circle, black 1px, transparent 1px)',
            backgroundSize: '4px 4px'
          }}
        />
        
        {/* Main bubble content */}
        <div className="relative border-2 border-black bg-white rounded-lg p-4">
          {children}
        </div>

        {/* Speech pointer */}
        {variant === 'speech' && (
          <>
            {position === 'right' && (
              <div className="absolute right-0 top-4 h-4 w-4 transform translate-x-1/2 rotate-45 border-t-2 border-r-2 border-black bg-white" />
            )}
            {position === 'left' && (
              <div className="absolute left-0 top-4 h-4 w-4 transform -translate-x-1/2 rotate-45 border-l-2 border-b-2 border-black bg-white" />
            )}
          </>
        )}

        {/* Thought bubbles */}
        {variant === 'thought' && (
          <div className={cn(
            "absolute flex items-center justify-center space-x-1",
            position === 'left' && "-left-8 top-8",
            position === 'right' && "-right-8 top-8"
          )}>
            <motion.div
              className="h-3 w-3 rounded-full bg-white border-2 border-black"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            />
            <motion.div
              className="h-2 w-2 rounded-full bg-white border-2 border-black"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}; 