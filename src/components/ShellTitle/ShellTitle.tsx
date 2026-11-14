import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";

export interface ShellTitleLabels {
  /** aria-label of the trail when there is a `parent`. Default: "<parent> / <title>" when both are strings. */
  trail: string;
}

export interface ShellTitleProps {
  /** The page's h1. */
  title: ReactNode;
  /** One sentence under the title; shown from 1024px up. */
  description?: ReactNode;
  /** The page's icon, the same one as in the sidebar. */
  icon?: IconName;
  /** A logo or `Emblem` in place of the icon, e.g. on a detail page. */
  media?: ReactNode;
  /** The list this page belongs to, linked before the title: Providers › OpenAI. */
  parent?: { label: ReactNode; href: string };
  labels?: Partial<ShellTitleLabels>;
  className?: string;
}

/** The page title in the `AppShell` top bar (its `title` slot): icon, h1 and a one-line description. */
export function ShellTitle({ title, description, icon, media, parent, labels, className }: ShellTitleProps): JSX.Element {
  const mark = media ?? (icon ? <Icon name={icon} size={24} /> : null);
  const heading = (
    <div className="x-shell-title-body">
      <div className="x-shell-title-row">
        {mark ? (
          <span className="x-shell-title-icon" aria-hidden="true">
            {mark}
          </span>
        ) : null}
        <h1 className="x-shell-title-text">{title}</h1>
      </div>
      {description ? <p className="x-shell-title-desc">{description}</p> : null}
    </div>
  );
  if (!parent) return <div className={cx("x-shell-title", className)}>{heading}</div>;
  const trail = labels?.trail ?? (typeof parent.label === "string" && typeof title === "string" ? `${parent.label} / ${title}` : undefined);
  return (
    <nav aria-label={trail} className={cx("x-shell-title", className)}>
      <a className="x-shell-title-parent" href={parent.href}>
        {parent.label}
      </a>
      <Icon name="chevron-right" size={16} className="x-shell-title-sep" />
      {heading}
    </nav>
  );
}
