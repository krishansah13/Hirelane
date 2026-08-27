import { revalidatePath, revalidateTag } from "next/cache";

export function revalidateJobBoard(slug?: string) {
  revalidateTag("jobs", "max");
  if (slug) {
    revalidateTag(`job:${slug}`, "max");
    // revalidatePath(`/jobs/${slug}`);
  }
  revalidatePath("/");
  revalidatePath("/jobs");
  revalidatePath("/sitemap.xml");
}
