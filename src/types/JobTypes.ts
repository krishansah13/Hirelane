export type JobSearchProps = {
  q?: string;
  location?: string;
  type?: string;
  remote?: string;
  sort?: string;
  page?: number;
};

export type JobCompany = {
  _id?: string;
  name: string;
  slug?: string;
  logo?: string;
  logoURL?: string;
  website?: string;
  about?: string;
};

export type Job = {
  _id: string | { toString(): string };
  title: string;
  slug: string;
  location: string;
  description: string;
  type?: string;
  isRemote?: boolean;
  skills?: string[];
  requirements?: string;
  salaryMin?: number;
  salaryMax?: number;
  status?: "draft" | "published" | "expired";
  publishedAt?: string | Date | null;
  expiresAt?: string | Date;
  joiningDate?: string | Date | null;
  createdAt?: string | Date;
  companyId: JobCompany;
};
