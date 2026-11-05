import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createStore } from "../data/store";
import type { AuditEvent } from "../data/seed";
import type { Load } from "../data/useLoad";
import { I18nProvider, type Locale } from "../i18n";
import { AuditLogView, auditCsv, filterAudit, type AuditFilters, type AuditLogViewProps } from "./AuditLog";

const events = await createStore().listAudit();
const none: AuditFilters = { actor: "", kinds: new Set(), from: "", to: "" };
const noop = () => {};

function props(over: Partial<AuditLogViewProps> = {}): AuditLogViewProps {
  return {
    state: { status: "ready", data: events } as Load<AuditEvent[]>,
    canExport: true,
    filters: none,
    onFiltersChange: noop,
    page: 1,
    pageSize: 10,
    onPageChange: noop,
    onPageSizeChange: noop,
    onExport: noop,
    onRetry: noop,
    ...over,
  };
}
const render = (locale: Locale, p: AuditLogViewProps) =>
  renderToStaticMarkup(
    <I18nProvider locale={locale}>
      <AuditLogView {...p} />
    </I18nProvider>,
  );

describe("filterAudit", () => {
  it("matches actor text, kinds and an inclusive date range", () => {
    const actor = events[0].actor;
    expect(filterAudit(events, { ...none, actor: actor.toUpperCase() }).every((e) => e.actor === actor)).toBe(true);
    const kind = filterAudit(events, { ...none, kinds: new Set(["roleUpdate"]) });
    expect(kind.length).toBeGreaterThan(0);
    expect(kind.every((e) => e.kind === "roleUpdate")).toBe(true);
    const day = events[0].time.slice(0, 10);
    const same = filterAudit(events, { ...none, from: day, to: day });
    expect(same.length).toBeGreaterThan(0);
    expect(same.every((e) => e.time.slice(0, 10) === day)).toBe(true);
    expect(filterAudit(events, { ...none, from: "2999-01-01" })).toHaveLength(0);
  });
});

describe("auditCsv", () => {
  it("writes a header, one line per event and quotes commas and quotes", () => {
    const csv = auditCsv([{ id: "e1", time: "2026-11-04T00:00:00.000Z", actor: 'Ada, "A"', kind: "signIn", target: "console", ip: "10.0.0.1" }]);
    const lines = csv.trim().split("\n");
    expect(lines[0]).toBe("time,actor,action,target,ip");
    expect(lines[1]).toBe('2026-11-04T00:00:00.000Z,"Ada, ""A""",signIn,console,10.0.0.1');
  });
});

describe("AuditLog", () => {
  for (const locale of ["en", "vi"] as const) {
    it(`ready: a table page, filters, pagination, details (${locale})`, () => {
      const html = render(locale, props());
      expect(html.match(/<h1/g)).toHaveLength(1);
      expect(html.match(/<tbody>[\s\S]*<\/tbody>/)![0].match(/<tr/g)).toHaveLength(10);
      expect(html.match(/type="date"/g)).toHaveLength(2);
      expect(html).toContain(locale === "en" ? "Export CSV" : "Xuất CSV");
      expect(html).toContain("aria-expanded");
    });
    it(`loading and error (${locale})`, () => {
      expect(render(locale, props({ state: { status: "loading" } }))).toContain('aria-busy="true"');
      expect(render(locale, props({ state: { status: "error" } }))).toContain(locale === "en" ? "Try again" : "Thử lại");
    });
  }
  it("a role without audit read gets no export button", () => {
    expect(render("en", props({ canExport: false }))).not.toContain("Export CSV");
  });
  it("no match shows the empty state", () => {
    expect(render("en", props({ filters: { ...none, actor: "zzzz" } }))).toContain("No events match");
  });
});
