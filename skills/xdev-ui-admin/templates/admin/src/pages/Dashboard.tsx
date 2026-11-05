import type { JSX } from "react";
import { Banner, Button, Card, EmptyState, ListRow, PageHeader, Spinner, StatTile } from "@xdev-asia/ui";
import { useStore } from "../data/context";
import type { Summary } from "../data/store";
import { useLoad, type Load } from "../data/useLoad";
import { useI18n } from "../i18n";
import { href, navigate } from "../router";

export interface DashboardViewProps {
  state: Load<Summary>;
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
        <Banner title={t("app.loadFailed")} action={<Button variant="secondary" onClick={onRetry}>{t("app.retry")}</Button>}>
          {t("app.loadFailedHint")}
        </Banner>
      ) : (
        <div className="app-stack">
          <div className="app-grid">
            <StatTile labels={ui.statTile} loading={loading} label={t("dashboard.total")} value={data ? num(data.total) : ""} />
            <StatTile labels={ui.statTile} loading={loading} label={t("dashboard.active")} value={data ? num(data.active) : ""} />
            <StatTile labels={ui.statTile} loading={loading} label={t("dashboard.archived")} value={data ? num(data.archived) : ""} />
          </div>
          <Card title={t("dashboard.recent")} actions={<Button variant="secondary" onClick={() => navigate(href.items)}>{t("dashboard.viewItems")}</Button>} flush>
            {loading ? (
              <div className="app-pane"><Spinner size="md" label={ui.spinner.loading} /></div>
            ) : data && data.recent.length ? (
              <ul className="app-list">
                {data.recent.map((i) => (
                  <ListRow as="li" key={i.id} title={i.name} meta={`${i.owner} · ${date(i.updated, true)}`} />
                ))}
              </ul>
            ) : (
              <EmptyState size="inline" title={t("dashboard.recentEmpty")} />
            )}
          </Card>
        </div>
      )}
    </>
  );
}

export function DashboardPage(): JSX.Element {
  const store = useStore();
  const { state, reload } = useLoad(() => store.summary(), [store]);
  return <DashboardView state={state} onRetry={reload} />;
}
