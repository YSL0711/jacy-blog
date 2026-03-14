import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export const CelestialSleigh = () => {
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed top-16 left-4 z-50 flex flex-col items-start gap-1">
      {/* Compact music control button */}
      <button
        onClick={toggleMute}
        className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-red-700/90 to-red-900/90 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-[10px]"
        style={{
          boxShadow: '0 0 8px 2px rgba(255, 215, 0, 0.2), 0 2px 6px rgba(0,0,0,0.2)'
        }}
        aria-label="Toggle music"
      >
        {isMuted ? (
          <>
            <VolumeX className="w-3 h-3" />
            <span className="font-display whitespace-nowrap">🎷 Play sound</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3 h-3" />
            <span className="font-display whitespace-nowrap">🎷 Mute</span>
          </>
        )}
      </button>

      {/* Hidden YouTube iframe for audio */}
      <iframe
        width="1"
        height="1"
        src={`https://www.youtube.com/embed/7O9jGGm7PlE?autoplay=1&loop=1&playlist=7O9jGGm7PlE&controls=0&mute=${isMuted ? 1 : 0}`}
        title="Cozy Christmas Jazz"
        allow="autoplay; encrypted-media"
        className="opacity-0 absolute pointer-events-none"
      />
    </div>
  );
};
