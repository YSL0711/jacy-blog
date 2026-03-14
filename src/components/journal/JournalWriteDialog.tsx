import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ImagePlus, X, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface JournalEntry {
  id: string;
  emoji: string;
  title: string;
  body: string;
  category: string;
  image_url?: string | null;
  created_at: string;
}

interface JournalWriteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editEntry?: JournalEntry | null;
}

export const JournalWriteDialog = ({
  open,
  onOpenChange,
  onSuccess,
  editEntry,
}: JournalWriteDialogProps) => {
  const [emoji, setEmoji] = useState("✨");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  
  // Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Delete states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (editEntry) {
      setEmoji(editEntry.emoji);
      setTitle(editEntry.title);
      setBody(editEntry.body);
      setExistingImageUrl(editEntry.image_url || null);
      setImagePreview(editEntry.image_url || null);
    } else {
      resetForm();
    }
  }, [editEntry, open]);

  const resetForm = () => {
    setEmoji("✨");
    setTitle("");
    setBody("");
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('journal-images')
      .upload(fileName, file);
    
    if (error) {
      console.error('Upload error:', error);
      throw error;
    }
    
    const { data } = supabase.storage
      .from('journal-images')
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !body.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | null = existingImageUrl;
      
      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      } else if (!imagePreview && existingImageUrl) {
        // Image was removed
        imageUrl = null;
      }

      if (editEntry) {
        const { error } = await supabase
          .from("journal_entries")
          .update({ 
            emoji, 
            title: title.trim(), 
            body: body.trim(),
            image_url: imageUrl 
          })
          .eq("id", editEntry.id);

        if (error) throw error;
        toast.success("Memory updated! ✨");
      } else {
        const { error } = await supabase
          .from("journal_entries")
          .insert({ 
            emoji, 
            title: title.trim(), 
            body: body.trim(),
            image_url: imageUrl,
            category: "General" // Keep for backwards compatibility
          });

        if (error) throw error;
        toast.success("Pinned to the board! 📌");
      }

      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving entry:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editEntry) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", editEntry.id);
      
      if (error) throw error;
      
      toast.success("Memory removed 🍂");
      setDeleteDialogOpen(false);
      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Couldn't remove the memory. Try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isDeleting) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent 
          className="sm:max-w-xl max-h-[90vh] overflow-y-auto border-0"
          style={{
            background: 'linear-gradient(165deg, #FFFBF5 0%, #FDF8F3 100%)',
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-center italic">
              {editEntry ? "Edit your memory" : "Pin a new memory"}
            </DialogTitle>
            <DialogDescription className="text-center font-display text-muted-foreground">
              {editEntry ? "Update what made your day sparkle" : "Write what made your day sparkle..."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Emoji Selector */}
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-display text-muted-foreground">Choose your emoji</label>
              <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="text-6xl hover:scale-110 transition-transform p-2 rounded-lg hover:bg-muted/50"
                  >
                    {emoji}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none" align="center">
                  <Picker
                    data={data}
                    onEmojiSelect={(e: { native: string }) => {
                      setEmoji(e.native);
                      setEmojiPickerOpen(false);
                    }}
                    theme="light"
                    previewPosition="none"
                    skinTonePosition="none"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-display text-muted-foreground">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your cozy headline here…"
                className="font-serif text-lg bg-white/80 border-border/50 focus:border-primary/50"
                maxLength={100}
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <label className="text-sm font-display text-muted-foreground">Your memory</label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write what made your day sparkle…"
                className="font-display min-h-[150px] resize-none bg-white/80 border-border/50 focus:border-primary/50"
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground/60 text-right">
                {body.length}/2000
              </p>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-display text-muted-foreground">Photo (optional)</label>
              
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl shadow-md"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <ImagePlus className="w-8 h-8 text-muted-foreground/50" />
                  <span className="text-sm font-display text-muted-foreground/70">
                    Click to add a photo
                  </span>
                </button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full font-display text-lg py-6 rounded-full"
              disabled={isSubmitting || !title.trim() || !body.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editEntry ? "Saving..." : "Pinning..."}
                </>
              ) : (
                `📌 ${editEntry ? "Save changes" : "Pin to the board"}`
              )}
            </Button>

            {/* Delete button - only show in edit mode */}
            {editEntry && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDeleteDialogOpen(true)}
                className="w-full font-display text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete this memory
              </Button>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent style={{ background: 'linear-gradient(165deg, #FFFBF5 0%, #FDF8F3 100%)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl">
              Are you sure you want to remove this memory?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-display">
              This action cannot be undone. The memory will be permanently removed from the board.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-display rounded-full">
              Keep it
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="font-display rounded-full bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Yes, remove it"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
