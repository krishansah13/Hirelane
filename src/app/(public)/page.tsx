import type { Metadata } from "next";
import LandingHero from "@/components/landing-pages/LandingHero";
import LandingCompanies from "@/components/landing-pages/LandingCompanies";
import LandingCategories from "@/components/landing-pages/LandingCategories";
import LandingFeatured from "@/components/landing-pages/LandingFeatured";
import LandingHowItWorks from "@/components/landing-pages/LandingHowItWorks";
import LandingEmployerCta from "@/components/landing-pages/LandingEmployerCta";
import { getLandingContent } from "@/lib/job-query";
import { Job } from "@/types/JobTypes";

export const metadata: Metadata = {
    title: "Hirelane | Find work that fits you",
    description:
        "Discover roles from companies hiring now, apply from one place, or post a job in minutes.",
};

export default async function Home() {
    const { jobs, stats, companies } = await getLandingContent();

    return (
        <main className="flex-1 bg-white">
            <LandingCompanies companies={companies} />
            <LandingCategories />
            <LandingFeatured jobs={jobs as Job[]} total={stats.openRoles} />
            <LandingHowItWorks />
            <LandingEmployerCta />
        </main>
    );
}
