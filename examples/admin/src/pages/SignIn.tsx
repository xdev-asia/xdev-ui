import { useRef, useState, type FormEvent, type JSX } from "react";
import { AuthShell, Banner, BrandMark, Button, Field, Segmented, Select, ThemeSwitch, type ThemePreference } from "@xdev-asia/ui";
import { hrefFor } from "../router";
import { checkCredentials, type Session } from "../auth/session";
import { LOCALES, useI18n, type Locale, type MessageKey } from "../i18n";
import { focusFirstInvalid } from "../parts/focus";
import { CodeSignIn, ForgotPassword, RegisterForm, type SignInMode } from "./SignInModes";

export interface SignInErrors {
  email?: MessageKey;
  password?: MessageKey;
}

export function validateSignIn(email: string, password: string): SignInErrors {
  const errors: SignInErrors = {};
  if (!email.trim()) errors.email = "signIn.emailRequired";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "signIn.emailInvalid";
  if (!password) errors.password = "signIn.passwordRequired";
  return errors;
}

export interface SignInPageProps {
  onSignedIn: (session: Session) => void;
  theme: ThemePreference;
  onThemeChange: (p: ThemePreference) => void;
  /** Starting state, for tests and screenshots. */
  initial?: { errors?: SignInErrors; failed?: boolean; mode?: SignInMode; empty?: boolean };
}

const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", vi: "Tiếng Việt" };

export function SignInPage({ onSignedIn, theme, onThemeChange, initial }: SignInPageProps): JSX.Element {
  const { t, ui, locale, setLocale } = useI18n();
  // The demo account is filled in, as in react-antd-admin; a real app starts empty.
  const [email, setEmail] = useState(initial?.empty ? "" : "admin@example.com");
  const [password, setPassword] = useState(initial?.empty ? "" : "admin-demo");
  const [errors, setErrors] = useState<SignInErrors>(initial?.errors ?? {});
  const [failed, setFailed] = useState(initial?.failed ?? false);
  const [mode, setMode] = useState<SignInMode>(initial?.mode ?? "password");
  const form = useRef<HTMLFormElement>(null);

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    const next = validateSignIn(email, password);
    setErrors(next);
    setFailed(false);
    if (next.email || next.password) return focusFirstInvalid(form.current);
    const result = checkCredentials(email, password);
    if (result.ok) onSignedIn(result.session);
    else setFailed(true);
  };
  // After the first submit, clear a field's error as soon as it is valid again.
  const revalidate = (nextEmail: string, nextPassword: string): void => {
    if (!errors.email && !errors.password) return;
    const next = validateSignIn(nextEmail, nextPassword);
    setErrors({ email: errors.email && next.email, password: errors.password && next.password });
  };

  return (
    <AuthShell
      brand={
        <>
          <BrandMark size={24} />
          <span translate="no">{t("app.name")}</span>
        </>
      }
      actions={
        <>
          <Select
            aria-label={t("signIn.language")}
            icon="globe"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            options={LOCALES.map((l) => ({ value: l, label: LANGUAGE_NAMES[l] }))}
          />
          <ThemeSwitch variant="icon" value={theme} onChange={onThemeChange} labels={ui.themeSwitch} />
        </>
      }
      headline={t("signIn.headline")}
      tagline={t("signIn.tagline")}
      footer={
        <span className="app-row">
          <span>{t("signIn.copyright")}</span>
          <a href={hrefFor.legal("privacy")}>{t("legal.privacy")}</a>
          <a href={hrefFor.legal("terms")}>{t("legal.terms")}</a>
        </span>
      }
    >
          <div className="app-form">
            <div>
              <h1 className="app-title">{t(mode === "forgot" ? "signIn.forgotTitle" : mode === "register" ? "signIn.registerTitle" : "signIn.title")}</h1>
              <p className="app-muted">{t(mode === "forgot" ? "signIn.forgotSubtitle" : mode === "register" ? "signIn.registerSubtitle" : "signIn.subtitle")}</p>
            </div>
            {mode === "password" || mode === "code" ? (
              <div className="app-row">
                <Segmented
                  label={t("signIn.method")}
                  value={mode}
                  onChange={(v) => setMode(v as SignInMode)}
                  options={[
                    { value: "password", label: t("signIn.withPassword") },
                    { value: "code", label: t("signIn.withCode") },
                  ]}
                />
              </div>
            ) : null}
            {mode === "password" ? (
              <form ref={form} className="app-form" onSubmit={submit} noValidate>
                {failed ? (
                  <Banner title={t("signIn.wrongCredentials")}>{t("signIn.wrongCredentialsHint")}</Banner>
                ) : null}
                <Field
                  label={t("signIn.email")}
                  type="email"
                  name="email"
                  autoComplete="username"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    revalidate(e.target.value, password);
                  }}
                  error={errors.email ? t(errors.email) : undefined}
                />
                <Field
                  label={t("signIn.password")}
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  labels={ui.field}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    revalidate(email, e.target.value);
                  }}
                  error={errors.password ? t(errors.password) : undefined}
                />
                <Button variant="primary" type="submit">{t("signIn.submit")}</Button>
              </form>
            ) : mode === "code" ? (
              <CodeSignIn onSignedIn={onSignedIn} />
            ) : mode === "forgot" ? (
              <ForgotPassword />
            ) : (
              <RegisterForm />
            )}
            <div className="app-row">
              {mode === "password" || mode === "code" ? (
                <>
                  <Button variant="link" onClick={() => setMode("forgot")}>{t("signIn.forgot")}</Button>
                  <Button variant="link" onClick={() => setMode("register")}>{t("signIn.register")}</Button>
                </>
              ) : (
                <Button variant="link" onClick={() => setMode("password")}>{t("signIn.back")}</Button>
              )}
            </div>
            <p className="app-muted">{t("signIn.demo")}</p>
          </div>
    </AuthShell>
  );
}
