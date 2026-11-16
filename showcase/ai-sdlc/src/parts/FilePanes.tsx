import { useState, type JSX } from "react";
import { Button, EmptyState, FieldMessage, Stack, Tag } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { href, navigate } from "../router";
import { useStore } from "../store";
import { CommentDialog } from "./Comments";
import { DiffView } from "./DiffView";
import { MdView } from "./MdView";

/** The diff of one changed file of the worktree. Selecting a line starts a comment that goes with the next prompt. */
export function DiffPane({ sessionId, path }: { sessionId: string; path: string }): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  const [line, setLine] = useState<number | null>(null);
  const file = (s.changes[sessionId] ?? []).find((f) => f.path === path);
  if (!file) return <EmptyState size="inline" title={t("ws2.tabGone")} />;
  return (
    <div className="app-file-pane">
      <DiffView lines={file.lines} label={t("changes.diffOf", { path })} onPick={setLine} pickLabel={(n) => t("comments.addLine", { n })} />
      {line !== null ? <CommentDialog key={line} scope={sessionId} target="" quote="" range={{ path, from: line, lines: file.lines }} title={t("comments.addLine", { n: line })} onClose={() => setLine(null)} /> : null}
    </div>
  );
}

/** A document, read in the worktree beside the agent that wrote it. Editing happens on the Documents page. */
export function DocPane({ docId }: { docId: string }): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  const doc = s.docs.find((d) => d.id === docId);
  if (!doc) return <EmptyState size="inline" title={t("ws2.tabGone")} />;
  const last = doc.versions[doc.versions.length - 1];
  return (
    <div className="app-file-pane">
      <Stack gap={3}>
        <Stack direction="row" gap={2} align="center" wrap>
          <Tag>{t("docs.version", { n: last.n })}</Tag>
          <span className="app-muted">{`${doc.folder}${doc.file}`}</span>
          <span className="app-grow" />
          <Button
            variant="secondary"
            size="sm"
            icon="edit"
            onClick={() => {
              s.setProject(doc.project);
              s.setDocId(doc.id);
              navigate(href.documents);
            }}
          >
            {t("ws2.openDocs")}
          </Button>
        </Stack>
        <MdView text={last.text} />
        {doc.truncated ? <FieldMessage tone="warn">{t("docs.truncated")}</FieldMessage> : null}
      </Stack>
    </div>
  );
}
