import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CalendarDays, Download, GitBranch, Info, ShieldCheck } from "lucide-react";
import { product } from "@/config/product";
import { formatDate, formatSize, type Locale, type Messages } from "@/lib/i18n";
import { getLatestRelease, getReleaseHistory } from "@/lib/releases";
import type { Build, Platform, Release } from "@/types/releases";
import { PageIntro } from "../ui/page-intro";
import { PlatformBuilds } from "./builds";

const platforms: Platform[] = ["mac", "windows"];

function architectureNames(platform: Platform, copy: Messages["download"]) {
  return platform === "mac"
    ? { x64: copy.intel, arm64: copy.apple, universal: copy.universal }
    : { x64: "x64", arm64: "ARM64", universal: copy.universal };
}

function BuildCard({ build, release, locale, copy }: { build: Build; release: Release; locale: Locale; copy: Messages }) {
  const labels = copy.download;
  const arch = architectureNames(build.platform, labels)[build.architecture];
  return (
    <article className="build-card">
      <div className="build-title">
        <div><h3>{arch} · {labels[build.format]}</h3><p>{release.version} · {build.name}</p></div>
        <a href={build.url} className="button button-primary button-small" aria-label={`${copy.nav.download} ${build.name}`}><Download size={15} aria-hidden="true" />{copy.nav.download}</a>
      </div>
      <dl>
        <div><dt>{labels.minimum}</dt><dd>{build.minimum || labels.requirementsUnknown}</dd></div>
        <div><dt>{labels.date}</dt><dd><time dateTime={release.date}>{formatDate(release.date, locale)}</time></dd></div>
        <div><dt>{labels.size}</dt><dd>{formatSize(build.bytes, locale)}</dd></div>
        <div><dt>{labels.count}</dt><dd>{new Intl.NumberFormat(locale).format(build.downloads)}</dd></div>
      </dl>
      {build.sha256 && <details className="checksum"><summary>{labels.checksum}</summary><code>{build.sha256}</code></details>}
    </article>
  );
}

function ReleaseNotice({ text, link, label }: { text: string; link?: string; label?: string }) {
  return <div className="release-notice"><Info size={20} aria-hidden="true" /><div><p>{text}</p>{link && label && <a href={link}>{label}</a>}</div></div>;
}

export async function Downloads({ locale, copy }: { locale: Locale; copy: Messages }) {
  const release = await getLatestRelease();
  const status = release.status !== "ready" ? copy.releases[release.status] : release.fallback ? copy.releases.fallback : null;
  const latest = release.data;
  return (
    <>
      <PageIntro {...copy.download} />
      <div className="container inner-page downloads-page">
        {status && <ReleaseNotice text={status} link={product.repository?.url && `${product.repository.url}/releases`} label={copy.download.releasePage} />}
        <p className="platform-guide">{copy.download.device}</p>
        <div className="platform-grid">
          {platforms.map((platform) => (
            <PlatformBuilds key={platform} platform={platform} copy={copy.download} architectures={architectureNames(platform, copy.download)}>
              {latest?.builds.filter((build) => build.platform === platform).map((build) => ({
                arch: build.architecture, url: build.url, card: <BuildCard build={build} release={latest} locale={locale} copy={copy} />,
              })) ?? []}
            </PlatformBuilds>
          ))}
        </div>
        <aside className="security-panel">
          <div className="tile-icon"><ShieldCheck size={21} aria-hidden="true" /></div>
          <div><h2>{copy.download.verifyTitle}</h2><p>{copy.download.verifyBody}</p>
            {latest && <a href={latest.url}>{copy.download.releasePage}</a>}</div>
        </aside>
      </div>
    </>
  );
}

type Section = "new" | "improvements" | "fixes" | "notes";

