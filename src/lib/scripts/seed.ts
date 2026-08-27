import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";

import User from "../models/User";
import Company from "../models/Company";
import Job from "../models/Job";
import Application from "../models/Application";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined");
}

/* ---------------------------------- */
/* Types                              */
/* ---------------------------------- */

type CompanySeed = {
  name: string;
  slug: string;
  logoURL: string;
  website: string;
  about: string;
};

type EmployerSeed = {
  name: string;
  email: string;
  companySlug: string;
};

type JobType = "part-time" | "contract" | "full-time" | "internship";

type JobStatus = "draft" | "published" | "expired";

type ApplicationStage =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected";

/* ---------------------------------- */
/* Seed Data                          */
/* ---------------------------------- */

const companiesData: CompanySeed[] = [
  {
    name: "TechNova",
    slug: "technova",
    logoURL: "",
    website: "https://technova.example.com",
    about: "A technology company building modern software products.",
  },
  {
    name: "CloudPeak",
    slug: "cloudpeak",
    logoURL: "",
    website: "https://cloudpeak.example.com",
    about: "A cloud infrastructure and developer tooling company.",
  },
  {
    name: "Finora",
    slug: "finora",
    logoURL: "",
    website: "https://finora.example.com",
    about: "A fintech company building accessible financial products.",
  },
  {
    name: "HealthSync",
    slug: "healthsync",
    logoURL: "",
    website: "https://healthsync.example.com",
    about: "A digital healthcare technology company.",
  },
  {
    name: "PixelForge",
    slug: "pixelforge",
    logoURL: "",
    website: "https://pixelforge.example.com",
    about: "A design and creative technology studio.",
  },
  {
    name: "GreenGrid",
    slug: "greengrid",
    logoURL: "",
    website: "https://greengrid.example.com",
    about: "A technology company focused on sustainable infrastructure.",
  },
];

const employersData: EmployerSeed[] = [
  {
    name: "Rahul Sharma",
    email: "rahul@technova.com",
    companySlug: "technova",
  },
  {
    name: "Priya Menon",
    email: "priya@technova.com",
    companySlug: "technova",
  },
  {
    name: "Arjun Rao",
    email: "arjun@cloudpeak.com",
    companySlug: "cloudpeak",
  },
  {
    name: "Sarah Thomas",
    email: "sarah@finora.com",
    companySlug: "finora",
  },
  {
    name: "Neha Kapoor",
    email: "neha@finora.com",
    companySlug: "finora",
  },
  {
    name: "Michael Joseph",
    email: "michael@healthsync.com",
    companySlug: "healthsync",
  },
  {
    name: "Ananya Das",
    email: "ananya@pixelforge.com",
    companySlug: "pixelforge",
  },
  {
    name: "Vikram Singh",
    email: "vikram@greengrid.com",
    companySlug: "greengrid",
  },
];

const seekerNames: string[] = [
  "Aarav Patel",
  "Diya Nair",
  "Aditya Kumar",
  "Meera Iyer",
  "Rohan Gupta",
  "Ishita Shah",
  "Karan Verma",
  "Sneha Reddy",
  "Arjun Mehta",
  "Kavya Rao",
  "Nikhil Joshi",
  "Ananya Sharma",
  "Rahul Nair",
  "Pooja Menon",
  "Vivek Das",
  "Aisha Khan",
  "Siddharth Jain",
  "Riya Kapoor",
  "Manish Kumar",
  "Tanya Singh",
];

const jobTitles: string[] = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "React Developer",
  "Next.js Developer",
  "Node.js Developer",
  "Software Engineer",
  "Senior Software Engineer",
  "Product Designer",
  "UI/UX Designer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Data Analyst",
  "Data Engineer",
  "Product Manager",
  "QA Engineer",
  "Mobile Developer",
  "Machine Learning Engineer",
  "Technical Writer",
  "Engineering Intern",
];

const locations: string[] = [
  "Bengaluru",
  "Hyderabad",
  "Mumbai",
  "Pune",
  "Chennai",
  "Delhi",
  "Gurugram",
  "Noida",
];

const jobTypes: JobType[] = [
  "full-time",
  "part-time",
  "contract",
  "internship",
];

const stages: ApplicationStage[] = [
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
];

/* ---------------------------------- */
/* Helpers                            */
/* ---------------------------------- */

function randomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createSlug(title: string, companySlug: string, index: number) {
  const base = `${title}-${companySlug}`;

  return `${base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}-${index}`;
}

