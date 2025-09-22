"use client";

import Section from "@/components/section";
import Particles from "@/components/magicui/particles";
import { motion } from "framer-motion";

export default function ValueHighlights() {
  const pipelineSteps = [
    {
      step: "01",
      title: "Video Upload",
      description: "Your game footage is securely processed and prepared for analysis",
      color: "bg-blue-500"
    },
    {
      step: "02", 
      title: "Player Detection",
      description: "AI identifies every player, puck, and key game element in real-time",
      color: "bg-green-500"
    },
    {
      step: "03",
      title: "Camera Tracking",
      description: "System adapts to camera movements and maintains consistent perspective",
      color: "bg-purple-500"
    },
    {
      step: "04",
      title: "Data Extraction",
      description: "Captures precise player movements, speeds, and positioning data",
      color: "bg-orange-500"
    },
    {
      step: "05",
      title: "Insights Delivery",
      description: "Clean, actionable data ready for players, coaches, and families",
      color: "bg-teal-500"
    }
  ];

  return (
    <Section
      id="value"
      title="Advanced AI Pipeline"
      subtitle="Multi-stage computer vision processing for precision tracking."
      background={
        <Particles
          className="absolute inset-0"
          quantity={160}
          color={"#ba9343"}
          size={1}
          ease={40}
          staticity={60}
          vx={0.04}
          vy={0.02}
        />
      }
    >
      {/* Pipeline Diagram */}
      <div className="mx-auto max-w-6xl mb-12">
        <div className="relative">
          {/* Connection Lines */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-green-500 via-purple-500 via-orange-500 to-teal-500 opacity-30 transform -translate-y-1/2"></div>
          
          {/* Pipeline Steps */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
            {pipelineSteps.map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-3 shadow-lg`}>
                  {item.step}
                </div>
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-tight">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>


      {/* Key Benefits */}
      <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg border p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="font-semibold text-blue-700 dark:text-blue-300">Lightning Fast</div>
          <p className="text-sm text-muted-foreground mt-2">
            Process your entire game in minutes, not hours. Get insights while the game is still fresh in everyone’s mind.
          </p>
        </div>
        <div className="rounded-lg border p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <div className="font-semibold text-green-700 dark:text-green-300">Never Miss a Play</div>
          <p className="text-sm text-muted-foreground mt-2">
            Advanced AI adapts to any camera angle or movement. Works with professional broadcasts or live streams.
          </p>
        </div>
        <div className="rounded-lg border p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <div className="font-semibold text-purple-700 dark:text-purple-300">Pro-Level Accuracy</div>
          <p className="text-sm text-muted-foreground mt-2">
            The same technology used for NHL analysis, now available for youth hockey. Get insights that were previously impossible.
          </p>
        </div>
      </div>
    </Section>
  );
}


