import { useState, useEffect } from "react";
import { PartyPopper } from "lucide-react";

export const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState<{
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isDDay, setIsDDay] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      let christmas = new Date(currentYear, 11, 25); // Month is 0-indexed (11 = Dec)

      // If Christmas has passed this year, look to next year
      if (now.getTime() > christmas.getTime() + 24 * 60 * 60 * 1000) {
        christmas = new Date(currentYear + 1, 11, 25);
      }
      
      // If it's Christmas day (local time)
      if (now.getDate() === 25 && now.getMonth() === 11) {
        setIsDDay(true);
        setTimeLeft(null);
        return;
      } else {
        setIsDDay(false);
      }

      const difference = christmas.getTime() - now.getTime();
      
      // Calculate units
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      // Approximate months and remaining days for a friendly display
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;

      setTimeLeft({
        months,
        days: remainingDays,
        hours,
        minutes,
        seconds
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-[#FDF8F2] relative overflow-hidden" id="countdown">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 text-4xl opacity-50 animate-float">❄️</div>
      <div className="absolute top-20 right-16 text-4xl opacity-50 animate-float" style={{ animationDelay: "1s" }}>⭐</div>

      <div className="container mx-auto px-4 z-10 relative mt-12 md:mt-16">
        <div className="text-center mb-10">
          <h2 className="font-elegant text-5xl md:text-7xl text-christmas-red mb-4">
            Countdown
          </h2>
          <p className="font-sans text-lg md:text-xl text-warm-grey/70">
            Waiting for the most magical time of the year...
          </p>
        </div>

        {isDDay ? (
          <div className="flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-500">
            <div className="flex space-x-4">
              <span className="text-5xl md:text-7xl animate-bounce">🎅</span>
              <span className="text-5xl md:text-7xl animate-bounce" style={{ animationDelay: "200ms" }}>🎄</span>
              <span className="text-5xl md:text-7xl animate-bounce" style={{ animationDelay: "400ms" }}>🎁</span>
            </div>
            <h3 className="font-display text-4xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-christmas-red via-ornament-gold to-christmas-green font-bold text-center">
              MERRY CHRISTMAS!
            </h3>
            <p className="font-sans text-xl text-center text-foreground">
              Wishing you a day filled with joy, warmth, and love!
            </p>
            <PartyPopper className="w-16 h-16 text-ornament-gold animate-pulse mt-4" />
          </div>
        ) : (
          timeLeft && (
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-4xl mx-auto">
              <TimeUnit value={timeLeft.months} label="Months" />
              <TimeUnit value={timeLeft.days} label="Days" />
              <TimeUnit value={timeLeft.hours} label="Hours" />
              <TimeUnit value={timeLeft.minutes} label="Minutes" />
              <TimeUnit value={timeLeft.seconds} label="Seconds" />
            </div>
          )
        )}
      </div>
    </section>
  );
};

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm border-2 border-candlelight/20 rounded-2xl p-4 md:p-6 min-w-[100px] md:min-w-[130px] shadow-sm transform hover:scale-105 transition-transform duration-300">
    <span className="font-elegant text-5xl md:text-6xl text-christmas-red mb-2">
      {value.toString().padStart(2, '0')}
    </span>
    <span className="font-sans text-xs md:text-sm text-warm-grey uppercase tracking-wider font-semibold">
      {label}
    </span>
  </div>
);
