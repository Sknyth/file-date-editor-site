"use client";

import { useState, type FormEvent } from "react";
import { CalendarDays, Check, Clock3, FileText, MousePointer2, RotateCcw, Shuffle } from "lucide-react";
import type { Locale, Messages } from "@/lib/i18n";

const originals = ["2025-05-14T09:30:00", "2025-05-16T14:15:00", "2025-05-20T11:00:00"];
const dateIcons = [CalendarDays, Clock3, CalendarDays];

function withRandomSecond(value: string) {
  const second = String(Math.floor(Math.random() * 60)).padStart(2, "0");
  return `${value.slice(0, 16)}:${second}`;
}

export function Demo({ locale, copy }: { locale: Locale; copy: Messages["demo"] }) {
  const [values, setValues] = useState(originals);
  const [applied, setApplied] = useState(originals);
  const [random, setRandom] = useState(false);
  const [status, setStatus] = useState<"applied" | "restored" | "invalid" | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (values.some((value) => !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(value)
      || !Number.isFinite(Date.parse(`${value}Z`)))) {
      setStatus("invalid");
      return;
    }
    const next = random ? values.map(withRandomSecond) : values.map((value) => value.length === 16 ? `${value}:00` : value);
    setApplied(next);
    setValues(next);
    setStatus("applied");
  }

  function reset() {
    setValues(originals);
    setApplied(originals);
    setRandom(false);
    setStatus("restored");
  }

  function display(value: string) {
    return new Intl.DateTimeFormat(locale, {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23", timeZone: "UTC",
    }).format(new Date(`${value}Z`));
  }

  return (
    <figure className="demo" id="demo" aria-label={copy.badge}>
      <div className="demo-window">
        <div className="demo-titlebar">
          <div className="window-dots" aria-hidden="true"><i /><i /><i /></div>
          <span>{copy.title}</span>
          <div className="demo-badge"><span />{copy.badge}</div>
        </div>
        <div className="demo-body">
          <div className="demo-file">
            <div className="file-mark"><FileText size={21} aria-hidden="true" /></div>
            <div><strong>{copy.file}</strong><span>{copy.sample}</span></div>
            <Clock3 className="file-clock" size={19} aria-hidden="true" />
          </div>
          <form onSubmit={handleSubmit} className="demo-form">
            <div className="demo-timestamps">
              <h2>{applied.some((value, index) => value !== originals[index]) ? copy.current : copy.original}</h2><h2>{copy.edit}</h2>
              {copy.dates.map((label, index) => {
                const Icon = dateIcons[index];
                return (
                  <div className="demo-row" key={label}>
                    <div className="demo-original">
                      <Icon size={15} aria-hidden="true" />
                      <div><label htmlFor={`demo-date-${index}`}>{label}</label>
                        <time dateTime={applied[index]} data-changed={applied[index] !== originals[index]}>{display(applied[index])}</time>
                      </div>
                    </div>
                    <input id={`demo-date-${index}`} type="datetime-local" step="1" min="1900-01-01T00:00" max="2099-12-31T23:59:59" required
                      value={values[index]} onChange={(event) => {
                        const next = event.currentTarget.value;
                        setValues((current) => current.map((value, i) => index === i ? next : value));
                        setStatus(null);
                      }} />
                  </div>
                );
              })}
            </div>
            <div className="demo-options">
              <span className="shuffle-mark"><Shuffle size={16} aria-hidden="true" /></span>
              <label htmlFor="random-seconds"><strong>{copy.random}</strong><span id="random-seconds-hint">{copy.randomHint}</span></label>
              <input type="checkbox" id="random-seconds" role="switch" aria-label={copy.random} aria-describedby="random-seconds-hint" className="switch" checked={random}
                onChange={(event) => setRandom(event.currentTarget.checked)} />
            </div>
            <div className="demo-actions">
              <button type="button" className="button button-small button-secondary" onClick={reset} aria-label={copy.restore}>
                <RotateCcw size={14} aria-hidden="true" />{copy.reset}
              </button>
              <button className="button button-small button-primary" type="submit"><Check size={16} aria-hidden="true" />{copy.apply}</button>
            </div>
          </form>
        </div>
      </div>
      <figcaption aria-live="polite" className={status ? "demo-status" : ""}>
        {status ? <Check size={15} aria-hidden="true" /> : <MousePointer2 size={14} aria-hidden="true" />}
        {status ? copy[status] : copy.note}
      </figcaption>
    </figure>
  );
}
