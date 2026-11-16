import { useState, type JSX } from "react";
import { Composer, FieldMessage, FilterChip, MenuButton, Stack } from "@xdev-asia/ui";
import { agentOf } from "../data";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { can, useStore } from "../store";
import type { Session } from "../workspace";

/**
 * The prompt box under the panes. It sends to one or several agents of the worktree at once, and the line
 * comments made in diffs go with it as one message. Typing straight into a terminal still works.
 */
export function TargetComposer({ session, active }: { session: Session; active?: string }): JSX.Element | null {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<string[] | null>(null);
  const terms = s.terminals.filter((x) => x.sessionId === session.id && x.agent !== "shell");
  const operator = can(s.role, "operator");
  const comments = s.comments[session.id] ?? [];
  if (terms.length === 0) return null;

  // Until the person picks, the message goes to the terminal in front.
  const targets = picked ?? [active && terms.some((x) => x.id === active) ? active : terms[0].id];
  const history = [...new Set(targets.flatMap((id) => s.prompts[id] ?? []))].slice(-10).reverse();

  const toggle = (id: string): void => setPicked(targets.includes(id) ? targets.filter((x) => x !== id) : [...targets, id]);

  const send = (): void => {
    const body = text.trim();
    if (!body || targets.length === 0) return;
    const lines = [`> ${body}`, ...comments.map((c) => `  ${c.target}: ${c.text}`)];
    s.setTerminals((list) => list.map((x) => (targets.includes(x.id) ? { ...x, output: [...x.output, ...lines] } : x)));
    s.setPrompts((all) => Object.fromEntries([...Object.entries(all), ...targets.map((id) => [id, [...(all[id] ?? []).filter((p) => p !== body), body].slice(-10)])]));
    if (comments.length > 0) s.setComments((all) => ({ ...all, [session.id]: [] }));
    for (const id of targets) s.agentReply(session.id, id);
    notify(t("ws2.sentTo", { names: terms.filter((x) => targets.includes(x.id)).map((x) => x.name).join(", ") }));
    setText("");
  };

  return (
    <div className="app-composer">
      <Stack gap={2}>
        <div className="app-row" role="group" aria-label={t("ws2.sendTo")}>
          <span className="app-muted">{t("ws2.sendTo")}</span>
          {terms.map((x) => (
            <FilterChip key={x.id} pressed={targets.includes(x.id)} disabled={!operator} onClick={() => toggle(x.id)}>
              {`${agentOf(x.agent).name} · ${x.name}`}
            </FilterChip>
          ))}
          {comments.length > 0 ? <span className="app-muted">{t("ws2.withComments", { n: comments.length })}</span> : null}
        </div>
        <Composer value={text} onChange={setText} onSend={send} disabled={!operator || targets.length === 0} placeholder={t("ws.promptPlaceholder")} labels={ui.composer} />
        {operator ? (
          <Stack direction="row" gap={2} align="center" wrap>
            <MenuButton label={t("ws.history")} icon="history" items={history.length === 0 ? [{ label: t("ws.historyEmpty"), disabled: true }] : history.map((p) => ({ label: p, onSelect: () => setText(p) }))} />
            <span className="app-muted">{targets.length === 0 ? t("ws2.sendToNone") : t("ws2.typeHint")}</span>
          </Stack>
        ) : (
          <FieldMessage tone="info">{t("roles.terminalsNeedOperator", { role: t(`roles.${s.role}`) })}</FieldMessage>
        )}
      </Stack>
    </div>
  );
}
