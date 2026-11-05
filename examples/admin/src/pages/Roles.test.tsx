import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { seedRoles } from "../data/seed";
import type { Load } from "../data/useLoad";
import { I18nProvider, type Locale } from "../i18n";
import { RolesView, samePermissions, togglePermission, type RolesData, type RolesViewProps } from "./Roles";

const roles = seedRoles();
const data: RolesData = { roles, counts: { owner: 1, admin: 5, editor: 17, viewer: 34 } };
const noop = () => {};

function props(over: Partial<RolesViewProps> = {}): RolesViewProps {
  const roleId = over.roleId ?? "admin";
  return {
    state: { status: "ready", data } as Load<RolesData>,
    canEdit: true,
    roleId,
    onRoleChange: noop,
    draft: roles.find((r) => r.id === roleId)!,
    dirty: false,
    saving: false,
    onToggle: noop,
    onSave: noop,
    onDiscard: noop,
    onRetry: noop,
    ...over,
  };
}
const render = (locale: Locale, p: RolesViewProps) =>
  renderToStaticMarkup(
    <I18nProvider locale={locale}>
      <RolesView {...p} />
    </I18nProvider>,
  );

describe("togglePermission", () => {
  it("returns a changed copy and leaves the original alone", () => {
    const admin = roles[1];
    const next = togglePermission(admin, "roles", "update", true);
    expect(next.permissions.roles.update).toBe(true);
    expect(admin.permissions.roles.update).toBe(false);
    expect(samePermissions(admin, next)).toBe(false);
    expect(samePermissions(admin, togglePermission(admin, "roles", "update", false))).toBe(true);
  });
});

describe("Roles", () => {
  for (const locale of ["en", "vi"] as const) {
    it(`lists four roles with member counts and a 4 by 4 matrix (${locale})`, () => {
      const html = render(locale, props());
      expect(html.match(/<li class="x-list-row/g)).toHaveLength(4);
      expect(html.match(/type="checkbox"/g)).toHaveLength(16);
      expect(html).toContain(locale === "en" ? "5 members" : "5 thành viên");
      expect(html.match(/<h1/g)).toHaveLength(1);
    });
    it(`has loading and error states (${locale})`, () => {
      expect(render(locale, props({ state: { status: "loading" } }))).toContain(locale === "en" ? ">Loading<" : ">Đang tải<");
      expect(render(locale, props({ state: { status: "error" } }))).toContain(locale === "en" ? "Try again" : "Thử lại");
    });
  }
  it("the owner row is read-only: every checkbox disabled, a note, no save", () => {
    const html = render("en", props({ roleId: "owner" }));
    expect(html).toContain("The owner role always has every permission.");
    expect(html.match(/type="checkbox"[^>]*disabled/g) ?? html.match(/disabled=""[^>]*type="checkbox"/g)).toHaveLength(16);
    expect(html).not.toContain("Save permissions");
  });
  it("a role that cannot edit sees disabled checkboxes and no actions", () => {
    const html = render("en", props({ canEdit: false }));
    expect(html).not.toContain("Save permissions");
    expect(html.match(/disabled/g)!.length).toBeGreaterThanOrEqual(16);
  });
  it("shows the unsaved banner with Save enabled and Discard before it", () => {
    const html = render("en", props({ dirty: true }));
    expect(html).toContain("Unsaved changes");
    expect(html).not.toMatch(/<button[^>]*disabled=""[^>]*>Save permissions/);
    expect(html.indexOf("Discard")).toBeLessThan(html.indexOf("Save permissions"));
    expect(html.match(/class="btn"/g)).toHaveLength(1);
    expect(render("en", props())).not.toContain("Unsaved changes");
    expect(render("en", props())).toMatch(/<button[^>]*disabled=""[^>]*>Save permissions/);
  });
  it("marks the chosen role", () => {
    expect(render("en", props({ roleId: "editor" }))).toMatch(/aria-current|data-selected|selected/);
  });
});
