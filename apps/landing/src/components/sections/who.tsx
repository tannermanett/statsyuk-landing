import Section from "@/components/section";
import Particles from "@/components/magicui/particles";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, ClipboardList, Heart, Search, Briefcase, Users } from "lucide-react";

export default function WhoSection() {
  const stakeholders: { title: string; description: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
    {
      title: "Players",
      description:
        "See yourself improving. Understand what separates good from great, set reachable goals, and picture your future in junior, college, or the NHL.",
      Icon: Target,
    },
    {
      title: "Coaches",
      description:
        "Make confident decisions with clear insights. Evaluate players, explain your choices, and build trust at tryouts, camps, tournaments, or throughout a season.",
      Icon: ClipboardList,
    },
    {
      title: "Parents",
      description:
        "Follow your child’s progress. Stay connected to goals, know how to best support them, and be part of a growing database higher-level organizations are searching.",
      Icon: Heart,
    },
    {
      title: "Scouts",
      description:
        "Search and compare prospects with consistent analytics across events, teams, and seasons.",
      Icon: Search,
    },
    {
      title: "Agents",
      description:
        "Track client development, benchmark against peers, and present clear value to teams.",
      Icon: Briefcase,
    },
    {
      title: "Teams",
      description:
        "Manage rosters, benchmark performance, and align development goals across staff and seasons.",
      Icon: Users,
    },
  ];

  return (
    <Section id="who" title="Who it’s for" subtitle="Players, Coaches, Parents, Scouts, Agents, Teams" background={
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
      <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
        {stakeholders.map(({ title, description, Icon }) => (
          <Card key={title} className="transition hover:shadow-md hover:border-accent/40">
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription className="mt-1">{description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </Section>
  );
}


