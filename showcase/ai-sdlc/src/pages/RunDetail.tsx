import { useState, type JSX } from "react";
import { AgentChip, Badge, Banner, Button, Card, DescriptionList, Dialog, DiffStat, Disclosure, EmptyState, FieldMessage, List, ListRow, PageHeader, RunTimeline, Stack, StatusDot, Tag, Textarea, type StatusTone } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { CommentDialog, PendingComments } from "../parts/Comments";
import { DiffView } from "../parts/DiffView";
import { MdView } from "../parts/MdView";
import { useGate } from "../parts/useGate";
import { href, navigate } from "../router";
import { can, logEvent, showInWorkspace, useStore } from "../store";
import { tabKey } from "../layout";
import { PIPELINES, attemptTerminal, md, sessionOfRun, type Run, type StageId } from "../workspace";
import { STAGE_KEY, STATE_KEY, attemptsOf } from "./run-keys";

/** One run: its stages, its attempts in order, what the chosen attempt left, the gate when it waits, and its log. */
export function RunDetail({ run }: { run: Run }): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [passage, setPassage] = useState<string | null>(null);
  const [branchPath, setBranchPath] = useState<string | null>(null);

  const gate = useGate(run);
  const operator = can(s.role, "operator");
  const approver = can(s.role, "approver");
  const roleName = t(`roles.${s.role}`);
  const stages = PIPELINES[run.pipeline].stages;
  const gates = PIPELINES[run.pipeline].gatesAfter;
  const attempt = run.attempts.find((a) => a.id === attemptId) ?? run.attempts[run.attempts.length - 1];
  const doc = attempt ? s.docs.find((d) => d.runId === run.id && d.stage === attempt.stage) : undefined;
  // An attempt that left its own copy shows that copy; otherwise the stage's current document.
  const latest = attempt ? [...run.attempts].reverse().find((a) => a.stage === attempt.stage)?.id === attempt.id : true;
  const text = attempt?.artifact && !latest ? md(attempt.artifact.sections) : (doc?.versions[doc.versions.length - 1]?.text ?? (attempt?.artifact ? md(attempt.artifact.sections) : undefined));
  const atGate = run.state === "waiting_gate" && attempt?.stage === run.stage;
  const { final, scope, comments } = gate;
  const session = sessionOfRun(run, s.sessions);
  const log = s.runLog[run.id] ?? [];
  const branchFiles = session ? (s.changes[session.id] ?? []) : [];
  const branchFile = branchFiles.find((f) => f.path === branchPath) ?? branchFiles[0];
  const attemptTerm = attempt && session ? s.terminals.find((x) => x.sessionId === session.id && x.name === attemptTerminal(attempt)) : undefined;
  // What stopped the run: the stage that kept failing its verdict, or the stage that was running.
  const failed = [...run.attempts].reverse().find((a) => a.verdict === "fail");
  const stopped = run.blocked === "max_attempts" && failed ? failed : { stage: run.stage, n: attemptsOf(run, run.stage) };
  const blockedText = t(run.blocked === "interrupted" ? "runs.blockedInterrupted" : run.blocked === "agent_exit" ? "runs.blockedExit" : "runs.blockedMax", { stage: t(STAGE_KEY[stopped.stage]), n: stopped.n });
  const verdictOf = (stage: StageId): string => {
    const a = lastOf(stage);
    return `${t(a?.verdict === "fail" ? "runs.verdictFail" : "runs.verdictPass")}: ${a?.summary ?? t("runs.summaryNone")}`;
  };
  /** The account a stage's agent signs in with: Review runs on the second agent. */
  const accountOf = (stage: StageId): string => s.accounts.find((a) => a.id === s.defaults[stage === "review" ? "codex" : "claude-code"])?.name ?? t("terminals.noAccount");
  const lastOf = (stage: StageId): Run["attempts"][number] | undefined => [...run.attempts].reverse().find((a) => a.stage === stage);

  const patch = (change: Partial<Run>): void => s.setRuns((list) => list.map((r) => (r.id === run.id ? { ...r, ...change } : r)));
  const startAttempt = (stage: StageId, reason?: string): Run["attempts"] => [...run.attempts, { id: `${run.id}-${run.attempts.length + 1}`, stage, n: attemptsOf(run, stage) + 1, status: "running", at: "now", reason }];

  const approve = (): void => {
    gate.approve();
    setNote("");
    setTried(false);
    notify(t("approvals.approved", { title: run.title }));
  };

  const requestChanges = (): void => {
    if (!gate.requestChanges(note)) return setTried(true);
    setNote("");
    setTried(false);
    notify(t("approvals.changesSent", { title: run.title }));
  };

  const dot = (stage: StageId): { tone: StatusTone; pulse: boolean } => {
    const index = stages.indexOf(stage);
    const current = stages.indexOf(run.stage);
    if (run.state === "done" || index < current) return { tone: "ok", pulse: false };
    if (index > current) return { tone: "neutral", pulse: false };
    return { tone: run.state === "blocked" ? "danger" : run.state === "waiting_gate" ? "warn" : "accent", pulse: run.state === "running" };
  };

  return (
    <Stack gap={4}>
      <PageHeader
        title={run.title}
        breadcrumb={
          <Button variant="link" icon="arrow-left" onClick={() => s.setRunId(null)}>
            {t("runs.back")}
          </Button>
        }
        meta={
          <span className="app-row">
            <Tag>{run.project}</Tag>
            <Tag>{t(run.pipeline === "feature" ? "runs.pipelineFeature" : "runs.pipelineFix")}</Tag>
            <Tag>{run.branch}</Tag>
            <Badge status={run.state === "done" ? "unchanged" : "changed"}>{t(STATE_KEY[run.state])}</Badge>
          </span>
        }
        actions={
          <>
            {session ? (
              <Button
                variant="secondary"
                icon="terminal"
                onClick={() => {
                  s.setSessionId(session.id);
                  navigate(href.workspace);
                }}
              >
                {t("runs.openSession")}
              </Button>
            ) : null}
            {operator && run.state !== "done" && run.state !== "cancelled" ? (
              <Button variant="danger" onClick={() => setCancelling(true)}>
                {t("runs.cancel")}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="app-stages" role="list">
        {stages.map((stage) => (
          <span key={stage} className="app-row" role="listitem">
            <AgentChip profile={stage === "review" ? "codex" : "claude"} title={stage === "review" ? "Codex" : "Claude Code"} />
            <StatusDot tone={dot(stage).tone} pulse={dot(stage).pulse} label={t(STAGE_KEY[stage])} />
            {gates.includes(stage) ? run.state === "waiting_gate" && run.stage === stage ? <Tag tone="warn">{t("runs.gateWaiting")}</Tag> : <Tag>{t("runs.gate")}</Tag> : null}
          </span>
        ))}
      </div>

      {run.state === "blocked" ? (
        <Banner
          tone="warn"
          title={t("runs.blockedTitle")}
          action={
            <Button
              variant="secondary"
              icon="refresh"
              disabled={!operator}
              onClick={() => {
                patch({ state: "running", blocked: undefined, attempts: startAttempt(run.stage, blockedText) });
                logEvent(s, run.id, "stage_retried", s.device, run.stage);
                notify(t("runs.retried", { stage: t(STAGE_KEY[run.stage]) }));
              }}
            >
              {t("runs.retry")}
            </Button>
          }
        >
          {blockedText}
        </Banner>
      ) : null}

      {run.state === "done" ? (
        <Banner
          tone="ok"
          title={t("runs.notPushedTitle")}
          action={
            session ? (
              <Button
                variant="secondary"
                icon="terminal"
                onClick={() => {
                  s.setSessionId(session.id);
                  navigate(href.workspace);
                }}
              >
                {t("runs.openSession")}
              </Button>
            ) : undefined
          }
        >
          {t("runs.notPushedHint")}
        </Banner>
      ) : null}

      <div className="app-split">
        <div className="app-col-narrow">
          <Card title={t("runs.timeline")} headingLevel={2}>
            <RunTimeline
              labels={{ ...ui.runTimeline, duration: ui.duration }}
              steps={run.attempts.map((a) => ({
                id: a.id,
                status: a.status,
                at: a.at,
                durationMs: a.durationMs,
                label: (
                  <span className="app-row">
                    <Button variant="link" onClick={() => setAttemptId(a.id)} aria-current={a.id === attempt?.id ? "true" : undefined}>
                      {t("runs.attempt", { stage: t(STAGE_KEY[a.stage]), n: a.n })}
                    </Button>
                    <Tag>{accountOf(a.stage)}</Tag>
                    {a.verdict ? <Badge tone={a.verdict === "fail" ? "danger" : undefined}>{t(a.verdict === "pass" ? "runs.verdictPass" : "runs.verdictFail")}</Badge> : null}
                    {a.stale ? <Badge status="foreign">{t("docs.basedOnOld")}</Badge> : null}
                  </span>
                ),
              }))}
            />
          </Card>
        </div>

        <div className="app-col-wide">
          <Stack gap={4}>
            {atGate ? (
              <Card title={t("runs.gateTitle", { stage: t(STAGE_KEY[run.stage]) })} subtitle={t(final ? "runs.finalHint" : "runs.gateHint")} headingLevel={2}>
                <Stack gap={3}>
                  {final ? (
                    <Stack gap={2}>
                      <span className="app-label">{t("runs.finalTitle")}</span>
                      <DescriptionList
                        layout="columns"
                        items={[
                          { term: t("runs.branchDiff", { base: run.base }), value: <DiffStat added={run.diff.add} removed={run.diff.del} labels={{ diffStat: ui.diffStat }} /> },
                          { term: t(STAGE_KEY.review), value: verdictOf("review") },
                          { term: t(STAGE_KEY.test), value: verdictOf("test") },
                          { term: t("runs.attemptsPerStage"), value: stages.map((st) => `${t(STAGE_KEY[st])} ${attemptsOf(run, st)}`).join(" · ") },
                        ]}
                      />
                      {branchFiles.length > 0 ? (
                        <List aria-label={t("runs.branchFiles")}>
                          {branchFiles.map((f) => (
                            <ListRow key={f.path} as="li" selected={f.path === branchFile?.path} onClick={() => setBranchPath(f.path)} title={f.path} trailing={<DiffStat added={f.add} removed={f.del} labels={{ diffStat: ui.diffStat }} />} />
                          ))}
                        </List>
                      ) : null}
                      {branchFile ? <DiffView lines={branchFile.lines} label={t("changes.diffOf", { path: branchFile.path })} /> : null}
                    </Stack>
                  ) : null}
                  {!approver ? <FieldMessage tone="info">{t("roles.needApprover", { role: roleName })}</FieldMessage> : null}
                  {comments.length > 0 ? <PendingComments scope={scope} /> : null}
                  <Textarea label={t("approvals.note")} hint={t("approvals.noteHint")} error={tried && !note.trim() && comments.length === 0 ? t("approvals.noteRequired") : undefined} value={note} onChange={(e) => setNote(e.target.value)} />
                  <p className="app-muted">
                    {final ? t("runs.changesHintFinal") : t("runs.changesHint", { stage: t(STAGE_KEY[run.stage]) })} {t("runs.noExpiry")}
                  </p>
                  <Stack direction="row" gap={2} justify="end" wrap>
                    <Button variant="secondary" disabled={!approver} onClick={requestChanges}>
                      {t("approvals.requestChanges")}
                    </Button>
                    {doc ? (
                      <Button
                        variant="secondary"
                        icon="edit"
                        disabled={!approver}
                        onClick={() => {
                          s.setProject(run.project);
                          s.setDocId(doc.id);
                          navigate(href.documents);
                        }}
                      >
                        {t("runs.editDoc")}
                      </Button>
                    ) : null}
                    <Button variant="primary" icon="check" disabled={!approver} onClick={approve}>
                      {t("approvals.approve")}
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            ) : null}
            <Card title={t("runs.artifact")} subtitle={doc?.file} monoSubtitle headingLevel={2}>
              {attempt?.reason ? <FieldMessage tone="warn">{attempt.reason}</FieldMessage> : null}
              {text ? <MdView text={text} onPick={atGate && approver ? setPassage : undefined} pickLabel={t("comments.addPassage")} /> : <EmptyState size="inline" title={t("runs.noArtifact")} />}
              {doc?.truncated && latest ? <FieldMessage tone="warn">{t("docs.truncated")}</FieldMessage> : null}
              {session && attemptTerm ? (
                <Stack direction="row" justify="end">
                  <Button
                    variant="ghost"
                    icon="terminal"
                    onClick={() => {
                      showInWorkspace(s, session.id, { tab: tabKey({ kind: "term", id: attemptTerm.id }) });
                    }}
                  >
                    {t("runs.openTerminal")}
                  </Button>
                </Stack>
              ) : (
                <p className="app-muted">{t("runs.terminalGone")}</p>
              )}
            </Card>
            <Disclosure title={t("log.title")} count={log.length}>
              {log.length === 0 ? (
                <p className="app-muted">{t("log.empty")}</p>
              ) : (
                <Stack gap={2}>
                  <List>
                    {log.map((e, i) => (
                      <ListRow key={i} as="li" leading={<Tag>{e.kind}</Tag>} title={e.detail} meta={`${e.at} · ${e.actor}`} />
                    ))}
                  </List>
                  <Stack direction="row" justify="end">
                    <Button variant="secondary" icon="download" onClick={() => notify(t("log.exported", { title: run.title }))}>
                      {t("log.export")}
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Disclosure>
          </Stack>
        </div>
      </div>

      {passage !== null && doc ? <CommentDialog scope={scope} target={doc.file} quote={passage} title={t("comments.addPassage")} onClose={() => setPassage(null)} /> : null}
      {cancelling ? (
        <Dialog
          alert
          modal
          tone="danger"
          busy={false}
          title={t("runs.cancelTitle", { title: run.title })}
          confirmLabel={t("runs.cancel")}
          cancelLabel={t("add.cancel")}
          onCancel={() => setCancelling(false)}
          onConfirm={() => {
            patch({ state: "cancelled" });
            s.setApprovals((list) => list.map((a) => (a.runId === run.id && !a.decided ? { ...a, decided: { choice: "changes", by: s.device, agoMin: 0 } } : a)));
            logEvent(s, run.id, "run_cancelled", s.device, run.branch);
            notify(t("runs.cancelled", { title: run.title }));
            setCancelling(false);
          }}
        >
          {t("runs.cancelBody")}
        </Dialog>
      ) : null}
    </Stack>
  );
}
