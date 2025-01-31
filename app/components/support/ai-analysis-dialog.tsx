import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wand2 } from 'lucide-react';

interface AIAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisMessages: string[];
}

export function AIAnalysisDialog({ open, onOpenChange, analysisMessages }: AIAnalysisDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="ai-analysis-dialog sm:max-w-[500px]">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="h-5 w-5 text-primary animate-pulse" />
          <h2 className="text-lg font-semibold text-foreground">AI Analysis in Progress</h2>
        </div>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {analysisMessages.map((message, index) => (
              <div
                key={index}
                className="text-sm text-foreground py-1"
                style={{
                  animation: 'fadeIn 0.5s ease-in-out',
                  animationFillMode: 'forwards',
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0
                }}
              >
                {message}
              </div>
            ))}
          </div>
        </ScrollArea>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
} 