"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface TileBackgroundProps {
  className?: string;
  /** Grid line color, e.g. rgba(255,255,255,0.06) */
  lineColor?: string;
  /** Background color underneath the grid */
  backgroundColor?: string;
  /** Grid size in pixels */
  size?: number;
  /** Optional radial mask to fade edges */
  withRadialMask?: boolean;
}

/**
 * Subtle tile/grid background using layered CSS gradients.
 * Designed to sit absolutely positioned inside a relatively positioned container.
 */
const TileBackground: React.FC<TileBackgroundProps> = ({
  className,
  lineColor = "rgba(255,255,255,0.06)",
  backgroundColor = "transparent",
  size = 36,
  withRadialMask = true,
}) => {
  const maskStyle = withRadialMask
    ? {
        WebkitMaskImage:
          "radial-gradient(60% 60% at 50% 40%, rgba(0,0,0,1), rgba(0,0,0,0))",
        maskImage:
          "radial-gradient(60% 60% at 50% 40%, rgba(0,0,0,1), rgba(0,0,0,0))",
      }
    : {};

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundColor,
        backgroundImage: `
          linear-gradient(0deg, ${lineColor} 1px, transparent 1px),
          linear-gradient(90deg, ${lineColor} 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px, ${size}px ${size}px`,
        backgroundPosition: "center",
        ...maskStyle,
      }}
    />
  );
};

export default TileBackground;




