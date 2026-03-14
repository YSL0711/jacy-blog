import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Unlock, Trash2, Edit2 } from "lucide-react";
import { verifyPasscode } from "@/lib/passcode";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Ornament {
  id: string;
  emoji: string;
  nickname: string;
  passcode_hash: string;
  note: string | null;
  position_x: number;
  position_y: number;
}

interface ViewOrnamentDialogProps {
  ornament: Ornament | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const ViewOrnamentDialog = ({
  ornament,
  open,
  onOpenChange,
  onUpdate,
}: ViewOrnamentDialogProps) => {
  const [passcode, setPasscode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const MASTER_KEY = "qorgusfh";

  const handleUnlock = async () => {
    if (!ornament) return;

    setError("");
    
    // Check master key first
    if (passcode === MASTER_KEY) {
      setUnlocked(true);
      return;
    }
    
    // Otherwise check user's passcode
    const isValid = await verifyPasscode(passcode, ornament.passcode_hash);

    if (isValid) {
      setUnlocked(true);
    } else {
      setError("That passcode doesn't unlock this ornament.");
    }
  };

  const handleDelete = async () => {
    if (!ornament) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("ornaments")
        .delete()
        .eq("id", ornament.id);

      if (error) throw error;

      toast.success("Ornament removed from the tree");
      onUpdate();
      handleClose();
    } catch (err) {
      console.error("Error deleting ornament:", err);
      toast.error("Failed to remove ornament");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPasscode("");
    setUnlocked(false);
    setError("");
    onOpenChange(false);
  };

  if (!ornament) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <span className="text-3xl">{ornament.emoji}</span>
            {ornament.nickname}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!unlocked ? (
            <>
              <div className="flex items-center justify-center py-6">
                <div className="text-center space-y-2">
                  <Lock className="w-10 h-10 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    This ornament is hidden from others.
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    The tree owner may still view it using a private master key.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unlock-passcode">
                  Enter passcode to unlock
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="unlock-passcode"
                    type="password"
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter passcode"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && passcode.length >= 4) {
                        handleUnlock();
                      }
                    }}
                  />
                  <Button
                    onClick={handleUnlock}
                    disabled={passcode.length < 4}
                  >
                    <Unlock className="w-4 h-4" />
                  </Button>
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Unlock className="w-4 h-4" />
                  <span>Note unlocked</span>
                </div>
                {ornament.note ? (
                  <p className="text-foreground whitespace-pre-wrap">
                    {ornament.note}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">
                    No note was left with this ornament.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