const skillsByTitle: Record<string, string[]> = {
  "Frontend Developer": ["React", "TypeScript", "CSS", "HTML", "JavaScript"],
  "Backend Developer": ["Node.js", "REST APIs", "MongoDB", "SQL"],
  "Full Stack Developer": ["React", "Node.js", "TypeScript", "MongoDB"],
  "React Developer": ["React", "JavaScript", "Redux", "CSS"],
  "Next.js Developer": ["Next.js", "React", "TypeScript", "Tailwind CSS"],
  "Node.js Developer": ["Node.js", "Express", "MongoDB", "REST APIs"],
  "Software Engineer": ["JavaScript", "Git", "Problem solving", "Testing"],
  "Senior Software Engineer": [
    "System design",
    "TypeScript",
    "Mentoring",
    "Cloud",
  ],
  "Product Designer": ["Figma", "User research", "Prototyping", "UI design"],
  "UI/UX Designer": ["Figma", "Wireframing", "Usability testing", "Design systems"],
  "DevOps Engineer": ["CI/CD", "Docker", "Kubernetes", "AWS"],
  "Cloud Engineer": ["AWS", "Terraform", "Linux", "Networking"],
  "Data Analyst": ["SQL", "Excel", "Tableau", "Python"],
  "Data Engineer": ["Python", "SQL", "ETL", "Spark"],
  "Product Manager": ["Roadmapping", "Stakeholder management", "Analytics"],
  "QA Engineer": ["Manual testing", "Automation", "Cypress", "Test planning"],
  "Mobile Developer": ["React Native", "TypeScript", "iOS", "Android"],
  "Machine Learning Engineer": ["Python", "PyTorch", "MLOps", "SQL"],
  "Technical Writer": ["Technical writing", "Markdown", "API docs", "Editing"],
  "Engineering Intern": ["JavaScript", "Git", "HTML", "CSS"],
};

function skillsForTitle(title: string): string[] {
  return skillsByTitle[title] ?? ["Communication", "Problem solving", "Git"];
}

function requirementsForTitle(title: string): string {
  return [
    `2+ years of relevant experience as a ${title}, or equivalent project work.`,
    "Bachelor's degree in a related field, or comparable practical experience.",
    "Clear written and verbal communication, and comfort collaborating in a team.",
    "Ability to take ownership of work and ship high-quality results on schedule.",
  ].join("\n");
}

/* ---------------------------------- */
/* Seed                               */
/* ---------------------------------- */

