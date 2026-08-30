"use client";

import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";

function isInterceptedJobPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length === 2 && segments[0] === "jobs";
}

export default function PersistModalBackground({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const background = useRef<ReactNode>(children);
  const intercepted = isInterceptedJobPath(pathname);

  if (!intercepted) {
    background.current = children;
  }

  return <>{intercepted && background.current != null ? background.current : children}</>;
}
