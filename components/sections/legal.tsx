import type { Messages } from "@/lib/i18n";
import { PageIntro } from "../ui/page-intro";

const githubPrivacy = "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement";

export function Legal({ copy, page }: { copy: Messages; page: "privacy" | "terms" }) {
  const content = copy[page];
  return (
    <>
      <PageIntro {...content} />
      <div className="container inner-page legal-page">
        {content.sections.map(({ title, description }) => <section key={title}><h2>{title}</h2><p>{description}</p></section>)}
        {page === "privacy" && <a href={githubPrivacy}>{copy.privacy.githubPrivacy}</a>}
      </div>
    </>
  );
}
