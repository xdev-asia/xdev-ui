import { useState, type JSX } from "react";
import { Button, Card, PageHeader, Spinner } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { EMBEDS, type EmbedId, type NESTED } from "../router";

const NAMES = { "menu1-1": "nav.menu11", "menu1-2": "nav.menu12", menu2: "nav.menu2" } as const;

/** A leaf of the nested-menu demo. */
export function NestedPage({ leaf }: { leaf: (typeof NESTED)[number] }): JSX.Element {
  const { t } = useI18n();
  return <PageHeader title={t(NAMES[leaf])} description={t(leaf === "menu2" ? "nested.hint2" : "nested.hint")} />;
}

/** Another site inside the console (Outside pages, Embedded), with a way out to a full tab. */
export function EmbedPage({ id }: { id: EmbedId }): JSX.Element {
  // Until the embedded site answers, the card shows a spinner instead of an empty frame.
  const [loaded, setLoaded] = useState(false);
  const { t } = useI18n();
  const url = EMBEDS[id];
  const name = t(id === "docs" ? "nav.docs" : "nav.storybook");
  return (
    <>
      <PageHeader
        title={name}
        description={t("docs.description")}
        actions={
          <Button variant="secondary" icon="external" href={url} target="_blank" rel="noreferrer">
            {t("docs.openNew")}
          </Button>
        }
      />
      <Card flush>
        <div className="app-frame-wrap">
          {loaded ? null : (
            <div className="app-frame-loading">
              <Spinner size="md" label={t("shell.loadingPage")} />
            </div>
          )}
          <iframe className="app-frame" src={url} title={name} loading="lazy" referrerPolicy="no-referrer" onLoad={() => setLoaded(true)} />
        </div>
      </Card>
    </>
  );
}
