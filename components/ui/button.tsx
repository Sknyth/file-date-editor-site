import Link from "next/link";
import type { ComponentProps } from "react";

export function ButtonLink({ className = "", variant = "primary", small, ...props }: ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary";
  small?: boolean;
}) {
  return <Link className={`button button-${variant} ${small ? "button-small" : ""} ${className}`} {...props} />;
}
