"use client";
import Section from "@/components/section";
import Particles from "@/components/magicui/particles";
import TileBackground from "@/components/magicui/tile-background";
import { useState } from "react";

export default function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setEmail("");
    } catch (e) {
      setStatus("error");
    }
  }

  return (
    <Section id="waitlist" title="Be the first in line for the beta." subtitle="Join the waitlist" background={
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
      <form onSubmit={onSubmit} className="mx-auto max-w-xl flex gap-2 mt-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@hockeymail.com"
          className="flex-1 rounded-md border bg-background px-4 py-2"
        />
        <button
          type="submit"
          className="rounded-md bg-accent text-accent-foreground px-4 py-2 font-medium hover:opacity-90"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Joining…" : "Join waitlist"}
        </button>
      </form>
      <p className="text-center text-xs text-muted-foreground mt-3">
        We’ll only send hockey updates. Unsubscribe anytime. <a className="underline" href="#">Privacy Policy</a>
      </p>
      {status === "success" && (
        <p className="text-center text-sm mt-2">Thanks! We’ll follow up shortly. Optional: tell us if you’re a parent, player, or coach.</p>
      )}
      {status === "error" && (
        <p className="text-center text-sm mt-2 text-red-500">Something went wrong. Please try again.</p>
      )}
    </Section>
  );
}



