import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Printer } from "lucide-react";

interface Recipe {
  id: string;
  title: string;
  category: string;
  ingredients: string;
  instructions: string | null;
  memory_story: string | null;
  image_url: string | null;
  submitted_by: string;
}

interface RecipeDetailDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onPrint: (recipe: Recipe) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  sweet: "Sweet Treat",
  savory: "Savory Dish",
  drinks: "Holiday Drink",
  traditions: "Family Tradition",
};

export const RecipeDetailDialog = ({
  recipe,
  open,
  onOpenChange,
  isSaved,
  onToggleSave,
  onPrint,
}: RecipeDetailDialogProps) => {
  if (!recipe) return null;

  const ingredientsList = recipe.ingredients
    .split("\n")
    .filter((line) => line.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-3">
            {recipe.title}
            <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-1 rounded">
              {CATEGORY_LABELS[recipe.category]}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          {recipe.image_url && (
            <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Memory Story */}
          {recipe.memory_story && (
            <div className="bg-secondary/30 rounded-lg p-4 border-l-4 border-accent">
              <h4 className="font-display text-sm font-semibold text-muted-foreground mb-2">
                Memory Bite ✨
              </h4>
              <p
                className="text-foreground italic text-lg leading-relaxed"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                {recipe.memory_story}
              </p>
            </div>
          )}

          {/* Ingredients */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-3">
              Ingredients
            </h4>
            <ul
              className="space-y-1.5 text-foreground"
              style={{ fontFamily: "'Caveat', cursive", fontSize: "1.25rem" }}
            >
              {ingredientsList.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          {recipe.instructions && (
            <div>
              <h4 className="font-display text-lg font-semibold mb-3">
                Instructions
              </h4>
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                {recipe.instructions}
              </p>
            </div>
          )}

          {/* Attribution */}
          <p className="text-sm text-muted-foreground">
            Shared by <span className="font-medium">{recipe.submitted_by}</span>
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant={isSaved ? "default" : "outline"}
              onClick={() => onToggleSave(recipe.id)}
              className="flex-1"
            >
              <Heart
                className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`}
              />
              {isSaved ? "Saved to Cookbook" : "Save to Cookbook"}
            </Button>
            <Button variant="outline" onClick={() => onPrint(recipe)}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
