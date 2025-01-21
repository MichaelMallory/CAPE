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

export const createHeroEntrance = (direction: 'top' | 'bottom' | 'left' | 'right'): Variants => {
  const offset = 20;
  const getOffset = () => {
    switch (direction) {
      case 'top': return { y: -offset };
      case 'bottom': return { y: offset };
      case 'left': return { x: -offset };
      case 'right': return { x: offset };
    }
  };

  return {
    initial: {
      opacity: 0,
      ...getOffset(),
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      ...getOffset(),
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };
};

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