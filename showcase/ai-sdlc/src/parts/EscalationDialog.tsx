import { useState, type JSX } from "react";
import { FieldMessage, FormDialog, Stack, Textarea } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { can, useStore } from "../store";
import { roleOf, type Escalation, type Squad } from "../squads";
import { clock } from "../workspace";

/** A question one seat sent up and nobody answered: the person reads it and answers the seat that asked. */
export function EscalationDialog({ squad, escalation, onClose }: { squad: Squad; escalation: Escalation; onClose: () => void }): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [answer, setAnswer] = useState("");
  const [tried, setTried] = useState(false);
  const operator = can(s.role, "operator");
  const from = roleOf(squad, escalation.from);

  return (
    <FormDialog
      modal
      busy={false}
      size="wide"
      title={t("squads.route", { from, to: roleOf(squad, escalation.to) })}
      description={t("squads.waited", { n: escalation.waitedMin })}
      labels={ui.formDialog}
      submitLabel={t("squads.answerSend")}
      submitDisabled={!operator}
      onCancel={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        const text = answer.trim();
        if (!text) return setTried(true);
        s.setSquads((all) =>
          all.map((q) =>
            q.id === squad.id
              ? {
                  ...q,
                  escalations: q.escalations.map((x) => (x.id === escalation.id ? { ...x, answered: { by: s.device, text } } : x)),
                  seats: q.seats.map((x) => (x.id === escalation.from ? { ...x, state: "working" as const } : x)),
                  events: [...q.events, { at: clock(s.now), text: t("squads.eventAnswered", { role: from, text }) }],
                }
              : q,
          ),
        );
        notify(t("squads.answered", { role: from }));
        onClose();
      }}
    >
      <Stack gap={3}>
        <p className="app-text">{escalation.text}</p>
        <Textarea label={t("squads.answer")} hint={t("squads.answerHint", { role: from })} error={tried && !answer.trim() ? t("squads.answerRequired") : undefined} value={answer} disabled={!operator} onChange={(e) => setAnswer(e.target.value)} />
        {!operator ? <FieldMessage tone="info">{t("roles.needOperator", { role: t(`roles.${s.role}`) })}</FieldMessage> : null}
      </Stack>
    </FormDialog>
  );
}
