import { useState, type JSX } from "react";
import { AgentChip, Button, EmptyState, List, ListRow, Stack, StatusDot, Tag } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { href, navigate } from "../router";
import { useStore } from "../store";
import { openEscalations, roleOf, type Squad } from "../squads";
import { EscalationDialog } from "./EscalationDialog";
import { seatMeta } from "./SeatChart";

/** The squad of the worktree: its seats and the questions that wait for an answer. */
export function SquadDock({ squad, onPickSeat }: { squad?: Squad; onPickSeat: (seatId: string) => void }): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  const [asking, setAsking] = useState<string | null>(null);
  if (!squad) return <EmptyState size="inline" icon="bot" title={t("dock.noSquad")} />;
  const waiting = squad.state === "active" ? openEscalations(squad) : [];
  const escalation = waiting.find((e) => e.id === asking);
  return (
    <Stack gap={4}>
      <span className="app-row">
        <span className="app-text">{squad.name}</span>
        <Tag tone={squad.state === "active" ? "default" : "warn"}>{t(squad.state === "active" ? "squads.stateActive" : "squads.stateInactive")}</Tag>
      </span>
      {waiting.length > 0 ? (
        <Stack gap={2}>
          <span className="app-label">{t("squads.escalations")}</span>
          <List>
            {waiting.map((e) => (
              <ListRow key={e.id} as="li" onClick={() => setAsking(e.id)} title={t("squads.route", { from: roleOf(squad, e.from), to: roleOf(squad, e.to) })} meta={e.text} trailing={<span className="app-muted">{t("squads.waited", { n: e.waitedMin })}</span>} />
            ))}
          </List>
        </Stack>
      ) : null}
      <Stack gap={2}>
        <span className="app-label">{t("dock.seats")}</span>
        <List>
          {squad.seats.map((seat) => (
            <ListRow
              key={seat.id}
              as="li"
              onClick={() => onPickSeat(seat.id)}
              leading={seat.agent ? <AgentChip profile={seat.agent.profile} letter={seat.agent.letter} title={seat.agent.name} /> : undefined}
              title={seat.role}
              meta={seatMeta(seat, t)}
              trailing={seat.agent ? <StatusDot state={squad.state === "active" ? seat.state : "idle"} /> : <Tag tone="warn">{t("squads.vacant")}</Tag>}
            />
          ))}
        </List>
      </Stack>
      <Button
        variant="ghost"
        icon="workflow"
        onClick={() => {
          s.setSquadId(squad.id);
          navigate(href.squads);
        }}
      >
        {t("dock.openSquadPage")}
      </Button>
      {escalation ? <EscalationDialog squad={squad} escalation={escalation} onClose={() => setAsking(null)} /> : null}
    </Stack>
  );
}
