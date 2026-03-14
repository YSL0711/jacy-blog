import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import WishCard from "./WishCard";
import AddWishDialog from "./AddWishDialog";
import { Loader2 } from "lucide-react";

interface Wish {
  id: string;
  name: string;
  message: string | null;
  photo_url: string | null;
  voice_url: string | null;
  created_at: string;
}

const YearbookGallery = () => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("wishes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching wishes:", error);
    } else {
      setWishes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  return (
    <section id="yearbook" className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            📖 Family Yearbook
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Share your holiday wishes, photos, and voice messages with the family
          </p>
          <AddWishDialog onWishAdded={fetchWishes} />
        </div>

        {/* Gallery */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : wishes.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📷</span>
            <p className="text-muted-foreground text-lg">
              No wishes yet. Be the first to add one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishes.map((wish) => (
              <WishCard
                key={wish.id}
                name={wish.name}
                message={wish.message}
                photoUrl={wish.photo_url}
                voiceUrl={wish.voice_url}
                createdAt={wish.created_at}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default YearbookGallery;
