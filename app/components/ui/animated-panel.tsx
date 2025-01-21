"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedPanelProps extends Omit<HTMLMotionProps<"div">, "initial" | "animate" | "transition"> {
  direction?: "left" | "right" | "top" | "bottom"
  className?: string
  children: React.ReactNode
}

export function AnimatedPanel({
  direction = "right",
  className,
  children,
  ...props
}: AnimatedPanelProps) {
  const getAnimationProps = () => {
    const base = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3, ease: "easeOut" },
    }

    const directionProps = {
      left: { x: -20 },
      right: { x: 20 },
      top: { y: -20 },
      bottom: { y: 20 },
    }

    return {
      ...base,
      initial: { ...base.initial, ...directionProps[direction] },
      animate: { ...base.animate, [direction === "left" || direction === "right" ? "x" : "y"]: 0 },
    }
  }

  return (
    <motion.div
      className={cn(
        "bg-card p-6 rounded-lg shadow-lg border-2 border-primary/20",
        className
      )}
      {...getAnimationProps()}
      {...props}
    >
      {children}
    </motion.div>
  )
} 