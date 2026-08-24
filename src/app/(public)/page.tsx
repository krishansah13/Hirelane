import type { Metadata } from "next";
import LandingHero from "@/components/Landing Pages/LandingHero";
import LandingCompanies from "@/components/Landing Pages/LandingCompanies";
import LandingCategories from "@/components/Landing Pages/LandingCategories";
import LandingFeatured from "@/components/Landing Pages/LandingFeatured";
import LandingHowItWorks from "@/components/Landing Pages/LandingHowItWorks";
import LandingEmployerCta from "@/components/Landing Pages/LandingEmployerCta";
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
            <LandingHero stats={stats} />
            <LandingCompanies companies={companies} />
            <LandingCategories />
            <LandingFeatured jobs={jobs as Job[]} total={stats.openRoles} />
            <LandingHowItWorks />
            <LandingEmployerCta />
        </main>
    );
}
