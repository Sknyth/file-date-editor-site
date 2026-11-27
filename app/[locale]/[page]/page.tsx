import { notFound } from "next/navigation";
import { Chrome } from "@/components/chrome";
import { Legal } from "@/components/sections/legal";
import { Changelog, Downloads } from "@/components/sections/release-pages";
import { getMessages, isLocale, pages, type Page } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 900;
export const dynamicParams = false;

const innerPages = pages.filter((page): page is Exclude<Page, ""> => Boolean(page));

function isInnerPage(value: string): value is Exclude<Page, ""> {
  return innerPages.some((item) => item === value);
}

export function generateStaticParams() {
  return innerPages.map((page) => ({ page }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/[page]">) {
  const { locale, page } = await params;
  if (!isLocale(locale) || !isInnerPage(page)) notFound();
  return pageMetadata(locale, page);
}

export default async function InnerPage({ params }: PageProps<"/[locale]/[page]">) {
  const { locale, page } = await params;
  if (!isLocale(locale) || !isInnerPage(page)) notFound();
  const copy = getMessages(locale);
  return (
    <Chrome locale={locale} messages={copy} page={page}>
      {page === "download" && <Downloads locale={locale} copy={copy} />}
      {page === "changelog" && <Changelog locale={locale} copy={copy} />}
      {(page === "privacy" || page === "terms") && <Legal copy={copy} page={page} />}
    </Chrome>
  );
}
