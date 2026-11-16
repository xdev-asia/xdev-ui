import type { JSX } from "react";
import { EmptyState, IconButton, TabStrip, type TabItem } from "@xdev-asia/ui";
import { agentOf } from "../data";
import { useI18n } from "../i18n";
import { parseKey, type Pane } from "../layout";
import { pending, useStore } from "../store";
import type { Session } from "../workspace";
import { DiffPane, DocPane } from "./FilePanes";
import { TermPane } from "./TermPane";

export interface PaneViewProps {
  session: Session;
  pane: Pane;
  index: number;
  /** How many panes the layout has: with more than one, a tab can move to the next. */
  count: number;
  focused: boolean;
  onSelect: (key: string) => void;
  onClose: (key: string) => void;
  onMove: () => void;
  /** Opens a new agent terminal; false hides the button. */
  onAdd: (() => void) | false;
  canClose: boolean;
}

const base = (path: string): string => path.split("/").pop() ?? path;

/** One pane of the worktree: its own tab strip and the thing its active tab holds. */
export function PaneView({ session, pane, index, count, focused, onSelect, onClose, onMove, onAdd, canClose }: PaneViewProps): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const waiting = pending(s.approvals);

  const item = (key: string): TabItem => {
    const ref = parseKey(key);
    if (ref.kind === "term") {
      const term = s.terminals.find((x) => x.id === ref.id);
      return { id: key, name: term?.name ?? ref.id, state: term?.state, profile: term ? agentOf(term.agent).profile : undefined, unread: waiting.some((a) => a.termId === ref.id) };
    }
    if (ref.kind === "diff") return { id: key, name: t("ws2.diffTab", { file: base(ref.path) }), color: 4 };
    const doc = s.docs.find((d) => d.id === ref.id);
    return { id: key, name: t("ws2.docTab", { file: doc?.file ?? ref.id }), color: 6 };
  };

  const active = pane.active ? parseKey(pane.active) : null;
  const term = active?.kind === "term" ? s.terminals.find((x) => x.id === active.id) : undefined;

  return (
    <section className="app-pane" data-focused={focused && count > 1 ? "" : undefined} aria-label={t("ws2.pane", { n: index + 1 })}>
      <div className="app-pane-tabs">
        <TabStrip label={t("ws2.pane", { n: index + 1 })} labels={ui.tabStrip} tabs={pane.tabs.map(item)} selected={pane.active ?? undefined} onSelect={onSelect} onClose={canClose ? onClose : undefined} onAdd={onAdd} />
        {count > 1 && pane.active ? <IconButton icon="arrow-right" size="sm" label={t("ws2.moveNext")} onClick={onMove} /> : null}
      </div>
      <div className="app-pane-body">
        {!active ? (
          <EmptyState size="center" icon="layers" title={t("ws2.emptyPane")} hint={t("ws2.emptyPaneHint")} />
        ) : active.kind === "term" ? (
          term ? (
            <TermPane key={term.id} term={term} diff={session.diff} />
          ) : (
            <EmptyState size="inline" title={t("ws2.tabGone")} />
          )
        ) : active.kind === "diff" ? (
          <DiffPane sessionId={session.id} path={active.path} />
        ) : (
          <DocPane docId={active.id} />
        )}
      </div>
    </section>
  );
}
