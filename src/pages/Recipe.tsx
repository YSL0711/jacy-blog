import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Snowfall } from "@/components/Snowflake";
import { Button } from "@/components/ui/button";
import { Heart, Printer, Share2, ArrowLeft } from "lucide-react";
import { useCookbook } from "@/hooks/useCookbook";
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

const CATEGORY_EMOJI: Record<string, string> = {
  sweet: "🍪",
  savory: "🍖",
  drinks: "🍷",
  traditions: "🎄",
};

const Recipe = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isRecipeSaved, toggleRecipe } = useCookbook();

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) {
        setError("Recipe not found");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("recipes")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          setError("Recipe not found");
        } else {
          setRecipe(data);
        }
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setError("Failed to load recipe");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handlePrint = () => {
    if (!recipe) return;
    
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

  const handleShare = async () => {
    if (!recipe) return;
    
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${recipe.title} - JACY's Christmas Kitchen`,
          text: recipe.memory_story || `Check out this recipe: ${recipe.title}`,
          url,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Snowfall />
        <Header />
        <div className="pt-32 pb-16 px-6 text-center">
          <div className="animate-spin text-4xl mb-4">🍪</div>
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-background">
        <Snowfall />
        <Header />
        <div className="pt-32 pb-16 px-6 text-center">
          <span className="text-6xl mb-4 block">😢</span>
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">
            {error || "Recipe not found"}
          </h1>
          <Link to="/#recipes">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Kitchen
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isSaved = isRecipeSaved(recipe.id);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{recipe.title} - JACY's Christmas Kitchen</title>
        <meta name="description" content={recipe.memory_story || `${recipe.title} recipe from JACY's Christmas Kitchen`} />
      </Helmet>
      
      <Snowfall />
      <Header />
      
      <main className="pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-3xl">
          {/* Back link */}
          <Link 
            to="/#recipes" 
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Kitchen
          </Link>

          {/* Recipe Card */}
          <article className="bg-card rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-8 pb-0">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-4xl mb-2 block">
                    {CATEGORY_EMOJI[recipe.category] || "🍽️"}
                  </span>
                  <h1 className="font-display text-4xl font-bold text-foreground mb-2">
                    {recipe.title}
                  </h1>
                  <p className="text-muted-foreground font-display italic">
                    Shared by {recipe.submitted_by}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6">
                <Button
                  variant={isSaved ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleRecipe(recipe.id)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "Saved" : "Save"}
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Memory Story */}
            {recipe.memory_story && (
              <div className="px-8 py-6">
                <blockquote className="bg-accent/50 rounded-xl p-6 font-display italic text-lg text-foreground/80 border-l-4 border-primary">
                  "{recipe.memory_story}"
                </blockquote>
              </div>
            )}

            {/* Ingredients */}
            <div className="px-8 py-6">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <span>📝</span> Ingredients
              </h2>
              <ul className="space-y-2">
                {recipe.ingredients.split("\n").filter(line => line.trim()).map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3 text-foreground/90">
                    <span className="text-primary mt-1">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            {recipe.instructions && (
              <div className="px-8 py-6 bg-accent/20">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span>👩‍🍳</span> Instructions
                </h2>
                <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {recipe.instructions}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-8 py-6 text-center border-t border-border">
              <p className="text-muted-foreground font-display text-sm">
                From JACY's Christmas Kitchen 🎄
              </p>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Recipe;
