import FooterSection from "@/components/FooterSection";
import LandingHero from "@/components/landing-pages/LandingHero";
import { getLandingContent } from "@/lib/job-query";

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
      {children}
      {modal}
      <FooterSection />
    </>
  );
}
