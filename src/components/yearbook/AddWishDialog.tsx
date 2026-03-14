import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import VoiceRecorder from "./VoiceRecorder";

interface AddWishDialogProps {
  onWishAdded: () => void;
}

const AddWishDialog = ({ onWishAdded }: AddWishDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const resetForm = () => {
    setName("");
    setMessage("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setVoiceBlob(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive"
      });
      return;
    }

    if (!message.trim() && !voiceBlob) {
      toast({
        title: "Message required",
        description: "Please add a text or voice message",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl: string | null = null;
      let voiceUrl: string | null = null;

      // Upload photo if provided
      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("wishes")
          .upload(`photos/${fileName}`, photoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("wishes")
          .getPublicUrl(`photos/${fileName}`);
        
        photoUrl = publicUrl;
      }

      // Upload voice recording if provided
      if (voiceBlob) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webm`;
        
        const { error: uploadError } = await supabase.storage
          .from("wishes")
          .upload(`voices/${fileName}`, voiceBlob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("wishes")
          .getPublicUrl(`voices/${fileName}`);
        
        voiceUrl = publicUrl;
      }

      // Insert wish into database
      const { error: insertError } = await supabase
        .from("wishes")
        .insert({
          name: name.trim(),
          message: message.trim() || null,
          photo_url: photoUrl,
          voice_url: voiceUrl
        });

      if (insertError) throw insertError;

      toast({
        title: "Wish added! 🎉",
        description: "Your holiday wish has been added to the yearbook"
      });

      resetForm();
      setOpen(false);
      onWishAdded();

    } catch (error) {
      console.error("Error adding wish:", error);
      toast({
        title: "Error",
        description: "Failed to add your wish. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="christmas" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Your Wish
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            ✨ Add Your Holiday Wish
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={isSubmitting}
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Photo (optional)</Label>
            <div className="flex flex-col items-center gap-4">
              {photoPreview ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click to upload photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Text Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your holiday wishes, memories, or greetings..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {/* Voice Recording */}
          <div className="space-y-2">
            <Label>Voice Message (optional)</Label>
            <VoiceRecorder
              onRecordingComplete={setVoiceBlob}
              onClear={() => setVoiceBlob(null)}
              hasRecording={!!voiceBlob}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="christmas"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Adding Wish...
              </>
            ) : (
              "Add to Yearbook ✨"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWishDialog;
