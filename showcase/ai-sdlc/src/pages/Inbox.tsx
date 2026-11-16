import type { JSX } from "react";
import { AgentChip, Card, EmptyState, List, ListRow, PageHeader, Stack, Tag, type AgentProfile } from "@xdev-asia/ui";
import { agentOf } from "../data";
import { useI18n, type MessageKey } from "../i18n";
import { tabKey } from "../layout";
import { pending, showInWorkspace, useStore, type Dock } from "../store";
import { openEscalations } from "../squads";
import { clock, sessionOfRun, type ApprovalKind } from "../workspace";

interface Row {
  id: string;
  profile: AgentProfile;
  letter?: string;
  title: string;
  where: string;
  kind?: MessageKey;
  /** What an agent already said, for a gate that AI grades first. */
  extra?: string;
  waitedMin?: number;
  open: () => void;
}

const KIND: Record<ApprovalKind, MessageKey> = { command: "inbox.kindCommand", edit: "inbox.kindEdit", push: "inbox.kindPush", stage: "inbox.kindStage" };

/**
 * Everything that waits for a person and what every agent is doing, across projects: one place to start from.
 * A row opens its worktree with the right tab in front; requests are answered there, beside the agent.
 */
export function InboxPage(): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  const label = (sessionId: string): string => {
    const x = s.sessions.find((y) => y.id === sessionId);
    return x ? `${x.project} / ${x.branch}` : "";
  };
  const aiNote = (runId: string): string | undefined => {
    const review = s.runs.find((r) => r.id === runId)?.aiReview;
    return review ? t("aigate.inbox", { verdict: t(review.verdict === "pass" ? "aigate.pass" : "aigate.changes") }) : undefined;
  };
  const go = (sessionId: string, opts: { tab?: string; dock?: Dock }) => () => showInWorkspace(s, sessionId, opts);

  const needs: Row[] = [
    ...pending(s.approvals).map((a) => ({
      id: a.id,
      profile: agentOf(a.agent).profile,
      title: a.title,
      where: a.session,
      kind: KIND[a.kind],
      extra: a.runId ? aiNote(a.runId) : undefined,
      waitedMin: a.waitedMin,
      open: go(a.sessionId, a.termId ? { tab: tabKey({ kind: "term", id: a.termId }) } : { dock: a.kind === "push" ? "changes" : "run" }),
    })),
    ...s.runs
      .filter((r) => r.state === "blocked")
      .map((r) => ({ id: r.id, profile: "claude" as AgentProfile, title: r.title, where: `${r.project} / ${r.branch}`, kind: "inbox.kindBlocked" as MessageKey, waitedMin: 200, open: go(sessionOfRun(r, s.sessions)?.id ?? "", { dock: "run" }) })),
    ...s.squads
      .filter((q) => q.state === "active")
      .flatMap((q) =>
        openEscalations(q).map((e) => {
          const from = q.seats.find((x) => x.id === e.from)?.agent;
          return { id: e.id, profile: from?.profile ?? "custom", letter: from?.letter, title: e.text, where: `${q.project} / ${q.name}`, kind: "inbox.kindEscalation" as MessageKey, waitedMin: e.waitedMin, open: go(q.sessionId, { dock: "squad" }) };
        }),
      ),
  ].sort((a, b) => (b.waitedMin ?? 0) - (a.waitedMin ?? 0));

  const byState = (state: "working" | "done" | "idle"): Row[] =>
    s.terminals
      .filter((x) => x.state === state && x.agent !== "shell")
      .map((x) => ({ id: x.id, profile: agentOf(x.agent).profile, title: x.name, where: label(x.sessionId), waitedMin: Math.round(x.elapsedMs / 60000), open: go(x.sessionId, { tab: tabKey({ kind: "term", id: x.id }) }) }));

  const groups: { id: string; title: MessageKey; rows: Row[]; warn?: boolean }[] = [
    { id: "needs", title: "inbox.needsYou", rows: needs, warn: true },
    { id: "working", title: "inbox.working", rows: byState("working") },
    { id: "done", title: "inbox.done", rows: byState("done") },
    { id: "idle", title: "inbox.idle", rows: byState("idle") },
  ];

  return (
    <Stack gap={4}>
      <PageHeader title={t("inbox.title")} description={t("inbox.description")} />
      {groups.map((g) => (
        <Card key={g.id} flush title={t(g.title)} titleAside={<Tag tone={g.warn && g.rows.length > 0 ? "warn" : "default"}>{g.rows.length}</Tag>} headingLevel={2}>
          {g.rows.length === 0 ? (
            <EmptyState size="inline" title={t("inbox.empty")} />
          ) : (
            <List>
              {g.rows.map((r) => (
                <ListRow
                  key={r.id}
                  as="li"
                  onClick={r.open}
                  leading={<AgentChip profile={r.profile} letter={r.letter} />}
                  title={r.title}
                  meta={[r.where, r.kind ? t(r.kind) : "", r.extra ?? ""].filter(Boolean).join(" · ")}
                  trailing={r.waitedMin !== undefined ? <span className="app-muted">{t("inbox.waited", { n: r.waitedMin })}</span> : undefined}
                />
              ))}
            </List>
          )}
        </Card>
      ))}
    </Stack>
  );
}

/** Requests that were decided, newest first, in every project. */
export function HistoryPage(): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  const decided = s.approvals.filter((a) => a.decided).sort((a, b) => (a.decided?.agoMin ?? 0) - (b.decided?.agoMin ?? 0));
  return (
    <Stack gap={4}>
      <PageHeader title={t("history.title")} description={t("history.description")} />
      {decided.length === 0 ? (
        <EmptyState size="center" icon="history" title={t("history.empty")} />
      ) : (
        <Card flush>
          <List>
            {decided.map((a) => {
              const d = a.decided;
              if (!d) return null;
              return (
                <ListRow
                  key={a.id}
                  as="li"
                  leading={<AgentChip profile={agentOf(a.agent).profile} />}
                  title={a.title}
                  meta={[a.session, t(KIND[a.kind]), t(d.choice === "approve" ? "approvals.decidedApprove" : "approvals.decidedChanges", { by: d.by }), t("approvals.decidedClock", { time: clock(s.now - d.agoMin * 60_000) }), d.note ?? ""].filter(Boolean).join(" · ")}
                  trailing={<Tag tone={d.choice === "approve" ? "default" : "warn"}>{t(d.choice === "approve" ? "approvals.approve" : "approvals.requestChanges")}</Tag>}
                />
              );
            })}
          </List>
        </Card>
      )}
    </Stack>
  );
}
