import { useState, type JSX } from "react";
import { FormDialog, IconButton, List, ListRow, Select, Stack, Textarea } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { useStore } from "../store";
import type { Comment } from "../workspace";

/** A comment on lines of a diff: it starts at `from` (1-based) and may run through a later line. */
export interface LineRange {
  path: string;
  from: number;
  lines: string[];
}

/** How many lines after the first one a comment may cover. */
const MAX_SPAN = 30;

/** Asks for the text of one comment on `target` (a line or a range of lines of a file, or a passage of a document). */
export function CommentDialog({ scope, target, quote, title, range, onClose }: { scope: string; target: string; quote: string; title: string; range?: LineRange; onClose: () => void }): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const [text, setText] = useState("");
  const [tried, setTried] = useState(false);
  const [through, setThrough] = useState(range?.from ?? 0);
  const ranged = range !== undefined && through > range.from;
  if (range) {
    target = ranged ? `${range.path}:${range.from}-${through}` : `${range.path}:${range.from}`;
    quote = range.lines.slice(range.from - 1, through).join("\n");
    title = ranged ? t("comments.addLines", { from: range.from, to: through }) : title;
  }
  const last = range ? Math.min(range.lines.length, range.from + MAX_SPAN) : 0;
  return (
    <FormDialog
      modal
      busy={false}
      title={title}
      description={quote}
      labels={ui.formDialog}
      submitLabel={t("comments.save")}
      onCancel={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return setTried(true);
        const c: Comment = { id: Math.random().toString(16).slice(2, 10), target, quote, text: text.trim() };
        s.setComments((all) => ({ ...all, [scope]: [...(all[scope] ?? []), c] }));
        onClose();
      }}
    >
      <Stack gap={3}>
        {range && last > range.from ? (
          <div className="app-field">
            <label className="app-label" htmlFor="comment-through">
              {t("comments.through")}
            </label>
            <Select id="comment-through" value={String(through)} onChange={(e) => setThrough(Number(e.target.value))} options={Array.from({ length: last - range.from + 1 }, (_, i) => ({ value: String(range.from + i), label: String(range.from + i) }))} />
          </div>
        ) : null}
        <Textarea label={t("comments.text")} error={tried && !text.trim() ? t("comments.textRequired") : undefined} value={text} onChange={(e) => setText(e.target.value)} />
      </Stack>
    </FormDialog>
  );
}

/** The comments of one scope that were not sent yet, each with a button to drop it. */
export function PendingComments({ scope }: { scope: string }): JSX.Element | null {
  const s = useStore();
  const { t } = useI18n();
  const list = s.comments[scope] ?? [];
  if (list.length === 0) return null;
  return (
    <List aria-label={t("comments.list")}>
      {list.map((c) => (
        <ListRow
          key={c.id}
          as="li"
          title={c.text}
          meta={c.quote ? `${c.target} · ${t("comments.quote", { quote: c.quote.length > 90 ? `${c.quote.slice(0, 90)}...` : c.quote })}` : c.target}
          trailing={<IconButton icon="close" label={t("comments.remove")} onClick={() => s.setComments((all) => ({ ...all, [scope]: (all[scope] ?? []).filter((x) => x.id !== c.id) }))} />}
        />
      ))}
    </List>
  );
}
