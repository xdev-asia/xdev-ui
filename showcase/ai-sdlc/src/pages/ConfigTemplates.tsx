import { useState, type JSX } from "react";
import { Button, Card, Checkbox, Field, FieldMessage, FormDialog, IconButton, List, ListRow, PageHeader, SaveBar, Select, Stack, Tag, type AgentProfile } from "@xdev-asia/ui";
import { templateProblems, type SquadTemplate, type TemplateSeat } from "../config";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { ConfigNote } from "../parts/ConfigNote";
import { SeatChart } from "../parts/SeatChart";
import { can, showInWorkspace, useStore } from "../store";
import type { Squad } from "../squads";
import { clock } from "../workspace";

/** Pure: the squad a template would make, for the preview and for "Start a squad". */
export function squadFrom(tpl: SquadTemplate, agents: { id: string; name: string; profile: AgentProfile }[], at: { id: string; project: string; name: string; now: string; by: string }): Squad {
  return {
    id: `sq-${Math.random().toString(16).slice(2, 8)}`,
    name: at.name,
    topology: "hierarchy",
    project: at.project,
    sessionId: at.id,
    startedMin: 0,
    state: "active",
    seats: tpl.seats.map((x) => {
      const a = agents.find((g) => g.id === x.agent);
      return { id: x.id, role: x.role, parent: x.parent, state: a ? "working" : "idle", context: a ? 0 : undefined, task: x.brief, ...(a ? { agent: { name: a.name, profile: a.profile }, account: "" } : {}) };
    }),
    links: [...tpl.seats.filter((x) => x.parent).map((x) => ({ a: x.parent as string, b: x.id, kind: "reports" as const })), ...tpl.peers.map(([a, b]) => ({ a, b, kind: "peer" as const }))],
    escalations: [],
    violations: [],
    events: [{ at: at.now, text: at.by }],
  };
}

