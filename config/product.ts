import "server-only";
import type { BuildRule, Platform } from "@/types/releases";

const owner = process.env.GITHUB_REPOSITORY_OWNER?.trim() ?? "";
const repo = process.env.GITHUB_REPOSITORY_NAME?.trim() ?? "";
const validRepository = /^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(owner)
  && /^[a-z\d_.-]+$/i.test(repo) && repo !== "." && repo !== "..";

export const product = {
  name: "File Date Editor",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
  repository: validRepository ? { owner, repo, url: `https://github.com/${owner}/${repo}` } : null,
  platforms: {
    mac: { name: "macOS", verified: true, minimum: "macOS 14" },
    windows: { name: "Windows", verified: false },
  } satisfies Record<Platform, { name: string; verified: boolean; minimum?: string }>,
  contact: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.PRODUCT_CONTACT_EMAIL ?? "")
    ? process.env.PRODUCT_CONTACT_EMAIL : undefined,
};

const defaults: BuildRule[] = [
  { platform: "mac", architecture: "universal", format: "dmg", pattern: "File Date Editor.dmg", minimum: "macOS 14" },
  ...["arm64", "aarch64", "apple-silicon"].map((arch): BuildRule => ({ platform: "mac", architecture: "arm64", format: "dmg", pattern: `*${arch}*.dmg`, minimum: "macOS 14" })),
  ...["x64", "x86_64", "intel"].map((arch): BuildRule => ({ platform: "mac", architecture: "x64", format: "dmg", pattern: `*${arch}*.dmg`, minimum: "macOS 14" })),
  { platform: "mac", architecture: "universal", format: "dmg", pattern: "*universal*.dmg", minimum: "macOS 14" },
  ...([["x64", "x64"], ["x86_64", "x64"], ["arm64", "arm64"]] as const).flatMap(([marker, architecture]): BuildRule[] => [
    { platform: "windows", architecture, format: "setup", pattern: `*${marker}*.exe` },
    { platform: "windows", architecture, format: "setup", pattern: `*${marker}*.msi` },
    ...["windows", "-win-", "_win_"].map((platformMarker): BuildRule => ({
      platform: "windows", architecture, format: "zip", pattern: `*${platformMarker}*${marker}*.zip`,
    })),
  ]),
];

function isRule(value: unknown): value is BuildRule {
  if (!value || typeof value !== "object") return false;
  const rule = value as Record<string, unknown>;
  return (rule.platform === "mac" || rule.platform === "windows")
    && (rule.architecture === "x64" || rule.architecture === "arm64" || rule.architecture === "universal")
    && (rule.format === "dmg" || rule.format === "setup" || rule.format === "zip")
    && typeof rule.pattern === "string" && rule.pattern.trim().length > 0
    && (rule.minimum === undefined || typeof rule.minimum === "string");
}

function customRules(): BuildRule[] {
  if (!process.env.RELEASE_ASSET_MAPPING) return [];
  try {
    const rules: unknown = JSON.parse(process.env.RELEASE_ASSET_MAPPING);
    if (Array.isArray(rules) && rules.every(isRule)) return rules;
  } catch {
    // Invalid optional configuration falls back to the built-in rules.
  }
  console.warn("Invalid RELEASE_ASSET_MAPPING. Using built-in release asset rules.");
  return [];
}

export const buildRules = [...customRules(), ...defaults];
