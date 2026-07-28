import type { LucideIcon } from "lucide-react";

interface LegalHighlightItem {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: "gold" | "terracotta" | "neutral";
}

interface LegalHighlightGridProps {
  items: LegalHighlightItem[];
}

const toneStyles = {
  gold: "border-[#D4A359]/30 bg-[#D4A359]/10",
  terracotta: "border-[#D27C5A]/30 bg-[#D27C5A]/10",
  neutral: "border-stone-200 bg-stone-50",
};

const iconToneStyles = {
  gold: "bg-[#D4A359]/20 text-[#8B6914]",
  terracotta: "bg-[#D27C5A]/20 text-[#D27C5A]",
  neutral: "bg-stone-200 text-[#2A1810]",
};

export function LegalHighlightGrid({ items }: LegalHighlightGridProps) {
  return (
    <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
      {items.map((item) => {
        const tone = item.tone ?? "neutral";
        return (
          <article
            key={item.title}
            className={`rounded-xl border p-5 shadow-sm ${toneStyles[tone]}`}
          >
            <div className={`inline-flex rounded-lg p-2 ${iconToneStyles[tone]}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-serif text-lg font-bold text-[#2A1810]">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#2A1810]/80">{item.description}</p>
          </article>
        );
      })}
    </div>
  );
}
