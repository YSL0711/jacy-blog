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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubmitRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const SubmitRecipeDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: SubmitRecipeDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "",
    ingredients: "",
    instructions: "",
    memory_story: "",
    image_url: "",
    submitted_by: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.category || !form.ingredients.trim() || !form.submitted_by.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("recipes").insert({
        title: form.title.trim(),
        category: form.category,
        ingredients: form.ingredients.trim(),
        instructions: form.instructions.trim() || null,
        memory_story: form.memory_story.trim() || null,
        image_url: form.image_url.trim() || null,
        submitted_by: form.submitted_by.trim(),
        is_approved: false,
      });

      if (error) throw error;

      toast.success("Recipe submitted! It will appear after approval. 🎄");
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error submitting recipe:", error);
      toast.error("Failed to submit recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      category: "",
      ingredients: "",
      instructions: "",
      memory_story: "",
      image_url: "",
      submitted_by: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Share Your Recipe 🍪
          </DialogTitle>
          <DialogDescription>
            Share a cherished holiday recipe with the community.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Recipe Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Grandma's Sugar Cookies"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={form.category}
              onValueChange={(value) => setForm({ ...form, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sweet">🍪 Sweet</SelectItem>
                <SelectItem value="savory">🍖 Savory</SelectItem>
                <SelectItem value="drinks">🍷 Drinks</SelectItem>
                <SelectItem value="traditions">🎄 Traditions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ingredients">Ingredients * (one per line)</Label>
            <Textarea
              id="ingredients"
              value={form.ingredients}
              onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
              placeholder="2 cups flour&#10;1 cup sugar&#10;1 tsp vanilla..."
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              placeholder="Mix dry ingredients first, then..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memory_story">
              Memory Bite{" "}
              <span className="text-muted-foreground text-xs">
                (Why does this recipe matter?)
              </span>
            </Label>
            <Textarea
              id="memory_story"
              value={form.memory_story}
              onChange={(e) => setForm({ ...form, memory_story: e.target.value })}
              placeholder="My grandmother made these every Christmas Eve..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">
              Photo URL{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="image_url"
              type="url"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="submitted_by">Your Name *</Label>
            <Input
              id="submitted_by"
              value={form.submitted_by}
              onChange={(e) => setForm({ ...form, submitted_by: e.target.value })}
              placeholder="Your name or nickname"
              maxLength={50}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Recipe"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
