import { useState, type JSX } from "react";
import { Banner, BarChart, Button, Card, EmptyState, ListRow, Meter, PageHeader, Segmented, Spinner, StatTile, TimeSeriesChart } from "@xdev-asia/ui";
import { categoryShare, visitSeries, visitsBySource, type Channel, type Period } from "../data/catalog";
import { useStore } from "../data/context";
import type { DashboardData } from "../data/store";
import { useLoad, type Load } from "../data/useLoad";
import { useI18n, type Locale } from "../i18n";
import { hrefFor, initialParam, replaceQuery } from "../router";

export interface DashboardViewProps {
  state: Load<DashboardData>;
  onRetry: () => void;
  initialPeriod?: Period;
  initialChannel?: Channel;
  /** A chart filter changed; the page writes it to the URL. */
  onFilterChange?: (patch: { period?: Period; channel?: Channel }) => void;
}

const PERIODS: Period[] = ["week", "month", "year"];
const CHANNELS: Channel[] = ["all", "online", "store"];

/** Pure: chart points and sparse axis ticks for a period, formatted for the locale. */
export function trend(period: Period, locale: Locale, unit: (n: number) => string): { points: { key: string; value: number; label: string }[]; ticks: { index: number; label: string }[] } {
  const series = visitSeries(period);
  const axis = new Intl.DateTimeFormat(locale, period === "year" ? { month: "short", timeZone: "UTC" } : period === "week" ? { weekday: "short", timeZone: "UTC" } : { day: "numeric", month: "short", timeZone: "UTC" });
  const full = new Intl.DateTimeFormat(locale, period === "year" ? { month: "long", year: "numeric", timeZone: "UTC" } : { dateStyle: "medium", timeZone: "UTC" });
  const every = period === "month" ? 6 : period === "year" ? 2 : 1;
  return {
    points: series.map((s) => ({ key: String(s.at), value: s.value, label: `${full.format(s.at)}, ${unit(s.value)}` })),
    ticks: series.flatMap((s, index) => (index % every === 0 ? [{ index, label: axis.format(s.at) }] : [])),
  };
}

