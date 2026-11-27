import { Download, LockKeyhole, UserRoundCheck, WifiOff } from "lucide-react";
import { href, type Locale, type Messages } from "@/lib/i18n";
import type { ReleaseResult, Release } from "@/types/releases";
import { ButtonLink } from "../ui/button";
import { PlatformIcon } from "../ui/platform-icon";
import { Demo } from "./demo";
import { HeroDownload } from "./hero-download";

const trustIcons = [WifiOff, UserRoundCheck, LockKeyhole];

export function Hero({ copy, locale, latest }: { copy: Messages; locale: Locale; latest: ReleaseResult<Release> }) {
  const { hero, nav, demo } = copy;
  const release = latest.data;
  const hasWindows = release?.builds.some((build) => build.platform === "windows");
  const trustLabels = hasWindows ? [...hero.trust.slice(0, 3), hero.crossPlatform] : hero.trust;
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow hero-eyebrow"><span className="blue-dot" />{hero.eyebrow}</div>
            <h1>{hero.headline[0]}<br /><span>{hero.headline[1]}</span></h1>
            <p>{hasWindows ? hero.crossDescription : hero.description}</p>
            <div className="hero-buttons">
              <HeroDownload path={href(locale, "download")} label={nav.download}
                platforms={release?.builds.map(({ platform }) => platform) ?? []} />
              <ButtonLink href="#features" variant="secondary">{hero.explore}</ButtonLink>
            </div>
            <div className="hero-meta">
              <span><PlatformIcon platform="mac" size={17} />{hero.macReady}</span>
              <span>
                {hasWindows && <PlatformIcon platform="windows" size={15} />}
                {hasWindows && <span>Windows</span>}
                {!hasWindows && <Download size={15} aria-hidden="true" />}
                {release ? <span>{hero.version} <strong>{release.version}</strong></span> : latest.status === "unconfigured" || latest.status === "empty" ? hero.pending : copy.releases[latest.status]}
              </span>
            </div>
          </div>
          <Demo copy={demo} locale={locale} />
        </div>
      </section>
      <div className="trust-bar">
        <ul className="container trust-list">
          {trustLabels.map((label, index) => {
            const Icon = trustIcons[index];
            return <li key={label}>{Icon ? <Icon size={18} aria-hidden="true" /> : <PlatformIcon platform={hasWindows ? "windows" : "mac"} size={19} />}{label}</li>;
          })}
        </ul>
      </div>
    </>
  );
}
