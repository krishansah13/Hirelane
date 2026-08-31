"use client";

import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useTransition, type ComponentPropsWithoutRef } from "react";
import { startNavigation } from "@/lib/navigation-progress";

export default function QuerySearchForm({
  children,
  ...props
}: ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      const trimmed = String(value).trim();
      if (trimmed) params.set(key, trimmed);
    }

    const query = params.toString();
    const href = query ? `${pathname}?${query}` : pathname;

    startNavigation(href);
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  return (
    <form
      {...props}
      onSubmit={handleSubmit}
      aria-busy={isPending}
    >
      {children}
    </form>
  );
}
