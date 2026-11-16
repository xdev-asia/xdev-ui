import type { JSX } from "react";
import { Tabs } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { useStore, type Dock as DockId } from "../store";
import { openEscalations, type Squad } from "../squads";
import type { Run, Session } from "../workspace";
export interface DockProps {
  session: Session;
  run?: Run;
  squad?: Squad;
  /** Shows a tab (a diff, a document) in the focused pane. */
  onOpen: (key: string) => void;
  onPickSeat: (seatId: string) => void;
  /** Shows only this part, with no tabs: on a phone the workspace's own tabs choose it. */
  part?: DockId;
}

/** The column on the right of the workspace: what changed in the worktree, its run, its squad. */
export function Dock({ session, run, squad, onOpen, onPickSeat, part }: DockProps): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  const files = s.changes[session.id] ?? [];
  const gate = run?.state === "waiting_gate" || run?.state === "blocked" ? 1 : 0;
  const asks = squad && squad.state === "active" ? openEscalations(squad).length : 0;
  const shown = part ?? s.dock;
  const body = shown === "changes" ? <ChangesDock session={session} onOpen={onOpen} /> : shown === "run" ? <RunDock session={session} run={run} onOpen={onOpen} /> : <SquadDock squad={squad} onPickSeat={onPickSeat} />;
  if (part) return <div className="app-dock-body">{body}</div>;
  return (
    <aside className="app-dock" aria-label={t("ws2.dock")}>
      <Tabs
        label={t("ws2.dock")}
        value={s.dock}
        onChange={(id) => s.setDock(id as DockId)}
        items={[
          { id: "changes", label: t("dock.changes"), badge: files.length || undefined },
          { id: "run", label: t("dock.run"), badge: gate || undefined, badgeTone: "danger" },
          { id: "squad", label: t("dock.squad"), badge: asks || undefined, badgeTone: "danger" },
        ]}
      />
      <div className="app-dock-body">{body}</div>
    </aside>
  );
}

import { ChangesDock } from "./DockChanges";
import { RunDock } from "./DockRun";
import { SquadDock } from "./DockSquad";