async function seed(): Promise<void> {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(MONGO_URI!);

    console.log("MongoDB connected.");

    /*
     * WARNING:
     * This removes all existing Hirelane data.
     */

    console.log("Clearing existing data...");

    await Application.deleteMany({});
    await Job.deleteMany({});
    await User.deleteMany({});
    await Company.deleteMany({});

    /* ------------------------------ */
    /* Companies                       */
    /* ------------------------------ */

    console.log("Creating companies...");
    await Application.syncIndexes();
    const companies = await Company.insertMany(companiesData);

    /*
     * Map:
     *
     * "technova" -> Company document
     * "cloudpeak" -> Company document
     * etc.
     */

    const companyMap = new Map(
      companies.map((company) => [company.slug, company]),
    );

    console.log(`Created ${companies.length} companies.`);

    /* ------------------------------ */
    /* Employers                       */
    /* ------------------------------ */

    console.log("Creating employers...");

    const employerPassword = await bcrypt.hash("Employer@123", 10);

    const employerDocuments = employersData.map((employer) => {
      const company = companyMap.get(employer.companySlug);

      if (!company) {
        throw new Error(`Company not found: ${employer.companySlug}`);
      }

      return {
        name: employer.name,
        email: employer.email,
        passwordHash: employerPassword,
        role: "employer" as const,

        // ObjectId reference to Company
        companyId: company._id,
      };
    });

    const employers = await User.insertMany(employerDocuments);

    console.log(`Created ${employers.length} employers.`);

    /* ------------------------------ */
    /* Seekers                         */
    /* ------------------------------ */

    console.log("Creating seekers...");

    const seekerPassword = await bcrypt.hash("Seeker@123", 10);

    const seekerDocuments = seekerNames.map((name, index) => ({
      name,
      email: `seeker${index + 1}@example.com`,
      passwordHash: seekerPassword,
      role: "seeker" as const,

      // Seekers do not belong to a company
      companyId: null,
    }));

    const seekers = await User.insertMany(seekerDocuments);

    console.log(`Created ${seekers.length} seekers.`);

    /* ------------------------------ */
    /* Jobs                            */
    /* ------------------------------ */

    console.log("Creating jobs...");

    const jobDocuments = [];

    for (let i = 0; i < 50; i++) {
      /*
       * Pick an employer.
       */
      const employer = randomItem(employers);

      /*
       * Find the company that belongs
       * to this employer.
       */
      const employerData = employersData.find(
        (item) => item.email === employer.email,
      );

      if (!employerData) {
        throw new Error(`Employer data not found for ${employer.email}`);
      }

      const company = companyMap.get(employerData.companySlug);

      if (!company) {
        throw new Error(`Company not found: ${employerData.companySlug}`);
      }

      const title = jobTitles[i % jobTitles.length];

      const location = randomItem(locations);

      const type = randomItem(jobTypes);

      const isRemote = Math.random() < 0.3;

      /*
       * Salary in INR.
       *
       * Example:
       * salaryMin = 600000
       * salaryMax = 1200000
       */
      const salaryMin = randomNumber(400000, 1200000);

      const salaryMax = salaryMin + randomNumber(200000, 700000);

      /*
       * First 40 jobs are published.
       * Next 7 are drafts.
       * Last 3 are expired.
       */
      let status: JobStatus;

      if (i < 40) {
        status = "published";
      } else if (i < 47) {
        status = "draft";
      } else {
        status = "expired";
      }

      const publishedAt =
        status === "published"
          ? new Date(Date.now() - randomNumber(1, 120) * 24 * 60 * 60 * 1000)
          : null;

      const expiresAt =
        status === "expired"
          ? new Date(Date.now() - randomNumber(1, 30) * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + randomNumber(30, 180) * 24 * 60 * 60 * 1000);

      jobDocuments.push({
        companyId: company._id,

        // The employer who created the job
        postedById: employer._id,

        title,

        slug: createSlug(title, company.slug, i + 1),

        description: `
We are looking for a talented ${title} to join ${company.name}.

You will work with a collaborative team to build high-quality products and solve interesting technical problems.

Responsibilities:
- Build and maintain production features
- Collaborate with designers and engineers
- Write clean and maintainable code
- Participate in code reviews
- Help improve engineering practices
        `.trim(),

        skills: skillsForTitle(title),

        requirements: requirementsForTitle(title),

        location,

        type,

        isRemote,

        salaryMin,

        salaryMax,

        status,

        publishedAt,

        expiresAt,
      });
    }

    const jobs = await Job.insertMany(jobDocuments);

    console.log(`Created ${jobs.length} jobs.`);

    /* ------------------------------ */
    /* Applications                    */
    /* ------------------------------ */

    console.log("Creating applications...");

    /*
     * Only published jobs should receive
     * applications.
     */
    const publishedJobs = jobs.filter((job) => job.status === "published");

    const applicationDocuments = [];
    const usedPairs = new Set<string>();

    function historyFor(
      stage: ApplicationStage,
      appliedAt: Date,
      stageChangedAt: Date,
    ) {
      if (stage === "applied") {
        return [{ stage: "applied" as const, changedAt: appliedAt }];
      }

      if (stage === "rejected") {
        return [
          { stage: "applied" as const, changedAt: appliedAt },
          { stage: "rejected" as const, changedAt: stageChangedAt },
        ];
      }

      const path: ApplicationStage[] = [
        "applied",
        "screening",
        "interview",
        "offer",
      ];
      const end = path.indexOf(stage);
      const steps = path.slice(0, end + 1);
      const span = Math.max(stageChangedAt.getTime() - appliedAt.getTime(), 1);

      return steps.map((step, index) => ({
        stage: step,
        changedAt:
          index === 0
            ? appliedAt
            : new Date(
                appliedAt.getTime() +
                  (span * index) / Math.max(steps.length - 1, 1),
              ),
      }));
    }

    let attempts = 0;
    while (applicationDocuments.length < 45 && attempts < 400) {
      attempts += 1;
      const seeker = randomItem(seekers);
      const job = randomItem(publishedJobs);
      const pairKey = `${job._id.toString()}:${seeker._id.toString()}`;

      if (usedPairs.has(pairKey)) {
        continue;
      }

      usedPairs.add(pairKey);

      const stage = randomItem(stages);
      const appliedAt = new Date(
        Date.now() - randomNumber(1, 60) * 24 * 60 * 60 * 1000,
      );
      const stageChangedAt = new Date(
        appliedAt.getTime() + randomNumber(0, 10) * 24 * 60 * 60 * 1000,
      );

      applicationDocuments.push({
        jobId: job._id,
        userId: seeker._id,
        resumeURL: "https://example.com/resumes/sample-resume.pdf",
        coverNote:
          "I am excited to apply for this position and believe my skills and experience make me a strong candidate.",
        stage,
        appliedAt,
        stageChangedAt,
        stageHistory: historyFor(stage, appliedAt, stageChangedAt),
      });
    }

    const applications = await Application.insertMany(applicationDocuments);

    console.log(`Created ${applications.length} applications.`);

    /* ------------------------------ */
    /* Summary                         */
    /* ------------------------------ */

    console.log("\n==============================");
    console.log("Hirelane seed completed!");
    console.log("==============================");

    console.log(`Companies: ${companies.length}`);
    console.log(`Employers: ${employers.length}`);
    console.log(`Seekers: ${seekers.length}`);
    console.log(`Jobs: ${jobs.length}`);
    console.log(`Applications: ${applications.length}`);

    console.log("\nTest accounts:");

    console.log("\nEmployer:");
    console.log("Email: rahul@technova.com");
    console.log("Password: Employer@123");

    console.log("\nSeeker:");
    console.log("Email: seeker1@example.com");
    console.log("Password: Seeker@123");

    console.log("\n==============================");

    await mongoose.disconnect();

    console.log("Disconnected from MongoDB.");
  } catch (error) {
    console.error("\nSeed failed:");

    console.error(error);

    await mongoose.disconnect();

    process.exit(1);
  }
}

seed();
