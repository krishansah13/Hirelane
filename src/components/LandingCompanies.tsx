import CompanyLogo from "./CompanyLogo";

type LandingCompany = {
    name: string;
    slug: string;
    logoURL?: string;
};

export default function LandingCompanies({
    companies,
}: {
    companies: LandingCompany[];
}) {
    if (companies.length === 0) {
        return null;
    }

    return (
        <section
            id="companies"
            className="scroll-mt-20 border-b border-[#eeeaf8] bg-[#f7f5ff]"
        >
            <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
                <p className="text-center text-xs font-medium uppercase tracking-wide text-gray-400">
                    Teams hiring on Hirelane
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
                    {companies.map((company) => (
                        <div
                            key={company.slug}
                            className="flex items-center gap-2.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-[#dcd8ea]/80"
                        >
                            <CompanyLogo
                                name={company.name}
                                slug={company.slug}
                                src={company.logoURL}
                                size="sm"
                            />
                            <span className="text-sm font-medium text-gray-800">
                                {company.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
