import { cn } from "@/lib/utils";

interface ComicBackgroundProps {
  className?: string;
  variant?: "blue" | "red" | "purple" | "green" | "yellow" | "orange";
}

const variantStyles = {
  blue: "from-blue-500 to-blue-700",
  red: "from-red-500 to-red-700",
  purple: "from-purple-500 to-purple-700",
  green: "from-emerald-500 to-emerald-700",
  yellow: "from-amber-500 to-amber-700",
  orange: "from-orange-500 to-orange-700"
};

export function ComicBackground({
  className,
  variant = "blue"
}: ComicBackgroundProps) {
  return (
    <div 
      className={cn(
        "fixed inset-0 w-full h-full overflow-hidden",
        "bg-blue-500", // Debug color
        className
      )}
      style={{
        zIndex: -1, // Explicit z-index
      }}
    >
      {/* Base color layer */}
      <div 
        className={cn(
          "absolute inset-0 w-full h-full",
          variantStyles[variant]
        )}
        style={{
          backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to))`
        }}
      />
      
      {/* Burst pattern */}
      <div 
        className="absolute inset-0 w-full h-full mix-blend-overlay"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%),
            repeating-conic-gradient(
              from 0deg at 50% 50%,
              rgba(255,255,255,0.2) 0deg 10deg,
              transparent 10deg 20deg
            )
          `,
          backgroundSize: '100% 100%, 100% 100%'
        }}
      />

      {/* Additional rays */}
      <div 
        className="absolute inset-0 w-full h-full mix-blend-overlay"
        style={{
          backgroundImage: `
            conic-gradient(
              from 0deg at 50% 50%,
              transparent 0deg,
              rgba(255,255,255,0.2) 45deg,
              transparent 90deg,
              rgba(255,255,255,0.2) 135deg,
              transparent 180deg,
              rgba(255,255,255,0.2) 225deg,
              transparent 270deg,
              rgba(255,255,255,0.2) 315deg,
              transparent 360deg
            )
          `
        }}
      />
    </div>
  );
} 