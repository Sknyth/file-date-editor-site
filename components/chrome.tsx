import Link from "next/link";
import { Download } from "lucide-react";
import { product } from "@/config/product";
import { href, localeNames, locales, type Locale, type Messages, type Page } from "@/lib/i18n";
import { LanguageMenu, MobileMenu } from "./navigation";
import { Brand } from "./ui/brand";
import { ButtonLink } from "./ui/button";
import { ThemeToggle } from "./ui/theme";

const productLinks = [
  ["features", "#features"], ["downloads", "download"], ["how", "#how-it-works"],
  ["faq", "#faq"], ["changelog", "changelog"],
] as const;

export function Chrome({ locale, messages: { nav, footer }, page, children }: {
  locale: Locale; messages: Messages; page: Page; children: React.ReactNode;
}) {
  const home = href(locale);
  const languageLinks = locales.map((code) => ({ code, name: localeNames[code], url: href(code, page) }));
  const navItems = productLinks.map(([label, path]) => (
    <Link key={label} href={path.startsWith("#") ? home + path : href(locale, path as Page)}
      aria-current={page && page === path ? "page" : undefined}>{nav[label]}</Link>
  ));
  return (
    <>
      <a href="#main-content" className="skip-link">{nav.skip}</a>
      <header className="site-header">
        <div className="container header-content">
          <Brand locale={locale} />
          <nav className="desktop-nav">{navItems}</nav>
          <div className="header-actions">
            <ThemeToggle label={nav.theme} />
            <LanguageMenu current={locale} label={nav.language} links={languageLinks} />
            <ButtonLink href={href(locale, "download")} className="header-download" small><Download size={15} aria-hidden="true" />{nav.download}</ButtonLink>
            <MobileMenu label={nav.menu} close={nav.close}>
              <nav>{navItems}</nav>
              <ButtonLink href={href(locale, "download")} small><Download size={15} aria-hidden="true" />{nav.download}</ButtonLink>
            </MobileMenu>
          </div>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="site-footer">
        <div className="container footer-main">
          <div className="footer-company"><Brand locale={locale} /><p>{footer.description}</p></div>
          <nav className="footer-links" aria-label={footer.product}>
            <h2>{footer.product}</h2>{navItems}
          </nav>
          <nav className="footer-links" aria-label={footer.resources}>
            <h2>{footer.resources}</h2>
            <Link href={href(locale, "privacy")}>{nav.privacy}</Link>
            <Link href={href(locale, "terms")}>{nav.terms}</Link>
            {product.repository && <a href={product.repository.url}>{nav.github}</a>}
            {product.contact && <a href={`mailto:${product.contact}`}>{nav.contact}</a>}
          </nav>
        </div>
        <div className="container footer-bottom">
          <p>© {new Date().getUTCFullYear()} {nav.copyright}</p>
          <LanguageMenu current={locale} label={nav.language} links={languageLinks} />
        </div>
      </footer>
    </>
  );
}
