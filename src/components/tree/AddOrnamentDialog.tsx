import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmojiPicker } from "./EmojiPicker";
import { hashPasscode } from "@/lib/passcode";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Wand2 } from "lucide-react";

interface AddOrnamentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: { x: number; y: number };
  onSuccess: (newId?: string) => void;
}


const MEMORY_SUGGESTIONS = [
  "Cookies with Grandma, 2002",
  "Wishing snow for Christmas Eve",
  "Our first tree in the new home",
  "The year we laughed until we cried",
  "Hot cocoa by the fireplace",
  "Midnight wrapping sessions",
  "The ornament that survived three moves",
  "Teaching someone to bake for the first time",
  "A carol that makes you cry every time",
  "The gift that meant everything",
];

export const AddOrnamentDialog = ({
  open,
  onOpenChange,
  position,
  onSuccess,
}: AddOrnamentDialogProps) => {
  const [emoji, setEmoji] = useState("🎄");
  const [nickname, setNickname] = useState("");
  const [passcode, setPasscode] = useState("");
  const [note, setNote] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [showElf, setShowElf] = useState(false);

  const wordCount = note.trim().split(/\s+/).filter(Boolean).length;
  const isValidPasscode = /^\d{4}$/.test(passcode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname.trim()) {
      toast.error("Please enter a nickname");
      return;
    }

    if (!isValidPasscode) {
      toast.error("Passcode must be exactly 4 digits");
      return;
    }

    if (wordCount > 200) {
      toast.error("Note must be 200 words or less");
      return;
    }

    setLoading(true);

    try {
      const passcodeHash = await hashPasscode(passcode);

      const { data, error } = await supabase.from("ornaments").insert({
        emoji,
        nickname: nickname.trim(),
        passcode_hash: passcodeHash,
        note: note.trim() || null,
        position_x: position.x,
        position_y: position.y,
      }).select().single();

      if (error) throw error;
      
      if (data && data.id) {
        const myOrnaments = JSON.parse(localStorage.getItem('myOrnaments') || '[]');
        myOrnaments.push(data.id);
        localStorage.setItem('myOrnaments', JSON.stringify(myOrnaments));
      }

      toast.success("Your ornament is glowing 🎁", {
        description: "Thank you for adding your sparkle to the tree!",
      });
      onSuccess(data?.id);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error adding ornament:", error);
      toast.error("Failed to add ornament. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmoji("🎄");
    setNickname("");
    setPasscode("");
    setNote("");
    
    setShowElf(false);
  };

  const useSuggestion = (suggestion: string) => {
    setNote(suggestion);
    setShowElf(false);
    toast.success("Memory added! ✨", { description: "Feel free to personalize it." });
  };

  const getRandomSuggestions = () => {
    const shuffled = [...MEMORY_SUGGESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-b from-card to-card/95 border-candlelight/20">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-candlelight animate-twinkle" />
            Add Your Sparkle
          </DialogTitle>
          <DialogDescription className="font-sans text-muted-foreground">
            What memory do you want to hang on the tree?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Emoji Picker */}
          <div className="space-y-2">
            <Label className="font-sans text-sm">Choose Your Ornament</Label>
            <EmojiPicker selectedEmoji={emoji} onSelect={setEmoji} />
          </div>

          {/* Nickname */}
          <div className="space-y-2">
            <Label htmlFor="nickname" className="font-sans text-sm">
              Your Name or Nickname
            </Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="How should we call you?"
              maxLength={30}
              className="font-sans"
            />
          </div>

          {/* Passcode */}
          <div className="space-y-2">
            <Label htmlFor="passcode" className="font-sans text-sm">
              4-Digit Passcode{" "}
              <span className="text-muted-foreground text-xs">(to protect your note)</span>
            </Label>
            <Input
              id="passcode"
              type="password"
              inputMode="numeric"
              value={passcode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPasscode(val);
              }}
              placeholder="••••"
              maxLength={4}
              className="font-sans"
            />
            {passcode && !isValidPasscode && (
              <p className="text-xs text-destructive font-sans">Passcode must be 4 digits</p>
            )}
          </div>

          {/* Note with Memory Elf */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="note" className="font-sans text-sm">
                Your Private Message{" "}
                <span className="text-muted-foreground text-xs">({wordCount}/200 words)</span>
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowElf(!showElf)}
                className="text-xs text-candlelight hover:text-candlelight/80 gap-1"
              >
                <Wand2 className="w-3 h-3" />
                Need ideas?
              </Button>
            </div>

            {/* Memory Helper Elf */}
            {showElf && (
              <div className="bg-candlelight/10 rounded-lg p-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                <p className="text-xs text-muted-foreground font-sans flex items-center gap-1">
                  <span className="text-base">🧝</span> The Memory Elf suggests...
                </p>
                <div className="space-y-1">
                  {getRandomSuggestions().map((suggestion, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => useSuggestion(suggestion)}
                      className="w-full text-left text-sm font-handwritten text-foreground/80 hover:text-foreground p-2 rounded hover:bg-candlelight/10 transition-colors"
                    >
                      "{suggestion}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Leave a message... only you (and the tree owner) can read it."
              rows={3}
              className="font-handwritten text-base resize-none"
            />
            {wordCount > 200 && (
              <p className="text-xs text-destructive font-sans">Note exceeds 200 words limit</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full font-sans font-semibold bg-gradient-to-r from-ornament-cranberry to-ornament-gold hover:from-ornament-gold hover:to-ornament-cranberry transition-all duration-300"
            disabled={loading || !nickname.trim() || !isValidPasscode}
            size="lg"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Hanging ornament...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Hang on Tree
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
