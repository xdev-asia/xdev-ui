import { useState, type JSX, type ReactNode } from "react";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";

export type AppId = "docs" | "changes" | "tasks" | "squads" | "agents" | "kit" | "accounts" | "terminal";

/** Per-app labels plus the bar name and the Changes count formatter. */
export type ActivityBarLabels = Partial<Record<AppId, string>> & {
  /** aria-label of the nav landmark. */
  nav?: string;
  /** Label of Changes with a pending count, e.g. "Changes (3)". */
  count?: (base: string, n: number) => string;
};

/** An item the host adds beside the built-in apps (a board, settings, ...). */
export interface ActivityBarItem {
  id: string;
  icon: IconName;
  /** aria-label and title. */
  label: string;
  /** A number shows a count (caps at "99+", hidden at 0); `true` shows a dot. */
  badge?: number | boolean;
}

export interface ActivityBarProps {
  /** An `AppId`, or the `id` of an extra or bottom item. */
  active?: AppId | (string & {});
  apps?: AppId[];
  /** Items placed after the built-in apps. */
  extraItems?: ActivityBarItem[];
  /** Items pinned to the bottom of the bar (for example settings). */
  bottomItems?: ActivityBarItem[];
  /** Pending changes; badge on Changes, caps at "99+", hidden at 0. */
  changeCount?: number;
  /** Method syntax keeps handlers typed `(id: AppId) => void` assignable; extra items pass their own id. */
  onSelect?(id: AppId | (string & {})): void;
  /** Override the English labels (e.g. for vi). */
  labels?: ActivityBarLabels;
}

export const APPS: AppId[] = ["docs", "changes", "tasks", "squads", "agents", "kit", "accounts", "terminal"];
const APP_LABELS: Record<AppId, string> = {
  docs: "Docs",
  changes: "Changes",
  tasks: "Tasks",
  squads: "Squads",
  agents: "Agents",
  kit: "Kit",
  accounts: "Accounts",
  terminal: "Terminal",
};

export function ActivityBar({ active, apps = APPS, extraItems, bottomItems, changeCount, onSelect, labels }: ActivityBarProps): JSX.Element {
  const [inner, setInner] = useState<string>(active ?? "terminal");
  const current = active ?? inner;
  const pending = changeCount != null && changeCount > 0 ? changeCount : null;
  const button = (id: string, icon: IconName, label: string, badge: ReactNode): JSX.Element => (
    <button
      key={id}
      type="button"
      className="activity"
      aria-label={label}
      title={label}
      aria-current={id === current ? "page" : undefined}
      onClick={() => {
        setInner(id);
        onSelect?.(id);
      }}
    >
      <Icon name={icon} size={22} />
      {badge}
    </button>
  );
  const extra = (it: ActivityBarItem): JSX.Element => {
    const n = typeof it.badge === "number" && it.badge > 0 ? it.badge : null;
    const badge =
      n !== null ? (
        <span className="activity-badge" aria-hidden="true">
          {n > 99 ? "99+" : String(n)}
        </span>
      ) : it.badge === true ? (
        <span className="activity-badge" data-dot aria-hidden="true" />
      ) : null;
    return button(it.id, it.icon, it.label, badge);
  };
  return (
    <nav className="activitybar" aria-label={labels?.nav ?? "Apps"}>
      {apps.map((id) => {
        const base = labels?.[id] ?? APP_LABELS[id] ?? id;
        const label = id === "changes" && pending !== null ? (labels?.count ?? ((b, n) => `${b} (${n})`))(base, pending) : base;
        const badge =
          id === "changes" && pending !== null ? (
            <span className="activity-badge" aria-hidden="true">
              {pending > 99 ? "99+" : String(pending)}
            </span>
          ) : null;
        return button(id, id, label, badge);
      })}
      {extraItems?.map(extra)}
      {bottomItems?.length ? <div className="activity-end">{bottomItems.map(extra)}</div> : null}
    </nav>
  );
}