/** Squad templates: the seats, who reports to whom, the agent of each seat, peer links and the rules. A proposal. */
export function ConfigTemplatesPage(): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [pickedId, setPickedId] = useState(s.templates[0]?.id ?? "");
  const saved = s.templates.find((x) => x.id === pickedId) ?? s.templates[0];
  const [draft, setDraft] = useState<SquadTemplate | undefined>(saved && structuredClone(saved));
  const [peer, setPeer] = useState<[string, string]>(["", ""]);
  const [starting, setStarting] = useState(false);
  const admin = can(s.role, "admin");
  if (!draft || !saved) return <PageHeader title={t("cfg.templatesTitle")} />;

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const problems = templateProblems(draft);
  const edit = (change: Partial<SquadTemplate>): void => setDraft((d) => (d ? { ...d, ...change } : d));
  const editSeat = (id: string, change: Partial<TemplateSeat>): void => edit({ seats: draft.seats.map((x) => (x.id === id ? { ...x, ...change } : x)) });
  const role = (id: string): string => draft.seats.find((x) => x.id === id)?.role ?? id;
  const preview = squadFrom(draft, s.agentConfigs, { id: "", project: "", name: draft.name, now: "", by: "" });
  const pick = (id: string): void => {
    const x = s.templates.find((y) => y.id === id);
    setPickedId(id);
    setDraft(x && structuredClone(x));
  };

  return (
    <Stack gap={4}>
      <PageHeader
        title={t("cfg.templatesTitle")}
        description={t("cfg.templatesDescription")}
        actions={
          can(s.role, "operator") ? (
            <Button variant="secondary" icon="play" disabled={dirty || problems.length > 0} onClick={() => setStarting(true)}>
              {t("cfg.start")}
            </Button>
          ) : undefined
        }
      />
      <ConfigNote source={null} />
      <div className="app-split">
        <div className="app-col-narrow">
          <Card flush>
            <List>
              {s.templates.map((x) => (
                <ListRow key={x.id} as="li" selected={x.id === draft.id} onClick={() => pick(x.id)} title={x.name} meta={x.seats.map((y) => y.role).join(" · ")} />
              ))}
            </List>
          </Card>
        </div>
        <div className="app-col-wide">
          <Stack gap={4}>
            <Card title={t("cfg.preview")} headingLevel={2}>
              <SeatChart squad={preview} selected={null} onPick={() => undefined} />
            </Card>
            <Card title={draft.name} headingLevel={2}>
              <Stack gap={4}>
                <Field label={t("cfg.name")} value={draft.name} disabled={!admin} onChange={(e) => edit({ name: e.target.value })} />
                <Stack gap={2}>
                  <span className="app-label">{t("cfg.seat")}</span>
                  <ol className="app-cfg-list">
                    {draft.seats.map((seat, i) => (
                      <li key={seat.id} className="app-cfg-row" data-wide="">
                        <span className="app-cfg-n">{i + 1}</span>
                        <Field label={t("cfg.seatRole")} value={seat.role} disabled={!admin} onChange={(e) => editSeat(seat.id, { role: e.target.value })} />
                        <div className="app-field">
                          <label className="app-label" htmlFor={`seat-parent-${seat.id}`}>
                            {t("cfg.seatParent")}
                          </label>
                          <Select id={`seat-parent-${seat.id}`} value={seat.parent ?? ""} disabled={!admin} onChange={(e) => editSeat(seat.id, { parent: e.target.value || null })} options={[{ value: "", label: t("cfg.seatTop") }, ...draft.seats.filter((x) => x.id !== seat.id).map((x) => ({ value: x.id, label: x.role }))]} />
                        </div>
                        <div className="app-field">
                          <label className="app-label" htmlFor={`seat-agent-${seat.id}`}>
                            {t("cfg.seatAgent")}
                          </label>
                          <Select id={`seat-agent-${seat.id}`} value={seat.agent} disabled={!admin} onChange={(e) => editSeat(seat.id, { agent: e.target.value })} options={[{ value: "", label: t("cfg.seatVacant") }, ...s.agentConfigs.map((a) => ({ value: a.id, label: a.name }))]} />
                        </div>
                        <Field label={t("cfg.seatBrief")} value={seat.brief} disabled={!admin} onChange={(e) => editSeat(seat.id, { brief: e.target.value })} />
                        <span className="app-cfg-tools">
                          <IconButton
                            icon="close"
                            size="sm"
                            label={t("cfg.removeSeat", { role: seat.role })}
                            disabled={!admin || draft.seats.length < 2}
                            onClick={() => edit({ seats: draft.seats.filter((x) => x.id !== seat.id).map((x) => (x.parent === seat.id ? { ...x, parent: seat.parent } : x)), peers: draft.peers.filter(([a, b]) => a !== seat.id && b !== seat.id) })}
                          />
                        </span>
                      </li>
                    ))}
                  </ol>
                  <Stack direction="row">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon="plus"
                      disabled={!admin}
                      onClick={() => {
                        const id = `seat-${Math.random().toString(16).slice(2, 6)}`;
                        edit({ seats: [...draft.seats, { id, role: `${t("cfg.seat")} ${draft.seats.length + 1}`, parent: draft.seats.find((x) => x.parent === null)?.id ?? null, agent: "", brief: "" }] });
                      }}
                    >
                      {t("cfg.addSeat")}
                    </Button>
                  </Stack>
                </Stack>
                <Stack gap={2}>
                  <span className="app-label">{t("cfg.peers")}</span>
                  <span className="app-muted">{t("cfg.peersHint")}</span>
                  {draft.peers.length > 0 ? (
                    <List>
                      {draft.peers.map(([a, b]) => (
                        <ListRow key={`${a}-${b}`} as="li" title={t("squads.linkPair", { a: role(a), b: role(b) })} trailing={<IconButton icon="close" size="sm" label={t("cfg.removePeer", { a: role(a), b: role(b) })} disabled={!admin} onClick={() => edit({ peers: draft.peers.filter(([x, y]) => !(x === a && y === b)) })} />} />
                      ))}
                    </List>
                  ) : null}
                  <Stack direction="row" gap={2} align="end" wrap>
                    {[0, 1].map((side) => (
                      <div key={side} className="app-field">
                        <label className="app-label" htmlFor={`peer-${side}`}>
                          {t("cfg.seat")}
                        </label>
                        <Select id={`peer-${side}`} value={peer[side]} disabled={!admin} onChange={(e) => setPeer((p) => (side === 0 ? [e.target.value, p[1]] : [p[0], e.target.value]))} options={[{ value: "", label: "-" }, ...draft.seats.map((x) => ({ value: x.id, label: x.role }))]} />
                      </div>
                    ))}
                    <Button
                      variant="secondary"
                      size="sm"
                      icon="link"
                      disabled={!admin || !peer[0] || !peer[1] || peer[0] === peer[1] || draft.peers.some(([a, b]) => (a === peer[0] && b === peer[1]) || (a === peer[1] && b === peer[0]))}
                      onClick={() => {
                        edit({ peers: [...draft.peers, peer] });
                        setPeer(["", ""]);
                      }}
                    >
                      {t("cfg.addPeer")}
                    </Button>
                  </Stack>
                </Stack>
                <fieldset className="app-cfg-set">
                  <legend className="app-label">{t("cfg.rules")}</legend>
                  <span className="app-muted">{t("cfg.rulesHint")}</span>
                  <Checkbox label={t("cfg.ruleLinked")} checked={draft.rules.linkedOnly} disabled={!admin} onChange={(e) => edit({ rules: { ...draft.rules, linkedOnly: e.target.checked } })} />
                  <Checkbox label={t("cfg.ruleUp")} checked={draft.rules.escalateUp} disabled={!admin} onChange={(e) => edit({ rules: { ...draft.rules, escalateUp: e.target.checked } })} />
                  <Checkbox label={t("cfg.ruleWriters")} checked={draft.rules.editsByWriters} disabled={!admin} onChange={(e) => edit({ rules: { ...draft.rules, editsByWriters: e.target.checked } })} />
                </fieldset>
                {problems.map((p, i) => (
                  <FieldMessage key={i} tone="error">
                    {t(p.key, p.vars)}
                  </FieldMessage>
                ))}
                <SaveBar
                  dirty={dirty}
                  labels={ui.saveBar}
                  saveDisabled={problems.length > 0 || !admin}
                  onDiscard={() => setDraft(structuredClone(saved))}
                  onSave={() => {
                    s.setTemplates((list) => list.map((x) => (x.id === draft.id ? draft : x)));
                    notify(t("cfg.saved", { name: draft.name }));
                  }}
                />
              </Stack>
            </Card>
          </Stack>
        </div>
      </div>
      {starting ? <StartSquad template={saved} onClose={() => setStarting(false)} /> : null}
    </Stack>
  );
}

