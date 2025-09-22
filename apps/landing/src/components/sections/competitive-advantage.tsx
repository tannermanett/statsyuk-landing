"use client";

import Section from "@/components/section";
import Particles from "@/components/magicui/particles";

export default function CompetitiveAdvantage() {
  return (
    <Section
      id="advantage"
      title="Software‑Only Broadcast Overlays"
      subtitle={
        <>
          Virtual broadcast overlays for hockey — hardware‑free.
        </>
      }
      background={
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
      }
    >
      <div className="mx-auto max-w-4xl space-y-8">
        <p className="text-muted-foreground">
          Recently, while improving our rink tracking, we realized we can place stable, precise
          <span className="text-accent font-semibold"> visual overlays</span> on the ice and boards during live streams —
          without changing anything in the rink.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border p-6 bg-background/40">
            <h4 className="font-semibold mb-3">What this enables</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Instantly create new ad inventory across all levels of hockey — no hardware changes</li>
              <li>• Dynamically rotate or region‑sync ads for local audiences</li>
              <li>• Offer sponsors contextual overlays during replays, intermissions, or highlight segments</li>
            </ul>
          </div>
          <div className="rounded-lg border p-6 bg-background/40">
            <h4 className="font-semibold mb-3">Ideal partners</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Broadcasters seeking scalable inventory</li>
              <li>• Sponsors needing audience‑targeted, brand‑safe placements</li>
              <li>• Leagues and teams wanting zero‑impact rink branding</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex h-2 w-2 rounded-full bg-accent"></span>
          <span>
            Built on our existing tracking stack — no fixed cameras, no special rig, just software.
          </span>
        </div>
      </div>
    </Section>
  );
}

