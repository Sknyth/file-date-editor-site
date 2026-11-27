"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { usePlatform } from "@/hooks/use-platform";
import type { Messages } from "@/lib/i18n";
import type { Architecture, Platform } from "@/types/releases";
import { PlatformIcon } from "../ui/platform-icon";

export function PlatformBuilds({ platform, architectures, children, copy }: {
  platform: Platform;
  architectures: Record<Architecture, string>;
  children: { arch: Architecture; url: string; card: ReactNode }[];
  copy: Messages["download"];
}) {
  const [filter, setFilter] = useState<Architecture | "all">("all");
  const detected = usePlatform();
  const visible = children.filter(({ arch }) => filter === "all" || arch === filter || platform === "mac" && arch === "universal");
  const options: Architecture[] = platform === "mac" ? ["arm64", "x64", "universal"] : ["x64", "arm64"];
  return (
    <section className="platform-card" id={platform}>
      <div className="platform-heading">
        <div className="platform-icon"><PlatformIcon platform={platform} size={27} /></div>
        <div><h2>{platform === "mac" ? "macOS" : "Windows"}</h2>
          <p>{platform === "mac" ? copy.macDescription : copy.windowsDescription}</p></div>
        {detected === platform && <span className="platform-detected">{copy.recommended}</span>}
      </div>
      <div className="platform-filter">
        <label htmlFor={`${platform}-architecture`}>{copy.selectArch}</label>
        <div className="select-wrap">
          <select id={`${platform}-architecture`} value={filter} onChange={(event) => setFilter(event.currentTarget.value as typeof filter)}>
            <option value="all">{copy.allArch}</option>
            {options.map((arch) => <option key={arch} value={arch}>{architectures[arch]}</option>)}
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </div>
      </div>
      <div className="build-results">
        {visible.length ? visible.map(({ url, card }) => <div key={url}>{card}</div>) : <p className="build-unavailable">{copy.unavailable}</p>}
      </div>
    </section>
  );
}
