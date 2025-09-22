import Section from "@/components/section";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function DemoSection() {
  return (
    <section id="demo" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          className="absolute inset-0 w-full h-full object-cover scale-110"
          style={{ transform: 'scale(1.1)' }}
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/demo_landing.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/70"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 py-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-sm text-primary font-mono font-medium tracking-wider uppercase mb-4">
            See it in action
          </h2>
          <h3 className="mx-auto mt-4 max-w-xs text-3xl font-semibold sm:max-w-none sm:text-4xl md:text-5xl mb-6">
            No chips. No wearables. <span className="text-accent">No hassle.</span>
          </h3>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto text-lg">
            Our AI tracks every shift and surfaces insights you will not find in a box score.
          </p>
          <div className="mt-6">
            <Link
              href="https://www.youtube.com/watch?v=iGRs93cyJlk"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "default" }), "bg-accent text-accent-foreground hover:opacity-90")}
            >
              Watch on YouTube
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}


