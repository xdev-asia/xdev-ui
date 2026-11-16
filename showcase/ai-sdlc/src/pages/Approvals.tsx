import { useState, type JSX } from "react";
import { AgentChip, Button, Card, CodeBlock, EmptyState, FieldMessage, List, ListRow, PageHeader, Stack, Tabs, Tag, Textarea } from "@xdev-asia/ui";
import { agentOf } from "../data";
import { useI18n, type MessageKey } from "../i18n";
import { useNotify } from "../notify";
import { DiffView } from "../parts/DiffView";
import { MdView } from "../parts/MdView";
import { href, navigate } from "../router";
import { StageDecision } from "../parts/StageDecision";
import { can, useStore } from "../store";
import { clock, type Approval, type ApprovalKind } from "../workspace";

const KIND_KEY: Record<ApprovalKind, MessageKey> = { command: "approvals.kindCommand", edit: "approvals.kindEdit", push: "approvals.kindPush", stage: "approvals.kindStage" };

/** Requests with a deadline first, the nearest deadline on top; then the ones that never expire, longest wait first. */
const byUrgency = (a: Approval, b: Approval): number => (a.expiresMin ?? Infinity) - (b.expiresMin ?? Infinity) || b.waitedMin - a.waitedMin;

export function ApprovalsPage(): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [view, setView] = useState("pending");
  const { approvalId: selected, setApprovalId: setSelected } = s;
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);

  // Requests of every project show here, whatever project is chosen: each row names its project.
  const mine = s.approvals;
  const waiting = mine.filter((a) => !a.decided).sort(byUrgency);
  const history = mine.filter((a) => a.decided);
  const list = view === "pending" ? waiting : history;
  const current = list.find((a) => a.id === selected) ?? list[0];
  const run = current?.runId ? s.runs.find((r) => r.id === current.runId) : undefined;
  const doc = current?.runId ? s.docs.find((d) => d.runId === current.runId && d.status === "waiting") : undefined;
  const term = current?.termId ? s.terminals.find((x) => x.id === current.termId) : undefined;
  const canDecide = can(s.role, "approver");

  const decide = (choice: "approve" | "changes"): void => {
    if (!current) return;
    if (choice === "changes" && !note.trim()) return setTried(true);
    s.setApprovals((all) => all.map((a) => (a.id === current.id ? { ...a, decided: { choice, by: s.device, note: note.trim() || undefined, agoMin: 0 } } : a)));
    if (current.termId) s.setTerminals((all) => all.map((x) => (x.id === current.termId ? { ...x, state: choice === "approve" ? "working" : "idle" } : x)));
    notify(t(choice === "approve" ? "approvals.approved" : "approvals.changesSent", { title: current.title }));
    setNote("");
    setTried(false);
    setSelected(null);
  };

  const meta = (a: Approval): string =>
    a.decided
      ? `${a.session} · ${t(a.decided.choice === "approve" ? "approvals.decidedApprove" : "approvals.decidedChanges", { by: a.decided.by })} · ${t("approvals.decidedClock", { time: clock(s.now - a.decided.agoMin * 60_000) })} · ${a.decided.agoMin ? t("approvals.decidedAt", { min: a.decided.agoMin }) : t("approvals.decidedNow")}`
      : `${a.session} · ${t("approvals.waited", { min: a.waitedMin })} · ${a.expiresMin !== undefined ? t("approvals.expires", { min: a.expiresMin }) : t("approvals.noExpiry")}`;

  return (
    <Stack gap={4}>
      <PageHeader title={t("approvals.title")} description={t("approvals.description")} />
      <Tabs
        label={t("approvals.views")}
        value={view}
        onChange={(id) => {
          setView(id);
          setSelected(null);
        }}
        items={[
          { id: "pending", label: t("approvals.pending"), badge: waiting.length || undefined },
          { id: "history", label: t("approvals.history") },
        ]}
      />
      {list.length === 0 ? (
        <EmptyState size="center" icon="inbox" title={t(view === "pending" ? "approvals.emptyTitle" : "approvals.historyEmpty")} hint={view === "pending" ? t("approvals.emptyHint") : undefined} />
      ) : (
        <div className="app-split">
          <div className="app-col-narrow">
            <Card flush>
              <List aria-label={t("approvals.list")}>
                {list.map((a) => (
                  <ListRow
                    key={a.id}
                    as="li"
                    selected={a.id === current?.id}
                    onClick={() => {
                      setSelected(a.id);
                      setNote("");
                      setTried(false);
                    }}
                    leading={<AgentChip profile={agentOf(a.agent).profile} title={agentOf(a.agent).name} />}
                    title={
                      <span className="app-row">
                        <Tag>{t(KIND_KEY[a.kind])}</Tag>
                        {a.title}
                      </span>
                    }
                    meta={meta(a)}
                  />
                ))}
              </List>
            </Card>
          </div>
          <div className="app-col-wide">
            {current ? (
              <Card title={current.title} subtitle={meta(current)} headingLevel={2}>
                <Stack gap={3}>
                  <span className="app-row">
                    <Tag>{agentOf(current.agent).name}</Tag>
                    {term ? <Tag>{t("approvals.terminal", { name: term.name })}</Tag> : null}
                  </span>
                  {current.command ? <CodeBlock language="sh" labels={ui.codeBlock} code={current.command} /> : null}
                  {current.diff ? <DiffView lines={current.diff} label={t("changes.diffOf", { path: current.title })} /> : null}
                  {current.truncated ? <FieldMessage tone="warn">{t("approvals.truncated")}</FieldMessage> : null}
                  {!canDecide && !current.decided ? <FieldMessage tone="info">{t("roles.needApprover", { role: t(`roles.${s.role}`) })}</FieldMessage> : null}
                  {doc && !(run && !current.decided) ? <MdView text={doc.versions[doc.versions.length - 1]?.text ?? ""} /> : null}
                  {doc?.truncated ? <FieldMessage tone="warn">{t("docs.truncated")}</FieldMessage> : null}
                  {current.decided?.note ? <FieldMessage tone="info">{current.decided.note}</FieldMessage> : null}
                  {!current.decided && current.kind === "stage" && run ? <StageDecision key={run.id} run={run} canDecide={canDecide} /> : null}
                  {!current.decided && current.kind !== "stage" ? (
                    <>
                      <Textarea label={t("approvals.note")} hint={t("approvals.noteHint")} error={tried && !note.trim() ? t("approvals.noteRequired") : undefined} value={note} disabled={!canDecide} onChange={(e) => setNote(e.target.value)} />
                      <Stack direction="row" gap={2} justify="end" wrap>
                        <Button
                          variant="secondary"
                          icon="terminal"
                          onClick={() => {
                            s.setSessionId(current.sessionId);
                            navigate(href.workspace);
                          }}
                        >
                          {t("approvals.openSession")}
                        </Button>
                        <Button variant="secondary" disabled={!canDecide} onClick={() => decide("changes")}>
                          {t("approvals.requestChanges")}
                        </Button>
                        <Button variant="primary" icon="check" disabled={!canDecide} onClick={() => decide("approve")}>
                          {t("approvals.approve")}
                        </Button>
                      </Stack>
                    </>
                  ) : null}
                </Stack>
              </Card>
            ) : (
              <EmptyState size="inline" title={t("approvals.select")} />
            )}
          </div>
        </div>
      )}
    </Stack>
  );
}
