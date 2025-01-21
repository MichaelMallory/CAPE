import { Variants } from 'framer-motion';

// Timing constants
export const DURATIONS = {
  QUICK: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
  DRAMATIC: 0.8,
} as const;

// Easing presets
export const EASING = {
  // Sharp, energetic movements
  HEROIC: [0.4, 0, 0.2, 1],
  // Smooth, powerful transitions
  POWER: [0.4, 0.2, 0.2, 1],
  // Quick, agile movements
  AGILE: [0.175, 0.885, 0.32, 1],
  // Dramatic, impactful animations
  IMPACT: [0.6, 0.04, 0.98, 0.335],
} as const;

// Common animation variants
export const FADE_IN: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: DURATIONS.NORMAL,
      ease: EASING.HEROIC,
    }
  },
};

export const SLIDE_IN: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: DURATIONS.NORMAL,
      ease: EASING.POWER,
    }
  },
};

export const HERO_ENTRANCE: Variants = {
  hidden: { 
    y: -50,
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: DURATIONS.DRAMATIC,
      ease: EASING.HEROIC,
    }
  },
};

export const POWER_PULSE: Variants = {
  idle: { scale: 1 },
  pulse: {
    scale: 1.05,
    transition: {
      duration: DURATIONS.QUICK,
      ease: EASING.IMPACT,
      repeat: Infinity,
      repeatType: "reverse",
    }
  },
};

// Mission alert animation
export const ALERT_ANIMATION: Variants = {
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
      duration: DURATIONS.NORMAL,
      ease: EASING.AGILE,
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: DURATIONS.QUICK,
      ease: EASING.POWER,
    }
  },
}; 