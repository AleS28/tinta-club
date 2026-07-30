"use client";

import { useEffect, useMemo, useState } from "react";

interface ButterflySpec {
  id: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  direction: "ltr" | "rtl";
  variant: "terracotta" | "gold" | "cream";
}

const COUNT = 8;

function createButterflies(): ButterflySpec[] {
  const variants: ButterflySpec["variant"][] = ["terracotta", "gold", "cream"];

  return Array.from({ length: COUNT }, (_, id) => ({
    id,
    top: 6 + Math.random() * 78,
    size: 26 + Math.random() * 22,
    delay: Math.random() * 2.5,
    duration: 13 + Math.random() * 9,
    direction: Math.random() > 0.45 ? "ltr" : "rtl",
    variant: variants[id % variants.length]!,
  }));
}

const COLORS: Record<ButterflySpec["variant"], { body: string; wing: string; accent: string }> = {
  terracotta: { body: "#8B3A2B", wing: "#D97757", accent: "#F5E6C8" },
  gold: { body: "#6B4E1A", wing: "#C9A961", accent: "#F5E6C8" },
  cream: { body: "#5C4030", wing: "#E8D5A3", accent: "#D97757" },
};

function ButterflyIcon({
  size,
  variant,
}: {
  size: number;
  variant: ButterflySpec["variant"];
}) {
  const colors = COLORS[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="butterfly-wing-flap"
    >
      <ellipse cx="32" cy="24" rx="3" ry="14" fill={colors.body} />
      <g className="butterfly-wing-left origin-center">
        <path
          d="M30 24 C22 8 6 6 4 20 C3 30 14 36 28 28 Z"
          fill={colors.wing}
          opacity="0.92"
        />
        <path
          d="M28 26 C20 18 12 22 10 28 C12 32 20 30 28 28 Z"
          fill={colors.accent}
          opacity="0.55"
        />
      </g>
      <g className="butterfly-wing-right origin-center">
        <path
          d="M34 24 C42 8 58 6 60 20 C61 30 50 36 36 28 Z"
          fill={colors.wing}
          opacity="0.92"
        />
        <path
          d="M36 26 C44 18 52 22 54 28 C52 32 44 30 36 28 Z"
          fill={colors.accent}
          opacity="0.55"
        />
      </g>
      <circle cx="32" cy="12" r="2.5" fill={colors.body} />
      <path d="M31 10 L30 6 M33 10 L34 6" stroke={colors.body} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function ButterflyFlight() {
  const butterflies = useMemo(() => createButterflies(), []);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    setVisible(true);

    const longestMs = Math.max(
      ...butterflies.map((b) => (b.delay + b.duration + 0.5) * 1000),
    );
    const timer = window.setTimeout(() => setVisible(false), longestMs);

    return () => window.clearTimeout(timer);
  }, [butterflies]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
      aria-hidden
    >
      {butterflies.map((b) => (
        <div
          key={b.id}
          className={`absolute butterfly-fly-${b.direction}`}
          style={{
            top: `${b.top}%`,
            width: b.size,
            height: b.size * 0.75,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        >
          <ButterflyIcon size={b.size} variant={b.variant} />
        </div>
      ))}
    </div>
  );
}
