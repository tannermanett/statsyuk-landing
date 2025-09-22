import Section from "@/components/section";
import Particles from "@/components/magicui/particles";

export default function ProofRoadmap() {
  return (
    <Section
      id="proof"
      title="Backed by Leading Incubators"
      subtitle={<>
        Pilots today. <span className="text-accent">Launch tomorrow.</span>
      </>}
      className=""
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
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center gap-8">
          <p className="text-center text-muted-foreground max-w-2xl">
            Statsyuk is proud to be supported by leading startup incubators that have been instrumental in our journey, 
            providing mentorship, resources, and access to elite hockey programs across North America.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-100/30 rounded-lg p-8 w-full">
            <div className="grid grid-cols-2 gap-8 place-items-center">
              <a 
                href="https://www.chaitech.org/startups" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <img src="/logos/chai-tech.png" alt="Chai Tech Incubator - Supporting innovative startups" className="h-20 w-auto" />
              </a>
              <a 
                href="https://www.innovationboostzone.com/ibz-incubation" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <img src="/logos/ru-ibz.png" alt="RU-IBZ Innovation Boost Zone - Accelerating startup growth" className="h-20 w-auto" />
              </a>
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <img src="/logos/644cc9f504dc3168fd1788d1c966d26b1618847872-1.png" alt="Partner Organization - Supporting innovative startups" className="h-20 w-auto" />
              </a>
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <img src="/logos/tmu_logo.svg" alt="Toronto Metropolitan University - Supporting innovative startups" className="h-20 w-auto" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-4">
            <div className="rounded-lg border p-4">
              <div className="text-xs text-muted-foreground uppercase">Now</div>
              <div className="mt-1 font-medium">Pilots underway</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-xs text-muted-foreground uppercase">Next</div>
              <div className="mt-1 font-medium">Private beta — join the waitlist</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-xs text-muted-foreground uppercase">Future</div>
              <div className="mt-1 font-medium">Full launch for all rinks and teams</div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}


