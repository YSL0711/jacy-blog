import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";

interface JournalEntry {
  id: string;
  emoji: string;
  title: string;
  body: string;
  category: string;
  created_at: string;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  Traditions: { bg: "bg-emerald-100/80", text: "text-emerald-700" },
  Gifts: { bg: "bg-rose-100/80", text: "text-rose-700" },
  Baking: { bg: "bg-amber-100/80", text: "text-amber-700" },
  Adventures: { bg: "bg-sky-100/80", text: "text-sky-700" },
  Songs: { bg: "bg-violet-100/80", text: "text-violet-700" },
};

export const BlogPreview = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentEntries = async () => {
      try {
        const { data, error } = await supabase
          .from("journal_entries")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) throw error;
        setEntries(data || []);
      } catch (error) {
        console.error("Error fetching entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentEntries();
  }, []);

  const getPreviewText = (body: string) => {
    return body.length > 100 ? body.substring(0, 100).trim() + "..." : body;
  };

  return (
    <section id="journal" className="py-20" style={{ backgroundColor: '#F8F5F0' }}>
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl italic text-foreground">
              "Little moments that make the season bright"
            </h2>
            <p className="text-muted-foreground font-display mt-2">
              Our cozy holiday journal
            </p>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blog')}
            className="font-display gap-2 text-primary hover:text-primary/80 self-start md:self-auto"
          >
            View all entries
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block">📌</span>
            <p className="font-display text-lg text-muted-foreground">
              No memories pinned yet. Be the first!
            </p>
            <Button 
              onClick={() => navigate('/blog')} 
              className="mt-4 font-display rounded-full"
            >
              Start writing
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {entries.map((entry, index) => {
              const categoryStyle = categoryColors[entry.category] || { bg: "bg-muted", text: "text-muted-foreground" };
              
              return (
                <Card 
                  key={entry.id}
                  onClick={() => navigate('/blog')}
                  className="group cursor-pointer border-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(145deg, #FFFBF5 0%, #FDF8F3 100%)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span 
                        className="text-3xl group-hover:scale-110 transition-transform duration-300" 
                        style={{ animationDelay: `${index * 0.5}s` }}
                      >
                        {entry.emoji}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wide font-display px-2 py-0.5 rounded-full ${categoryStyle.bg} ${categoryStyle.text}`}>
                        {entry.category}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300 leading-snug">
                      {entry.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed font-display mb-3">
                      {getPreviewText(entry.body)}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 font-display uppercase tracking-wide">
                      {format(new Date(entry.created_at), "MMM d, yyyy")}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
