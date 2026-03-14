import { useEffect, useState } from "react";

interface SnowflakeProps {
  delay: number;
  duration: number;
  left: number;
  size: number;
}

const Snowflake = ({ delay, duration, left, size }: SnowflakeProps) => {
  return (
    <div
      className="fixed pointer-events-none text-primary/20 animate-snowfall"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        fontSize: `${size}px`,
        top: "-20px",
      }}
    >
      ❄
    </div>
  );
};

export const Snowfall = () => {
  const [snowflakes, setSnowflakes] = useState<SnowflakeProps[]>([]);

  useEffect(() => {
    const flakes: SnowflakeProps[] = [];
    for (let i = 0; i < 20; i++) {
      flakes.push({
        delay: Math.random() * 10,
        duration: 8 + Math.random() * 10,
        left: Math.random() * 100,
        size: 10 + Math.random() * 20,
      });
    }
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
      {snowflakes.map((flake, index) => (
        <Snowflake key={index} {...flake} />
      ))}
    </div>
  );
};
