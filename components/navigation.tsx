"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown, Languages, Menu, X } from "lucide-react";

function closeWithEscape(event: KeyboardEvent<HTMLDetailsElement>) {
  if (event.key !== "Escape" || !event.currentTarget.open) return;
  event.stopPropagation();
  event.currentTarget.open = false;
  event.currentTarget.querySelector("summary")?.focus();
}

export function LanguageMenu({ current, label, links }: {
  current: string;
  label: string;
  links: { url: string; code: string; name: string }[];
}) {
  const menu = useRef<HTMLDetailsElement>(null);

  return (
    <details ref={menu} className="language-menu" onKeyDown={closeWithEscape} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
    }}>
      <summary className="icon-button language-button" aria-label={label} title={label}>
        <Languages size={17} aria-hidden="true" /><span>{current.toUpperCase()}</span><ChevronDown size={12} aria-hidden="true" />
      </summary>
      <div className="language-popover">
        {links.map(({ url, code, name }) => (
          <a key={code} href={url} hrefLang={code} lang={code} aria-current={current === code ? "true" : undefined}
            onClick={(event) => {
              if (menu.current) menu.current.open = false;
              if (window.location.hash) event.currentTarget.hash = window.location.hash;
            }}>{name}</a>
        ))}
      </div>
    </details>
  );
}

export function MobileMenu({ label, close, children }: { label: string; close: string; children: ReactNode }) {
  const menu = useRef<HTMLDetailsElement>(null);
  return (
    <details className="mobile-menu" ref={menu} onKeyDown={closeWithEscape}>
      <summary className="icon-button" title={label}>
        <Menu size={20} className="mobile-open" aria-hidden="true" />
        <X size={20} className="mobile-close" aria-hidden="true" />
        <span className="sr-only mobile-open">{label}</span><span className="sr-only mobile-close">{close}</span>
      </summary>
      <div className="mobile-nav" onClick={(event) => {
        if (event.target instanceof Element && event.target.closest("a") && menu.current) menu.current.open = false;
      }}>{children}</div>
    </details>
  );
}
