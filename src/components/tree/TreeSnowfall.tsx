import { useEffect, useState, useMemo } from "react";

interface Snowflake {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export const TreeSnowfall = () => {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  const generateSnowflakes = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 8 + 8,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  }, []);

  useEffect(() => {
    setSnowflakes(generateSnowflakes);
  }, [generateSnowflakes]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute animate-snowfall"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity * 0.5,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            background: "radial-gradient(circle, hsl(var(--christmas-gold) / 0.3) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(0.5px)",
          }}
        />
      ))}
    </div>
  );
};
