import { format } from "date-fns";

interface JournalEntry {
  id: string;
  emoji: string;
  title: string;
  body: string;
  category: string;
  image_url?: string | null;
  created_at: string;
}

interface JournalCardProps {
  entry: JournalEntry;
  onClick: () => void;
  index: number;
}

export const JournalCard = ({ entry, onClick, index }: JournalCardProps) => {
  // Get preview text (first ~80 characters)
  const previewText = entry.body.length > 80 
    ? entry.body.substring(0, 80).trim() + "..." 
    : entry.body;
  
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{
        background: 'linear-gradient(145deg, #FFFBF5 0%, #FDF8F3 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Image thumbnail */}
      {entry.image_url && (
        <div className="w-full h-32 overflow-hidden">
          <img
            src={entry.image_url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      
      <div className="p-5">
        {/* Emoji and content */}
        <div className="flex items-start gap-4">
          <span 
            className="text-4xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300" 
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            {entry.emoji}
          </span>
          
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h2 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300 mb-2 leading-snug">
              {entry.title}
            </h2>
            
            {/* Preview text */}
            <p className="font-display text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {previewText}
            </p>
            
            {/* Timestamp */}
            <p className="text-[11px] text-muted-foreground/50 mt-3 font-display uppercase tracking-wide">
              Posted on {format(new Date(entry.created_at), "MMM d, yyyy")}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};
