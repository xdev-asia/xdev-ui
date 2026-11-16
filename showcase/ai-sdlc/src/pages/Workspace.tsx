import { useEffect, useState, type JSX } from "react";
import { Banner, Button, Dialog, Disclosure, EmptyState, PageHeader, Segmented, Stack, Tabs, Tag, useBreakpoint } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { closeTab, moveToNext, openTab, parseKey, setPreset, type Layout, type Preset } from "../layout";
import { useNotify } from "../notify";
import { Dock } from "../parts/Dock";
import { OpenTerminalDialog } from "../parts/OpenTerminalDialog";
import { PaneView } from "../parts/PaneView";
import { SeatPanel } from "../parts/SeatPanel";
import { SquadRail } from "../parts/SquadRail";
import { TargetComposer } from "../parts/TargetComposer";
import { can, layoutOf, useStore, type Dock as DockId } from "../store";
import { STAGE_KEY } from "./run-keys";

/**
 * The worktree in front: its agents, files and documents in tabs and panes, a prompt box that can reach several
 * agents, and a column on the right with the changes, the run and the squad. Below 768 px the panes become one,
 * and the right column becomes tabs beside it.
 */
export function WorkspacePage(): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  const notify = useNotify();
  const bp = useBreakpoint();
  const narrow = bp === "base" || bp === "sm";
  const [part, setPart] = useState("terminal");
  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState<string | null>(null);
  const [seatId, setSeatId] = useState<string | null>(null);
  const session = s.sessions.find((x) => x.id === s.sessionId) ?? s.sessions[0];
  const operator = can(s.role, "operator");

  // The setup of a new session runs in its worktree. The showcase ends it after a moment.
  const settingUp = session?.setup === "running" ? session.id : null;
  const { setSessions } = s;
  useEffect(() => {
    if (!settingUp) return;
    const timer = window.setTimeout(() => {
      setSessions((list) => list.map((x) => (x.id === settingUp ? { ...x, setup: "ok", setupLog: [...(x.setupLog ?? []), "exit status 0"] } : x)));
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [settingUp, setSessions]);

  if (!session) return <EmptyState size="center" icon="terminal" title={t("side.none")} />;

  const stored = layoutOf(s, session.id);
  // On a narrow screen every tab sits in one pane; the stored layout comes back on a wider one.
  const layout = narrow ? setPreset(stored, "one") : stored;
  const update = (change: (l: Layout) => Layout): void => s.setLayouts((all) => ({ ...all, [session.id]: change(layout) }));
  const run = s.runs.find((r) => r.project === session.project && r.branch === session.branch);
  const squad = s.squads.find((q) => q.sessionId === session.id);
  const seat = squad?.seats.find((x) => x.id === seatId);
  const front = layout.panes[layout.focus]?.active;
  const frontTerm = front && parseKey(front).kind === "term" ? (parseKey(front) as { id: string }).id : undefined;

  const open = (key: string): void => {
    // A file opened from the side column goes beside the terminal when there is room for it: into the first pane
    // that does not show a terminal, else into the pane after the focused one.
    update((l) => {
      if (narrow || l.panes.length < 2 || l.panes.some((p) => p.tabs.includes(key))) return openTab(l, key);
      const free = l.panes.findIndex((p) => !p.active?.startsWith("term:"));
      return openTab(l, key, free >= 0 ? free : (l.focus + 1) % l.panes.length);
    });
    if (narrow) setPart("terminal");
  };

  const showDock = !narrow && s.dockOpen;
  const panes = (
    <div className="app-panes" data-preset={layout.preset}>
      {layout.panes.map((pane, i) => (
        <PaneView
          key={i}
          session={session}
          pane={pane}
          index={i}
          count={layout.panes.length}
          focused={layout.focus === i}
          canClose={operator}
          onAdd={operator && i === 0 ? () => setOpening(true) : false}
          onMove={() => update((l) => moveToNext(l, i))}
          onSelect={(key) => update((l) => ({ ...l, focus: i, panes: l.panes.map((p, j) => (j === i ? { ...p, active: key } : p)) }))}
          onClose={(key) => (key.startsWith("term:") ? setClosing(key.slice(5)) : update((l) => closeTab(l, key)))}
        />
      ))}
    </div>
  );

  return (
    <Stack gap={3} className="app-workspace">
      <PageHeader
        title={`${session.project} / ${session.branch}`}
        meta={
          <span className="app-row">
            <Tag>{t(session.root ? "ws.rootSession" : "ws.worktree")}</Tag>
            {session.port ? (
              <span title={t("ws.portHint")}>
                <Tag>{t("ws.port", { port: session.port })}</Tag>
              </span>
            ) : null}
            {run ? <Tag>{`${run.title} · ${t(STAGE_KEY[run.stage])}`}</Tag> : null}
          </span>
        }
        actions={
          narrow ? undefined : (
            <>
              <Segmented
                label={t("ws2.layout")}
                value={layout.preset}
                onChange={(v) => update((l) => setPreset(l, v as Preset))}
                options={[
                  { value: "one", label: t("ws2.one") },
                  { value: "two", label: t("ws2.two") },
                  { value: "grid", label: t("ws2.grid") },
                ]}
              />
              <Button variant="secondary" icon="panel-right" onClick={() => s.setDockOpen(!s.dockOpen)}>
                {t(s.dockOpen ? "ws2.dockHide" : "ws2.dockShow")}
              </Button>
            </>
          )
        }
      />
      {session.setup === "running" ? (
        <Banner tone="info" title={t("ws.setupRunning")}>
          <Stack gap={2}>
            <span>{t("ws.setupRunningHint")}</span>
            <pre className="app-output app-log">{(session.setupLog ?? []).join("\n")}</pre>
          </Stack>
        </Banner>
      ) : null}
      {session.setup === "failed" ? (
        <Banner
          tone="warn"
          title={t("ws.setupFailed")}
          action={
            operator ? (
              <Button
                variant="secondary"
                icon="refresh"
                onClick={() => {
                  s.setSessions((list) => list.map((x) => (x.id === session.id ? { ...x, setup: "ok" } : x)));
                  notify(t("ws.setupOk", { name: session.branch }));
                }}
              >
                {t("ws.setupRerun")}
              </Button>
            ) : undefined
          }
        >
          <Stack gap={2}>
            <span>{t("ws.setupFailedHint")}</span>
            <Disclosure title={t("ws.setupLog")}>
              <pre className="app-output app-log">{(session.setupLog ?? []).join("\n")}</pre>
            </Disclosure>
          </Stack>
        </Banner>
      ) : null}
      {squad ? <SquadRail squad={squad} onPick={setSeatId} /> : null}
      {narrow ? (
        <Tabs
          label={t("ws2.panes")}
          value={part}
          onChange={setPart}
          items={[
            { id: "terminal", label: t("ws2.paneTerminal") },
            { id: "changes", label: t("dock.changes"), badge: (s.changes[session.id] ?? []).length || undefined },
            { id: "run", label: t("dock.run") },
            ...(squad ? [{ id: "squad", label: t("dock.squad") }] : []),
          ]}
        />
      ) : null}
      <div className="app-ws2" data-dock={showDock ? "" : undefined}>
        <div className="app-ws2-main">
          {!narrow || part === "terminal" ? (
            <>
              {panes}
              <TargetComposer session={session} active={frontTerm} />
            </>
          ) : (
            <Dock part={part as DockId} session={session} run={run} squad={squad} onOpen={open} onPickSeat={setSeatId} />
          )}
        </div>
        {showDock ? <Dock session={session} run={run} squad={squad} onOpen={open} onPickSeat={setSeatId} /> : null}
      </div>

      {opening ? <OpenTerminalDialog sessionId={session.id} onClose={() => setOpening(false)} /> : null}
      {seat && squad ? <SeatPanel key={seat.id} squad={squad} seat={seat} onClose={() => setSeatId(null)} /> : null}
      {closing ? (
        <Dialog
          alert
          modal
          tone="danger"
          busy={false}
          title={t("ws.closeTitle", { name: s.terminals.find((x) => x.id === closing)?.name ?? "" })}
          confirmLabel={t("ws.closeConfirm")}
          cancelLabel={t("add.cancel")}
          onCancel={() => setClosing(null)}
          onConfirm={() => {
            s.setTerminals((list) => list.filter((x) => x.id !== closing));
            setClosing(null);
          }}
        >
          {t("ws.closeBody")}
        </Dialog>
      ) : null}
    </Stack>
  );
}
