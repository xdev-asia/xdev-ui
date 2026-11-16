import type { JSX } from "react";
import { AgentChip, Button, Icon } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { href, navigate } from "../router";
import { useStore } from "../store";
import type { Squad } from "../squads";
import { seatMeta } from "./SeatChart";

/** The seats of the worktree's squad in one row above the panes. Selecting one opens it; the chart is a click away. */
export function SquadRail({ squad, onPick }: { squad: Squad; onPick: (seatId: string) => void }): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  return (
    <div className="app-rail" role="group" aria-label={t("rail.label", { name: squad.name })}>
      <span className="app-rail-name">{squad.name}</span>
      {squad.seats.map((seat) => {
        const used = seat.context ?? 0;
        return (
          <button key={seat.id} type="button" className="app-rail-seat" data-state={seat.agent ? (squad.state === "active" ? seat.state : "idle") : "vacant"} onClick={() => onPick(seat.id)}>
            <span className="app-rail-ring" style={{ "--used": `${used * 3.6}deg` } as React.CSSProperties} data-warn={used >= 70 ? "" : undefined} data-vacant={seat.agent ? undefined : ""}>
              <span className="app-rail-hole">{seat.agent ? <AgentChip profile={seat.agent.profile} letter={seat.agent.letter} title={seat.agent.name} /> : <Icon name="plus" size={12} />}</span>
            </span>
            <span className="app-rail-role">{seat.role}</span>
            <span className="app-rail-meta">{seatMeta(seat, t)}</span>
          </button>
        );
      })}
      <span className="app-grow" />
      <Button
        variant="ghost"
        size="sm"
        icon="workflow"
        onClick={() => {
          s.setSquadId(squad.id);
          navigate(href.squads);
        }}
      >
        {t("rail.chart")}
      </Button>
    </div>
  );
}
