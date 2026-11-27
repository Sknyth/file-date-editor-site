import { Plus } from "lucide-react";
import type { Messages } from "@/lib/i18n";
import { Reveal } from "../ui/reveal";

const links: Record<number, string> = {
  8: "https://learn.microsoft.com/en-us/windows/win32/sysinfo/file-times",
  9: "https://learn.microsoft.com/windows/apps/package-and-deploy/smartscreen-reputation",
  10: "https://support.apple.com/en-us/102445",
};

export function FAQ({ copy }: { copy: Messages["faq"] }) {
  return (
    <section className="section faq-section" id="faq" aria-labelledby="faq-heading">
      <div className="container faq-grid">
        <Reveal className="section-head">
          <div className="eyebrow"><span className="blue-dot" />{copy.eyebrow}</div>
          <h2 id="faq-heading">{copy.title}</h2><p>{copy.intro}</p>
        </Reveal>
        <div className="faq-list">
          {copy.items.map(({ question, answer, source }, index) => <details key={question}>
            <summary><span>{question}</span><Plus size={19} aria-hidden="true" /></summary>
            <div><p>{answer}</p>{source && links[index] && <a href={links[index]}>{source}</a>}</div>
          </details>)}
        </div>
      </div>
    </section>
  );
}
