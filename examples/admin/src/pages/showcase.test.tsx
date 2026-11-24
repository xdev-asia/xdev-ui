import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { seedDepartments, seedMenus } from "../data/catalog";
import { seedRoles } from "../data/seed";
import type { Session } from "../auth/session";
import { I18nProvider, type Locale } from "../i18n";
import { AboutPage } from "./About";
import { EmbedPage, NestedPage } from "./Demo";
import { AccessView } from "./Access";
import { DepartmentsView } from "./Departments";
import { ExceptionPage } from "./Exception";
import { MenusView, validateMenu } from "./Menus";
import { ProfileView, validateProfile } from "./Profile";

const render = (node: ReactNode, locale: Locale = "en") => renderToStaticMarkup(<I18nProvider locale={locale}>{node}</I18nProvider>);
const roles = seedRoles();
const count = (html: string, re: RegExp) => html.match(re)?.length ?? 0;

describe("Menus", () => {
  const tree = seedMenus();
  it("shows the roots with open and close buttons that say their state", () => {
    const html = render(<MenusView tree={tree} canEdit onSave={() => {}} initialExpanded={[]} />);
    expect(count(html, /<tr/g)).toBe(1 + tree.length);
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Expand Access");
    expect(count(html, /<h1/g)).toBe(1);
  });
  it("opens every branch that holds a match while filtering", () => {
    const html = render(<MenusView tree={tree} canEdit onSave={() => {}} initialQuery="menu 1-2" />);
    expect(html).toContain("Menu 1-2");
    expect(html).not.toContain("Menu 1-1");
    expect(html).toContain("Nested menu");
  });
  it("shows an empty state with a way back when nothing matches", () => {
    const html = render(<MenusView tree={tree} canEdit onSave={() => {}} initialQuery="zzz" />, "vi");
    expect(html).toContain("Không có menu khớp");
    expect(html).toContain("Xóa bộ lọc");
  });
  it("hides the edit column from a role that cannot change settings", () => {
    expect(render(<MenusView tree={tree} canEdit={false} onSave={() => {}} />)).not.toContain("Edit Dashboard");
    expect(render(<MenusView tree={tree} canEdit onSave={() => {}} />)).toContain("Edit Dashboard");
    expect(render(<MenusView tree={tree} canEdit onSave={() => {}} onAdd={() => {}} />)).toContain("Add menu");
    expect(render(<MenusView tree={tree} canEdit={false} onSave={() => {}} onAdd={() => {}} />)).not.toContain("Add menu");
  });
  it("needs a name", () => {
    expect(validateMenu({ ...tree[0]!.data, name: " " })).toEqual({ name: "menus.nameRequired" });
    expect(validateMenu(tree[0]!.data)).toEqual({});
  });
});

describe("Departments", () => {
  it("opens the whole tree and names each lead", () => {
    const html = render(<DepartmentsView tree={seedDepartments()} />);
    expect(html).toContain("Applications");
    expect(html).toContain("Radia Perlman");
    expect(html).toContain("Paused");
  });
  it("filters by lead", () => {
    const html = render(<DepartmentsView tree={seedDepartments()} initialQuery="Eich" />);
    expect(html).toContain("Applications");
    expect(html).not.toContain("Quality");
  });
});

describe("Access demo", () => {
  const owner = { name: "Ada Lovelace", email: "admin@example.com", role: "owner" as const };
  const viewer = { name: "Grace Hopper", email: "viewer@example.com", role: "viewer" as const };
  const view = (page: "mode" | "pages" | "buttons" | "admin" | "common", session: Session = owner) => render(<AccessView page={page} session={session} roles={roles} onSwitch={() => {}} />);
  it("page control offers to sign in as the other demo account and marks what the role sees", () => {
    const html = view("pages", viewer);
    expect(html).toContain("Sign in as Ada Lovelace");
    expect(html).not.toContain("Sign in as Grace Hopper");
    expect(count(html, />Hidden</g)).toBeGreaterThan(3);
  });
  it("button control renders only the buttons and codes the role holds", () => {
    // Owner: six code-gated buttons, two role-gated buttons and the account switch.
    expect(count(view("buttons"), /btn-secondary/g)).toBe(9);
    for (const s of ["Component · permission code", "Component · role", "Function · permission code", "Function · role"]) expect(view("buttons")).toContain(s);
    const vh = view("buttons", viewer);
    expect(vh).toContain("This role can use none of these buttons.");
    expect(vh).not.toContain("users.delete");
    expect(vh).not.toContain("Visible to owners and admins");
    expect(vh).toContain("Visible to every role");
  });
  it("mode names both ways and marks the one in use; the role pages explain who sees them", () => {
    expect(view("mode")).toContain("In use");
    const back = render(<AccessView page="mode" session={owner} roles={roles} onSwitch={() => {}} mode="back" onModeChange={() => {}} />);
    expect(back).toMatch(/aria-pressed="true"[^>]*>Back-end/);
    expect(back.indexOf("Not in use")).toBeLessThan(back.indexOf("In use<"));
    expect(view("admin")).toContain("Only owners and admins see this page");
    expect(view("common")).toContain("Only editors and viewers see this page");
  });
});

describe("Profile", () => {
  const saved = { name: "Ada Lovelace", email: "admin@example.com", phone: "", bio: "" };
  it("checks the name and the length of the bio", () => {
    expect(validateProfile({ ...saved, name: "" })).toEqual({ name: "profile.nameRequired" });
    expect(validateProfile({ ...saved, bio: "x".repeat(201) })).toEqual({ bio: "profile.bioTooLong" });
  });
  it("shows the save bar only when the draft differs", () => {
    expect(render(<ProfileView saved={saved} onSave={async () => {}} />)).not.toContain("You have unsaved changes");
    const html = render(<ProfileView saved={saved} onSave={async () => {}} initialDraft={{ ...saved, phone: "0900" }} />);
    expect(html).toContain("You have unsaved changes");
    expect(html).toContain('autoComplete="tel"');
  });
});

describe("Status, about and demo pages", () => {
  it("403 has one primary action, 500 adds a retry", () => {
    const forbidden = render(<ExceptionPage code="403" />);
    expect(forbidden).toContain("You cannot open this page");
    expect(count(forbidden, /class="btn"/g)).toBe(1);
    const failed = render(<ExceptionPage code="500" />, "vi");
    expect(failed).toContain("Có lỗi ở phía hệ thống");
    expect(count(failed, /class="btn"/g)).toBe(1);
    expect(render(<ExceptionPage code="404" />)).toContain("Page not found");
  });
  it("about lists the version and opens links in a new tab", () => {
    const html = render(<AboutPage />);
    expect(html).toContain("4.1.0");
    expect(html).toContain('target="_blank"');
  });
  it("nested and docs pages have a title and a named frame", () => {
    expect(render(<NestedPage leaf="menu1-2" />)).toContain("Menu 1-2");
    expect(render(<EmbedPage id="storybook" />)).toContain('title="Storybook"');
    expect(render(<ExceptionPage code="unknown" />)).toContain("x-empty-figure\">404");
  });
});
