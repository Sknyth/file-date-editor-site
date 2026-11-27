import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getMessages, isLocale } from "@/lib/i18n";

export async function GET(_request: Request, { params }: RouteContext<"/[locale]/opengraph-image">) {
  const { locale } = await params;
  if (!isLocale(locale)) return new Response(null, { status: 404 });
  const { hero } = getMessages(locale);
  const icon = await readFile(join(process.cwd(), "public/app-icon.png"));
  return new ImageResponse(
    <div style={{ background: "#edf3ff", color: "#111a2e", width: "100%", height: "100%", display: "flex", padding: "80px 94px", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 17, fontSize: 27, fontWeight: 600 }}>
        <img src={`data:image/png;base64,${icon.toString("base64")}`} alt="" width={73} height={73} />File Date Editor
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 39, fontSize: 79, fontWeight: 700, letterSpacing: "-4px", lineHeight: 1.06 }}>
        <span>{hero.headline[0]}</span><span style={{ color: "#2459dd" }}>{hero.headline[1]}</span>
      </div>
      <div style={{ display: "flex", color: "#485775", marginTop: 34, fontSize: 28 }}>{hero.macReady}</div>
    </div>,
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400" } },
  );
}
