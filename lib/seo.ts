import "server-only";
import type { Metadata } from "next";
import { product } from "@/config/product";
import { getMessages, href, locales, ogLocales, type Locale, type Page } from "./i18n";
import type { Release } from "@/types/releases";

export function origin() {
  try {
    const url = new URL(product.siteUrl ?? "http://localhost:3000");
    if (url.protocol === "https:" || url.protocol === "http:" && url.hostname === "localhost") return url.origin;
  } catch {
    // A malformed deployment origin falls back to the development origin.
  }
  return "http://localhost:3000";
}

export function alternates(page: Page) {
  return {
    ...Object.fromEntries(locales.map((locale) => [locale, new URL(href(locale, page), origin()).href])),
    "x-default": new URL(href("en", page), origin()).href,
  };
}

export function pageMetadata(locale: Locale, page: Page): Metadata {
  const { seo } = getMessages(locale);
  const key = page || "home";
  const title = seo[`${key}Title`];
  const description = seo[`${key}Description`];
  const url = href(locale, page);
  const image = locale === "en" ? "/opengraph-image" : `/${locale}/opengraph-image`;
  return {
    metadataBase: new URL(origin()),
    title,
    description,
    alternates: { canonical: url, languages: alternates(page) },
    openGraph: {
      type: "website", title, description, url, siteName: product.name, locale: ogLocales[locale],
      alternateLocale: locales.filter((code) => code !== locale).map((code) => ogLocales[code]),
      images: [{ url: image, width: 1200, height: 630, alt: product.name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    icons: { icon: "/favicon.png", apple: "/app-icon.png" },
  };
}

export function applicationSchema(locale: Locale, release?: Release) {
  const platforms = new Set(release?.builds.map((build) => build.platform === "mac" ? "macOS" : "Windows"));
  platforms.add("macOS");
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: getMessages(locale).seo.homeDescription,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: [...platforms].join(", "),
    softwareRequirements: product.platforms.mac.minimum,
    softwareVersion: release?.version,
    datePublished: release?.date,
    inLanguage: locale,
    url: new URL(href(locale), origin()).href,
    image: new URL("/app-icon.png", origin()).href,
    downloadUrl: release?.builds.length ? new URL(href(locale, "download"), origin()).href : undefined,
  }).replace(/</g, "\\u003c");
}
