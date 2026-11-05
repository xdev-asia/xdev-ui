import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { checkCredentials } from "../auth/session";
import { I18nProvider, type Locale } from "../i18n";
import { SignInPage, validateSignIn } from "./SignIn";

const render = (locale: Locale, initial?: Parameters<typeof SignInPage>[0]["initial"]) =>
  renderToStaticMarkup(
    <I18nProvider locale={locale}>
      <SignInPage onSignedIn={() => {}} theme="dark" onThemeChange={() => {}} initial={initial} />
    </I18nProvider>,
  );

describe("SignIn", () => {
  it("renders the form in en and vi", () => {
    const en = render("en");
    expect(en).toContain("Sign in");
    expect(en).toContain('type="password"');
    expect(en.match(/<h1/g)).toHaveLength(1);
    const vi = render("vi");
    expect(vi).toContain("Đăng nhập");
    expect(vi).toContain("Mật khẩu");
    expect(vi).not.toContain(">Password<");
  });
  it("shows field errors", () => {
    const html = render("en", { errors: { email: "signIn.emailRequired", password: "signIn.passwordRequired" } });
    expect(html).toContain("Enter your email.");
    expect(html).toContain("Enter your password.");
  });
  it("shows a banner for wrong credentials in both languages", () => {
    expect(render("en", { failed: true })).toContain("Email or password is wrong");
    expect(render("vi", { failed: true })).toContain("Email hoặc mật khẩu không đúng");
  });
  it("has one primary button", () => {
    expect(render("en").match(/class="btn"/g) ?? []).toHaveLength(1);
  });
});

describe("validateSignIn", () => {
  it("requires and checks the email, and requires the password", () => {
    expect(validateSignIn("", "")).toEqual({ email: "signIn.emailRequired", password: "signIn.passwordRequired" });
    expect(validateSignIn("nope", "x")).toEqual({ email: "signIn.emailInvalid" });
    expect(validateSignIn("a@b.co", "x")).toEqual({});
  });
});

describe("checkCredentials", () => {
  it("accepts the demo accounts and rejects the rest", () => {
    expect(checkCredentials("ADMIN@example.com", "admin-demo")).toMatchObject({ ok: true, session: { role: "owner" } });
    expect(checkCredentials("viewer@example.com", "viewer-demo")).toMatchObject({ ok: true, session: { role: "viewer" } });
    expect(checkCredentials("admin@example.com", "wrong")).toEqual({ ok: false });
  });
});
