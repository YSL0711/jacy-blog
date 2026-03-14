import { useState, useEffect, useCallback } from "react";

const COOKBOOK_KEY = "jacy-christmas-cookbook";

export const useCookbook = () => {
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(COOKBOOK_KEY);
    if (stored) {
      try {
        setSavedRecipes(JSON.parse(stored));
      } catch {
        setSavedRecipes([]);
      }
    }
  }, []);

  const saveRecipe = useCallback((recipeId: string) => {
    setSavedRecipes((prev) => {
      if (prev.includes(recipeId)) return prev;
      const updated = [...prev, recipeId];
      localStorage.setItem(COOKBOOK_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeRecipe = useCallback((recipeId: string) => {
    setSavedRecipes((prev) => {
      const updated = prev.filter((id) => id !== recipeId);
      localStorage.setItem(COOKBOOK_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isRecipeSaved = useCallback(
    (recipeId: string) => savedRecipes.includes(recipeId),
    [savedRecipes]
  );

  const toggleRecipe = useCallback(
    (recipeId: string) => {
      if (isRecipeSaved(recipeId)) {
        removeRecipe(recipeId);
      } else {
        saveRecipe(recipeId);
      }
    },
    [isRecipeSaved, saveRecipe, removeRecipe]
  );

  return {
    savedRecipes,
    saveRecipe,
    removeRecipe,
    isRecipeSaved,
    toggleRecipe,
  };
};
