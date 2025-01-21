import { Variants } from 'framer-motion';

export function createImpactEffect(scale = 1.2) {
  return {
    initial: {
      scale: 1,
      opacity: 0,
    },
    animate: {
      scale: [1, scale, 1],
      opacity: [0, 1, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  }
}

export const createHeroEntrance = (delay: number = 0): Variants => ({
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
});

export const powerSurge: Variants = {
  initial: {
    scale: 0.95,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "backOut"
    }
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
}; 