import { notFound } from "next/navigation";
import { Chrome } from "@/components/chrome";
import { DownloadBanner } from "@/components/sections/download-banner";
import { FAQ } from "@/components/sections/faq";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how";
import { getMessages, isLocale } from "@/lib/i18n";
import { getLatestRelease } from "@/lib/releases";
import { applicationSchema, pageMetadata } from "@/lib/seo";

export const revalidate = 900;

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return pageMetadata(locale, "");
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getMessages(locale);
  const latest = await getLatestRelease();
  return (
    <Chrome locale={locale} messages={copy} page="">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: applicationSchema(locale, latest.data) }} />
      <Hero copy={copy} locale={locale} latest={latest} />
      <Features copy={copy.features} />
      <HowItWorks copy={copy.how} dates={copy.demo.dates} />
      <FAQ copy={copy.faq} />
      <DownloadBanner copy={copy} locale={locale} />
    </Chrome>
  );
}
