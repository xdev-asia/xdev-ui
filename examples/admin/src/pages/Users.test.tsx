import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { seedRoles, seedUsers } from "../data/seed";
import type { Load } from "../data/useLoad";
import { I18nProvider, type Locale } from "../i18n";
import { filterUsers, roleCounts, statusCounts, UsersView, type UserFilters, type UsersViewProps } from "./Users";

const users = seedUsers();
const roles = seedRoles();
const none: UserFilters = { query: "", statuses: new Set(), roles: new Set() };
const noop = () => {};

function props(over: Partial<UsersViewProps> = {}): UsersViewProps {
  return {
    state: { status: "ready", data: users } as Load<typeof users>,
    viewer: { role: "owner" },
    roles,
    filters: none,
    onFiltersChange: noop,
    sort: null,
    onSortChange: noop,
    page: 1,
    pageSize: 20,
    onPageChange: noop,
    onPageSizeChange: noop,
    selected: new Set(),
    onSelectedChange: noop,
    onCreate: noop,
    onSuspend: noop,
    onDelete: noop,
    onRetry: noop,
    ...over,
  };
}
const render = (locale: Locale, p: UsersViewProps) =>
  renderToStaticMarkup(
    <I18nProvider locale={locale}>
      <UsersView {...p} />
    </I18nProvider>,
  );

describe("filterUsers", () => {
  it("matches name or email, case-insensitively", () => {
    expect(filterUsers(users, { ...none, query: "ADMIN@" }).map((u) => u.id)).toEqual(["u1"]);
    expect(filterUsers(users, { ...none, query: "grace hopper" }).length).toBeGreaterThan(0);
  });
  it("combines status and role", () => {
    const r = filterUsers(users, { ...none, statuses: new Set(["invited"]), roles: new Set(["viewer"]) });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((u) => u.status === "invited" && u.role === "viewer")).toBe(true);
    const two = filterUsers(users, { ...none, roles: new Set(["owner", "admin"]) });
    expect(new Set(two.map((u) => u.role))).toEqual(new Set(["owner", "admin"]));
  });
  it("counts roles with the other filters applied", () => {
    const all = roleCounts(users, { ...none, roles: new Set(["owner"]) });
    expect(all.owner + all.admin + all.editor + all.viewer).toBe(57);
    const invited = roleCounts(users, { ...none, statuses: new Set(["invited"]) });
    expect(invited.owner).toBe(0);
  });
  it("counts statuses with the other filters applied", () => {
    const c = statusCounts(users, { ...none, roles: new Set(["owner"]) });
    expect(c).toEqual({ active: 1, invited: 0, suspended: 0 });
    expect(statusCounts(users, none).active + statusCounts(users, none).invited + statusCounts(users, none).suspended).toBe(57);
  });
});

describe("UsersView", () => {
  for (const locale of ["en", "vi"] as const) {
    it(`renders the first page with 20 rows and a range (${locale})`, () => {
      const html = render(locale, props());
      expect(html.match(/<tbody>.*<\/tbody>/)![0].match(/<tr/g)).toHaveLength(20);
      expect(html).toContain(locale === "en" ? "1–20 of 57" : "1–20 trên 57");
      expect(html).toContain(locale === "en" ? "Create user" : "Tạo người dùng");
      expect(html.match(/<h1/g)).toHaveLength(1);
    });
    it(`shows loading and error states (${locale})`, () => {
      expect(render(locale, props({ state: { status: "loading" } }))).toContain('aria-busy="true"');
      const err = render(locale, props({ state: { status: "error" } }));
      expect(err).toContain(locale === "en" ? "Try again" : "Thử lại");
      expect(err).not.toContain("x-table");
    });
  }
  it("an empty search names the query", () => {
    const html = render("en", props({ filters: { ...none, query: "zzzz" } }));
    expect(html).toContain("No users match “zzzz”");
    expect(html).toContain("Clear filters");
    expect(render("vi", props({ filters: { ...none, query: "zzzz" } }))).toContain("Không có người dùng khớp “zzzz”");
  });
  it("an empty workspace offers to create the first user", () => {
    const html = render("en", props({ state: { status: "ready", data: [] } }));
    expect(html).toContain("No users yet");
    expect(html.match(/class="btn"/g)).toHaveLength(2); // header action and the empty state's action
  });
  it("the bulk bar appears with the selection count and its actions", () => {
    const html = render("en", props({ selected: new Set(["u3", "u4", "u5"]) }));
    expect(html).toContain('role="region" aria-label="Bulk actions"');
    expect(html).toContain("3 selected");
    expect(html).toMatch(/<button[^>]*>Suspend<\/button>/);
    expect(html).toContain("Clear selection");
    expect(render("vi", props({ selected: new Set(["u3"]) }))).toContain("Đã chọn 1");
    expect(render("en", props())).not.toContain("x-bulk-bar");
  });
  it("filters by role through a facet with counts", () => {
    const html = render("en", props({ filters: { ...none, roles: new Set(["admin"]) } }));
    expect(html).toContain("x-facet-trigger");
    expect(html).toMatch(/>Role<.*task-chip-count[^>]*>1</);
  });
  it("a viewer sees no create, no bulk bar and no checkboxes", () => {
    const html = render("en", props({ viewer: { role: "viewer" } }));
    expect(html).not.toContain("Create user");
    expect(html).not.toContain("x-bulk-bar");
    expect(html).not.toContain('type="checkbox"');
    expect(html).toContain("Ada Lovelace");
  });
  it("marks the active status chip and shows its count", () => {
    const html = render("en", props({ filters: { ...none, statuses: new Set(["invited"]) } }));
    expect(html).toMatch(/aria-pressed="true"[^>]*>.*Invited/);
  });
  it("links each name to its detail page", () => {
    expect(render("en", props())).toContain('href="#/users/u1"');
  });
});
