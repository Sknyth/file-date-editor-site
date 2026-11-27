export function PageIntro({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return <section className="page-intro">
    <div className="container">
      <div className="eyebrow"><span className="blue-dot" />{eyebrow}</div>
      <h1>{title}</h1><p>{intro}</p>
    </div>
  </section>;
}
