import { Heart, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Recipe {
  id: string;
  title: string;
  category: string;
  ingredients: string;
  memory_story: string | null;
  image_url: string | null;
  submitted_by: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onPrint: (recipe: Recipe) => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  sweet: "🍪",
  savory: "🍖",
  drinks: "🍷",
  traditions: "🎄",
};

export const RecipeCard = ({
  recipe,
  isSaved,
  onToggleSave,
  onPrint,
}: RecipeCardProps) => {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/recipe/${recipe.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${recipe.title} - JACY's Christmas Kitchen`,
          text: recipe.memory_story || `Check out this recipe: ${recipe.title}`,
          url,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard!");
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="group relative bg-card rounded-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-rotate-1 cursor-pointer block"
    >
      {/* Polaroid frame */}
      <div className="p-3 pb-0">
        {/* Photo area */}
        <div className="aspect-square bg-secondary/50 rounded-sm overflow-hidden mb-3">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {CATEGORY_EMOJI[recipe.category] || "🍽️"}
            </div>
          )}
        </div>
      </div>

      {/* Polaroid caption area */}
      <div className="p-4 pt-2 space-y-2">
        <h3 className="font-display text-lg font-semibold text-foreground leading-tight">
          {recipe.title}
        </h3>
        
        <p className="text-sm text-muted-foreground italic line-clamp-2" style={{ fontFamily: "'Caveat', cursive" }}>
          {recipe.memory_story || "A cherished family recipe..."}
        </p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            by {recipe.submitted_by}
          </span>
          
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault();
                onToggleSave(recipe.id);
              }}
              title={isSaved ? "Remove from cookbook" : "Save to cookbook"}
            >
              <Heart
                className={`w-4 h-4 ${isSaved ? "fill-primary text-primary" : ""}`}
              />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault();
                onPrint(recipe);
              }}
              title="Print recipe"
            >
              <Printer className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={handleShare}
              title="Share recipe"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tape decoration */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-accent/60 rotate-2" />
    </Link>
  );
};
