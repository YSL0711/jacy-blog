import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Snowfall } from "@/components/Snowflake";
import YearbookGallery from "@/components/yearbook/YearbookGallery";
import { Helmet } from "react-helmet-async";

const Yearbook = () => {

  return (
    <>
      <Helmet>
        <title>Family Yearbook - Holiday Wishes & Messages</title>
        <meta name="description" content="Share your holiday wishes, photos, and voice messages with the family. Add your special memories to our digital yearbook." />
      </Helmet>

      <div className="min-h-screen bg-background relative overflow-hidden">
        <Snowfall />

        <Header />
        <main className="relative z-20 pt-24">
          <YearbookGallery />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Yearbook;
