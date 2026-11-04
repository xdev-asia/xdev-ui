import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { seedAudit, seedRoles, seedUsers } from "../data/seed";
import { I18nProvider, type Locale } from "../i18n";
import { UserDetailView, UserNotFound, validateUser, type UserDetailViewProps } from "./UserDetail";

const users = seedUsers();
const roles = seedRoles();
const user = users[2];
const noop = () => {};

function props(over: Partial<UserDetailViewProps> = {}): UserDetailViewProps {
  return { user, activity: seedAudit(users).slice(0, 3), viewer: { role: "owner" }, roles, onSave: async () => "ok", onToggleStatus: noop, onDelete: noop, ...over };
}
const render = (locale: Locale, p: UserDetailViewProps) =>
  renderToStaticMarkup(
    <I18nProvider locale={locale}>
      <UserDetailView {...p} />
    </I18nProvider>,
  );

describe("validateUser", () => {
  it("requires a name and a valid email", () => {
    expect(validateUser({ name: " ", email: "" })).toEqual({ name: "user.nameRequired", email: "user.emailRequired" });
    expect(validateUser({ name: "A", email: "x" })).toEqual({ email: "user.emailInvalid" });
    expect(validateUser({ name: "A", email: "a@b.co" })).toEqual({});
  });
});

describe("UserDetail", () => {
  for (const locale of ["en", "vi"] as const) {
    it(`shows the name, status, facts and both form sections (${locale})`, () => {
      const html = render(locale, props());
      expect(html.match(/<h1/g)).toHaveLength(1);
      expect(html).toContain(user.name);
      expect(html.match(/<section class="x-form-section"/g)).toHaveLength(2);
      expect(html).toContain('<dl class="x-dl"');
      expect(html).toContain(locale === "en" ? "Save changes" : "Lưu thay đổi");
      expect(html).toContain('role="tablist"');
    });
  }
  it("has one primary button: Save, last in the form actions", () => {
    const html = render("en", props());
    expect(html.match(/class="btn"/g)).toHaveLength(1);
    expect(html.indexOf("Cancel")).toBeLessThan(html.indexOf("Save changes"));
  });
  it("disables Save until something changes", () => {
    expect(render("en", props())).toMatch(/<button[^>]*disabled=""[^>]*>Save changes/);
    expect(render("en", props({ initial: { values: { name: "Changed" } } }))).not.toMatch(/<button[^>]*disabled=""[^>]*>Save changes/);
  });
  it("shows field errors and the save-failed banner", () => {
    const html = render("en", props({ initial: { errors: { name: "user.nameRequired", email: "user.emailTaken" }, saveFailed: true } }));
    expect(html).toContain("Enter a full name.");
    expect(html).toContain("Another user already has this email.");
    expect(html).toContain("Could not save the user");
    expect(render("vi", props({ initial: { saveFailed: true } }))).toContain("Không lưu được người dùng");
  });
  it("a viewer gets a read-only form and no actions", () => {
    const html = render("en", props({ viewer: { role: "viewer" } }));
    expect(html).not.toContain("Save changes");
    expect(html).not.toContain("Delete user");
    expect(html).not.toContain("Suspend user");
    expect(html).toMatch(/<input[^>]*disabled/);
  });
  it("offers reactivate for a suspended user", () => {
    expect(render("en", props({ user: { ...user, status: "suspended" } }))).toContain("Reactivate user");
  });
  it("lists activity on the activity tab, or says there is none", () => {
    expect(render("en", props({ initial: { tab: "activity" } }))).toContain("class=\"x-list-row\"");
    expect(render("en", props({ activity: [], initial: { tab: "activity" } }))).toContain("No activity for this user yet");
  });
  it("renders a not-found state with one action", () => {
    const html = renderToStaticMarkup(
      <I18nProvider locale="en">
        <UserNotFound />
      </I18nProvider>,
    );
    expect(html).toContain("User not found");
    expect(html.match(/class="btn"/g)).toHaveLength(1);
  });
});
