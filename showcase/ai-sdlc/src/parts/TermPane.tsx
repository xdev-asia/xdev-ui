import { useState, type JSX } from "react";
import { ApprovalBar, Disclosure, FieldMessage, FormDialog, SessionBar, Tag, Textarea } from "@xdev-asia/ui";
import { agentOf } from "../data";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { can, canDecide, pending, useStore } from "../store";
import type { Terminal } from "../workspace";
import { DiffView } from "./DiffView";
import { TermView } from "./TermView";

/** One agent terminal in a pane: its state bar, the terminal, and the request it waits on, answered in place. */
export function TermPane({ term, diff }: { term: Terminal; diff: { add: number; del: number } }): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [denying, setDenying] = useState(false);
  const [note, setNote] = useState("");
  const operator = can(s.role, "operator");
  const ask = pending(s.approvals).find((a) => a.termId === term.id);
  const approver = ask ? canDecide(s, ask.kind) : false;
  const account = s.accounts.find((a) => a.id === term.account)?.name ?? t("terminals.noAccount");

  const decide = (allow: boolean, why?: string): void => {
    if (!ask) return;
    s.setApprovals((list) => list.map((a) => (a.id === ask.id ? { ...a, decided: { choice: allow ? "approve" : "changes", by: s.device, note: why, agoMin: 0 } } : a)));
    s.setTerminals((list) => list.map((x) => (x.id === term.id ? { ...x, state: allow ? "working" : "idle" } : x)));
    notify(t(allow ? "ws.allowed" : "ws.denied"));
  };

  const prompt = (text: string): void => {
    s.setTerminals((list) => list.map((x) => (x.id === term.id ? { ...x, output: [...x.output, `> ${text}`] } : x)));
    s.setPrompts((all) => ({ ...all, [term.id]: [...(all[term.id] ?? []).filter((p) => p !== text), text].slice(-10) }));
    s.agentReply(term.sessionId, term.id);
  };

  return (
    <div className="app-term-pane">
      <SessionBar
        status={term.state}
        elapsed={term.elapsedMs}
        diff={diff}
        labels={{ ...ui.sessionBar, status: ui.sessionState, duration: ui.duration, diffStat: ui.diffStat }}
        actions={
          <span className="app-row">
            <Tag>{agentOf(term.agent).name}</Tag>
            <Tag>{t("ws.account", { name: account })}</Tag>
          </span>
        }
      />
      <TermView term={term} readOnly={!operator} onLine={prompt} label={t("ws.output")} />
      {ask && !approver ? <FieldMessage tone="info">{t("roles.needApprover", { role: t(`roles.${s.role}`) })}</FieldMessage> : null}
      {ask && approver ? (
        <div className="app-ask">
          <ApprovalBar
            title={ask.kind === "edit" ? t("ws.approvalEdit", { agent: agentOf(ask.agent).name, file: ask.title }) : t("ws.approvalCommand", { agent: agentOf(ask.agent).name })}
            command={ask.command}
            onAllow={() => decide(true)}
            onDeny={() => {
              setNote("");
              setDenying(true);
            }}
            labels={ui.approvalBar}
          />
          {ask.diff ? (
            <Disclosure title={t("ws2.editDiff")}>
              <DiffView lines={ask.diff} label={t("changes.diffOf", { path: ask.title })} />
              {ask.truncated ? <FieldMessage tone="warn">{t("approvals.truncated")}</FieldMessage> : null}
            </Disclosure>
          ) : null}
        </div>
      ) : null}
      {denying ? (
        <FormDialog
          modal
          busy={false}
          title={t("ws.denyTitle")}
          labels={ui.formDialog}
          submitLabel={t("ws.denySubmit")}
          submitDisabled={!note.trim()}
          onCancel={() => setDenying(false)}
          onSubmit={(e) => {
            e.preventDefault();
            if (!note.trim()) return;
            decide(false, note.trim());
            setDenying(false);
          }}
        >
          <Textarea label={t("approvals.note")} hint={t("approvals.noteHint")} value={note} onChange={(e) => setNote(e.target.value)} />
        </FormDialog>
      ) : null}
    </div>
  );
}
