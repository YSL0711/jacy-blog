import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCookbook } from "@/hooks/useCookbook";
import { RecipeCard } from "./RecipeCard";
import { SubmitRecipeDialog } from "./SubmitRecipeDialog";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { toast } from "sonner";

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

type Category = "all" | "sweet" | "savory" | "drinks" | "traditions";

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "all", label: "All", emoji: "🍽️" },
  { value: "sweet", label: "Sweet", emoji: "🍪" },
  { value: "savory", label: "Savory", emoji: "🍖" },
  { value: "drinks", label: "Drinks", emoji: "🍷" },
  { value: "traditions", label: "Traditions", emoji: "🎄" },
];

export const RecipeGallery = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [showCookbookOnly, setShowCookbookOnly] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const { savedRecipes, isRecipeSaved, toggleRecipe } = useCookbook();

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      toast.error("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const filteredRecipes = recipes.filter((recipe) => {
    const categoryMatch =
      activeCategory === "all" || recipe.category === activeCategory;
    const cookbookMatch = !showCookbookOnly || savedRecipes.includes(recipe.id);
    return categoryMatch && cookbookMatch;
  });

  const handlePrint = (recipe: Recipe) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const ingredientsList = recipe.ingredients
      .split("\n")
      .filter((line) => line.trim())
      .map((ing) => `<li>${ing}</li>`)
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${recipe.title} - JACY's Christmas Kitchen</title>
          <style>
            body { font-family: Georgia, serif; max-width: 600px; margin: 40px auto; padding: 20px; }
            h1 { font-size: 28px; margin-bottom: 8px; }
            .meta { color: #666; font-style: italic; margin-bottom: 24px; }
            .memory { background: #fef3cd; padding: 16px; border-radius: 8px; margin-bottom: 24px; font-style: italic; }
            h2 { font-size: 18px; margin-top: 24px; border-bottom: 1px solid #ccc; padding-bottom: 8px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 4px; }
            .instructions { white-space: pre-wrap; line-height: 1.6; }
            .footer { margin-top: 32px; font-size: 12px; color: #999; text-align: center; }
          </style>
        </head>
        <body>
          <h1>${recipe.title}</h1>
          <p class="meta">Shared by ${recipe.submitted_by}</p>
          ${recipe.memory_story ? `<div class="memory">"${recipe.memory_story}"</div>` : ""}
          <h2>Ingredients</h2>
          <ul>${ingredientsList}</ul>
          ${recipe.instructions ? `<h2>Instructions</h2><p class="instructions">${recipe.instructions}</p>` : ""}
          <p class="footer">From JACY's Christmas Kitchen 🎄</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <section className="py-16 px-6" id="recipes">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block text-5xl mb-4 animate-float">🍪</span>
          <h2 className="font-display text-4xl font-bold text-foreground mb-3">
            Christmas Kitchen
          </h2>
          <p className="text-muted-foreground font-display italic text-lg max-w-xl mx-auto">
            Cherished recipes passed down through generations — cinnamon, butter, and love.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {CATEGORIES.map(({ value, label, emoji }) => (
            <Button
              key={value}
              variant={activeCategory === value ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(value)}
            >
              {emoji} {label}
            </Button>
          ))}
          
          <div className="w-px h-6 bg-border mx-2 hidden sm:block" />
          
          <Button
            variant={showCookbookOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCookbookOnly(!showCookbookOnly)}
          >
            <BookOpen className="w-4 h-4 mr-1" />
            My Cookbook ({savedRecipes.length})
          </Button>
        </div>

        {/* Recipe Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">🍪</div>
            <p className="text-muted-foreground">Loading recipes...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              {showCookbookOnly
                ? "No recipes saved to your cookbook yet."
                : "No recipes found in this category."}
            </p>
            {showCookbookOnly && (
              <Button variant="outline" onClick={() => setShowCookbookOnly(false)}>
                Browse All Recipes
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isSaved={isRecipeSaved(recipe.id)}
                onToggleSave={toggleRecipe}
                onPrint={handlePrint}
              />
            ))}
          </div>
        )}

        {/* Submit CTA */}
        <div className="text-center mt-12">
          <Button onClick={() => setSubmitOpen(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Share Your Recipe
          </Button>
        </div>
      </div>

      <SubmitRecipeDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        onSuccess={fetchRecipes}
      />
    </section>
  );
};
