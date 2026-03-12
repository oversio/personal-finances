import { Navbar } from "./_components/ui/navbar";
import { Hero } from "./_components/sections/hero";
import { Features } from "./_components/sections/features";
import { Pricing } from "./_components/sections/pricing";
import { CTA } from "./_components/sections/cta";
import { Footer } from "./_components/ui/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
