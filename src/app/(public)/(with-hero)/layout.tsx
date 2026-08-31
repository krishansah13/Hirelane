import PersistModalBackground from "@/components/jobs/PersistModalBackground";
import LandingHero from "@/components/landing-pages/LandingHero";
import RouteLoader from "@/components/RouteLoader";
import { getLandingContent } from "@/lib/job-query";
import { Suspense } from "react";

export default async function PublicLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const { stats: landingStats } = await getLandingContent();
  return (
    <>
      <LandingHero stats={landingStats} />
      <PersistModalBackground>{children}</PersistModalBackground>
      <Suspense fallback={<RouteLoader label="Loading job" />}>
        {modal}
      </Suspense>
    </>
  );
}
