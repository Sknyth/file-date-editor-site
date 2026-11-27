import { Laptop } from "lucide-react";
import type { Platform } from "@/types/releases";

export function PlatformIcon({ platform, size = 20 }: { platform: Platform; size?: number }) {
  if (platform === "mac") return <Laptop size={size} aria-hidden="true" />;
  return <span className="windows-mark" style={{ width: size - 3, height: size - 3 }} aria-hidden="true"><i /><i /><i /><i /></span>;
}
