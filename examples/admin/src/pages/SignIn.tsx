import { useRef, useState, type FormEvent, type JSX } from "react";
import { Banner, BrandMark, Button, Card, Field, Segmented, Select, ThemeSwitch, type ThemePreference } from "@xdev-asia/ui";
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
  initial?: { errors?: SignInErrors; failed?: boolean; mode?: SignInMode };
}

const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", vi: "Tiếng Việt" };

export function SignInPage({ onSignedIn, theme, onThemeChange, initial }: SignInPageProps): JSX.Element {
  const { t, ui, locale, setLocale } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <main className="app-signin">
      <div className="app-signin-card">
        <Card>
          <div className="app-form">
            <BrandMark variant="lockup" size={28} />
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
        </Card>
        <div className="app-signin-foot">
          <Select
            aria-label={t("signIn.language")}
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            options={LOCALES.map((l) => ({ value: l, label: LANGUAGE_NAMES[l] }))}
          />
          <ThemeSwitch variant="icons" value={theme} onChange={onThemeChange} labels={ui.themeSwitch} />
        </div>
      </div>
    </main>
  );
}
