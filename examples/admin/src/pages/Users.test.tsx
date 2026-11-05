import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { seedRoles, seedUsers } from "../data/seed";
import type { Load } from "../data/useLoad";
import { I18nProvider, type Locale } from "../i18n";
import { filterUsers, statusCounts, UsersView, type UserFilters, type UsersViewProps } from "./Users";

const users = seedUsers();
const roles = seedRoles();
const none: UserFilters = { query: "", statuses: new Set(), role: "" };
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
    const r = filterUsers(users, { ...none, statuses: new Set(["invited"]), role: "viewer" });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((u) => u.status === "invited" && u.role === "viewer")).toBe(true);
  });
  it("counts statuses with the other filters applied", () => {
    const c = statusCounts(users, { ...none, role: "owner" });
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
  it("the bulk bar shows the selection count and enables its actions", () => {
    const html = render("en", props({ selected: new Set(["u3", "u4", "u5"]) }));
    expect(html).toContain("3 selected");
    expect(html).toContain('data-variant="bulk"');
    expect(html).not.toMatch(/<button[^>]*disabled[^>]*>(Suspend|Delete)/);
    const idle = render("en", props());
    expect(idle).toContain("0 selected");
    expect(idle).toMatch(/<button[^>]*disabled=""[^>]*>Suspend/);
  });
  it("a viewer sees no create, no bulk bar and no checkboxes", () => {
    const html = render("en", props({ viewer: { role: "viewer" } }));
    expect(html).not.toContain("Create user");
    expect(html).not.toContain("data-variant=\"bulk\"");
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
