import { useState, type JSX } from "react";
import { Icon } from "../Icon/Icon";

export type AppId = "docs" | "changes" | "tasks" | "squads" | "agents" | "kit" | "accounts" | "terminal";

export interface ActivityBarProps {
  active?: AppId;
  apps?: AppId[];
  /** Pending changes; badge on Changes, caps at "99+", hidden at 0. */
  changeCount?: number;
  onSelect?: (id: AppId) => void;
  /** Override the English labels (e.g. for vi). */
  labels?: Partial<Record<AppId, string>>;
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

export function ActivityBar({ active, apps = APPS, changeCount, onSelect, labels }: ActivityBarProps): JSX.Element {
  const [inner, setInner] = useState<AppId>(active ?? "terminal");
  const current = active ?? inner;
  const pending = changeCount != null && changeCount > 0 ? changeCount : null;
  return (
    <nav className="activitybar" aria-label="Apps">
      {apps.map((id) => {
        const base = labels?.[id] ?? APP_LABELS[id] ?? id;
        const label = id === "changes" && pending !== null ? `${base} (${pending})` : base;
        return (
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
            <Icon name={id} size={22} />
            {id === "changes" && pending !== null ? (
              <span className="activity-badge" aria-hidden="true">
                {pending > 99 ? "99+" : String(pending)}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
