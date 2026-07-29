"use client";

import { usePathname } from "next/navigation";
import { SideCommunityNavLeft } from "@/components/layout/SideCommunityNavLeft";
import { SideSocialBannerRight } from "@/components/layout/SideSocialBannerRight";

interface AppShellProps {
  children: React.ReactNode;
}

/** Rutas inmersivas sin envoltorio crema ni barras laterales. */
function isImmersiveRoute(pathname: string): boolean {
  return pathname.startsWith("/leer/");
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  if (isImmersiveRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen bg-[#1A100C] literary-pattern">
      <SideCommunityNavLeft />
      <SideSocialBannerRight />

      <div className="relative mx-auto min-h-screen w-full max-w-7xl bg-[#FCF9F5] shadow-2xl">
        {children}
      </div>
    </div>
  );
}
