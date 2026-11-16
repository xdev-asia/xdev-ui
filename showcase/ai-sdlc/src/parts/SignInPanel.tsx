import { useEffect, useRef, useState, type JSX } from "react";
import { Banner, Spinner, Stack } from "@xdev-asia/ui";
import { agentOf, type Account } from "../data";
import { useI18n } from "../i18n";

export interface SignInPanelProps {
  account: Account;
  /** Called once, when the CLI reports the account as signed in. */
  onDone: () => void;
}

/** Step shown while the user signs in inside the terminal xDev opened (`xdev account login <id>`). The prototype finishes by itself. */
export function SignInPanel({ account, onDone }: SignInPanelProps): JSX.Element {
  const { t, ui } = useI18n();
  const [ok, setOk] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;
  const login = account.auth === "login";
  const agent = agentOf(account.agent);
  useEffect(() => {
    const timer = setTimeout(() => {
      setOk(true);
      done.current();
    }, login ? 4000 : 1200);
    return () => clearTimeout(timer);
  }, [account.id, login]);
  return (
    <Stack gap={3}>
      {login ? (
        <>
          <p className="app-text">{t("signIn.intro", { agent: agent.name })}</p>
          <figure className="app-figure">
            <figcaption className="app-muted">{t("signIn.sample")}</figcaption>
            <pre className="app-term">
              {`$ xdev account login ${account.id}\n`}
              <span className="app-term-note">{t("signIn.cliScreen")}</span>
            </pre>
          </figure>
        </>
      ) : (
        <pre className="app-term">{account.envFile}</pre>
      )}
      {ok ? (
        <Banner tone="ok" title={t(login ? "signIn.ok" : "signIn.okEnv", { name: account.name })}>
          {t(login ? "signIn.okHint" : "signIn.okEnvHint")}
        </Banner>
      ) : (
        <div className="app-row" role="status">
          <Spinner size="sm" labels={ui.spinner} />
          <span className="app-muted">{t(login ? "signIn.waiting" : "signIn.checkingFile")}</span>
        </div>
      )}
    </Stack>
  );
}
