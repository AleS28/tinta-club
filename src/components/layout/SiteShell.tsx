import { SideCommunityNavLeft } from "@/components/layout/SideCommunityNavLeft";
import { SideSocialBannerRight } from "@/components/layout/SideSocialBannerRight";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

interface SiteShellProps {
  children: React.ReactNode;
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="relative min-h-screen bg-literary-pattern">
      <SideCommunityNavLeft />
      <SideSocialBannerRight />

      <div className="relative mx-auto min-h-screen max-w-7xl bg-[#FCF9F5] pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] shadow-2xl md:pb-0 print:max-w-none print:pb-0 print:shadow-none">
        {children}
      </div>

      <MobileBottomNav />
    </div>
  );
}
