import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";
import * as Portal from "@radix-ui/react-portal";

interface ComicDialogProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
  onClose?: () => void;
}

export function ComicDialog({
  children,
  className,
  variant = "primary",
  onClose,
  ...props
}: ComicDialogProps) {
  return (
    <Portal.Root>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div 
          {...props}
          className={cn(
            "relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl pointer-events-auto",
            "border-4 border-black",
            "transform transition-all duration-200",
            "animate-in zoom-in-95",
            className
          )}
          style={{
            clipPath: `
              polygon(
                0% 20px, 20px 0%,
                calc(100% - 20px) 0%, 100% 20px,
                100% calc(100% - 20px), calc(100% - 20px) 100%,
                20px 100%, 0% calc(100% - 20px)
              )
            `
          }}
        >
          {/* Inner content */}
          <div className="relative z-10 p-6">
            {/* Burst corners */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-yellow-400" />
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-yellow-400" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-yellow-400" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-yellow-400" />

            {/* Content */}
            <div className="relative">
              {children}
            </div>
          </div>

          {/* Comic-style shadow effect */}
          <div 
            className="absolute -bottom-4 -right-4 w-full h-full bg-black/20 -z-10 rounded-lg"
            style={{
              clipPath: `
                polygon(
                  0% 20px, 20px 0%,
                  calc(100% - 20px) 0%, 100% 20px,
                  100% calc(100% - 20px), calc(100% - 20px) 100%,
                  20px 100%, 0% calc(100% - 20px)
                )
              `
            }}
          />
        </div>
      </div>
    </Portal.Root>
  );
} 