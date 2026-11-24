import type { JSX } from "react";
import { Button, Card, PageHeader } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import type { NESTED } from "../router";

const NAMES = { "menu1-1": "nav.menu11", "menu1-2": "nav.menu12", menu2: "nav.menu2" } as const;

/** A leaf of the nested-menu demo. */
export function NestedPage({ leaf }: { leaf: (typeof NESTED)[number] }): JSX.Element {
  const { t } = useI18n();
  return <PageHeader title={t(NAMES[leaf])} description={t("nested.hint")} />;
}

export const DOCS_URL = "https://ui.xdev.asia";

/** Another site inside the console, with a way out to a full tab. */
export function DocsPage(): JSX.Element {
  const { t } = useI18n();
  return (
    <>
      <PageHeader
        title={t("docs.title")}
        description={t("docs.description")}
        actions={
          <Button variant="secondary" icon="external" href={DOCS_URL} target="_blank" rel="noreferrer">
            {t("docs.openNew")}
          </Button>
        }
      />
      <Card flush>
        <iframe className="app-frame" src={DOCS_URL} title={t("docs.frame")} loading="lazy" referrerPolicy="no-referrer" />
      </Card>
    </>
  );
}
