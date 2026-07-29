import { Feather } from "lucide-react";

interface BrandLogoProps {
  size?: "sm" | "md";
  variant?: "default" | "light" | "navbar";
  className?: string;
}

export function BrandLogo({ size = "md", variant = "default", className = "" }: BrandLogoProps) {
  const iconSize = size === "sm" ? "h-5 w-5" : "h-7 w-7";
  const topLine = size === "sm" ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-[11px]";
  const mainLine = size === "sm" ? "text-base sm:text-lg" : "text-xl sm:text-2xl";

  const subtitleColor =
    variant === "navbar" ? "text-[#FCF9F5]/60" : variant === "light" ? "text-white/70" : "text-muted";
  const titleColor =
    variant === "navbar" ? "text-[#FCF9F5]" : variant === "light" ? "text-white" : "text-ink";
  const iconColor = variant === "light" ? "text-amber-200" : variant === "navbar" ? "text-white" : "text-terracotta";

  const iconBoxSize = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const iconInBoxSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      {variant === "navbar" ? (
        <span
          className={`flex ${iconBoxSize} shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#D27C5A] to-[#D4A359] shadow-md transition-transform duration-300 group-hover:scale-105`}
        >
          <Feather className={`${iconInBoxSize} text-white`} />
        </span>
      ) : (
        <Feather className={`${iconSize} shrink-0 ${iconColor}`} />
      )}
      <span className="font-serif leading-none">
        <span className={`block font-normal uppercase tracking-[0.25em] ${subtitleColor} ${topLine}`}>
          El Imperio de la
        </span>
        <span className={`block -mt-0.5 font-bold tracking-tight ${titleColor} ${mainLine}`}>Tinta</span>
      </span>
    </span>
  );
}
