import type { JSX } from "react";
import { Button, EmptyState } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { hrefFor } from "../router";
import { Illustration } from "../parts/Illustration";

export function NotFoundPage(): JSX.Element {
  const { t } = useI18n();
  return (
    <EmptyState
      size="center"
      headingLevel={1}
      icon="search"
      art={<Illustration scene="not-found" />}
      figure="404"
      title={t("app.notFoundTitle")}
      hint={t("app.notFoundHint")}
      actions={<Button variant="primary" href={hrefFor.dashboard()}>{t("app.goDashboard")}</Button>}
    />
  );
}
