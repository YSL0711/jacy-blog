import { Play, Pause } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface WishCardProps {
  name: string;
  message?: string | null;
  photoUrl?: string | null;
  voiceUrl?: string | null;
  createdAt: string;
}

const WishCard = ({ name, message, photoUrl, voiceUrl, createdAt }: WishCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="group relative bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-border/50">
      {/* Photo Section */}
      <div className="aspect-square overflow-hidden bg-secondary/30">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${name}'s photo`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">🎄</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Name with decorative underline */}
        <div className="relative">
          <h3 className="font-display text-xl text-foreground font-semibold">
            {name}
          </h3>
          <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-primary/60 rounded-full" />
        </div>

        {/* Message */}
        {message && (
          <p className="font-handwritten text-lg text-muted-foreground leading-relaxed line-clamp-4">
            "{message}"
          </p>
        )}

        {/* Voice Message Player */}
        {voiceUrl && (
          <div className="pt-2">
            <audio
              ref={audioRef}
              src={voiceUrl}
              onEnded={handleAudioEnded}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAudio}
              className="gap-2 w-full"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause Message
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Play Voice Message
                </>
              )}
            </Button>
          </div>
        )}

        {/* Date */}
        <p className="text-xs text-muted-foreground/70 pt-2">
          {new Date(createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
          })}
        </p>
      </div>

      {/* Decorative corner */}
      <div className="absolute top-2 right-2 text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
        ✨
      </div>
    </div>
  );
};

export default WishCard;
