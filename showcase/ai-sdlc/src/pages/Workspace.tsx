import { useEffect, useState, type JSX } from "react";
import { ApprovalBar, Badge, Banner, Button, Card, Composer, Dialog, DiffStat, Disclosure, EmptyState, Field, FieldMessage, FormDialog, List, ListRow, MenuButton, PageHeader, Select, SessionBar, Stack, TabStrip, Tabs, Tag, Textarea, Toolbar, useBreakpoint } from "@xdev-asia/ui";
import { agentOf } from "../data";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { CommentDialog, PendingComments } from "../parts/Comments";
import { DiffView } from "../parts/DiffView";
import { OpenTerminalDialog } from "../parts/OpenTerminalDialog";
import { can, pending, useStore } from "../store";

export function WorkspacePage(): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const session = s.sessions.find((x) => x.id === s.sessionId) ?? s.sessions[0];
  const terms = s.terminals.filter((x) => x.sessionId === session?.id);
  const { termId, setTermId } = s;
  // Below 768 px the Changes panel is a tab of the content area, not a column beside the terminal.
  const bp = useBreakpoint();
  const narrow = bp === "base" || bp === "sm";
  const [pane, setPane] = useState("terminal");
  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState<string | null>(null);
  const [showChanges, setShowChanges] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [commenting, setCommenting] = useState<number | null>(null);
  const [sendTo, setSendTo] = useState("");
  const [message, setMessage] = useState("");
  const [tried, setTried] = useState(false);
  const [denying, setDenying] = useState(false);
  const [denyNote, setDenyNote] = useState("");
  const operator = can(s.role, "operator");
  const approver = can(s.role, "approver");
  const roleName = t(`roles.${s.role}`);

  // The setup of a new session runs in its worktree. The showcase ends it after a moment.
  const settingUp = session?.setup === "running" ? session.id : null;
  const { setSessions } = s;
  useEffect(() => {
    if (!settingUp) return;
    const timer = window.setTimeout(() => {
      setSessions((list) => list.map((x) => (x.id === settingUp ? { ...x, setup: "ok", setupLog: [...(x.setupLog ?? []), "exit status 0"] } : x)));
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [settingUp, setSessions]);

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

  const history = term ? (s.prompts[term.id] ?? []) : [];
  const decide = (allow: boolean, why?: string): void => {
    if (!ask || !term) return;
    s.setApprovals((list) => list.map((a) => (a.id === ask.id ? { ...a, decided: { choice: allow ? "approve" : "changes", by: s.device, note: why, agoMin: 0 } } : a)));
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
            {session.port ? (
              <span title={t("ws.portHint")}>
                <Tag>{t("ws.port", { port: session.port })}</Tag>
              </span>
            ) : null}
            {run ? (
              <Button variant="link" href="#runs" onClick={() => s.setRunId(run.id)}>
                {run.title}
              </Button>
            ) : null}
          </span>
        }
        actions={
          narrow ? undefined : (
            <Button variant="secondary" icon="panel-right" onClick={() => setShowChanges((v) => !v)}>
              {t(showChanges ? "ws.hideChanges" : "ws.showChanges")}
            </Button>
          )
        }
      />
      {narrow ? (
        <Tabs
          label={t("ws.panes")}
          value={pane}
          onChange={setPane}
          items={[
            { id: "terminal", label: t("ws.paneTerminal") },
            { id: "changes", label: t("ws.paneChanges"), badge: files.length || undefined },
          ]}
        />
      ) : null}
      {session.setup === "running" ? (
        <Banner tone="info" title={t("ws.setupRunning")}>
          <Stack gap={2}>
            <span>{t("ws.setupRunningHint")}</span>
            <pre className="app-output app-log">{(session.setupLog ?? []).join("\n")}</pre>
          </Stack>
        </Banner>
      ) : null}
      {session.setup === "failed" ? (
        <Banner
          tone="warn"
          title={t("ws.setupFailed")}
          action={
            operator ? (
              <Button
                variant="secondary"
                icon="refresh"
                onClick={() => {
                  s.setSessions((list) => list.map((x) => (x.id === session.id ? { ...x, setup: "ok" } : x)));
                  notify(t("ws.setupOk", { name: session.branch }));
                }}
              >
                {t("ws.setupRerun")}
              </Button>
            ) : undefined
          }
        >
          <Stack gap={2}>
            <span>{t("ws.setupFailedHint")}</span>
            <Disclosure title={t("ws.setupLog")}>
              <pre className="app-output app-log">{(session.setupLog ?? []).join("\n")}</pre>
            </Disclosure>
          </Stack>
        </Banner>
      ) : null}
      <div className="app-ws">
        {narrow && pane !== "terminal" ? null : (
        <section className="app-ws-main" aria-label={t("ws.tabs")}>
          {!operator ? <FieldMessage tone="info">{t("roles.terminalsNeedOperator", { role: roleName })}</FieldMessage> : null}
          <TabStrip
            label={t("ws.tabs")}
            labels={ui.tabStrip}
            tabs={terms.map((x) => ({ id: x.id, name: x.name, state: x.state, profile: agentOf(x.agent).profile, unread: pending(s.approvals).some((a) => a.termId === x.id) }))}
            selected={term?.id}
            onSelect={setTermId}
            onClose={operator ? setClosing : undefined}
            onAdd={operator ? () => setOpening(true) : false}
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
              {ask && !approver ? <FieldMessage tone="info">{t("roles.needApprover", { role: roleName })}</FieldMessage> : null}
              {ask && approver ? (
                <ApprovalBar
                  title={ask.kind === "edit" ? t("ws.approvalEdit", { agent: agentOf(ask.agent).name, file: ask.title }) : t("ws.approvalCommand", { agent: agentOf(ask.agent).name })}
                  command={ask.command}
                  onAllow={() => decide(true)}
                  onDeny={() => {
                    setDenyNote("");
                    setDenying(true);
                  }}
                  labels={ui.approvalBar}
                />
              ) : null}
              <div className="app-pad">
                <Composer
                  value={prompt}
                  onChange={setPrompt}
                  disabled={!operator}
                  placeholder={t("ws.promptPlaceholder")}
                  labels={ui.composer}
                  onSend={() => {
                    const text = prompt.trim();
                    if (!text) return;
                    append(term.id, [`> ${text}`]);
                    s.agentReply(session.id, term.id);
                    s.setPrompts((all) => ({ ...all, [term.id]: [...(all[term.id] ?? []).filter((x) => x !== text), text].slice(-10) }));
                    notify(t("ws.sent", { name: term.name }));
                    setPrompt("");
                  }}
                />
                {operator ? (
                  <Stack direction="row" justify="start">
                    <MenuButton
                      label={t("ws.history")}
                      icon="history"
                      items={history.length === 0 ? [{ label: t("ws.historyEmpty"), disabled: true }] : [...history].reverse().map((text) => ({ label: text, onSelect: () => setPrompt(text) }))}
                    />
                  </Stack>
                ) : null}
              </div>
            </>
          ) : (
            <EmptyState
              size="center"
              icon="terminal"
              title={t("ws.noTerminalsTitle")}
              hint={t("ws.noTerminalsHint")}
              actions={
                operator ? (
                  <Button variant="secondary" icon="plus" onClick={() => setOpening(true)}>
                    {t("terminals.open")}
                  </Button>
                ) : undefined
              }
            />
          )}
        </section>
        )}

        {(narrow ? pane === "changes" : showChanges) ? (
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
                  {!operator ? <FieldMessage tone="info">{t("roles.needOperator", { role: roleName })}</FieldMessage> : null}
                  {target && operator ? (
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
                  ) : null}
                  {!target ? <FieldMessage tone="info">{t("comments.noTerminal")}</FieldMessage> : null}
                </Stack>
              </Card>
            ) : null}
            {files.length > 0 ? (
              <Stack gap={2}>
                <Field label={t("changes.commitMessage")} error={tried && !message.trim() ? t("changes.commitRequired") : undefined} value={message} autoComplete="off" onChange={(e) => setMessage(e.target.value)} />
                {!operator ? <FieldMessage tone="info">{t("roles.needOperator", { role: roleName })}</FieldMessage> : null}
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
          </aside>
        ) : null}
      </div>

      {opening ? <OpenTerminalDialog sessionId={session.id} onClose={() => setOpening(false)} /> : null}
      {commenting !== null && file ? (
        <CommentDialog key={commenting} scope={session.id} target="" quote="" range={{ path: file.path, from: commenting, lines: file.lines }} title={t("comments.addLine", { n: commenting })} onClose={() => setCommenting(null)} />
      ) : null}
      {denying ? (
        <FormDialog
          modal
          busy={false}
          title={t("ws.denyTitle")}
          labels={ui.formDialog}
          submitLabel={t("ws.denySubmit")}
          submitDisabled={!denyNote.trim()}
          onCancel={() => setDenying(false)}
          onSubmit={(e) => {
            e.preventDefault();
            if (!denyNote.trim()) return;
            decide(false, denyNote.trim());
            setDenying(false);
          }}
        >
          <Textarea label={t("approvals.note")} hint={t("approvals.noteHint")} value={denyNote} onChange={(e) => setDenyNote(e.target.value)} />
        </FormDialog>
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
