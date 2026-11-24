import type { JSX } from "react";
import { Button, Card, DescriptionList, PageHeader, Tag } from "@xdev-asia/ui";
import { useI18n } from "../i18n";

/** What the about page lists; fixed for the demo, a real app reads it from its build. */
export const ABOUT = {
  version: "4.1.0",
  license: "Apache-2.0",
  built: "2026-11-24T06:00:00Z",
  docs: "https://ui.xdev.asia",
  source: "https://github.com/xdev-asia/xdev-ui",
  dependencies: ["react 19", "react-dom 19", "@xdev-asia/ui"],
  devDependencies: ["vite 8", "typescript 7", "vitest 5", "@vitejs/plugin-react 6"],
};

export function AboutPage(): JSX.Element {
  const { t, date } = useI18n();
  return (
    <>
      <PageHeader title={t("about.title")} description={t("about.description")} />
      <div className="app-stack">
        <Card headingLevel={2} title={t("about.project")} subtitle={t("about.summary")}>
          <DescriptionList
            items={[
              { term: t("about.version"), value: <span translate="no">{ABOUT.version}</span>, mono: true },
              { term: t("about.license"), value: ABOUT.license },
              { term: t("about.built"), value: date(ABOUT.built, true) },
              {
                term: t("about.docs"),
                value: (
                  <Button variant="link" href={ABOUT.docs} target="_blank" rel="noreferrer">
                    ui.xdev.asia
                  </Button>
                ),
              },
              {
                term: t("about.source"),
                value: (
                  <Button variant="link" href={ABOUT.source} target="_blank" rel="noreferrer">
                    github.com/xdev-asia/xdev-ui
                  </Button>
                ),
              },
            ]}
          />
        </Card>
        <div className="app-grid app-grid-wide">
          <Card headingLevel={2} title={t("about.dependencies")}>
            <div className="app-chips">
              {ABOUT.dependencies.map((d) => (
                <Tag key={d}>
                  <span translate="no">{d}</span>
                </Tag>
              ))}
            </div>
          </Card>
          <Card headingLevel={2} title={t("about.devDependencies")}>
            <div className="app-chips">
              {ABOUT.devDependencies.map((d) => (
                <Tag key={d}>
                  <span translate="no">{d}</span>
                </Tag>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
