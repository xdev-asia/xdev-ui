import { useId, type JSX, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { foldText } from "../../internal/text";
import { NavList } from "../NavList/NavList";
import { SearchInput } from "../SearchInput/SearchInput";

export interface SettingsShellItem {
  id: string;
  label: string;
  /** Extra words the search matches besides the label ("dark", "theme"). */
  keywords?: string[];
}

export interface SettingsShellGroup {
  id: string;
  label: string;
  items: SettingsShellItem[];
}

export interface SettingsShellLabels {
  /** aria-label of the search input and its placeholder. */
  search: string;
  /** aria-label of the clear button. */
  clear: string;
  /** Result count read out after the search input. */
  count: (n: number) => string;
  /** Shown instead of the content when the query matches nothing. */
  empty: (query: string) => string;
}

const DEFAULT_LABELS: SettingsShellLabels = {
  search: "Search settings",
  clear: "Clear search",
  count: (n) => (n === 1 ? "1 result" : `${n} results`),
  empty: (query) => `No settings match "${query}"`,
};

/** What `children` gets when it is a function. */
export interface SettingsShellState {
  /** The trimmed query ("" when none). */
  query: string;
  /** Whether the item with this id matches the query; true for every id while the query is empty. */
  visible: (id: string) => boolean;
  /** Number of matching items. */
  matches: number;
}

export interface SettingsShellProps {
  groups: SettingsShellGroup[];
  /** Id of the selected item. */
  value: string;
  /** Called when an item is chosen, or when Enter in the search jumps to the first match. The shell then scrolls the element with that id into view. */
  onChange: (id: string) => void;
  query: string;
  onQuery: (query: string) => void;
  /** Settings rows (`SettingRow` with `id`s that match the items), or a function of the search state so rows can hide themselves. */
  children: ReactNode | ((state: SettingsShellState) => ReactNode);
  /** Sticky at the bottom of the content, usually a `SaveBar`. */
  saveBar?: ReactNode;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<SettingsShellLabels>;
  className?: string;
}

/** Whether `item` matches `query` by label or keywords, ignoring case and diacritics. An empty query matches. */
export function matchesSetting(item: SettingsShellItem, query: string): boolean {
  const q = foldText(query.trim());
  if (!q) return true;
  return [item.label, ...(item.keywords ?? [])].some((w) => foldText(w).includes(q));
}

/** The groups with only the matching items; groups left empty are dropped. */
export function filterSettingsGroups(groups: SettingsShellGroup[], query: string): SettingsShellGroup[] {
  return groups.map((g) => ({ ...g, items: g.items.filter((it) => matchesSetting(it, query)) })).filter((g) => g.items.length > 0);
}

function scrollToId(id: string): void {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ block: "start" });
}

export function SettingsShell({ groups, value, onChange, query, onQuery, children, saveBar, labels, className }: SettingsShellProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const contentId = `x-settings-shell-${useId()}`;
  const q = query.trim();
  const shown = filterSettingsGroups(groups, q);
  const matches = shown.reduce((n, g) => n + g.items.length, 0);
  const ids = new Set(shown.flatMap((g) => g.items.map((it) => it.id)));
  const state: SettingsShellState = { query: q, visible: (id) => !q || ids.has(id), matches };
  const choose = (id: string): void => {
    onChange(id);
    scrollToId(id);
  };
  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && shown[0]) {
      e.preventDefault();
      choose(shown[0].items[0].id);
    }
  };
  return (
    <div className={cx("x-settings-shell", className)}>
      <div className="x-settings-shell-side">
        <SearchInput
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onKeyDown={onSearchKeyDown}
          onClear={() => onQuery("")}
          placeholder={l.search}
          aria-controls={contentId}
          count={q ? matches : undefined}
          labels={{ search: l.search, clear: l.clear, count: l.count }}
        />
        {shown.map((g) => (
          <NavList key={g.id} title={g.label} items={g.items.map((it) => ({ id: it.id, label: it.label }))} value={value} onSelect={choose} />
        ))}
      </div>
      <div className="x-settings-shell-main">
        <div className="x-settings-shell-content" id={contentId}>
          {q && matches === 0 ? <p className="x-settings-shell-empty">{l.empty(q)}</p> : typeof children === "function" ? children(state) : children}
        </div>
        <div className="x-settings-shell-save">{saveBar}</div>
      </div>
    </div>
  );
}
