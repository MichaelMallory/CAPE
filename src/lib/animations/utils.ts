import { AnimationControls, TargetAndTransition, Transition, Variants } from 'framer-motion';
import { DURATIONS, EASING } from './constants';

// Stagger children animations
export const staggerChildren = (
  staggerTime: number = 0.1,
  delayStart: number = 0
): Transition => ({
  staggerChildren: staggerTime,
  delayChildren: delayStart,
});

// Create a sequence of animations
export const sequence = (animations: TargetAndTransition[]): TargetAndTransition => ({
  transition: {
    times: animations.map((_, i) => i / animations.length),
    sequence: animations,
  },
});

// Create a power surge effect for critical actions
export const powerSurge = async (controls: AnimationControls) => {
  await controls.start({
    scale: [1, 1.2, 1],
    filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
    transition: {
      duration: DURATIONS.DRAMATIC,
      ease: EASING.IMPACT,
    },
  });
};

// Create comic-style impact effect
export const createImpactEffect = (scale: number = 1.5): Variants => ({
  initial: { scale: 0.5, opacity: 0 },
  animate: {
    scale,
    opacity: [0, 1, 0],
    transition: {
      duration: DURATIONS.QUICK,
      ease: EASING.IMPACT,
    },
  },
});

// Create hero entrance animation with optional custom effects
export const createHeroEntrance = (
  direction: 'top' | 'bottom' | 'left' | 'right' = 'top',
  distance: number = 50
): Variants => {
  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
  const value = direction === 'right' || direction === 'bottom' ? distance : -distance;

  return {
    hidden: {
      opacity: 0,
      scale: 0.9,
      ...(axis === 'x' ? { x: value } : { y: value }),
    },
    visible: {
      opacity: 1,
      scale: 1,
      ...(axis === 'x' ? { x: 0 } : { y: 0 }),
      transition: {
        duration: DURATIONS.DRAMATIC,
        ease: EASING.HEROIC,
      },
    },
  };
};

// Create alert notification animation
export const createAlertAnimation = (
  severity: 'info' | 'warning' | 'critical' = 'info'
): Variants => ({
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: severity === 'critical' ? DURATIONS.DRAMATIC : DURATIONS.NORMAL,
      ease: severity === 'critical' ? EASING.IMPACT : EASING.AGILE,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: DURATIONS.QUICK,
    },
  },
}); 