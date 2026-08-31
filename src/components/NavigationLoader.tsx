"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import RouteLoader from "@/components/RouteLoader";
import {
  getNavigationSnapshot,
  startNavigation,
  stopNavigation,
  subscribeNavigation,
} from "@/lib/navigation-progress";

const SHOW_DELAY_MS = 80;

function currentLocation() {
  return `${window.location.pathname}${window.location.search}`;
}

function isModifiedClick(event: MouseEvent) {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

function isInternalNavigation(anchor: HTMLAnchorElement) {
  if (anchor.hasAttribute("download")) return false;

  const target = anchor.getAttribute("target");
  if (target && target !== "_self") return false;

  if (anchor.protocol !== "http:" && anchor.protocol !== "https:") {
    return false;
  }

  if (anchor.origin !== window.location.origin) return false;

  return (
    anchor.pathname !== window.location.pathname ||
    anchor.search !== window.location.search
  );
}

export default function NavigationLoader() {
  const previousLocationRef = useRef<string | null>(null);
  const navigating = useSyncExternalStore(
    subscribeNavigation,
    getNavigationSnapshot,
    () => false,
  );
  const [visible, setVisible] = useState(navigating);

  useEffect(() => {
    previousLocationRef.current = currentLocation();
  }, []);

  useEffect(() => {
    if (!navigating) {
      setVisible(false);
      previousLocationRef.current = currentLocation();
      return;
    }

    const showId = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);

    const checkId = window.setInterval(() => {
      const location = currentLocation();
      if (previousLocationRef.current == null) {
        previousLocationRef.current = location;
        return;
      }
      if (location !== previousLocationRef.current) {
        previousLocationRef.current = location;
        stopNavigation();
      }
    }, 40);

    return () => {
      window.clearTimeout(showId);
      window.clearInterval(checkId);
    };
  }, [navigating]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (isModifiedClick(event)) return;

      const eventTarget = event.target;
      if (!(eventTarget instanceof Element)) return;

      const anchor = eventTarget.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalNavigation(anchor)) return;

      startNavigation(anchor.href);
    }

    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  if (!visible) return null;

  return <RouteLoader />;
}
