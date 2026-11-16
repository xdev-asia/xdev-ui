// The tabs and panes of one worktree. Each tab holds one thing: an agent terminal, the diff of a file, or a
// document. Panes sit side by side (two columns) or in a 2 by 2 grid. Every worktree keeps its own layout, so
// switching worktrees swaps the whole set of tabs and panes.

export type TabRef = { kind: "term"; id: string } | { kind: "diff"; path: string } | { kind: "doc"; id: string };

export type Preset = "one" | "two" | "grid";

export interface Pane {
  /** Tab keys, in order. */
  tabs: string[];
  active: string | null;
}

export interface Layout {
  preset: Preset;
  panes: Pane[];
  /** The pane that receives a tab opened from elsewhere (the Changes list, a document). */
  focus: number;
}

export const PANES: Record<Preset, number> = { one: 1, two: 2, grid: 4 };

/** Pure: the key of a tab, unique within a worktree. */
export const tabKey = (t: TabRef): string => (t.kind === "term" ? `term:${t.id}` : t.kind === "diff" ? `diff:${t.path}` : `doc:${t.id}`);

/** Pure: the tab a key stands for. */
export function parseKey(key: string): TabRef {
  const at = key.indexOf(":");
  const kind = key.slice(0, at);
  const rest = key.slice(at + 1);
  if (kind === "diff") return { kind: "diff", path: rest };
  if (kind === "doc") return { kind: "doc", id: rest };
  return { kind: "term", id: rest };
}

/** Pure: a first layout for a worktree: its terminals on the left and, when there is a changed file, its diff on the right. */
export function initialLayout(terms: string[], firstDiff?: string): Layout {
  const left: Pane = { tabs: terms.map((id) => tabKey({ kind: "term", id })), active: terms[0] ? tabKey({ kind: "term", id: terms[0] }) : null };
  if (!firstDiff) return { preset: "one", panes: [left], focus: 0 };
  const key = tabKey({ kind: "diff", path: firstDiff });
  return { preset: "two", panes: [left, { tabs: [key], active: key }], focus: 1 };
}

/** Pure: the same layout with `tabs` added to the first pane when no pane holds them (terminals opened since). */
export function withTabs(layout: Layout, keys: string[]): Layout {
  const missing = keys.filter((k) => !layout.panes.some((p) => p.tabs.includes(k)));
  const gone = new Set(layout.panes.flatMap((p) => p.tabs).filter((k) => k.startsWith("term:") && !keys.includes(k)));
  if (missing.length === 0 && gone.size === 0) return layout;
  const panes = layout.panes.map((p, i) => {
    const tabs = [...p.tabs.filter((k) => !gone.has(k)), ...(i === 0 ? missing : [])];
    return { tabs, active: p.active && tabs.includes(p.active) ? p.active : (tabs[tabs.length - 1] ?? null) };
  });
  return { ...layout, panes };
}

/** Pure: changes how many panes there are. Tabs of panes that go away move to the last pane that stays. */
export function setPreset(layout: Layout, preset: Preset): Layout {
  const n = PANES[preset];
  const panes = layout.panes.slice(0, n).map((p) => ({ ...p, tabs: [...p.tabs] }));
  while (panes.length < n) panes.push({ tabs: [], active: null });
  for (const extra of layout.panes.slice(n)) {
    const last = panes[n - 1];
    last.tabs.push(...extra.tabs.filter((k) => !last.tabs.includes(k)));
    last.active = last.active ?? extra.active;
  }
  return { preset, panes, focus: Math.min(layout.focus, n - 1) };
}

/** Pure: shows `key` in a pane: where it already is, else in `pane` (default: the focused pane). */
export function openTab(layout: Layout, key: string, pane?: number): Layout {
  const holder = layout.panes.findIndex((p) => p.tabs.includes(key));
  if (holder >= 0 && pane === undefined) {
    return { ...layout, focus: holder, panes: layout.panes.map((p, i) => (i === holder ? { ...p, active: key } : p)) };
  }
  const to = pane ?? layout.focus;
  const panes = layout.panes.map((p, i) => {
    const tabs = p.tabs.filter((k) => k !== key || i === to);
    if (i === to) return { tabs: tabs.includes(key) ? tabs : [...tabs, key], active: key };
    return { tabs, active: p.active === key ? (tabs[0] ?? null) : p.active };
  });
  return { ...layout, panes, focus: to };
}

/** Pure: takes `key` out of every pane. */
export function closeTab(layout: Layout, key: string): Layout {
  return {
    ...layout,
    panes: layout.panes.map((p) => {
      const at = p.tabs.indexOf(key);
      if (at < 0) return p;
      const tabs = p.tabs.filter((k) => k !== key);
      return { tabs, active: p.active === key ? (tabs[Math.max(0, at - 1)] ?? null) : p.active };
    }),
  };
}

/** Pure: moves the active tab of `from` to the next pane (round), so two things can sit side by side. */
export function moveToNext(layout: Layout, from: number): Layout {
  const key = layout.panes[from]?.active;
  if (!key || layout.panes.length < 2) return layout;
  return openTab(closeTab(layout, key), key, (from + 1) % layout.panes.length);
}
