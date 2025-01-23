import { cn } from "@/lib/utils";

interface ComicTitleBoxProps {
  title: string;
  className?: string;
  variant?: "primary" | "secondary";
}

export function ComicTitleBox({
  title,
  className,
  variant = "primary"
}: ComicTitleBoxProps) {
  return (
    <div className={cn("relative inline-flex", className)}>
      {/* Yellow box for logo/icon */}
      <div className="bg-yellow-400 dark:bg-yellow-500 p-2 shadow-md transform -skew-x-12">
        <div className="transform skew-x-12">
          <span className="font-comic text-xs font-bold text-black">C.A.P.E</span>
        </div>
      </div>
      
      {/* Main title box */}
      <div className="relative">
        {/* Background with 3D effect */}
        <div className="absolute inset-0 bg-blue-600 dark:bg-blue-700 transform translate-x-1 translate-y-1" />
        <div className={cn(
          "relative bg-white dark:bg-gray-800 px-4 py-2 shadow-md",
          "border-2 border-blue-600 dark:border-blue-700"
        )}>
          <span className="font-comic text-sm font-bold uppercase">{title}</span>
        </div>
        
        {/* Top accent */}
        <div className={cn(
          "absolute -top-1 right-0 h-1 w-8",
          variant === "primary" ? "bg-pink-500" : "bg-blue-500"
        )} />
      </div>
    </div>
  );
} 