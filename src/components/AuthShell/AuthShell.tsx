import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface AuthShellProps {
  /** Top of the form pane: `BrandMark` and the product name, often a link home. Shown once, on every width. */
  brand: ReactNode;
  /** End of the form pane's bar: a language `Select`, a `ThemeSwitch`. No buttons. */
  actions?: ReactNode;
  /** Large line on the showcase side ("One gateway for every model"). Translated. */
  headline?: ReactNode;
  /** Short line under the headline. Translated. */
  tagline?: ReactNode;
  /** Picture for the showcase side. Leave it out for the built-in pattern (orbit rings over a dot grid). */
  art?: ReactNode;
  /** Copyright and links to terms: at the foot of the showcase from 1024px wide, under the form below that. */
  footer?: ReactNode;
  /** The sign-in form, with the page's `h1`. */
  children?: ReactNode;
  className?: string;
}

/**
 * Frame for a sign-in, sign-up or reset page: a showcase side (art, then headline and tagline, centred) next to a
 * form pane (brand, actions, form). From 1024px wide they split the width 5 to 3 and the footer sits at the foot of
 * the showcase; below that only the form pane shows, with the footer under it.
 */
export function AuthShell({ brand, actions, headline, tagline, art, footer, children, className }: AuthShellProps): JSX.Element {
  const pitch = headline || tagline;
  return (
    <div className={cx("x-auth", className)}>
      <aside className="x-auth-showcase">
        <div className="x-auth-art">
          {art ?? (
            <div className="x-auth-orbit" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
        {pitch ? (
          <div className="x-auth-pitch">
            {headline ? <p className="x-auth-headline">{headline}</p> : null}
            {tagline ? <p className="x-auth-tagline">{tagline}</p> : null}
          </div>
        ) : null}
      </aside>
      <div className="x-auth-pane">
        <header className="x-auth-bar">
          <div className="x-auth-brand">{brand}</div>
          {actions ? <div className="x-auth-actions">{actions}</div> : null}
        </header>
        <main className="x-auth-main">
          <div className="x-auth-form">{children}</div>
        </main>
      </div>
      {footer ? <footer className="x-auth-footer">{footer}</footer> : null}
    </div>
  );
}
