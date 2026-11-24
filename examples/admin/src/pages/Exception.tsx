import type { JSX } from "react";
import { Button, EmptyState } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { SpotArt } from "../parts/SpotArt";
import { hrefFor, type ExceptionCode } from "../router";
import { NotFoundPage } from "./NotFound";

/** Whole-page status views: no access (403), not found (404) and a server failure (500). */
export function ExceptionPage({ code, onRetry }: { code: ExceptionCode | "unknown"; onRetry?: () => void }): JSX.Element {
  const { t } = useI18n();
  if (code === "404") return <NotFoundPage />;
  const home = (
    <Button variant={code === "500" ? "secondary" : "primary"} href={hrefFor.dashboard()}>
      {t("app.goDashboard")}
    </Button>
  );
  if (code === "unknown") return <EmptyState size="center" icon="help" art={<SpotArt icon="file-code" badge="help" />} title={t("exception.unknownTitle")} hint={t("exception.unknownHint")} actions={home} />;
  return code === "403" ? (
    <EmptyState size="center" icon="lock" art={<SpotArt icon="shield" badge="lock" tone="warn" />} figure="403" title={t("exception.forbiddenTitle")} hint={t("exception.forbiddenHint")} actions={home} />
  ) : (
    <EmptyState
      size="center"
      icon="alert"
      art={<SpotArt icon="server" badge="alert" tone="danger" />}
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
