import type { JSX } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider, type Locale } from "../i18n";
import { CreateUserDialog } from "./CreateUserDialog";
import { DeleteUsersDialog } from "./DeleteUsersDialog";

const wrap = (locale: Locale, node: JSX.Element) => renderToStaticMarkup(<I18nProvider locale={locale}>{node}</I18nProvider>);
const noop = () => {};
const submit = async () => "ok" as const;

describe("CreateUserDialog", () => {
  for (const locale of ["en", "vi"] as const) {
    it(`is a modal dialog with the form inside (${locale})`, () => {
      const html = wrap(locale, <CreateUserDialog onSubmit={submit} onCancel={noop} />);
      expect(html).toContain('data-modal="true"');
      expect(html).toContain('role="dialog"');
      expect(html).toContain('<div class="dialog-body"><form');
      expect(html).toContain(locale === "en" ? "Create user" : "Tạo người dùng");
      expect(html).toContain(locale === "en" ? "Send invite email" : "Gửi email mời");
    });
  }
  it("shows validation messages", () => {
    const html = wrap("en", <CreateUserDialog onSubmit={submit} onCancel={noop} initial={{ errors: { name: "user.nameRequired", email: "user.emailInvalid" } }} />);
    expect(html).toContain("Enter a full name.");
    expect(html).toContain("Enter an email such as name@example.com.");
    expect(wrap("vi", <CreateUserDialog onSubmit={submit} onCancel={noop} initial={{ errors: { email: "user.emailTaken" } }} />)).toContain("Đã có người dùng khác dùng email này.");
  });
  it("disables the confirm button while saving", () => {
    const html = wrap("en", <CreateUserDialog onSubmit={submit} onCancel={noop} initial={{ saving: true }} />);
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Creating…/);
  });
  it("has exactly one primary button, last in the actions", () => {
    const html = wrap("en", <CreateUserDialog onSubmit={submit} onCancel={noop} />);
    expect(html.match(/class="btn"/g)).toHaveLength(1);
    expect(html.indexOf("btn-secondary")).toBeLessThan(html.indexOf('class="btn"'));
  });
});

describe("DeleteUsersDialog", () => {
  it("is an alert dialog that names the user", () => {
    const html = wrap("en", <DeleteUsersDialog users={[{ id: "u3", name: "Ada Lovelace" }]} onConfirm={noop} onCancel={noop} />);
    expect(html).toContain('role="alertdialog"');
    expect(html).toContain("Delete user Ada Lovelace?");
    expect(html).toContain(">Delete user</button>");
    expect(html).toContain('<p class="dialog-body"');
  });
  it("counts users when there are several, in both languages", () => {
    const users = [{ id: "a", name: "A" }, { id: "b", name: "B" }, { id: "c", name: "C" }];
    expect(wrap("en", <DeleteUsersDialog users={users} onConfirm={noop} onCancel={noop} />)).toContain("Delete 3 users?");
    expect(wrap("vi", <DeleteUsersDialog users={users} onConfirm={noop} onCancel={noop} />)).toContain("Xóa 3 người dùng?");
  });
  it("disables the confirm button while busy", () => {
    expect(wrap("en", <DeleteUsersDialog users={[{ id: "a", name: "A" }]} busy onConfirm={noop} onCancel={noop} />)).toMatch(/<button[^>]*disabled=""[^>]*>Delete user/);
  });
});
