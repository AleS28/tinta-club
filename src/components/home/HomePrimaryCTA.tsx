import { isLaunchMode } from "@/lib/launch";
import { LaunchReaderCTA } from "@/components/home/LaunchReaderCTA";
import { SubscriptionCTA } from "@/components/home/SubscriptionCTA";

export function HomePrimaryCTA() {
  if (isLaunchMode()) {
    return <LaunchReaderCTA />;
  }

  return <SubscriptionCTA />;
}
