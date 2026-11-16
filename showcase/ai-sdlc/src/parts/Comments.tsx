import { useState, type JSX } from "react";
import { FormDialog, IconButton, List, ListRow, Textarea } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { useStore } from "../store";
import type { Comment } from "../workspace";

/** Asks for the text of one comment on `target` (a line of a file, or a passage of a document). */
export function CommentDialog({ scope, target, quote, title, onClose }: { scope: string; target: string; quote: string; title: string; onClose: () => void }): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const [text, setText] = useState("");
  const [tried, setTried] = useState(false);
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
      <Textarea label={t("comments.text")} error={tried && !text.trim() ? t("comments.textRequired") : undefined} value={text} onChange={(e) => setText(e.target.value)} />
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
          meta={c.target}
          trailing={<IconButton icon="close" label={t("comments.remove")} onClick={() => s.setComments((all) => ({ ...all, [scope]: (all[scope] ?? []).filter((x) => x.id !== c.id) }))} />}
        />
      ))}
    </List>
  );
}
