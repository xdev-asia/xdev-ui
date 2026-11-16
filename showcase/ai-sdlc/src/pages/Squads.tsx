import type { JSX } from "react";
import { Button, Card, DescriptionList, EmptyState, Grid, PageHeader, Stack, Tag } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { inProject, useStore } from "../store";
import { openEscalations, seatCounts } from "../squads";
import { SquadDetail } from "./SquadDetail";

/** Pure: "41 min ago" below an hour, "25 h ago" from there on. */
export function ago(min: number, t: ReturnType<typeof useI18n>["t"]): string {
  return min < 60 ? t("squads.agoMin", { n: min }) : t("squads.agoHours", { n: Math.round(min / 60) });
}

/** The squads of the chosen project, or one squad when one is open. */
export function SquadsPage(): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  const squad = s.squads.find((q) => q.id === s.squadId);
  if (squad) return <SquadDetail key={squad.id} squad={squad} />;

  const list = s.squads.filter((q) => inProject(s.project, q.project));
  return (
    <Stack gap={4}>
      <PageHeader title={t("squads.title")} description={t("squads.description")} />
      {list.length === 0 ? (
        <EmptyState size="center" icon="bot" title={t("squads.none")} />
      ) : (
        <Grid minItemWidth="18rem">
          {list.map((q) => {
            const counts = seatCounts(q);
            const waiting = q.state === "active" ? openEscalations(q).length : 0;
            return (
              <Card
                key={q.id}
                title={q.name}
                titleAside={<Tag tone={q.state === "active" && waiting > 0 ? "warn" : "default"}>{t(q.state === "active" ? "squads.stateActive" : "squads.stateInactive")}</Tag>}
                subtitle={`${t("squads.topologyHierarchy")} · ${q.project} · ${t("squads.started", { when: ago(q.startedMin, t) })}`}
                headingLevel={2}
              >
                <Stack gap={3}>
                  <DescriptionList
                    layout="columns"
                    items={[
                      { term: t("squads.statSeats"), value: q.seats.length },
                      { term: t("squads.statActive"), value: counts.active },
                      { term: t("squads.statVacant"), value: counts.vacant },
                      { term: t("squads.statEscalations"), value: waiting },
                    ]}
                  />
                  <Stack direction="row">
                    <Button variant="secondary" onClick={() => s.setSquadId(q.id)}>
                      {t("squads.open")}
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            );
          })}
        </Grid>
      )}
    </Stack>
  );
}