function StartSquad({ template, onClose }: { template: SquadTemplate; onClose: () => void }): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const free = s.sessions.filter((x) => !x.root && !s.squads.some((q) => q.sessionId === x.id));
  const [sessionId, setSessionId] = useState(free[0]?.id ?? "");
  const [name, setName] = useState(template.name);
  const session = s.sessions.find((x) => x.id === sessionId);
  return (
    <FormDialog
      modal
      busy={false}
      title={t("cfg.startTitle", { name: template.name })}
      labels={ui.formDialogCreate}
      submitLabel={t("cfg.start")}
      submitDisabled={!session || !name.trim()}
      onCancel={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        if (!session) return;
        const squad = squadFrom(template, s.agentConfigs, { id: session.id, project: session.project, name: name.trim(), now: clock(s.now), by: t("squads.eventActivated", { who: s.device }) });
        s.setSquads((list) => [...list, squad]);
        notify(t("cfg.started", { name: squad.name, where: `${session.project} / ${session.branch}` }));
        onClose();
        showInWorkspace(s, session.id, { dock: "squad" });
      }}
    >
      <Stack gap={3}>
        <Field label={t("cfg.startName")} value={name} onChange={(e) => setName(e.target.value)} />
        <div className="app-field">
          <label className="app-label" htmlFor="start-session">
            {t("cfg.startIn")}
          </label>
          <Select id="start-session" value={sessionId} onChange={(e) => setSessionId(e.target.value)} options={free.map((x) => ({ value: x.id, label: `${x.project} / ${x.branch}` }))} />
        </div>
        <span className="app-row">
          {template.seats.map((x) => (
            <Tag key={x.id}>{x.role}</Tag>
          ))}
        </span>
      </Stack>
    </FormDialog>
  );
}
