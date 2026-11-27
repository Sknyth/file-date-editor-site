import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import type { Messages } from "@/lib/i18n";

const screenshot = "/screenshots/macos.webp";

export function AppPreview({ title, caption }: { title: Messages["how"]["preview"]; caption: string }) {
  if (!existsSync(join(process.cwd(), "public", screenshot))) return null;
  return (
    <figure className="app-preview">
      <h3>{title}</h3>
      <Image src={screenshot} alt={caption} width={1600} height={1029}
        sizes="(max-width: 768px) 95vw, 928px" loading="lazy" />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
