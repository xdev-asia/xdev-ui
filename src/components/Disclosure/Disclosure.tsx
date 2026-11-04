import { useId, useState, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Icon } from "../Icon/Icon";

export interface DisclosureProps {
  /** Group name in the head ("Staged", "Worktrees"). */
  title: ReactNode;
  /** Number of items in the group, shown after the title. */
  count?: number;
  /** Controlled open state. Leave undefined for uncontrolled. */
  expanded?: boolean;
  /** Initial open state when uncontrolled. Default true. */
  defaultExpanded?: boolean;
  /** Called with the new state when the head is clicked. */
  onToggle?: (expanded: boolean) => void;
  /** Buttons at the right of the head (e.g. "Stage all"). Kept outside the toggle button. */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Disclosure({
  title,
  count,
  expanded,
  defaultExpanded = true,
  onToggle,
  actions,
  children,
  className,
}: DisclosureProps): JSX.Element {
  const [inner, setInner] = useState(defaultExpanded);
  const open = expanded ?? inner;
  const bodyId = `x-disc-${useId()}`;
  const toggle = (): void => {
    setInner(!open);
    onToggle?.(!open);
  };
  return (
    <section className={cx("ws-group", className)} data-expanded={open ? "" : undefined}>
      <div className="ws-group-bar">
        <button type="button" className="ws-group-head" aria-expanded={open} aria-controls={bodyId} onClick={toggle}>
          <Icon name="chevron" size={14} className="ws-chevron" />
          <span className="ws-group-title">{title}</span>
          {count != null ? <span className="ws-group-count">{count}</span> : null}
        </button>
        {actions ? <div className="ws-group-actions">{actions}</div> : null}
      </div>
      <div className="ws-group-body" id={bodyId} hidden={!open}>
        {children}
      </div>
    </section>
  );
}
