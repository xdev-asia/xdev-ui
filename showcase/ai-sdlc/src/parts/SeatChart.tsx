import type { JSX } from "react";
import { AgentChip, Icon } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { childrenOf, type Seat, type Squad } from "../squads";

/** Circumference of the ring: r = 16 in a 36 by 36 box. */
const RING = 2 * Math.PI * 16;
/** From this share of context on, the ring warns. */
const CONTEXT_WARN = 70;

export interface SeatChartProps {
  squad: Squad;
  selected: string | null;
  onPick: (seatId: string) => void;
}

/** Pure: the line under a seat's role. */
export function seatMeta(seat: Seat, t: ReturnType<typeof useI18n>["t"]): string {
  if (!seat.agent) return t("squads.vacantWants");
  return `${seat.agent.name} · ${seat.state === "waiting" ? t("squads.needsYou") : `${seat.context ?? 0}%`}`;
}

function SeatNode({ squad, seat, selected, onPick }: SeatChartProps & { seat: Seat }): JSX.Element {
  const { t, ui } = useI18n();
  const kids = childrenOf(squad, seat.id);
  const used = seat.context ?? 0;
  const stopped = squad.state === "inactive";
  return (
    <li>
      <button type="button" className="app-seat" data-state={seat.agent ? seat.state : "vacant"} aria-pressed={selected === seat.id} onClick={() => onPick(seat.id)}>
        <span className="app-seat-ring" data-warn={used >= CONTEXT_WARN ? "" : undefined} data-vacant={seat.agent ? undefined : ""}>
          <svg viewBox="0 0 36 36" aria-hidden="true" focusable="false">
            <circle className="app-seat-track" cx="18" cy="18" r="16" />
            {seat.agent ? <circle className="app-seat-used" cx="18" cy="18" r="16" strokeDasharray={`${(used / 100) * RING} ${RING}`} /> : null}
          </svg>
          <span className="app-seat-mark">{seat.agent ? <AgentChip profile={seat.agent.profile} letter={seat.agent.letter} title={seat.agent.name} /> : <Icon name="terminal" />}</span>
          {seat.agent && !stopped ? <span className="app-seat-dot" data-state={seat.state} /> : null}
        </span>
        <span className="app-seat-role">{seat.role}</span>
        <span className="app-seat-meta">{seatMeta(seat, t)}</span>
        {seat.agent ? <span className="x-sr-only">{ui.sessionState[stopped ? "idle" : seat.state]}</span> : null}
      </button>
      {kids.length > 0 ? (
        <ul data-dashed={kids.every((k) => !k.agent) ? "" : undefined}>
          {kids.map((k) => (
            <SeatNode key={k.id} squad={squad} seat={k} selected={selected} onPick={onPick} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/** The seats of a squad as a tree: who reports to whom, who holds each seat, and how full its context is.
 *  The showcase draws it itself: the library has no chart of seats yet. */
export function SeatChart({ squad, selected, onPick }: SeatChartProps): JSX.Element {
  const { t } = useI18n();
  return (
    <nav className="app-seats" aria-label={t("squads.chart", { name: squad.name })}>
      <ul>
        {childrenOf(squad, null).map((seat) => (
          <SeatNode key={seat.id} squad={squad} seat={seat} selected={selected} onPick={onPick} />
        ))}
      </ul>
    </nav>
  );
}
