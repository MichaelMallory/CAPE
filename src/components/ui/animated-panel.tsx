import { motion } from 'framer-motion';
import { createHeroEntrance, powerSurge } from '@/lib/animations/utils';
import { POWER_PULSE } from '@/lib/animations/constants';
import { useRef } from 'react';
import { type ReactNode } from 'react';

interface AnimatedPanelProps {
  children: ReactNode;
  direction?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  isPowered?: boolean;
  onClick?: () => void;
}

export const AnimatedPanel = ({
  children,
  direction = 'left',
  className = '',
  isPowered = false,
  onClick,
}: AnimatedPanelProps) => {
  const controls = useRef(null);

  const handleClick = async () => {
    if (controls.current && isPowered) {
      await powerSurge(controls.current);
    }
    onClick?.();
  };

  return (
    <motion.div
      ref={controls}
      className={`rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 ${className}`}
      variants={createHeroEntrance(direction)}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...(isPowered && { variants: POWER_PULSE, animate: "pulse" })}
      onClick={handleClick}
    >
      {children}
    </motion.div>
  );
}; 