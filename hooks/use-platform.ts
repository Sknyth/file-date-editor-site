"use client";

import { useSyncExternalStore } from "react";
import type { Platform } from "@/types/releases";

const neverChanges = () => () => {};

function detectPlatform(): Platform | null {
  const browser = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = browser.userAgentData?.platform?.toLowerCase();
  const agent = browser.userAgent;
  if (platform === "windows" || /Windows NT/i.test(agent)) return "windows";
  if ((platform === "macos" || /Macintosh|Mac OS X/i.test(agent))
    && !/iPad|iPhone|Android/i.test(agent) && navigator.maxTouchPoints < 2) return "mac";
  return null;
}

export function usePlatform() {
  return useSyncExternalStore(neverChanges, detectPlatform, () => null);
}
