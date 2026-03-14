import { useState } from "react";
import { MapPin, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SantaTracker = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    // Force iframe refresh
    const iframe = document.querySelector("#norad-iframe") as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  return (
    <section id="santa" className="py-16 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <span className="inline-block text-5xl mb-4 animate-float">🎅</span>
          <h2 className="font-display text-4xl font-bold text-foreground mb-3">
            Where is Santa?
          </h2>
          <p className="text-muted-foreground font-display italic text-lg">
            Santa's sleigh is on the move...
          </p>
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-christmas border-4 border-primary/20 bg-card">
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-card/90 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin text-4xl mb-4">🎄</div>
                <p className="font-display text-muted-foreground">Loading Santa Tracker...</p>
              </div>
            </div>
          )}

          {/* NORAD Tracker Embed */}
          <div className="w-full h-[65vh] md:h-[600px] lg:h-[700px]">
            <iframe
              id="norad-iframe"
              src="https://www.noradsanta.org/en/map"
              className="w-full h-full border-0"
              title="NORAD Santa Tracker"
              onLoad={() => setIsLoading(false)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>

          {/* Control bar */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRefresh}
              className="shadow-lg"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button
              size="sm"
              variant={soundEnabled ? "christmas" : "secondary"}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="shadow-lg"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-accent rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-accent rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-accent rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-accent rounded-br-2xl" />
        </div>

        <div className="text-center mt-6">
          <a
            href="https://www.noradsanta.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-display"
          >
            <MapPin className="w-4 h-4" />
            Open full NORAD Santa Tracker
          </a>
        </div>
      </div>
    </section>
  );
};
