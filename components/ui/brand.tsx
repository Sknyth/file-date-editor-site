import Image from "next/image";
import Link from "next/link";
import { href, type Locale } from "@/lib/i18n";

export function Brand({ locale }: { locale: Locale }) {
  return (
    <Link href={href(locale)} className="brand">
      <Image src="/app-icon.png" alt="" width={37} height={37} />
      <span>File Date Editor</span>
    </Link>
  );
}
