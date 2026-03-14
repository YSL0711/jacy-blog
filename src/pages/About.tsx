import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Snowfall } from "@/components/Snowflake";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Snowfall />
      <Header />
      
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <span className="inline-block text-6xl mb-6 animate-float">✨</span>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-6">
              About <span className="text-primary">JACY</span>
            </h1>
            <p className="font-display text-xl text-muted-foreground italic">
              The heart behind this cozy corner
            </p>
          </div>

          <div className="prose prose-lg mx-auto">
            <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50">
              <p className="font-display text-lg text-foreground leading-relaxed mb-6">
                Hello, dear friend! I'm JACY, and this is my little Christmas sanctuary on the internet.
              </p>
              
              <p className="font-display text-lg text-foreground leading-relaxed mb-6">
                There's something magical about the holiday season — the scent of pine and cinnamon, 
                the warmth of twinkling lights, the joy of gathering with loved ones. I created this 
                blog to capture those precious moments and share the festive spirit all year round.
              </p>

              <p className="font-display text-lg text-foreground leading-relaxed mb-6">
                Here, you'll find my holiday memories, favorite recipes, cozy traditions, and 
                the little things that make this season so special to me.
              </p>

              <div className="flex items-center justify-center gap-4 text-3xl mt-8">
                <span className="animate-twinkle" style={{ animationDelay: "0s" }}>🎄</span>
                <span className="animate-twinkle" style={{ animationDelay: "0.3s" }}>❄️</span>
                <span className="animate-twinkle" style={{ animationDelay: "0.6s" }}>🎁</span>
                <span className="animate-twinkle" style={{ animationDelay: "0.9s" }}>☃️</span>
                <span className="animate-twinkle" style={{ animationDelay: "1.2s" }}>🌟</span>
              </div>

              <p className="font-display text-lg text-foreground leading-relaxed mt-8 text-center italic">
                Thank you for stopping by. May your days be merry and bright!
              </p>

              <p className="font-display text-xl text-primary text-center mt-4">
                With love,<br />
                <span className="font-semibold">JACY</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
