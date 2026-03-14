import { Instagram } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-12 bg-warm-grey text-primary-foreground">
      <div className="container mx-auto px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-2xl">🎄</span>
          <span className="font-display text-2xl font-semibold">JACY's Blog</span>
          <a
            href="https://www.instagram.com/_jacy_kim_?igsh=MXJnNXFqMHRxcGh3Zw=="
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-foreground/70 hover:text-primary transition-colors hover:scale-110 duration-300 ml-1"
            aria-label="JACY's Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
        </div>
        <p className="font-display italic text-primary-foreground/70 mb-6">
          "May your days be merry and bright"
        </p>
        <div className="flex items-center justify-center gap-6 text-2xl mb-6">
          <span className="animate-twinkle" style={{ animationDelay: "0s" }}>⭐</span>
          <span className="animate-twinkle" style={{ animationDelay: "0.5s" }}>❄️</span>
          <span className="animate-twinkle" style={{ animationDelay: "1s" }}>🎁</span>
          <span className="animate-twinkle" style={{ animationDelay: "1.5s" }}>🦌</span>
          <span className="animate-twinkle" style={{ animationDelay: "2s" }}>⭐</span>
        </div>
        <p className="text-sm text-primary-foreground/50 font-display">
          © {new Date().getFullYear()} JACY's Christmas Blog. Made with love.
        </p>
      </div>
    </footer>
  );
};
