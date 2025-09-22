import Section from "@/components/section";
import Particles from "@/components/magicui/particles";
import Image from "next/image";

export default function NhlStatsSection() {
  return (
    <Section id="nhl" title="Compare yourself to the game&apos;s best" subtitle="Pro-level speed, built for youth development" background={
      <Particles
        className="absolute inset-0"
        quantity={140}
        color={"#ba9343"}
        size={1}
        ease={40}
        staticity={60}
        vx={0.05}
        vy={0.02}
      />
    }>
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Our platform already processes NHL games to prove speed and reliability. Our mission is youth development,
            bringing pro-level insights to every family, player, and coach.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1">
            <Image 
              src="/advanced-board.webp" 
              alt="NHL Analytics Dashboard - Advanced Board View" 
              className="w-full rounded-lg shadow-lg border"
              width={1200}
              height={800}
            />
          </div>
          
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <h3 className="text-2xl font-semibold mb-4">See Our NHL Analytics in Action</h3>
            <p className="text-muted-foreground mb-6">
              This is our proof of concept - the same technology we’re bringing to youth hockey. 
              Experience the depth of insights that will soon be available for junior players.
            </p>
            <a 
              href="https://www.statsyuk.ca/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity text-lg"
            >
              View Our NHL Analytics Now
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}


