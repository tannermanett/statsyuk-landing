import Footer from "@/components/sections/footer";
import Header from "@/components/sections/header";
import Hero from "@/components/sections/hero";
import ProofRoadmap from "@/components/sections/proof-roadmap";
import DemoSection from "@/components/sections/demo";
import ValueHighlights from "@/components/sections/value-highlights";
import CompetitiveAdvantage from "@/components/sections/competitive-advantage";
import WhoSection from "@/components/sections/who";
import WaitlistSection from "@/components/sections/waitlist";
import NhlStatsSection from "@/components/sections/nhl-stats";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <ValueHighlights />
      <DemoSection />
      <ProofRoadmap />
      <WhoSection />
      <CompetitiveAdvantage />
      <NhlStatsSection />
      <WaitlistSection />
      <Footer />
    </main>
  );
}
