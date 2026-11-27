import type { MetadataRoute } from "next";
import { href, locales, pages } from "@/lib/i18n";
import { alternates, origin } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) => pages.map((page) => ({
    url: new URL(href(locale, page), origin()).href,
    alternates: { languages: alternates(page) },
  })));
}
