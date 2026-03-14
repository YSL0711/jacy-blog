import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MagicalTreeHero } from "@/components/tree/MagicalTreeHero";
import { SantaTracker } from "@/components/SantaTracker";
import { BlogPreview } from "@/components/BlogPreview";
import { RecipeGallery } from "@/components/recipes/RecipeGallery";
import SnowHarvestGame from "@/components/SnowHarvestGame";
import { CelestialSleigh } from "@/components/CelestialSleigh";
import YearbookGallery from "@/components/yearbook/YearbookGallery";
import { AboutSection } from "@/components/AboutSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Celestial Sleigh Animation */}
      <CelestialSleigh />
      
      <Header />
      
      {/* Magical Tree Hero Section */}
      <MagicalTreeHero />

      {/* Santa Tracker Section */}
      <SantaTracker />

      {/* Recipe Gallery Section */}
      <RecipeGallery />

      {/* Snow Harvest Game Section */}
      <SnowHarvestGame />

      {/* Yearbook Section */}
      <YearbookGallery />

      {/* Blog Preview Section */}
      <BlogPreview />

      {/* About Section */}
      <AboutSection />

      {/* Quote Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto text-center max-w-2xl">
          <blockquote className="font-display text-3xl md:text-4xl italic text-foreground leading-relaxed">
            "Christmas isn't just a day, it's a frame of mind."
          </blockquote>
          <cite className="block mt-6 text-muted-foreground font-display">
            — Valentine Davies
          </cite>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
