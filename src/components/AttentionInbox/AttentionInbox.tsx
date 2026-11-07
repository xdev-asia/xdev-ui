import { useState, type JSX } from "react";
import { cx } from "../../internal/cx";
import { formatDuration, toEpoch } from "../../internal/duration";
import type { AgentProfile } from "../../types";
import { AgentChip } from "../AgentChip/AgentChip";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { Popover } from "../Popover/Popover";

export type AttentionKind = "approval" | "question" | "failed";

export interface AttentionItem {
  id: string;
  agent: AgentProfile;
  worktree: string;
  /** What the agent is waiting for or what failed. */
  text: string;
  /** When the wait began: epoch ms, a Date or an ISO string. */
  since: number | string | Date;
  kind: AttentionKind;
}

export interface AttentionInboxLabels {
  /** Panel title and name of the dialog. */
  title: string;
  /** aria-label of the header button, e.g. "Needs you, 3". */
  button: (count: number) => string;
  /** Shown when nothing waits. */
  empty: string;
  /** Text of each row's button. */
  open: string;
  /** aria-label of a row's button, e.g. "Open feat/login". */
  openItem: (item: AttentionItem) => string;
  kind: Record<AttentionKind, string>;
  /** Wait time, e.g. "5 min". */
  waited: (ms: number) => string;
}

const DEFAULT_LABELS: AttentionInboxLabels = {
  title: "Needs you",
  button: (n) => `Needs you, ${n}`,
  empty: "Nothing is waiting for you.",
  open: "Open",
  openItem: (item) => `Open ${item.worktree}`,
  kind: { approval: "Approval", question: "Question", failed: "Failed" },
  waited: formatDuration,
};

export interface AttentionInboxProps {
  items: AttentionItem[];
  /** Called with the item id when its "Open" button is pressed. */
  onOpen: (id: string) => void;
  /** Controlled open state. Leave undefined for uncontrolled. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Epoch ms used for wait times. Default: `Date.now()` at render. */
  now?: number;
  labels?: Partial<AttentionInboxLabels>;
  className?: string;
}

/** Items sorted oldest first (longest wait on top); unparsable times go last. */
export function sortByWait(items: AttentionItem[]): AttentionItem[] {
  const t = (i: AttentionItem): number => {
    const v = toEpoch(i.since);
    return Number.isNaN(v) ? Number.POSITIVE_INFINITY : v;
  };
  return [...items].sort((a, b) => t(a) - t(b));
}

export function AttentionInbox({ items, onOpen, open, onOpenChange, now, labels, className }: AttentionInboxProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels, kind: { ...DEFAULT_LABELS.kind, ...labels?.kind } };
  const [inner, setInner] = useState(false);
  const isOpen = open ?? inner;
  const set = (v: boolean): void => {
    setInner(v);
    onOpenChange?.(v);
  };
  const count = items.length;
  const at = now ?? Date.now();
  const sorted = sortByWait(items);
  return (
    <>
    <Popover
      open={isOpen}
      onClose={() => set(false)}
      label={l.title}
      placement="bottom-end"
      className={cx("x-attention-pop", className)}
      trigger={(aria) => (
        <button type="button" className="x-attention-btn" aria-label={l.button(count)} data-active={count > 0 ? "" : undefined} onClick={() => set(!isOpen)} {...aria}>
          <Icon name="bell" />
          {count > 0 ? (
            <span className="x-attention-count" aria-hidden="true">
              {count > 99 ? "99+" : String(count)}
            </span>
          ) : null}
        </button>
      )}
    >
      <div className="x-attention">
        <h2 className="x-attention-title">{l.title}</h2>
        {count === 0 ? (
          <p className="x-attention-empty">{l.empty}</p>
        ) : (
          <ul className="x-attention-list">
            {sorted.map((item) => {
              const since = toEpoch(item.since);
              return (
                <li key={item.id} className="x-attention-row" data-kind={item.kind}>
                  <AgentChip profile={item.agent} title={item.agent} />
                  <span className="x-attention-text">
                    <span className="x-attention-wt">{item.worktree}</span>
                    <span className="x-attention-ask">{item.text}</span>
                    <span className="x-attention-meta">
                      <span className="x-attention-kind">{l.kind[item.kind]}</span>
                      {Number.isNaN(since) ? null : <span>{l.waited(Math.max(0, at - since))}</span>}
                    </span>
                  </span>
                  <Button size="sm" variant="secondary" aria-label={l.openItem(item)} onClick={() => onOpen(item.id)}>
                    {l.open}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Popover>
    <span className="x-sr-only" role="status">
      {l.button(count)}
    </span>
    </>
  );
}
