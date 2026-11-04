import type { JSX } from "react";
import { Banner, Button, Card, EmptyState, ListRow, Meter, PageHeader, Spinner, StatTile } from "@xdev-asia/ui";
import { useStore } from "../data/context";
import type { DashboardData } from "../data/store";
import { useLoad, type Load } from "../data/useLoad";
import { useI18n } from "../i18n";
import { hrefFor, navigate } from "../router";

export interface DashboardViewProps {
  state: Load<DashboardData>;
  onRetry: () => void;
}

export function DashboardView({ state, onRetry }: DashboardViewProps): JSX.Element {
  const { t, ui, num, date } = useI18n();
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
          <div className="app-grid app-grid-wide">
            <Card title={t("dashboard.recentActivity")} actions={<Button variant="secondary" onClick={() => navigate(hrefFor.audit())}>{t("dashboard.viewAudit")}</Button>} flush>
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
            <Card title={t("dashboard.usage")}>
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
  return <DashboardView state={state} onRetry={reload} />;
}
