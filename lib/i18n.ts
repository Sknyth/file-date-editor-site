import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import ro from "@/messages/ro.json";

export const locales = ["en", "ru", "ro"] as const;
export type Locale = typeof locales[number];
export type Messages = typeof en;
export const localeNames = { en: "English", ru: "Русский", ro: "Română" };
export const ogLocales = { en: "en_US", ru: "ru_RU", ro: "ro_RO" };
const dictionaries: Record<Locale, Messages> = { en, ru, ro };

export function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value);
}

export function getMessages(locale: Locale) {
  return dictionaries[locale];
}

export type Page = "" | "download" | "changelog" | "privacy" | "terms";
export const pages: Page[] = ["", "download", "changelog", "privacy", "terms"];

export function href(locale: Locale, page: Page = "") {
  const prefix = locale === "en" ? "" : `/${locale}`;
  return `${prefix}${page ? `/${page}` : ""}` || "/";
}

export function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(value));
}

export function formatSize(bytes: number, locale: Locale) {
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, style: "unit", unit: bytes >= 1_000_000 ? "megabyte" : "kilobyte", unitDisplay: "short" });
  return format.format(bytes / (bytes >= 1_000_000 ? 1_000_000 : 1_000));
}
