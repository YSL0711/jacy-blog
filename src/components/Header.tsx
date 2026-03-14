import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Handle hash scrolling after navigation
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  const handleAnchorClick = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/") {
      if (hash === "#top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else {
      // Navigate to home then scroll
      navigate("/" + hash);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-2">
        <a href="/#top" onClick={handleAnchorClick("#top")} className="flex items-center gap-1.5 shrink-0 cursor-pointer">
          <span className="text-xl md:text-2xl">🎄</span>
          <span className="font-display font-semibold text-primary tracking-tight leading-tight text-[clamp(0.85rem,2.5vw,1.5rem)]">
            JACY's<br />Blog
          </span>
        </a>
        
        <div className="flex items-center gap-2 md:gap-4 lg:gap-6 flex-wrap justify-end">
          <a 
            href="/#top" 
            onClick={handleAnchorClick("#top")}
            className="font-display text-[clamp(0.7rem,1.5vw,1rem)] text-foreground/80 hover:text-primary transition-colors duration-300 whitespace-nowrap cursor-pointer"
          >
            Home
          </a>
          <a 
            href="/#santa" 
            onClick={handleAnchorClick("#santa")}
            className="font-display text-[clamp(0.7rem,1.5vw,1rem)] text-foreground/80 hover:text-primary transition-colors duration-300 whitespace-nowrap cursor-pointer"
          >
            Santa
          </a>
          <a 
            href="/#recipes" 
            onClick={handleAnchorClick("#recipes")}
            className="font-display text-[clamp(0.7rem,1.5vw,1rem)] text-foreground/80 hover:text-primary transition-colors duration-300 whitespace-nowrap cursor-pointer"
          >
            Kitchen
          </a>
          <a 
            href="/#snow-harvest" 
            onClick={handleAnchorClick("#snow-harvest")}
            className="font-display text-[clamp(0.7rem,1.5vw,1rem)] text-foreground/80 hover:text-primary transition-colors duration-300 whitespace-nowrap cursor-pointer"
          >
            Game
          </a>
          <a 
            href="/#yearbook" 
            onClick={handleAnchorClick("#yearbook")}
            className="font-display text-[clamp(0.7rem,1.5vw,1rem)] text-foreground/80 hover:text-primary transition-colors duration-300 whitespace-nowrap cursor-pointer"
          >
            Yearbook
          </a>
          <a 
            href="/#journal" 
            onClick={handleAnchorClick("#journal")}
            className="font-display text-[clamp(0.7rem,1.5vw,1rem)] text-foreground/80 hover:text-primary transition-colors duration-300 whitespace-nowrap cursor-pointer"
          >
            Journal
          </a>
          <a 
            href="/#about" 
            onClick={handleAnchorClick("#about")}
            className="font-display text-[clamp(0.7rem,1.5vw,1rem)] text-foreground/80 hover:text-primary transition-colors duration-300 whitespace-nowrap cursor-pointer"
          >
            About
          </a>
        </div>
      </nav>
    </header>
  );
};
