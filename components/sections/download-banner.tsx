import { Download } from "lucide-react";
import Image from "next/image";
import { href, type Locale, type Messages } from "@/lib/i18n";
import { ButtonLink } from "../ui/button";

export function DownloadBanner({ locale, copy }: { locale: Locale; copy: Messages }) {
  return (
    <section className="container download-banner-wrap">
      <div className="download-banner">
        <div className="banner-copy">
          <Image src="/app-icon.png" alt="" width={75} height={75} />
          <div><h2>{copy.footer.cta}</h2><p>{copy.footer.ctaDescription}</p></div>
        </div>
        <ButtonLink href={href(locale, "download")}><Download size={18} aria-hidden="true" />{copy.nav.downloads}</ButtonLink>
      </div>
    </section>
  );
}
