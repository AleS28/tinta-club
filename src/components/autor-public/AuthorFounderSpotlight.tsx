import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { authorProfiles } from "@/data/author-profiles";

export function AuthorFounderSpotlight() {
  const founders = authorProfiles.filter((profile) => profile.badge.includes("Fundador"));

  if (founders.length === 0) return null;

  return (
    <section className="space-y-4">
      {founders.map((profile) => (
        <div
          key={profile.slug}
          className="overflow-hidden rounded-2xl border border-amber-900/10 bg-white shadow-editorial"
        >
          <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-8 sm:p-8">
            <div className="mx-auto shrink-0 sm:mx-0">
              <div className="rounded-full p-1 ring-2 ring-[#D27C5A] ring-offset-2 ring-offset-white">
                {profile.photoUrl ? (
                  <Image
                    src={profile.photoUrl}
                    alt={profile.name}
                    width={88}
                    height={88}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ backgroundColor: profile.featuredWork.coverAccent }}
                  >
                    {profile.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="text-center sm:text-left">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#D27C5A]/10 px-3 py-1 text-xs font-semibold text-[#D27C5A]">
                <Sparkles className="h-3.5 w-3.5" />
                {profile.badge}
              </span>
              <h2 className="mt-3 font-serif text-xl font-bold text-ink sm:text-2xl">{profile.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-2 sm:line-clamp-none">
                {profile.bio}
              </p>
              <p className="mt-2 text-sm font-medium text-imperial-deep">
                Obra destacada: {profile.featuredWork.title}
              </p>
            </div>

            <Link
              href={`/autor/${profile.slug}`}
              className="inline-flex items-center justify-center gap-2 self-center rounded-full bg-[#D27C5A] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-105 hover:bg-[#c06a48] sm:shrink-0"
            >
              Ver perfil
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}
