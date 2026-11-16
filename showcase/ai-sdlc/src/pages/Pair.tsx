import { useEffect, useState, type JSX } from "react";
import { Banner, BrandMark, Button, Card, CodeBlock, CodeInput, FieldMessage, Stack } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { useStore } from "../store";

const CODE = "7K4QM2XD9P";
const MAX_TRIES = 5;

/** Seconds the showcase makes an address wait after it used up a second code. The server's real limit is not set yet. */
const SLOW_SECONDS = 15;

/** Shown until this browser is paired: the person gets a one-time code from the server. Five wrong tries close the code. */
export function PairPage(): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const [code, setCode] = useState("");
  const [tries, setTries] = useState(0);
  const [codesUsed, setCodesUsed] = useState(0);
  const [wait, setWait] = useState(0);
  const closed = tries >= MAX_TRIES;
  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait((n) => n - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  const submit = (value: string): void => {
    if (closed || value.length !== CODE.length) return;
    if (value.toUpperCase() !== CODE) {
      // The server also counts tries per address: after a second closed code the address must wait.
      if (tries + 1 >= MAX_TRIES && codesUsed >= 1) setWait(SLOW_SECONDS);
      setTries(tries + 1);
      return setCode("");
    }
    s.setPairNote(false);
    s.setPaired(true);
  };

  return (
    <main className="app-center">
      <Card className="app-pair">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(code);
          }}
        >
          <Stack gap={4}>
            <Stack direction="row" gap={2} align="center">
              <BrandMark size={24} />
              <h1 className="app-text">{t("pair.title", { host: "build-box" })}</h1>
            </Stack>
            {s.pairNote ? <Banner tone="warn" title={t("pair.expired")} /> : null}
            <ol className="app-steps">
              <li>
                <Stack gap={2}>
                  <span>{t("pair.step1")}</span>
                  <CodeBlock language="sh" labels={ui.codeBlock} code="xdev web pair --role admin --days 30" />
                </Stack>
              </li>
              <li>{t("pair.step2")}</li>
            </ol>
            <CodeInput length={CODE.length} groupSize={5} alphabet="crockford" label={t("pair.code")} value={code} onChange={setCode} onComplete={submit} invalid={tries > 0} disabled={closed} autoFocus />
            {closed && wait > 0 ? <FieldMessage tone="error">{t("pair.slowDown", { seconds: wait })}</FieldMessage> : closed ? <FieldMessage tone="error">{t("pair.closed")}</FieldMessage> : tries > 0 ? <FieldMessage tone="error">{t("pair.wrong", { left: MAX_TRIES - tries })}</FieldMessage> : null}
            <p className="app-muted">{t("pair.roleNote")}</p>
            <FieldMessage tone="info">{t("pair.showcaseHint")}</FieldMessage>
            <Stack direction="row" gap={2} justify="end">
              {closed ? (
                <Button
                  variant="secondary"
                  icon="refresh"
                  disabled={wait > 0}
                  onClick={() => {
                    setTries(0);
                    setCodesUsed((n) => n + 1);
                  }}
                >
                  {t("app.retry")}
                </Button>
              ) : null}
              <Button variant="primary" type="submit" disabled={closed || code.length !== CODE.length}>
                {t("pair.submit")}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Card>
    </main>
  );
}
