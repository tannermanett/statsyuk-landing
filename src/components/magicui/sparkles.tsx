"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SparklesProps {
  className?: string;
  /** Number of sparkles rendered */
  quantity?: number;
  /** Base sparkle size in px */
  size?: number;
  /** Sparkle color */
  color?: string;
  /** Twinkle speed multiplier */
  speed?: number;
  /** Max opacity of sparkles */
  maxOpacity?: number;
}

/**
 * Lightweight canvas-based sparkle background with subtle twinkle.
 * Render absolutely inside a relatively positioned container.
 */
const Sparkles: React.FC<SparklesProps> = ({
  className,
  quantity = 120,
  size = 1.2,
  color = "#ffffff",
  speed = 1,
  maxOpacity = 0.5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<{
    x: number;
    y: number;
    r: number;
    phase: number;
  }[]>([]);
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      canvas.width = Math.max(1, Math.floor(clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(clientHeight * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // regenerate stars on resize for even distribution
      const stars = [] as typeof starsRef.current;
      for (let i = 0; i < quantity; i++) {
        stars.push({
          x: Math.random() * clientWidth,
          y: Math.random() * clientHeight,
          r: Math.max(0.6, size * (0.6 + Math.random() * 0.9)),
          phase: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = stars;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    const colorCanvas = document.createElement("canvas");
    const colorCtx = colorCanvas.getContext("2d");
    if (!colorCtx) return;
    colorCanvas.width = colorCanvas.height = 1;
    colorCtx.fillStyle = color;
    colorCtx.fillRect(0, 0, 1, 1);
    const [r, g, b] = colorCtx.getImageData(0, 0, 1, 1).data;

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of starsRef.current) {
        const twinkle = 0.5 + 0.5 * Math.sin(s.phase + (t * 0.002 * speed));
        const opacity = Math.min(maxOpacity, 0.15 + twinkle * maxOpacity);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [quantity, size, color, speed, maxOpacity, dpr]);

  return (
    <canvas ref={canvasRef} className={cn("pointer-events-none absolute inset-0 w-full h-full", className)} />
  );
};

export default Sparkles;




