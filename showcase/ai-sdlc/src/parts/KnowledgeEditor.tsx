import { useState, type JSX } from "react";
import { Button, Field, Stack, Textarea } from "@xdev-asia/ui";
import type { KnowledgeFile } from "../config";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { useStore } from "../store";

/** Edits one file of a knowledge repo. Saving is a commit with a message; the file keeps every version. */
export function KnowledgeEditor({ project, file, onClose }: { project: string; file: KnowledgeFile; onClose: () => void }): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  const notify = useNotify();
  const last = file.versions[file.versions.length - 1];
  const [text, setText] = useState(last.text);
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);
  const changed = text !== last.text;
  return (
    <Stack gap={3}>
      <Textarea label={t("kb.text")} mono resize="vertical" value={text} spellCheck={false} onChange={(e) => setText(e.target.value)} />
      <Field label={t("kb.note")} error={tried && !note.trim() ? t("kb.noteRequired") : undefined} value={note} autoComplete="off" onChange={(e) => setNote(e.target.value)} />
      <Stack direction="row" gap={2} justify="end">
        <Button variant="secondary" onClick={onClose}>
          {t("cfg.discard")}
        </Button>
        <Button
          variant="primary"
          icon="commit"
          disabled={!changed}
          onClick={() => {
            if (!note.trim()) return setTried(true);
            const n = last.n + 1;
            s.setKnowledge((repos) =>
              repos.map((r) => (r.project === project ? { ...r, files: r.files.map((f) => (f.path === file.path ? { ...f, versions: [...f.versions, { n, by: s.device, at: "now", note: note.trim(), text }] } : f)) } : r)),
            );
            notify(t("kb.committed", { n, file: file.path }));
            onClose();
          }}
        >
          {t("kb.saveCommit")}
        </Button>
      </Stack>
    </Stack>
  );
}
