import { useState, type JSX } from "react";
import { Button, Dialog, Field, RadioGroup, Stack, StepDots } from "@xdev-asia/ui";
import { AGENTS, checkId, slugify, type Account, type AgentId, type AuthKind } from "../data";
import { useI18n } from "../i18n";
import { SignInPanel } from "./SignInPanel";

export interface AddAccountDialogProps {
  accounts: Account[];
  agent?: AgentId;
  /** The account exists from here on, signed out until the last step finishes. */
  onCreate: (account: Account) => void;
  onSignedIn: (id: string) => void;
  onClose: () => void;
}

const STEP_KEYS = ["add.step1", "add.step2", "add.step3"] as const;

/** Three steps: agent and name, how it signs in, then the sign-in itself. */
export function AddAccountDialog({ accounts, agent: firstAgent = "claude-code", onCreate, onSignedIn, onClose }: AddAccountDialogProps): JSX.Element {
  const { t, ui } = useI18n();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [agent, setAgent] = useState<AgentId>(firstAgent);
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [idEdited, setIdEdited] = useState(false);
  const [auth, setAuth] = useState<AuthKind>("login");
  const [envFile, setEnvFile] = useState("");
  const [max, setMax] = useState("");
  const [tried, setTried] = useState(false);
  const [created, setCreated] = useState<Account | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  const idProblem = checkId(id, accounts.map((a) => a.id));
  const nameError = !name.trim() ? t("add.nameRequired") : undefined;
  const idError = idProblem === "required" ? t("add.idRequired") : idProblem === "format" ? t("add.idFormat") : idProblem === "taken" ? t("add.idTaken") : undefined;
  const envError = auth === "env_file" && !envFile.trim().startsWith("/") ? t("add.envFileRequired") : undefined;
  const maxError = max !== "" && !/^[1-9]\d?$/.test(max) ? t("add.maxInvalid") : undefined;

  const next = (): void => {
    if (step === 0) {
      if (nameError || idError) return setTried(true);
      setTried(false);
      return setStep(1);
    }
    if (step === 1) {
      if (envError || maxError) return setTried(true);
      const account: Account = {
        id,
        name: name.trim(),
        agent,
        auth,
        envFile: auth === "env_file" ? envFile.trim() : undefined,
        status: "signed_out",
        terminals: 0,
        maxTerminals: max ? Number(max) : undefined,
        checkedAt: new Date().toISOString(),
      };
      setCreated(account);
      onCreate(account);
      return setStep(2);
    }
    onClose();
  };

  return (
    <Dialog
      modal
      title={t("add.title")}
      size="wide"
      body="plain"
      confirmLabel={step === 0 ? t("add.next") : step === 1 ? t(auth === "login" ? "add.createLogin" : "add.createEnv") : t("add.done")}
      cancelLabel={step === 2 ? (signedIn ? null : t("add.later")) : t("add.cancel")}
      confirmDisabled={step === 2 && !signedIn}
      onConfirm={next}
      onCancel={onClose}
    >
      <Stack gap={4}>
        <Stack direction="row" gap={2} align="center" wrap>
          <StepDots total={3} current={step + 1} labels={ui.stepDots} />
          <span className="app-muted">{t(STEP_KEYS[step])}</span>
          {step === 1 ? (
            <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => setStep(0)}>
              {t("add.back")}
            </Button>
          ) : null}
        </Stack>
        {step === 0 ? (
          <>
            <RadioGroup name="add-agent" label={t("add.agent")} orientation="horizontal" value={agent} onChange={(v) => setAgent(v as AgentId)} options={AGENTS.map((a) => ({ value: a.id, label: a.name }))} />
            <Field
              label={t("add.name")}
              hint={t("add.nameHint")}
              error={tried ? nameError : undefined}
              value={name}
              autoComplete="off"
              onChange={(e) => {
                setName(e.target.value);
                if (!idEdited) setId(slugify(e.target.value));
              }}
            />
            <Field
              label={t("add.id")}
              hint={t("add.idHint", { id: id || "work" })}
              error={tried ? idError : undefined}
              value={id}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => {
                setIdEdited(true);
                setId(e.target.value);
              }}
            />
          </>
        ) : null}
        {step === 1 ? (
          <>
            <RadioGroup
              name="add-auth"
              orientation="vertical"
              label={t("add.auth")}
              value={auth}
              onChange={(v) => setAuth(v as AuthKind)}
              options={[
                { value: "login", label: t("add.authLogin"), hint: t("add.authLoginHint") },
                { value: "env_file", label: t("add.authEnv"), hint: t("add.authEnvHint") },
              ]}
            />
            {auth === "env_file" ? (
              <Field label={t("add.envFile")} hint={t("add.envFileHint")} error={tried ? envError : undefined} value={envFile} placeholder="/run/secrets/xdev/ci.env" autoComplete="off" spellCheck={false} onChange={(e) => setEnvFile(e.target.value)} />
            ) : null}
            <Field label={t("add.max")} hint={t("add.maxHint")} error={tried ? maxError : undefined} value={max} inputMode="numeric" autoComplete="off" onChange={(e) => setMax(e.target.value)} />
          </>
        ) : null}
        {step === 2 && created ? (
          <SignInPanel
            account={created}
            onDone={() => {
              setSignedIn(true);
              onSignedIn(created.id);
            }}
          />
        ) : null}
      </Stack>
    </Dialog>
  );
}
