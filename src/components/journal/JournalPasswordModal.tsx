import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface JournalPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

const JOURNAL_PASSWORD = "jacy<3";

export const JournalPasswordModal = ({
  open,
  onOpenChange,
  onSuccess,
  title = "Is that you, JACY?",
  description = "Enter the secret password to continue",
}: JournalPasswordModalProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === JOURNAL_PASSWORD) {
      setPassword("");
      setError("");
      onSuccess();
      onOpenChange(false);
    } else {
      setError("Hmm… that's not quite it. Try again, JACY.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-md border-0"
        style={{
          background: 'linear-gradient(165deg, #FFFBF5 0%, #FDF8F3 100%)',
        }}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="font-serif text-2xl text-center italic">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center font-display">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className={`transition-transform ${isShaking ? 'animate-shake' : ''}`}>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter password..."
              className="text-center font-display text-lg tracking-widest bg-white/80 border-border/50"
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-sm text-destructive text-center font-display animate-fade-in">
              {error}
            </p>
          )}

          <Button 
            type="submit" 
            className="w-full font-display rounded-full"
            disabled={!password}
          >
            Continue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
