import type { JSX } from "react";
import { Button, EmptyState } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { Illustration } from "../parts/Illustration";
import { hrefFor, type ExceptionCode } from "../router";
import { NotFoundPage } from "./NotFound";

/** Whole-page status views: no access (403), not found (404) and a server failure (500). */
export function ExceptionPage({ code, onRetry }: { code: ExceptionCode | "unknown"; onRetry?: () => void }): JSX.Element {
  const { t } = useI18n();
  // As react-antd-admin: a menu entry whose component does not exist shows the 404 page.
  if (code === "404" || code === "unknown") return <NotFoundPage />;
  const home = (
    <Button variant={code === "500" ? "secondary" : "primary"} href={hrefFor.dashboard()}>
      {t("app.goDashboard")}
    </Button>
  );
  return code === "403" ? (
    <EmptyState size="center" headingLevel={1} icon="lock" art={<Illustration scene="forbidden" />} figure="403" title={t("exception.forbiddenTitle")} hint={t("exception.forbiddenHint")} actions={home} />
  ) : (
    <EmptyState
      size="center"
      headingLevel={1}
      icon="alert"
      art={<Illustration scene="server-error" />}
      figure="500"
      title={t("exception.serverTitle")}
      hint={t("exception.serverHint")}
      actions={
        <>
          {home}
          <Button variant="primary" onClick={onRetry ?? (() => window.location.reload())}>
            {t("app.retry")}
          </Button>
        </>
      }
    />
  );
}
