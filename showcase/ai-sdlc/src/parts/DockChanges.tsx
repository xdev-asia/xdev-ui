import { useState, type JSX } from "react";
import { Badge, Button, DiffStat, EmptyState, Field, FieldMessage, List, ListRow, Stack } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { tabKey } from "../layout";
import { useNotify } from "../notify";
import { can, pending, useStore } from "../store";
import { type Session } from "../workspace";
import { PendingComments } from "./Comments";
import { PushCard } from "./PushCard";

/** What changed in the worktree: files, a push that waits, line comments, and the commit. */
export function ChangesDock({ session, onOpen }: { session: Session; onOpen: (key: string) => void }): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [message, setMessage] = useState("");
  const [tried, setTried] = useState(false);
  const files = s.changes[session.id] ?? [];
  const operator = can(s.role, "operator");
  const push = pending(s.approvals).find((a) => a.kind === "push" && a.sessionId === session.id);
  const base = s.projects.find((p) => p.name === session.project)?.base ?? "main";

  return (
    <Stack gap={4}>
      {push ? <PushCard id={push.id} command={push.command} /> : null}
      <span className="app-label">{t("dock.files", { base })}</span>
      {files.length === 0 ? (
        <EmptyState size="inline" title={t("changes.none")} hint={t("changes.noneHint")} />
      ) : (
        <List aria-label={t("changes.files")}>
          {files.map((f) => (
            <ListRow
              key={f.path}
              as="li"
              onClick={() => onOpen(tabKey({ kind: "diff", path: f.path }))}
              title={f.path}
              trailing={
                <span className="app-row">
                  <Badge status={f.status === "new" ? "new" : "changed"}>{t(f.status === "new" ? "changes.statusNew" : "changes.statusChanged")}</Badge>
                  <DiffStat added={f.add} removed={f.del} labels={{ diffStat: ui.diffStat }} />
                </span>
              }
            />
          ))}
        </List>
      )}
      <PendingComments scope={session.id} />
      {files.length > 0 ? (
        <Stack gap={2}>
          <Field label={t("changes.commitMessage")} error={tried && !message.trim() ? t("changes.commitRequired") : undefined} value={message} autoComplete="off" onChange={(e) => setMessage(e.target.value)} />
          {!operator ? <FieldMessage tone="info">{t("roles.needOperator", { role: t(`roles.${s.role}`) })}</FieldMessage> : null}
          <Button
            variant="primary"
            icon="commit"
            disabled={!operator}
            onClick={() => {
              if (!message.trim()) return setTried(true);
              s.setChanges((all) => ({ ...all, [session.id]: [] }));
              s.setSessions((list) => list.map((x) => (x.id === session.id ? { ...x, diff: { add: 0, del: 0 } } : x)));
              notify(t("changes.committed", { branch: session.branch }));
              setMessage("");
              setTried(false);
            }}
          >
            {t("changes.commitPush")}
          </Button>
        </Stack>
      ) : null}
    </Stack>
  );
}

