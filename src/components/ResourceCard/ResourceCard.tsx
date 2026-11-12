import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";

/** Props handed to `renderLink`; spread them on your router's link. */
export interface ResourceCardLinkProps {
  href: string;
  className: string;
  children: ReactNode;
}

export interface ResourceCardProps {
  /** Name of the thing: a provider, an integration, a tool. */
  title: ReactNode;
  /** Line under the title: a StatusDot with a label, Badges or one short fact. */
  status?: ReactNode;
  /** Before the text: an Avatar, a logo or an Icon. */
  leading?: ReactNode;
  /** After the text and outside the main link: a Switch or an IconButton. */
  trailing?: ReactNode;
  /** "hover" shows `trailing` on hover and focus only (always on touch screens). Default "always". */
  revealTrailing?: "always" | "hover";
  /** Makes the main area a link that opens the thing. */
  href?: string;
  /** Makes the main area a button. Ignored with `href`. Without both the card is static. */
  onClick?: () => void;
  /** Renders the `href` through your link component (e.g. Next `Link`). Default: a plain `<a>`. */
  renderLink?: (props: ResourceCardLinkProps) => ReactNode;
  /** Draws the card fainter, for a thing that is switched off. */
  dimmed?: boolean;
  className?: string;
}

/** A card for one thing in a grid (a provider, an integration, a tool): its mark, its name, its status, one control. */
export function ResourceCard({ title, status, leading, trailing, revealTrailing = "always", href, onClick, renderLink, dimmed = false, className }: ResourceCardProps): JSX.Element {
  const body = (
    <>
      {leading ? <span className="x-resource-card-lead">{leading}</span> : null}
      <span className="x-resource-card-text">
        <span className="x-resource-card-title">{title}</span>
        {status ? <span className="x-resource-card-status">{status}</span> : null}
      </span>
    </>
  );
  const main = "x-resource-card-main";
  return (
    <div className={cx("x-resource-card", className)} data-dimmed={dimmed ? "" : undefined} data-reveal={trailing && revealTrailing === "hover" ? "hover" : undefined}>
      {href !== undefined ? (
        renderLink ? (
          renderLink({ href, className: main, children: body })
        ) : (
          <a className={main} href={href}>
            {body}
          </a>
        )
      ) : onClick ? (
        <button type="button" className={main} onClick={onClick}>
          {body}
        </button>
      ) : (
        <div className={main}>{body}</div>
      )}
      {trailing ? <span className="x-resource-card-trail">{trailing}</span> : null}
    </div>
  );
}
