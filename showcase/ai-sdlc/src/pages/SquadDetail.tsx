import { useState, type JSX } from "react";
import { AgentChip, Banner, Button, Card, Dialog, Drawer, EmptyState, FieldMessage, List, ListRow, PageHeader, Stack, StatusDot, Tag } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { EscalationDialog } from "../parts/EscalationDialog";
import { SeatChart } from "../parts/SeatChart";
import { SeatPanel } from "../parts/SeatPanel";
import { can, useStore } from "../store";
import { openEscalations, roleOf, seatCounts, type Squad } from "../squads";
import { clock } from "../workspace";
import { ago } from "./Squads";

/** One squad: its seats as a tree, what waits for an answer, what happened last, and the switch that stops it. */
export function SquadDetail({ squad }: { squad: Squad }): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [seatId, setSeatId] = useState<string | null>(null);
  const [escalationId, setEscalationId] = useState<string | null>(null);
  const [panel, setPanel] = useState<"activity" | "links" | "violations" | null>(null);
  const [stopping, setStopping] = useState(false);

  const operator = can(s.role, "operator");
  const active = squad.state === "active";
  const counts = seatCounts(squad);
  const waiting = active ? openEscalations(squad) : [];
  const seat = squad.seats.find((x) => x.id === seatId);
  const escalation = waiting.find((e) => e.id === escalationId);
  const recent = [...squad.events].reverse();

  const setState = (state: Squad["state"]): void => {
    const event = t(state === "active" ? "squads.eventActivated" : "squads.eventDeactivated", { who: s.device });
    s.setSquads((all) => all.map((q) => (q.id === squad.id ? { ...q, state, events: [...q.events, { at: clock(s.now), text: event }] } : q)));
    notify(t(state === "active" ? "squads.activated" : "squads.deactivated", { name: squad.name }));
  };

  return (
    <Stack gap={4}>
      <PageHeader
        title={squad.name}
        breadcrumb={
          <Button variant="link" icon="arrow-left" onClick={() => s.setSquadId(null)}>
            {t("squads.back")}
          </Button>
        }
        meta={
          <span className="app-row">
            <Tag>{t("squads.topologyHierarchy")}</Tag>
            <Tag>{squad.project}</Tag>
            <Tag>{t("squads.started", { when: ago(squad.startedMin, t) })}</Tag>
            <Tag tone={active ? "default" : "warn"}>{t(active ? "squads.stateActive" : "squads.stateInactive")}</Tag>
          </span>
        }
        actions={
          <>
            <Button variant="secondary" icon="activity" onClick={() => setPanel("activity")}>
              {t("squads.activity")}
            </Button>
            <Button variant="secondary" icon="link" onClick={() => setPanel("links")}>
              {t("squads.links", { n: squad.links.length })}
            </Button>
            {active ? (
              <Button variant="danger" icon="stop" disabled={!operator} onClick={() => setStopping(true)}>
                {t("squads.deactivate")}
              </Button>
            ) : (
              <Button variant="secondary" icon="play" disabled={!operator} onClick={() => setState("active")}>
                {t("squads.activate")}
              </Button>
            )}
          </>
        }
      />
      {!operator ? <FieldMessage tone="info">{t("roles.needOperator", { role: t(`roles.${s.role}`) })}</FieldMessage> : null}
      {!active ? <Banner tone="info" title={t("squads.inactiveTitle")}>{t("squads.inactiveHint")}</Banner> : null}

      <div className="app-row">
        <Tag>
          <StatusDot tone={active ? "ok" : "neutral"} label={t("squads.active", { n: counts.active })} />
        </Tag>
        {counts.vacant > 0 ? <Tag tone="warn">{t("squads.vacantCount", { n: counts.vacant })}</Tag> : null}
        <Button variant="ghost" size="sm" icon="shield" onClick={() => setPanel("violations")}>
          {t("squads.violations", { n: squad.violations.length })}
        </Button>
      </div>

      <div className="app-split">
        <div className="app-col-wide">
          <Card>
            <Stack gap={3}>
              <SeatChart squad={squad} selected={seatId} onPick={setSeatId} />
              <p className="app-muted">{t("squads.chartHint")}</p>
            </Stack>
          </Card>
        </div>
        <div className="app-col-narrow">
          <Stack gap={4}>
            <Card flush title={t("squads.escalations")} titleAside={waiting.length > 0 ? <Tag tone="warn">{waiting.length}</Tag> : undefined} headingLevel={2}>
              {waiting.length === 0 ? (
                <EmptyState size="inline" title={t("squads.escalationsNone")} />
              ) : (
                <List>
                  {waiting.map((e) => {
                    const from = squad.seats.find((x) => x.id === e.from)?.agent;
                    return (
                      <ListRow
                        key={e.id}
                        as="li"
                        onClick={() => setEscalationId(e.id)}
                        leading={from ? <AgentChip profile={from.profile} letter={from.letter} title={from.name} /> : undefined}
                        title={t("squads.route", { from: roleOf(squad, e.from), to: roleOf(squad, e.to) })}
                        meta={e.text}
                        trailing={<span className="app-muted">{t("squads.waited", { n: e.waitedMin })}</span>}
                      />
                    );
                  })}
                </List>
              )}
            </Card>
            <Card flush title={t("squads.recent")} headingLevel={2}>
              <List>
                {recent.slice(0, 4).map((e, i) => (
                  <ListRow key={i} as="li" title={e.text} meta={e.at} />
                ))}
              </List>
            </Card>
          </Stack>
        </div>
      </div>
      <FieldMessage tone="info">{t("squads.openPoints")}</FieldMessage>

      {seat ? <SeatPanel key={seat.id} squad={squad} seat={seat} onClose={() => setSeatId(null)} /> : null}
      {escalation ? <EscalationDialog squad={squad} escalation={escalation} onClose={() => setEscalationId(null)} /> : null}
      {panel === "activity" ? (
        <Drawer modal title={t("squads.activityOf", { name: squad.name })} labels={ui.drawer} onClose={() => setPanel(null)}>
          <List>
            {recent.map((e, i) => (
              <ListRow key={i} as="li" title={e.text} meta={e.at} />
            ))}
          </List>
        </Drawer>
      ) : null}
      {panel === "links" ? (
        <Drawer modal title={t("squads.linksOf", { name: squad.name })} labels={ui.drawer} onClose={() => setPanel(null)}>
          <List>
            {squad.links.map((l) => (
              <ListRow key={`${l.a}-${l.b}`} as="li" title={t("squads.linkPair", { a: roleOf(squad, l.a), b: roleOf(squad, l.b) })} trailing={<Tag>{t(l.kind === "reports" ? "squads.linkReports" : "squads.linkPeer")}</Tag>} />
            ))}
          </List>
        </Drawer>
      ) : null}
      {panel === "violations" ? (
        <Drawer modal title={t("squads.violationsOf", { name: squad.name })} labels={ui.drawer} onClose={() => setPanel(null)}>
          {squad.violations.length === 0 ? (
            <EmptyState size="inline" icon="shield" title={t("squads.violationsNone")} />
          ) : (
            <List>
              {squad.violations.map((v, i) => (
                <ListRow key={i} as="li" title={v} />
              ))}
            </List>
          )}
        </Drawer>
      ) : null}
      {stopping ? (
        <Dialog
          alert
          modal
          tone="danger"
          busy={false}
          title={t("squads.deactivateTitle", { name: squad.name })}
          confirmLabel={t("squads.deactivate")}
          cancelLabel={t("add.cancel")}
          onCancel={() => setStopping(false)}
          onConfirm={() => {
            setState("inactive");
            setStopping(false);
          }}
        >
          {t("squads.deactivateBody")}
        </Dialog>
      ) : null}
    </Stack>
  );
}
