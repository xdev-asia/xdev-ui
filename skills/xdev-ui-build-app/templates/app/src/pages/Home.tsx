import type { JSX } from "react";
import { Button, EmptyState, PageHeader } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";

/** Every page has three states: loading, error and empty. Add the first two when this page reads data. */
export function HomePage(): JSX.Element {
  const { t } = useI18n();
  const notify = useNotify();
  return (
    <>
      <PageHeader title={t("home.title")} description={t("home.description")} />
      <EmptyState
        size="inline"
        icon="plus"
        title={t("home.emptyTitle")}
        hint={t("home.emptyHint")}
        actions={<Button variant="primary" onClick={() => notify(t("home.created"))}>{t("home.create")}</Button>}
      />
    </>
  );
}
