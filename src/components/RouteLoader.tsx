"use client";

import Image from "next/image";

export default function RouteLoader({
  label = "Loading page",
}: {
  label?: string;
}) {
  return (
    <div
      className="navigation-overlay fixed inset-0 z-90 flex items-center justify-center overflow-hidden bg-white/55 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-[#eef0ff]"
      >
        <div className="navigation-progress-bar relative h-full w-full bg-linear-to-r from-[#8b9cf5] via-[#2E46BA] to-[#1739ad] shadow-[0_0_16px_rgba(46,70,186,0.55)]">
          <span className="navigation-progress-sheen absolute inset-y-0 left-0 w-24 bg-linear-to-r from-transparent via-white/80 to-transparent" />
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-10 h-56 w-56 rounded-full bg-[#2E46BA]/12 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 top-16 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl"
      />

      <div className="navigation-card relative flex w-[min(100%-2rem,20rem)] flex-col items-center rounded-3xl bg-white/85 px-8 py-9 text-center shadow-[0_18px_50px_rgba(76,61,130,0.14)] ring-1 ring-[#dcd8ea]/80 backdrop-blur-xl">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span
            aria-hidden
            className="navigation-halo absolute inset-1 rounded-full bg-[#2E46BA]/15"
          />
          <span
            aria-hidden
            className="navigation-orbit pointer-events-none absolute inset-0 rounded-full border-2 border-transparent border-t-[#2E46BA] border-r-[#2E46BA]/30"
          />
          <span
            aria-hidden
            className="navigation-orbit-slow pointer-events-none absolute -inset-1.5 rounded-full border border-dashed border-[#2E46BA]/25"
          />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef0ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <Image
              src="/images/hirelane_brand_mark.png"
              alt=""
              width={28}
              height={28}
            />
          </div>
        </div>

        <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
          Hirelane
        </p>
        <p className="mt-2 text-base font-semibold tracking-tight text-gray-950">
          Just a moment
        </p>
        <p className="mt-1.5 text-sm text-gray-500">
          Taking you to the next page
        </p>

        <div className="mt-5 flex items-center gap-1.5" aria-hidden>
          <span className="navigation-dot h-1.5 w-1.5 rounded-full bg-[#2E46BA]" />
          <span className="navigation-dot h-1.5 w-1.5 rounded-full bg-[#2E46BA]" />
          <span className="navigation-dot h-1.5 w-1.5 rounded-full bg-[#2E46BA]" />
        </div>
      </div>
    </div>
  );
}
