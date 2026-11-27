"use client";

import { Download } from "lucide-react";
import { usePlatform } from "@/hooks/use-platform";
import type { Platform } from "@/types/releases";
import { ButtonLink } from "../ui/button";

export function HeroDownload({ path, label, platforms }: { path: string; label: string; platforms: Platform[] }) {
  const platform = usePlatform();
  const supported = platform && platforms.includes(platform);
  return <ButtonLink href={supported ? `${path}#${platform}` : path}><Download size={18} aria-hidden="true" />{label}</ButtonLink>;
}
