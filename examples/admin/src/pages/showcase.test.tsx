import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { seedDepartments, seedMenus } from "../data/catalog";
import { seedRoles } from "../data/seed";
import { I18nProvider, type Locale } from "../i18n";
import { AboutPage } from "./About";
import { DocsPage, NestedPage } from "./Demo";
import { DepartmentsView } from "./Departments";
import { ExceptionPage } from "./Exception";
import { MenusView, validateMenu } from "./Menus";
import { PermissionsView } from "./Permissions";
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
  });
  it("needs a name", () => {
    expect(validateMenu({ ...tree[0].data, name: " " })).toEqual({ name: "menus.nameRequired" });
    expect(validateMenu(tree[0].data)).toEqual({});
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

describe("Permissions", () => {
  it("shows a viewer that roles and audit are hidden and no buttons", () => {
    const html = render(<PermissionsView roles={roles} initialRole="viewer" />);
    expect(count(html, />Hidden</g)).toBeGreaterThan(4);
    expect(html).not.toContain("btn-secondary");
  });
  it("shows an owner every page and every button", () => {
    const html = render(<PermissionsView roles={roles} initialRole="owner" />);
    expect(html).not.toContain(">Hidden<");
    expect(html).toContain("Export the audit log");
    expect(count(html, /btn-secondary/g)).toBe(6);
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
    expect(render(<DocsPage />)).toContain('title="xdev-ui documentation"');
  });
});
