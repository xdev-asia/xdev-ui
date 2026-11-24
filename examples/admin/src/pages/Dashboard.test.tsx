import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createStore } from "../data/store";
import type { Load } from "../data/useLoad";
import type { DashboardData } from "../data/store";
import { I18nProvider, type Locale } from "../i18n";
import { DashboardView, trend } from "./Dashboard";

const data = await createStore().dashboard();
const render = (locale: Locale, state: Load<DashboardData>) =>
  renderToStaticMarkup(
    <I18nProvider locale={locale}>
      <DashboardView state={state} onRetry={() => {}} />
    </I18nProvider>,
  );

describe("Dashboard", () => {
  for (const locale of ["en", "vi"] as const) {
    it(`renders four stat tiles, a trend, two breakdowns and two cards when ready (${locale})`, () => {
      const html = render(locale, { status: "ready", data });
      expect(html.match(/class="x-stat"/g)).toHaveLength(4);
      expect(html.match(/<section class="x-card"/g)).toHaveLength(5);
      expect(html).toContain(locale === "en" ? "Visits by source" : "Lượt truy cập theo nguồn");
      expect(html.match(/<h1/g)).toHaveLength(1);
      expect(html).toContain(locale === "en" ? "Active users" : "Người dùng đang hoạt động");
      expect(html).not.toContain("aria-busy");
    });
    it(`shows spinners while loading (${locale})`, () => {
      const html = render(locale, { status: "loading" });
      expect(html.match(/aria-busy="true"/g)).toHaveLength(4);
      expect(html).toContain(locale === "en" ? ">Loading…<" : ">Đang tải…<");
    });
    it(`shows a banner with one retry action on error (${locale})`, () => {
      const html = render(locale, { status: "error" });
      expect(html).toContain(locale === "en" ? "Could not load this page" : "Không tải được trang này");
      expect(html).toContain(locale === "en" ? "Try again" : "Thử lại");
      expect(html).not.toContain("x-stat");
    });
  }
  it("names the recent events and their actors", () => {
    const html = render("en", { status: "ready", data });
    expect(html).toContain(data.recent[0]!.actor);
  });
  it("uses a good tone for growth and a bad tone for failed sign-ins", () => {
    const html = render("en", { status: "ready", data });
    expect(html).toContain('data-tone="bad"');
    expect(html).toContain('data-tone="good"');
  });
});

describe("trend", () => {
  it("gives one point per bucket and sparse ticks", () => {
    const unit = (n: number) => `${n} visits`;
    expect(trend("week", "en", unit).ticks).toHaveLength(7);
    const month = trend("month", "en", unit);
    expect(month.points).toHaveLength(30);
    expect(month.ticks.length).toBeLessThanOrEqual(7);
    expect(trend("year", "vi", unit).ticks).toHaveLength(6);
    expect(month.points[0]!.label).toMatch(/visits$/);
  });
});