export function DashboardView({ state, onRetry, initialPeriod = "week", initialChannel = "all", onFilterChange }: DashboardViewProps): JSX.Element {
  const { t, ui, num, date, locale } = useI18n();
  const [period, setPeriodState] = useState<Period>(initialPeriod);
  const [channel, setChannelState] = useState<Channel>(initialChannel);
  const setPeriod = (p: Period): void => {
    setPeriodState(p);
    onFilterChange?.({ period: p });
  };
  const setChannel = (c: Channel): void => {
    setChannelState(c);
    onFilterChange?.({ channel: c });
  };
  const visits = trend(period, locale, (n) => t("dashboard.visitsMax", { n: num(n) }));
  const peak = Math.max(...visits.points.map((p) => p.value));
  const data = state.status === "ready" ? state.data : null;
  const loading = state.status === "loading";
  return (
    <>
      <PageHeader title={t("dashboard.title")} description={t("dashboard.description")} />
      {state.status === "error" ? (
        <div className="app-stack">
          <Banner title={t("app.loadFailed")} action={<Button variant="secondary" onClick={onRetry}>{t("app.retry")}</Button>}>
            {t("app.loadFailedHint")}
          </Banner>
        </div>
      ) : (
        <div className="app-stack">
          <div className="app-grid">
            <StatTile labels={ui.statTile} loading={loading} label={t("dashboard.activeUsers")} value={data ? num(data.activeUsers) : ""} delta="+4%" deltaTrend="up" deltaTone="good" hint={t("dashboard.vsLastWeek")} />
            <StatTile labels={ui.statTile} loading={loading} label={t("dashboard.signIns")} value={data ? num(data.signIns) : ""} delta="+12%" deltaTrend="up" deltaTone="good" hint={t("dashboard.vsLastWeek")} />
            <StatTile labels={ui.statTile} loading={loading} label={t("dashboard.failedSignIns")} value={data ? num(data.failedSignIns) : ""} delta="+8%" deltaTrend="up" deltaTone="bad" hint={t("dashboard.vsLastWeek")} />
            <StatTile labels={ui.statTile} loading={loading} label={t("dashboard.storage")} value={data ? `${num(data.storageGb)} GB` : ""} hint={t("dashboard.storageHint")}>
              {data ? <Meter value={data.storageGb} warnAt={80} label={t("dashboard.storage")} /> : null}
            </StatTile>
          </div>
          <Card headingLevel={2}
            title={t("dashboard.visits")}
            titleAside={<Segmented label={t("dashboard.period")} value={period} onChange={(v) => setPeriod(v as Period)} options={PERIODS.map((p) => ({ value: p, label: t(`dashboard.${p}`) }))} />}
          >
            {loading ? (
              <div className="app-pane"><Spinner size="md" label={ui.spinner.loading} /></div>
            ) : (
              <TimeSeriesChart label={t("dashboard.visits")} points={visits.points} ticks={visits.ticks} maxLabel={num(peak)} zeroLabel={num(0)} />
            )}
          </Card>
          <div className="app-grid app-grid-wide">
            <Card headingLevel={2} title={t("dashboard.bySource")}>
              <BarChart
                label={t("dashboard.bySource")}
                bars={visitsBySource().map((s) => ({ key: s.source, label: t(`sources.${s.source}`), value: s.value, valueLabel: num(s.value) }))}
              />
            </Card>
            <Card headingLevel={2}
              title={t("dashboard.share")}
              subtitle={t("dashboard.shareHint")}
              titleAside={<Segmented label={t("dashboard.channel")} value={channel} onChange={(v) => setChannel(v as Channel)} options={CHANNELS.map((c) => ({ value: c, label: t(`channels.${c}`) }))} />}
            >
              <BarChart
                label={`${t("dashboard.share")}, ${t(`channels.${channel}`)}`}
                bars={categoryShare(channel).map((c) => ({ key: c.category, label: t(`categories.${c.category}`), value: c.value, valueLabel: `${num(c.value)}%` }))}
              />
            </Card>
          </div>
          <div className="app-grid app-grid-wide">
            <Card headingLevel={2} title={t("dashboard.recentActivity")} actions={<Button variant="secondary" href={hrefFor.audit()}>{t("dashboard.viewAudit")}</Button>} flush>
              {loading ? (
                <div className="app-pane"><Spinner size="md" label={ui.spinner.loading} /></div>
              ) : data && data.recent.length ? (
                <ul className="app-list">
                  {data.recent.map((e) => (
                    <ListRow as="li" key={e.id} title={t(`audit.actions.${e.kind}`)} meta={`${e.actor} · ${date(e.time, true)}`} />
                  ))}
                </ul>
              ) : (
                <EmptyState size="inline" title={t("dashboard.recentActivityEmpty")} />
              )}
            </Card>
            <Card headingLevel={2} title={t("dashboard.usage")}>
              {loading ? (
                <div className="app-pane"><Spinner size="md" label={ui.spinner.loading} /></div>
              ) : (
                <div className="app-stack">
                  {data?.byRole.map((r) => (
                    <Meter key={r.role} label={t(`roles.names.${r.role}`)} value={Math.round((r.count / Math.max(1, data.byRole.reduce((n, x) => n + x.count, 0))) * 100)} />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

export function DashboardPage(): JSX.Element {
  const store = useStore();
  const { state, reload } = useLoad(() => store.dashboard(), [store]);
  const period = initialParam("period");
  const channel = initialParam("channel");
  return (
    <DashboardView
      state={state}
      onRetry={reload}
      initialPeriod={PERIODS.includes(period as Period) ? (period as Period) : undefined}
      initialChannel={CHANNELS.includes(channel as Channel) ? (channel as Channel) : undefined}
      onFilterChange={(patch) => replaceQuery(patch)}
    />
  );
}
