import "@fontsource-variable/inter";
import "@fontsource-variable/manrope";
import "../globals.css";
import { notFound } from "next/navigation";
import { Theme } from "@/components/ui/theme";
import { isLocale, locales } from "@/lib/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body><Theme>{children}</Theme></body>
    </html>
  );
}
