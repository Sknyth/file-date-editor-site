export type Platform = "mac" | "windows";
export type Architecture = "x64" | "arm64" | "universal";
export type PackageFormat = "dmg" | "setup" | "zip";

export type BuildRule = {
  platform: Platform;
  architecture: Architecture;
  format: PackageFormat;
  pattern: string;
  minimum?: string;
};

export type ReleaseAsset = {
  name: string;
  url: string;
  bytes: number;
  downloads: number;
  sha256?: string;
};

export type Build = ReleaseAsset & Omit<BuildRule, "pattern">;

export type Release = {
  version: string;
  date: string;
  notes: string;
  url: string;
  assets: ReleaseAsset[];
  builds: Build[];
};

export type ReleaseResult<T> =
  | { status: "ready"; data: T; fallback?: boolean }
  | { status: "unconfigured" | "empty" | "unavailable" | "rateLimited"; data?: never };
