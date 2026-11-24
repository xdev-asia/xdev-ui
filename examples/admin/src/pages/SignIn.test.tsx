import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { checkCode, checkCredentials, DEMO_CODE } from "../auth/session";
import { I18nProvider, type Locale } from "../i18n";
import { SignInPage, validateSignIn } from "./SignIn";
import { validateRegister } from "./SignInModes";

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

describe("sign-in modes", () => {
  const html = (mode: "password" | "code" | "forgot" | "register", locale: "en" | "vi" = "en") =>
    renderToStaticMarkup(
      <I18nProvider locale={locale}>
        <SignInPage onSignedIn={() => {}} theme="dark" onThemeChange={() => {}} initial={{ mode }} />
      </I18nProvider>,
    );
  it("offers the code method next to the password and links to reset and register", () => {
    const page = html("password");
    expect(page).toContain("Email code");
    expect(page).toContain("Forgot password");
    expect(page).toContain("Create an account");
  });
  it("gives each mode its own single h1 and one primary button", () => {
    for (const m of ["password", "code", "forgot", "register"] as const) {
      const page = html(m);
      expect(page.match(/<h1/g), m).toHaveLength(1);
      expect(page.match(/class="btn"/g) ?? [], m).toHaveLength(1);
    }
    expect(html("forgot", "vi")).toContain("Đặt lại mật khẩu");
    expect(html("register")).toContain('autoComplete="new-password"');
  });
  it("checks the register form", () => {
    expect(validateRegister("", "nope", "short")).toEqual({ name: "signIn.nameRequired", email: "signIn.emailInvalid", password: "signIn.passwordShort" });
    expect(validateRegister("Ada", "ada@example.com", "long-enough")).toEqual({});
  });
  it("signs a demo account in with the demo code only", () => {
    expect(checkCode("admin@example.com", DEMO_CODE).ok).toBe(true);
    expect(checkCode("admin@example.com", "000000").ok).toBe(false);
    expect(checkCode("someone@example.com", DEMO_CODE).ok).toBe(false);
  });
});
