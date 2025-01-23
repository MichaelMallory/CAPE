import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { ComicTitleBox } from "./comic-title-box";

interface ComicPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
  colorScheme?: "yellow" | "blue" | "green" | "red" | "purple";
}

const colorSchemes = {
  yellow: "bg-amber-500 dark:bg-amber-600",
  blue: "bg-blue-500 dark:bg-blue-600",
  green: "bg-emerald-500 dark:bg-emerald-600",
  red: "bg-rose-500 dark:bg-rose-600",
  purple: "bg-purple-500 dark:bg-purple-600",
};

export function ComicPanel({
  title,
  children,
  className,
  colorScheme = "yellow",
}: ComicPanelProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg shadow-lg border-2 border-black h-full",
        "hover:shadow-xl transition-shadow duration-200",
        colorSchemes[colorScheme],
        className
      )}
    >
      {/* Comic-style title box */}
      <div className="absolute -top-1 -left-1 z-10">
        <ComicTitleBox 
          title={title}
          variant={colorScheme === "blue" ? "secondary" : "primary"}
        />
      </div>

      {/* Content area with inner border for comic effect */}
      <div className="h-full p-2 pt-10">
        {/* Inner panel border */}
        <div className="absolute inset-2 border-2 border-black opacity-20 pointer-events-none" />
        
        {/* Actual content */}
        <div className="relative z-0 h-full bg-white/95 dark:bg-gray-800/95 rounded p-2">
          {children}
        </div>
      </div>
    </div>
  );
} 