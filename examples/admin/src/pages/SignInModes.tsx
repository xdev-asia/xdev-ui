import { useRef, useState, type FormEvent, type JSX } from "react";
import { Banner, Button, CodeInput, Field, FieldMessage } from "@xdev-asia/ui";
import { checkCode, type Session } from "../auth/session";
import { useI18n, type MessageKey } from "../i18n";
import { validateSignIn } from "./SignIn";
import { focusFirstInvalid } from "../parts/focus";

export type SignInMode = "password" | "code" | "forgot" | "register";
export const PASSWORD_MIN = 8;

/** Pure: errors of the request-an-account form. */
export function validateRegister(name: string, email: string, password: string): { name?: MessageKey; email?: MessageKey; password?: MessageKey } {
  const e: { name?: MessageKey; email?: MessageKey; password?: MessageKey } = {};
  if (!name.trim()) e.name = "signIn.nameRequired";
  const mail = validateSignIn(email, "x").email;
  if (mail) e.email = mail;
  if (password.length < PASSWORD_MIN) e.password = "signIn.passwordShort";
  return e;
}

/** Email, then a 6-digit code. Paste and the platform's one-time-code autofill both work. */
export function CodeSignIn({ onSignedIn, initial }: { onSignedIn: (s: Session) => void; initial?: { email?: string; sent?: boolean; failed?: boolean } }): JSX.Element {
  const { t } = useI18n();
  const [email, setEmail] = useState(initial?.email ?? "");
  const [sent, setSent] = useState(initial?.sent ?? false);
  const [code, setCode] = useState("");
  const [failed, setFailed] = useState(initial?.failed ?? false);
  const [error, setError] = useState<MessageKey | undefined>();
  const [codeError, setCodeError] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const send = (e: FormEvent): void => {
    e.preventDefault();
    const next = validateSignIn(email, "x").email;
    setError(next);
    if (next) focusFirstInvalid(form.current);
    else setSent(true);
  };
  const verify = (value: string): void => {
    // The button stays enabled; a short code gets a message next to the field instead.
    if (value.length < 6) {
      setCodeError(true);
      return focusFirstInvalid(form.current);
    }
    const r = checkCode(email, value);
    if (r.ok) onSignedIn(r.session);
    else setFailed(true);
  };
  if (!sent)
    return (
      <form ref={form} className="app-form" onSubmit={send} noValidate>
        <Field label={t("signIn.email")} type="email" name="email" autoComplete="username" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} error={error ? t(error) : undefined} />
        <Button variant="primary" type="submit">
          {t("signIn.sendCode")}
        </Button>
      </form>
    );
  return (
    <form
      ref={form}
      className="app-form"
      onSubmit={(e) => {
        e.preventDefault();
        verify(code);
      }}
      noValidate
    >
      {failed ? <Banner title={t("signIn.wrongCode")}>{t("signIn.wrongCodeHint")}</Banner> : null}
      <div className="app-labelled">
        <span className="app-label" id="signin-code-label">
          {t("signIn.code")}
        </span>
        <CodeInput
          length={6}
          groupSize={3}
          alphabet="digits"
          label={t("signIn.code")}
          value={code}
          invalid={failed || codeError}
          onChange={(v) => {
            setCode(v);
            setFailed(false);
            setCodeError(false);
          }}
          onComplete={verify}
        />
        {codeError ? <FieldMessage tone="error">{t("signIn.codeRequired")}</FieldMessage> : null}
        <p className="app-muted">{t("signIn.codeHint", { email: email.trim() })}</p>
      </div>
      <div className="app-row">
        <Button
          variant="secondary"
          onClick={() => {
            setSent(false);
            setCode("");
            setFailed(false);
          }}
        >
          {t("signIn.otherEmail")}
        </Button>
        <Button variant="primary" type="submit">
          {t("signIn.submit")}
        </Button>
      </div>
    </form>
  );
}

/** Asks for a reset link. The answer is the same whether or not the email has an account. */
export function ForgotPassword({ initialSentTo }: { initialSentTo?: string }): JSX.Element {
  const { t } = useI18n();
  const [email, setEmail] = useState(initialSentTo ?? "");
  const [sentTo, setSentTo] = useState(initialSentTo ?? "");
  const [error, setError] = useState<MessageKey | undefined>();
  const form = useRef<HTMLFormElement>(null);
  if (sentTo)
    return (
      <Banner tone="ok" title={t("signIn.linkSent")}>
        {t("signIn.linkSentHint", { email: sentTo })}
      </Banner>
    );
  return (
    <form
      ref={form}
      className="app-form"
      onSubmit={(e) => {
        e.preventDefault();
        const next = validateSignIn(email, "x").email;
        setError(next);
        if (next) focusFirstInvalid(form.current);
        else setSentTo(email.trim());
      }}
      noValidate
    >
      <Field label={t("signIn.email")} type="email" name="email" autoComplete="username" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} error={error ? t(error) : undefined} />
      <Button variant="primary" type="submit">
        {t("signIn.sendLink")}
      </Button>
    </form>
  );
}

/** Requests an account; an owner approves it. Nothing is created in the demo. */
export function RegisterForm({ initialRequested }: { initialRequested?: string }): JSX.Element {
  const { t, ui } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialRequested ?? "");
  const [password, setPassword] = useState("");
  const [tried, setTried] = useState(false);
  const [requested, setRequested] = useState(initialRequested ?? "");
  const form = useRef<HTMLFormElement>(null);
  const errors = tried ? validateRegister(name, email, password) : {};
  if (requested)
    return (
      <Banner tone="ok" title={t("signIn.requested")}>
        {t("signIn.requestedHint", { email: requested })}
      </Banner>
    );
  return (
    <form
      ref={form}
      className="app-form"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (Object.keys(validateRegister(name, email, password)).length) focusFirstInvalid(form.current);
        else setRequested(email.trim());
      }}
      noValidate
    >
      <Field label={t("signIn.name")} name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name ? t(errors.name) : undefined} />
      <Field label={t("signIn.email")} type="email" name="email" autoComplete="email" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email ? t(errors.email) : undefined} />
      <Field
        label={t("signIn.password")}
        type="password"
        name="new-password"
        autoComplete="new-password"
        labels={ui.field}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint={t("signIn.passwordHint")}
        error={errors.password ? t(errors.password) : undefined}
      />
      <p className="app-muted">{t("signIn.agree")}</p>
      <Button variant="primary" type="submit">
        {t("signIn.requestAccount")}
      </Button>
    </form>
  );
}
