import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface JournalEntry {
  id: string;
  emoji: string;
  title: string;
  body: string;
  category: string;
  image_url?: string | null;
  created_at: string;
}

interface JournalEntryDialogProps {
  entry: JournalEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditClick: () => void;
}

export const JournalEntryDialog = ({
  entry,
  open,
  onOpenChange,
  onEditClick,
}: JournalEntryDialogProps) => {
  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0 border-0"
        style={{
          background: 'linear-gradient(165deg, #FFFBF5 0%, #FDF8F3 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Image at top if exists */}
        {entry.image_url && (
          <div className="w-full h-64 overflow-hidden">
            <img
              src={entry.image_url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8">
          {/* Emoji */}
          <div className="text-center mb-6">
            <span className="text-6xl inline-block animate-float">{entry.emoji}</span>
          </div>

          {/* Title */}
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground text-center mb-6 leading-snug">
            {entry.title}
          </h2>

          {/* Body */}
          <div className="prose prose-lg max-w-none">
            <p className="font-display text-foreground/90 leading-relaxed whitespace-pre-wrap text-base">
              {entry.body}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30">
            <p className="text-xs text-muted-foreground/60 font-display uppercase tracking-wide">
              Posted on {format(new Date(entry.created_at), "MMMM d, yyyy")}
            </p>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onEditClick}
              className="font-display gap-2 rounded-full hover:bg-primary/5"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
