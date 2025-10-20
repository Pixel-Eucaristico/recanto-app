'use client';

import HeroCommunityFeedback from "./components/HeroCommunityFeedback";
import HeroMissionOverview from "./components/HeroMissionOverview";
import PublicEvents from "@/components/blocks/public-events";

export const MainPage = () => {
  return (
    <div>
      <HeroMissionOverview />
      <PublicEvents />
      <HeroCommunityFeedback />
    </div>
  );
};