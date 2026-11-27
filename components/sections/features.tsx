import { CalendarDays, Check, Clock3, Cpu, FileStack, FileText, FileUp, History, Layers3, LockKeyhole, Moon, Pencil, RotateCcw, Shuffle, WifiOff } from "lucide-react";
import type { Messages } from "@/lib/i18n";
import { Reveal } from "../ui/reveal";

const icons = [CalendarDays, Pencil, Clock3, Layers3, Shuffle, RotateCcw, FileUp, History, Cpu, WifiOff, Moon, LockKeyhole];
const dates = ["2025-05-14", "2025-05-16", "2025-05-20"];

function FeatureVisual({ index, copy }: { index: number; copy: Messages["features"] }) {
  if (index < 3) {
    const Icon = icons[index];
    return <div className="feature-visual date-visual" aria-hidden="true">
      <span><Icon size={17} /></span><div><small>{copy.newValue}</small><strong>{dates[index]}</strong></div><Check className="feature-check" size={16} />
    </div>;
  }
  if (index === 3) {
    return <div className="feature-visual batch-visual" aria-hidden="true">
      <div><FileText size={16} /><FileText size={16} /><FileText size={16} /></div>
      <span><FileStack size={16} />{copy.selected}</span>
    </div>;
  }
  if (index === 4) {
    return <div className="feature-visual seconds-visual" aria-hidden="true">
      <span>14:15:<strong>00</strong></span><Shuffle size={16} /><span>14:15:<strong>37</strong></span>
    </div>;
  }
  return <div className="feature-visual restore-visual" aria-hidden="true">
    <RotateCcw size={16} /><span>{copy.restored}</span><Check className="feature-check" size={16} />
  </div>;
}

export function Features({ copy }: { copy: Messages["features"] }) {
  return (
    <section className="section features-section" id="features" aria-labelledby="feature-heading">
      <div className="container">
        <Reveal className="section-head">
          <div className="eyebrow"><span className="blue-dot" />{copy.eyebrow}</div>
          <h2 id="feature-heading">{copy.title}</h2>
          <p>{copy.intro}</p>
        </Reveal>
        <Reveal className="feature-grid">
          {copy.items.slice(0, 6).map(({ title, description }, index) => {
            const Icon = icons[index];
            return (
              <article className="feature-card" key={title}>
                <span className="tile-icon"><Icon size={20} aria-hidden="true" /></span>
                <h3>{title}</h3>
                <p>{description}</p>
                <FeatureVisual index={index} copy={copy} />
              </article>
            );
          })}
        </Reveal>
        <Reveal className="feature-list">
          {copy.items.slice(6).map(({ title, description }, index) => {
            const Icon = icons[index + 6];
            return <article key={title}><Icon size={19} aria-hidden="true" /><div><h3>{title}</h3><p>{description}</p></div></article>;
          })}
        </Reveal>
      </div>
    </section>
  );
}
