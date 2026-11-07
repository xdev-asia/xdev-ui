import type { JSX } from "react";
import { Button, EmptyState } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { href, navigate } from "../router";

export function NotFoundPage(): JSX.Element {
  const { t } = useI18n();
  return (
    <EmptyState
      size="center"
      icon="search"
      title={t("app.notFoundTitle")}
      hint={t("app.notFoundHint")}
      actions={<Button variant="primary" onClick={() => navigate(href.home)}>{t("app.goHome")}</Button>}
    />
  );
}
