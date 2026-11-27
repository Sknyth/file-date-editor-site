import "server-only";
import { cache } from "react";
import { buildRules, product } from "@/config/product";
import type { Build, Release, ReleaseAsset, ReleaseResult } from "@/types/releases";

const interval = 900;
const api = "https://api.github.com";
const github = "https://github.com";
let retryAfter = 0;

class ReleaseRequestError extends Error {
  constructor(readonly state: "empty" | "unavailable" | "rateLimited") {
    super(state);
  }
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

function officialUrl(value: unknown, isAsset = false): string | undefined {
  if (typeof value !== "string" || !product.repository) return;
  try {
    const url = new URL(value);
    const base = `/${product.repository.owner}/${product.repository.repo}/releases/`;
    const prefix = base + (isAsset ? "download/" : "tag/");
    if (url.origin === github && !url.username && !url.password && url.pathname.toLowerCase().startsWith(prefix.toLowerCase())
      && url.pathname.length > prefix.length) {
      return url.href;
    }
  } catch {
    return;
  }
}

function readAsset(input: unknown): ReleaseAsset | undefined {
  const raw = record(input);
  const url = officialUrl(raw?.browser_download_url, true);
  if (!raw || typeof raw.name !== "string" || !url || raw.state !== "uploaded"
    || typeof raw.size !== "number" || !Number.isSafeInteger(raw.size) || raw.size <= 0
    || typeof raw.download_count !== "number" || !Number.isSafeInteger(raw.download_count) || raw.download_count < 0) return;
  const sha256 = typeof raw.digest === "string" && /^sha256:[a-f\d]{64}$/i.test(raw.digest)
    ? raw.digest.slice(7).toLowerCase() : undefined;
  return { name: raw.name, url, bytes: raw.size, downloads: raw.download_count, sha256 };
}

function mapBuild(asset: ReleaseAsset): Build | undefined {
  const rule = buildRules.find(({ pattern }) => {
    const regex = pattern.split("*").map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*");
    return new RegExp(`^${regex}$`, "i").test(asset.name);
  });
  if (rule) return { ...asset, platform: rule.platform, architecture: rule.architecture, format: rule.format, minimum: rule.minimum };
}

function readRelease(input: unknown): Release | undefined {
  const raw = record(input);
  if (!raw || raw.draft !== false || raw.prerelease !== false || typeof raw.tag_name !== "string"
    || !raw.tag_name.trim() || typeof raw.published_at !== "string" || !Number.isFinite(Date.parse(raw.published_at))) return;
  const url = officialUrl(raw.html_url);
  if (!url) return;
  const assets = (Array.isArray(raw.assets) ? raw.assets : []).flatMap((input) => readAsset(input) ?? []);
  return {
    version: raw.tag_name,
    date: raw.published_at,
    notes: typeof raw.body === "string" ? raw.body : "",
    url,
    assets,
    builds: assets.flatMap((asset) => mapBuild(asset) ?? []),
  };
}

const newestFirst = (a: Release, b: Release) => Date.parse(b.date) - Date.parse(a.date);

function fallbackReleases() {
  if (!process.env.GITHUB_RELEASE_FALLBACK_JSON) return [];
  try {
    const items: unknown = JSON.parse(process.env.GITHUB_RELEASE_FALLBACK_JSON);
    return Array.isArray(items) ? items.flatMap((item) => readRelease(item) ?? []).sort(newestFirst) : [];
  } catch {
    console.warn("Invalid GITHUB_RELEASE_FALLBACK_JSON.");
    return [];
  }
}

async function request(path: string): Promise<{ data: unknown; more: boolean }> {
  if (Date.now() < retryAfter) throw new ReleaseRequestError("rateLimited");
  const repository = product.repository;
  if (!repository) throw new ReleaseRequestError("unavailable");
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "File-Date-Editor-Site",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(`${api}/repos/${repository.owner}/${repository.repo}${path}`, {
    headers,
    next: { revalidate: interval, tags: ["file-date-editor-releases"] },
    signal: AbortSignal.timeout(5500),
  });
  const forbidden = response.status === 403 ? record(await response.json().catch(() => null)) : null;
  const isRateLimited = response.status === 429 || response.status === 403 &&
    (response.headers.get("x-ratelimit-remaining") === "0" || response.headers.has("retry-after")
      || typeof forbidden?.message === "string" && /rate limit/i.test(forbidden.message));
  if (isRateLimited) {
    const retry = Number(response.headers.get("retry-after")) * 1000;
    const reset = Number(response.headers.get("x-ratelimit-reset")) * 1000 - Date.now();
    retryAfter = Date.now() + Math.max(retry || reset || 60_000, 1000);
    throw new ReleaseRequestError("rateLimited");
  }
  if (response.status === 404 && path === "/releases/latest") {
    // The latest endpoint also returns 404 when the repository is inaccessible.
    await request("/releases?per_page=1");
    throw new ReleaseRequestError("empty");
  }
  if (!response.ok) throw new ReleaseRequestError("unavailable");
  return { data: await response.json(), more: /rel="next"/.test(response.headers.get("link") ?? "") };
}

const confirmPublicRepository = cache(async () => {
  if (!process.env.GITHUB_TOKEN) return;
  const repository = record((await request("")).data);
  if (repository?.private !== false) throw new ReleaseRequestError("unavailable");
});

function errorState(error: unknown) {
  return error instanceof ReleaseRequestError ? error.state : "unavailable";
}

export const getLatestRelease = cache(async (): Promise<ReleaseResult<Release>> => {
  if (!product.repository) return { status: "unconfigured" };
  try {
    await confirmPublicRepository();
    const release = readRelease((await request("/releases/latest")).data);
    return release ? { status: "ready", data: release } : { status: "empty" };
  } catch (error) {
    const state = errorState(error);
    const release = state !== "empty" ? fallbackReleases()[0] : undefined;
    return release ? { status: "ready", data: release, fallback: true } : { status: state };
  }
});

export const getReleaseHistory = cache(async (): Promise<ReleaseResult<Release[]>> => {
  if (!product.repository) return { status: "unconfigured" };
  try {
    await confirmPublicRepository();
    const releases: Release[] = [];
    let page = 1;
    let more: boolean;
    do {
      const response = await request(`/releases?per_page=100&page=${page}`);
      if (!Array.isArray(response.data)) throw new ReleaseRequestError("unavailable");
      releases.push(...response.data.flatMap((item) => readRelease(item) ?? []));
      more = response.more;
      page += 1;
    } while (more);
    return releases.length ? { status: "ready", data: releases.sort(newestFirst) } : { status: "empty" };
  } catch (error) {
    const fallback = fallbackReleases();
    return fallback.length ? { status: "ready", data: fallback, fallback: true } : { status: errorState(error) };
  }
});