const headingGroups: Record<Exclude<Section, "notes">, RegExp> = {
  new: /\b(features?|added|additions?|enhancements?)\b|новые функц|возможност|функții noi|adăugări/i,
  improvements: /\b(improved|improvements?|changes?|updated|changed)\b|улучшени|изменени|îmbunătățiri|schimbări/i,
  fixes: /\b(fix(?:es|ed)?|bug(?:s)?|resolved)\b|исправлен|ошибк|remedier|corecți/i,
};

function groupNotes(markdown: string) {
  const sections: Record<Section, string[]> = { new: [], improvements: [], fixes: [], notes: [] };
  let section: Section = "notes";
  let fence: { marker: string; length: number } | undefined;
  for (const line of markdown.split(/\r?\n/)) {
    const code = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (code && !fence) {
      fence = { marker: code[1][0], length: code[1].length };
    } else if (code && fence && code[1][0] === fence.marker && code[1].length >= fence.length && !code[2].trim()) {
      fence = undefined;
    } else if (!fence) {
      const heading = /^\s{0,3}#{1,6}\s+(.+)$/.exec(line);
      if (heading) {
        const groups = Object.entries(headingGroups) as [Exclude<Section, "notes">, RegExp][];
        const match = groups.find(([, pattern]) => pattern.test(heading[1]));
        section = match?.[0] ?? "notes";
        if (match) {
          sections[section].push("");
          continue;
        }
      }
    }
    sections[section].push(line);
  }
  return sections;
}

function ReleaseNotes({ notes, copy }: { notes: string; copy: Messages["changelog"] }) {
  const groups = groupNotes(notes);
  const sections = (["new", "improvements", "fixes", "notes"] as const).filter((section) => groups[section].join("\n").trim());
  if (!sections.length) return <p>{copy.noNotes}</p>;
  return sections.map((section) => <section key={section} className="release-markdown">
    <h3>{copy[section]}</h3>
    <ReactMarkdown
      skipHtml
      remarkPlugins={[remarkGfm]}
      disallowedElements={["img", "input"]}
      urlTransform={(url) => {
        try {
          return new URL(url).protocol === "https:" ? url : "";
        } catch {
          return "";
        }
      }}
      components={{
        h1: "h4", h2: "h4", h3: "h4", h4: "h4", h5: "h5", h6: "h6",
        a: ({ href, children }) => href ? <a href={href} rel="nofollow noreferrer">{children}</a> : <span>{children}</span>,
      }}
    >{groups[section].join("\n")}</ReactMarkdown>
  </section>);
}

export async function Changelog({ locale, copy }: { locale: Locale; copy: Messages }) {
  const history = await getReleaseHistory();
  const status = history.status !== "ready" ? copy.releases[history.status] : history.fallback ? copy.releases.fallback : null;
  return (
    <>
      <PageIntro {...copy.changelog} />
      <div className="container inner-page changelog-page">
        {status && <ReleaseNotice text={status} link={product.repository?.url && `${product.repository.url}/releases`} label={copy.download.releasePage} />}
        {history.data?.map((release) => (
          <article className="release-entry" key={release.url}>
            <div className="release-heading">
              <span className="tile-icon"><GitBranch size={20} aria-hidden="true" /></span>
              <div><h2>{release.version}</h2><span><CalendarDays size={15} aria-hidden="true" /><time dateTime={release.date}>{formatDate(release.date, locale)}</time></span></div>
            </div>
            <ReleaseNotes notes={release.notes} copy={copy.changelog} />
            <section className="changelog-assets">
              <h3>{copy.changelog.builds}</h3>
              {release.builds.length ? (
                <ul>{release.builds.map((build) => <li key={build.url}><a href={build.url}><Download size={15} aria-hidden="true" />{build.name}</a><span>{formatSize(build.bytes, locale)}</span></li>)}</ul>
              ) : <p>{copy.changelog.noBuilds}</p>}
              <a href={release.url}>{copy.download.releasePage}</a>
            </section>
          </article>
        ))}
      </div>
    </>
  );
}
