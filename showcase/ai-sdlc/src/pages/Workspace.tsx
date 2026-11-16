import { useState, type JSX } from "react";
import { ApprovalBar, Badge, Button, Card, Composer, Dialog, DiffStat, EmptyState, Field, FieldMessage, List, ListRow, PageHeader, Select, SessionBar, Stack, TabStrip, Tag, Toolbar } from "@xdev-asia/ui";
import { agentOf } from "../data";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { CommentDialog, PendingComments } from "../parts/Comments";
import { DiffView } from "../parts/DiffView";
import { OpenTerminalDialog } from "../parts/OpenTerminalDialog";
import { pending, useStore } from "../store";

export function WorkspacePage(): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const session = s.sessions.find((x) => x.id === s.sessionId) ?? s.sessions[0];
  const terms = s.terminals.filter((x) => x.sessionId === session?.id);
  const [termId, setTermId] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState<string | null>(null);
  const [showChanges, setShowChanges] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [commenting, setCommenting] = useState<number | null>(null);
  const [sendTo, setSendTo] = useState("");
  const [message, setMessage] = useState("");
  const [tried, setTried] = useState(false);

  if (!session) return <EmptyState size="center" icon="terminal" title={t("side.none")} />;

  const term = terms.find((x) => x.id === termId) ?? terms[0];
  const ask = term ? pending(s.approvals).find((a) => a.termId === term.id) : undefined;
  const files = s.changes[session.id] ?? [];
  const file = files.find((f) => f.path === filePath) ?? files[0];
  const comments = s.comments[session.id] ?? [];
  const target = terms.find((x) => x.id === sendTo) ?? terms[0];
  const accountName = (id: string): string => s.accounts.find((a) => a.id === id)?.name ?? t("terminals.noAccount");
  const run = s.runs.find((r) => r.project === session.project && r.branch === session.branch);

  const append = (id: string, lines: string[]): void => s.setTerminals((list) => list.map((x) => (x.id === id ? { ...x, output: [...x.output, ...lines] } : x)));

  const decide = (allow: boolean): void => {
    if (!ask || !term) return;
    s.setApprovals((list) => list.map((a) => (a.id === ask.id ? { ...a, decided: { choice: allow ? "approve" : "changes", by: s.device } } : a)));
    s.setTerminals((list) => list.map((x) => (x.id === term.id ? { ...x, state: allow ? "working" : "idle" } : x)));
    notify(t(allow ? "ws.allowed" : "ws.denied"));
  };

  return (
    <Stack gap={4}>
      <PageHeader
        title={`${session.project} / ${session.branch}`}
        meta={
          <span className="app-row">
            <Tag>{t(session.root ? "ws.rootSession" : "ws.worktree")}</Tag>
            {run ? (
              <Button variant="link" href="#runs" onClick={() => s.setRunId(run.id)}>
                {run.title}
              </Button>
            ) : null}
          </span>
        }
        actions={
          <Button variant="secondary" icon="panel-right" onClick={() => setShowChanges((v) => !v)}>
            {t(showChanges ? "ws.hideChanges" : "ws.showChanges")}
          </Button>
        }
      />
      <div className="app-ws">
        <section className="app-ws-main" aria-label={t("ws.tabs")}>
          <TabStrip
            label={t("ws.tabs")}
            labels={ui.tabStrip}
            tabs={terms.map((x) => ({ id: x.id, name: x.name, state: x.state, profile: agentOf(x.agent).profile, unread: pending(s.approvals).some((a) => a.termId === x.id) }))}
            selected={term?.id}
            onSelect={setTermId}
            onClose={setClosing}
            onAdd={() => setOpening(true)}
          />
          {term ? (
            <>
              <SessionBar
                status={term.state}
                elapsed={term.elapsedMs}
                diff={session.diff}
                labels={{ ...ui.sessionBar, status: ui.sessionState, duration: ui.duration, diffStat: ui.diffStat }}
                actions={
                  <span className="app-row">
                    <Tag>{agentOf(term.agent).name}</Tag>
                    <Tag>{t("ws.account", { name: accountName(term.account) })}</Tag>
                  </span>
                }
              />
              <pre className="app-output" aria-label={t("ws.output")} tabIndex={0}>
                {term.output.join("\n")}
              </pre>
              {ask ? (
                <ApprovalBar
                  title={ask.kind === "edit" ? t("ws.approvalEdit", { agent: agentOf(ask.agent).name, file: ask.title }) : t("ws.approvalCommand", { agent: agentOf(ask.agent).name })}
                  command={ask.command}
                  onAllow={() => decide(true)}
                  onDeny={() => decide(false)}
                  labels={ui.approvalBar}
                />
              ) : null}
              <div className="app-pad">
                <Composer
                  value={prompt}
                  onChange={setPrompt}
                  placeholder={t("ws.promptPlaceholder")}
                  labels={ui.composer}
                  onSend={() => {
                    if (!prompt.trim()) return;
                    append(term.id, [`> ${prompt.trim()}`]);
                    notify(t("ws.sent", { name: term.name }));
                    setPrompt("");
                  }}
                />
              </div>
            </>
          ) : (
            <EmptyState
              size="center"
              icon="terminal"
              title={t("ws.noTerminalsTitle")}
              hint={t("ws.noTerminalsHint")}
              actions={
                <Button variant="secondary" icon="plus" onClick={() => setOpening(true)}>
                  {t("terminals.open")}
                </Button>
              }
            />
          )}
        </section>

        {showChanges ? (
          <aside className="app-ws-panel" aria-label={t("changes.title")}>
            <Card flush>
              <Toolbar title={t("changes.title")} count={files.length} labels={ui.toolbar} />
              {files.length === 0 ? (
                <EmptyState size="inline" title={t("changes.none")} hint={t("changes.noneHint")} />
              ) : (
                <List aria-label={t("changes.files")}>
                  {files.map((f) => (
                    <ListRow
                      key={f.path}
                      as="li"
                      selected={f.path === file?.path}
                      onClick={() => setFilePath(f.path)}
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
            </Card>
            {file ? <DiffView lines={file.lines} label={t("changes.diffOf", { path: file.path })} onPick={setCommenting} pickLabel={(n) => t("comments.addLine", { n })} /> : null}
            {comments.length > 0 ? (
              <Card title={t("comments.pending", { count: comments.length })} headingLevel={2}>
                <Stack gap={3}>
                  <PendingComments scope={session.id} />
                  {target ? (
                    <Stack direction="row" gap={2} align="end" wrap>
                      <div className="app-field">
                        <label className="app-label" htmlFor="comments-target">
                          {t("comments.sendTo")}
                        </label>
                        <Select id="comments-target" value={target.id} onChange={(e) => setSendTo(e.target.value)} options={terms.map((x) => ({ value: x.id, label: x.name }))} />
                      </div>
                      <Button
                        variant="secondary"
                        icon="send"
                        onClick={() => {
                          append(target.id, ["> review comments:", ...comments.map((c) => `  ${c.target}: ${c.text}`)]);
                          s.setComments((all) => ({ ...all, [session.id]: [] }));
                          notify(t("comments.sent", { count: comments.length, name: target.name }));
                        }}
                      >
                        {t("comments.send")}
                      </Button>
                    </Stack>
                  ) : (
                    <FieldMessage tone="info">{t("comments.noTerminal")}</FieldMessage>
                  )}
                </Stack>
              </Card>
            ) : null}
            {files.length > 0 ? (
              <Stack gap={2}>
                <Field label={t("changes.commitMessage")} error={tried && !message.trim() ? t("changes.commitRequired") : undefined} value={message} autoComplete="off" onChange={(e) => setMessage(e.target.value)} />
                <Button
                  variant="primary"
                  icon="commit"
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
          </aside>
        ) : null}
      </div>

      {opening ? <OpenTerminalDialog sessionId={session.id} onClose={() => setOpening(false)} /> : null}
      {commenting !== null && file ? (
        <CommentDialog scope={session.id} target={`${file.path}:${commenting}`} quote={file.lines[commenting - 1] ?? ""} title={t("comments.addLine", { n: commenting })} onClose={() => setCommenting(null)} />
      ) : null}
      {closing ? (
        <Dialog
          alert
          modal
          tone="danger"
          busy={false}
          title={t("ws.closeTitle", { name: terms.find((x) => x.id === closing)?.name ?? "" })}
          confirmLabel={t("ws.closeConfirm")}
          cancelLabel={t("add.cancel")}
          onCancel={() => setClosing(null)}
          onConfirm={() => {
            s.setTerminals((list) => list.filter((x) => x.id !== closing));
            setClosing(null);
          }}
        >
          {t("ws.closeBody")}
        </Dialog>
      ) : null}
    </Stack>
  );
}
