import { SideCommunityNavLeft } from "@/components/layout/SideCommunityNavLeft";
import { SideSocialBannerRight } from "@/components/layout/SideSocialBannerRight";

interface SiteShellProps {
  children: React.ReactNode;
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="relative min-h-screen bg-literary-pattern">
      <SideCommunityNavLeft />
      <SideSocialBannerRight />

      <div className="relative mx-auto min-h-screen max-w-7xl bg-[#FCF9F5] shadow-2xl print:max-w-none print:shadow-none">
        {children}
      </div>
    </div>
  );
}
