import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Container, type ContainerProps } from "../Container/Container";

export interface SiteShellLink {
  href: string;
  label: string;
}

export interface SiteShellProps {
  /** Start of the top bar: usually a link home with `BrandMark` and the product name. */
  brand: ReactNode;
  /** End of the top bar: a language `Select`, a sign-in button. */
  actions?: ReactNode;
  /** Footer links (privacy, terms). Needs `linksLabel`. */
  links?: SiteShellLink[];
  /** Accessible name of the footer nav, translated ("Legal"). */
  linksLabel?: string;
  /** Extra footer content after the links. */
  footer?: ReactNode;
  /** Width of the bar, the page and the footer. Default "md" (768px). */
  size?: ContainerProps["size"];
  children?: ReactNode;
  className?: string;
}

/** Frame for a small public web page (account portal, sign-in, legal): top bar, centred main, footer links. */
export function SiteShell({ brand, actions, links, linksLabel, footer, size = "md", children, className }: SiteShellProps): JSX.Element {
  const hasFooter = (links && links.length > 0) || footer;
  return (
    <div className={cx("x-site", className)}>
      <header className="x-site-header">
        <Container size={size} className="x-site-bar">
          <div className="x-site-brand">{brand}</div>
          {actions ? <div className="x-site-actions">{actions}</div> : null}
        </Container>
      </header>
      <Container as="main" size={size} className="x-site-main">
        {children}
      </Container>
      {hasFooter ? (
        <footer className="x-site-footer">
          <Container size={size} className="x-site-footer-inner">
            {links && links.length > 0 ? (
              <nav aria-label={linksLabel}>
                {links.map((l) => (
                  <a key={l.href} href={l.href}>
                    {l.label}
                  </a>
                ))}
              </nav>
            ) : null}
            {footer}
          </Container>
        </footer>
      ) : null}
    </div>
  );
}
