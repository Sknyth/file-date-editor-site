import { CalendarDays, Check, CheckCircle2, FileText, Files, Upload } from "lucide-react";
import type { Messages } from "@/lib/i18n";
import { Reveal } from "../ui/reveal";
import { AppPreview } from "./app-preview";

function StepVisual({ index, label, dates }: { index: number; label: string; dates: string[] }) {
  if (index === 1) {
    return <div className="step-visual step-fields" aria-hidden="true">
      <strong>{label}</strong>
      {dates.map((date) => <span key={date}><span><Check size={12} /></span>{date}<CalendarDays size={14} /></span>)}
    </div>;
  }
  if (index === 2) {
    return <div className="step-visual step-done" aria-hidden="true">
      <div className="step-done-icon"><CheckCircle2 size={30} /></div><strong>{label}</strong>
      <span className="step-done-line" />
    </div>;
  }
  return <div className="step-visual step-drop" aria-hidden="true">
    <div><FileText size={23} /><Files size={23} /></div>
    <strong><Upload size={14} />{label}</strong>
  </div>;
}

export function HowItWorks({ copy, dates }: { copy: Messages["how"]; dates: string[] }) {
  return (
    <section className="section how-section" id="how-it-works" aria-labelledby="how-heading">
      <div className="container">
        <Reveal className="section-head">
          <div className="eyebrow"><span className="blue-dot" />{copy.eyebrow}</div>
          <h2 id="how-heading">{copy.title}</h2><p>{copy.intro}</p>
        </Reveal>
        <Reveal>
          <ol className="steps">
            {copy.steps.map(({ title, description, visual }, index) => <li key={title}>
              <StepVisual index={index} label={visual} dates={dates} />
              <span className="step-number" aria-hidden="true">{index + 1}</span>
              <h3>{title}</h3><p>{description}</p>
            </li>)}
          </ol>
        </Reveal>
        <AppPreview title={copy.preview} caption={copy.previewCaption} />
      </div>
    </section>
  );
}
