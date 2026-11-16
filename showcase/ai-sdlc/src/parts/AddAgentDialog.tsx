import { useState, type JSX } from "react";
import { Field, FormDialog, Stack, Textarea } from "@xdev-asia/ui";
import type { AgentConfig } from "../config";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { useStore } from "../store";
import { lines } from "./ConfigNote";

/** Adds any CLI agent by its command. It starts at the basic level, like agents Orca does not know. */
export function AddAgentDialog({ onClose, onAdded }: { onClose: () => void; onAdded: (agent: AgentConfig) => void }): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [command, setCommand] = useState("");
  const [args, setArgs] = useState("");
  const [envFile, setEnvFile] = useState("");
  const [tried, setTried] = useState(false);
  const idError = !/^[a-z0-9][a-z0-9-]*$/.test(id) || s.agentConfigs.some((a) => a.id === id) ? t("cfg.errId") : undefined;
  const commandError = command.trim() ? undefined : t("cfg.errCommand");
  return (
    <FormDialog
      modal
      busy={false}
      title={t("cfg.addAgentTitle")}
      description={t("cfg.addAgentHint")}
      labels={ui.formDialogCreate}
      submitLabel={t("cfg.addAgent")}
      onCancel={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        if (idError || commandError) return setTried(true);
        const agent: AgentConfig = {
          id,
          name: name.trim() || id,
          vendor: "-",
          level: "basic",
          profile: "custom",
          letter: (name.trim() || id).slice(0, 1).toUpperCase(),
          command: command.trim().split(/\s+/),
          args: lines(args),
          hookProtocol: null,
          gates: [],
          allow: ["git status", "git diff", "ls", "cat"],
          timeoutSecs: 540,
          hookTimeoutSecs: 600,
          forbiddenArgs: ["--yolo", "--dangerously-skip-permissions"],
          envFile: envFile.trim() || undefined,
        };
        s.setAgentConfigs((list) => [...list, agent]);
        notify(t("cfg.added", { name: agent.name }));
        onAdded(agent);
        onClose();
      }}
    >
      <Stack gap={3}>
        <div className="app-cfg-pair">
          <Field label={t("cfg.id")} error={tried ? idError : undefined} value={id} spellCheck={false} autoComplete="off" onChange={(e) => setId(e.target.value.trim())} />
          <Field label={t("cfg.name")} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <Field label={t("cfg.command")} error={tried ? commandError : undefined} value={command} spellCheck={false} autoComplete="off" onChange={(e) => setCommand(e.target.value)} />
        <Textarea label={t("cfg.args")} hint={t("cfg.onePerLine")} mono value={args} spellCheck={false} onChange={(e) => setArgs(e.target.value)} />
        <Field label={t("cfg.envFile")} hint={t("cfg.envFileHint")} value={envFile} spellCheck={false} autoComplete="off" onChange={(e) => setEnvFile(e.target.value)} />
      </Stack>
    </FormDialog>
  );
}
