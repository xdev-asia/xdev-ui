import { useState, type JSX } from "react";
import { Button, Composer, DescriptionList, Drawer, FieldMessage, Meter, Select, Stack, StatusDot, useBreakpoint } from "@xdev-asia/ui";
import { AGENTS, type AgentId } from "../data";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { can, useStore } from "../store";
import { linkedTo, roleOf, type Seat, type Squad } from "../squads";
import { clock } from "../workspace";

export interface SeatPanelProps {
  squad: Squad;
  seat: Seat;
  onClose: () => void;
}

/** One seat: who holds it and what it is doing, with a box to steer it. A vacant seat asks for an agent. */
export function SeatPanel({ squad, seat, onClose }: SeatPanelProps): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [message, setMessage] = useState("");
  const [agentId, setAgentId] = useState<AgentId>("claude-code");
  const [accountId, setAccountId] = useState("");
  const phone = useBreakpoint() === "base";
  const operator = can(s.role, "operator");
  const stopped = squad.state === "inactive";
  // Why the seat cannot be steered or filled now, if it cannot.
  const blocked = stopped ? t("squads.inactiveHint") : operator ? null : t("roles.needOperator", { role: t(`roles.${s.role}`) });
  const accounts = s.accounts.filter((a) => a.agent === agentId && a.status === "signed_in");

  const change = (seats: (list: Seat[]) => Seat[], event: string): void =>
    s.setSquads((all) => all.map((q) => (q.id === squad.id ? { ...q, seats: seats(q.seats), events: [...q.events, { at: clock(s.now), text: event }] } : q)));

  const fill = (): void => {
    const agent = AGENTS.find((a) => a.id === agentId);
    if (!agent) return;
    const account = s.accounts.find((a) => a.id === accountId)?.name ?? "";
    const name = agent.id === "claude-code" ? "Claude" : agent.name;
    change((list) => list.map((x) => (x.id === seat.id ? { ...x, agent: { name, profile: agent.profile }, account, state: "working", context: 0 } : x)), t("squads.eventFilled", { role: seat.role, agent: name }));
    notify(t("squads.filled", { role: seat.role, agent: name }));
    onClose();
  };

  return (
    <Drawer
      modal
      side={phone ? "bottom" : "end"}
      title={seat.role}
      description={seat.agent ? seat.agent.name : t("squads.vacant")}
      labels={ui.drawer}
      onClose={onClose}
      footer={
        seat.agent ? undefined : (
          <Button variant="primary" disabled={!operator || stopped} onClick={fill}>
            {t("squads.fill")}
          </Button>
        )
      }
    >
      <Stack gap={4}>
        {seat.agent ? (
          <>
            <DescriptionList
              items={[
                { term: t("squads.seatAgent"), value: seat.agent.name },
                { term: t("squads.seatAccount"), value: seat.account || t("squads.ownSignIn") },
                { term: t("squads.seatState"), value: <StatusDot state={stopped ? "idle" : seat.state} label={ui.sessionState[stopped ? "idle" : seat.state]} /> },
                { term: t("squads.seatContext"), value: <Meter value={seat.context ?? 0} warnAt={70} /> },
                { term: t("squads.seatReports"), value: seat.parent ? roleOf(squad, seat.parent) : t("squads.seatTop") },
                { term: t("squads.seatLinks"), value: linkedTo(squad, seat.id).map((id) => roleOf(squad, id)).join(", ") },
                ...(seat.task ? [{ term: t("squads.seatDoing"), value: seat.task }] : []),
              ]}
            />
            <Composer
              value={message}
              onChange={setMessage}
              disabled={!operator || stopped}
              placeholder={t("squads.steer", { role: seat.role })}
              labels={ui.composer}
              onSend={() => {
                const text = message.trim();
                if (!text) return;
                change((list) => list, t("squads.eventYou", { role: seat.role, text }));
                notify(t("squads.steerSent", { role: seat.role }));
                setMessage("");
              }}
            />
          </>
        ) : (
          <>
            <FieldMessage tone="info">{`${t("squads.fillTitle")}. ${t("squads.fillHint")}`}</FieldMessage>
            <div className="app-field">
              <label className="app-label" htmlFor="seat-agent">
                {t("squads.seatAgent")}
              </label>
              <Select
                id="seat-agent"
                value={agentId}
                disabled={!operator || stopped}
                onChange={(e) => {
                  setAgentId(e.target.value as AgentId);
                  setAccountId("");
                }}
                options={AGENTS.map((a) => ({ value: a.id, label: a.name }))}
              />
            </div>
            <div className="app-field">
              <label className="app-label" htmlFor="seat-account">
                {t("squads.seatAccount")}
              </label>
              <Select id="seat-account" value={accountId} disabled={!operator || stopped} onChange={(e) => setAccountId(e.target.value)} options={[{ value: "", label: t("squads.ownSignIn") }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]} />
            </div>
          </>
        )}
        {blocked ? <FieldMessage tone="info">{blocked}</FieldMessage> : null}
      </Stack>
    </Drawer>
  );
}
