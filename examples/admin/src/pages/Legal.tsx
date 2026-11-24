import type { JSX } from "react";
import { BrandMark, Button, Container, Prose } from "@xdev-asia/ui";
import { useI18n, type MessageKey } from "../i18n";
import { hrefFor, type LegalPage } from "../router";

const BODY: Record<LegalPage, MessageKey[]> = {
  privacy: ["legal.privacy1", "legal.privacy2", "legal.privacy3"],
  terms: ["legal.terms1", "legal.terms2", "legal.terms3"],
};

/** Privacy policy and terms of service: public pages, open before signing in, as in react-antd-admin. */
export function LegalView({ page, signedIn }: { page: LegalPage; signedIn: boolean }): JSX.Element {
  const { t } = useI18n();
  return (
    <main className="app-legal">
      <Container size="md">
        <div className="app-stack">
          <a className="app-legal-brand" href={hrefFor.dashboard()}>
            <BrandMark size={24} />
            <span translate="no">{t("app.name")}</span>
          </a>
          <Prose>
            <h1>{t(page === "privacy" ? "legal.privacy" : "legal.terms")}</h1>
            <p className="app-muted">{t("legal.updated")}</p>
            {BODY[page].map((k) => (
              <p key={k}>{t(k)}</p>
            ))}
          </Prose>
          <div>
            <Button variant="secondary" icon="arrow-left" href={signedIn ? hrefFor.dashboard() : hrefFor.signIn()}>
              {signedIn ? t("app.goDashboard") : t("legal.back")}
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
