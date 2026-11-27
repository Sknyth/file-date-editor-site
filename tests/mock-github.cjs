const realFetch = globalThis.fetch;
const route = "https://api.github.com/repos/fde-test/fixture/releases";
const releasesUrl = "https://github.com/fde-test/fixture/releases";
const checksum = "a".repeat(64);

function asset(name, version, extra = {}) {
  return {
    name,
    browser_download_url: `${releasesUrl}/download/${version}/${encodeURIComponent(name)}`,
    size: 5_250_000,
    download_count: 24,
    digest: `sha256:${checksum}`,
    state: "uploaded",
    ...extra,
  };
}

function release(version, date, assets = [], extra = {}) {
  return {
    tag_name: version,
    published_at: date,
    html_url: `${releasesUrl}/tag/${version}`,
    draft: false,
    prerelease: false,
    assets,
    ...extra,
  };
}

const latest = release("v99.2.0", "2025-06-06T12:00:00Z", [
  asset("File Date Editor.dmg", "v99.2.0"),
  asset("FileDateEditor-windows-x64-setup.exe", "v99.2.0"),
  asset("FileDateEditor-windows-arm64-portable.zip", "v99.2.0", { digest: null }),
  asset("FileDateEditor-darwin-x64.zip", "v99.2.0"),
  asset("Foreign-linux-x64.exe", "v99.2.0", { browser_download_url: "https://example.com/unverified.exe" }),
], {
  body: [
    "## New Features",
    "- Batch timestamp editing",
    "## Improvements",
    "- Better date validation",
    "## Bug Fixes",
    "- Clearer time zone handling",
    "## Release Notes",
    "See the [release information](https://example.com/notes).",
    "[Unsafe address](javascript:alert%281%29)",
    '<img src="https://example.com/tracking.png">',
  ].join("\n"),
});
const prerelease = release("v99.3.0-beta", "2025-06-10T12:00:00Z", [], { prerelease: true });
const draft = release("v100.0.0-draft", "2025-06-11T12:00:00Z", [], { draft: true });
const older = release("v99.1.0", "2025-04-05T12:00:00Z");

globalThis.fetch = function fetchWithFixture(input, init) {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input?.url;
  if (url === `${route}/latest`) return Promise.resolve(Response.json(latest));
  if (url === `${route}?per_page=100&page=1`) {
    return Promise.resolve(Response.json([prerelease, latest, draft], { headers: { Link: `<${route}?per_page=100&page=2>; rel="next"` } }));
  }
  if (url === `${route}?per_page=100&page=2`) return Promise.resolve(Response.json([older]));
  if (url?.startsWith("https://api.github.com/")) return Promise.resolve(new Response(null, { status: 404 }));
  return realFetch(input, init);
};
