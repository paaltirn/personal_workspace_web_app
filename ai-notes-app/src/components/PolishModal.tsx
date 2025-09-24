'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

interface PolishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalContent: string;
  polishedContent: string;
  onApply: (content: string) => void;
}

export default function PolishModal({
  open,
  onOpenChange,
  originalContent,
  polishedContent,
  onApply
}: PolishModalProps) {
  const handleApply = () => {
    onApply(polishedContent);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] rounded-2xl border border-border bg-card shadow-2xl">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-lg font-semibold">内容优化对比</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 p-6 min-h-[500px]">          <div className="flex flex-col">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">原文</h3>
            <div className="flex-1 p-4 border rounded-xl bg-secondary/30 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{originalContent}</ReactMarkdown>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col">
            <h3 className="text-sm font-medium mb-3 text-primary">优化后</h3>
            <div className="flex-1 p-4 border rounded-xl bg-secondary/30 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{polishedContent}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="border-t border-border pt-4 px-6 pb-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="rounded-lg"
          >
            取消
          </Button>
          <Button 
            onClick={handleApply}
            className="rounded-lg"
          >
            应用优化
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}