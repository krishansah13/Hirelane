type Listener = () => void;

let navigating = false;
let timeoutId: number | undefined;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

function isSameLocation(href: string) {
  if (typeof window === "undefined") return false;

  try {
    const next = new URL(href, window.location.href);
    return (
      next.origin === window.location.origin &&
      next.pathname === window.location.pathname &&
      next.search === window.location.search
    );
  } catch {
    return false;
  }
}

/** Call before `router.push` / `router.replace` so the global loader appears. */
export function startNavigation(href?: string) {
  if (href && isSameLocation(href)) return;

  navigating = true;

  if (typeof window !== "undefined") {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      stopNavigation();
    }, 12000);
  }

  notify();
}

export function stopNavigation() {
  if (typeof window !== "undefined") {
    window.clearTimeout(timeoutId);
  }

  if (!navigating) return;

  navigating = false;
  notify();
}

export function subscribeNavigation(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getNavigationSnapshot() {
  return navigating;
}
