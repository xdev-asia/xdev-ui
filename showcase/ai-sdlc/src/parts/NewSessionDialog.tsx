import { useState, type JSX } from "react";
import { Field, FieldMessage, FormDialog, Select, Stack } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { href, navigate } from "../router";
import { useStore } from "../store";

/** A session is a branch with its own worktree. The project's setup runs in the new worktree. */
export function NewSessionDialog({ onClose }: { onClose: () => void }): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [projectName, setProjectName] = useState(s.project || (s.projects[0]?.name ?? ""));
  const project = s.projects.find((p) => p.name === projectName);
  const [base, setBase] = useState(project?.base ?? "main");
  const [branch, setBranch] = useState("");
  const [tried, setTried] = useState(false);

  const name = branch.trim();
  const error = !name ? t("ws.branchRequired") : s.sessions.some((x) => x.project === projectName && x.branch === name) ? t("ws.branchTaken") : undefined;
  const setup = [project?.setupScript, ...(project?.copyFiles ?? [])].filter(Boolean).join(" · ");

  return (
    <FormDialog
      modal
      busy={false}
      title={t("ws.newSession")}
      labels={ui.formDialogCreate}
      submitLabel={t("ws.create")}
      onCancel={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        if (error) return setTried(true);
        const id = Math.random().toString(16).slice(2, 14).padEnd(12, "0");
        const steps = [...(project?.copyFiles ?? []).map((f) => `$ cp ${f}`), ...(project?.setupScript ? [`$ ${project.setupScript}`] : [])];
        s.setSessions((list) => [...list, { id, project: projectName, branch: name, root: false, status: "idle", diff: { add: 0, del: 0 }, ...(steps.length ? { setup: "running" as const, setupLog: steps } : {}) }]);
        s.setSessionId(id);
        notify(t("ws.created", { name: `${projectName} / ${name}` }));
        navigate(href.workspace);
        onClose();
      }}
    >
      <Stack gap={3}>
        <div className="app-field">
          <label className="app-label" htmlFor="session-project">
            {t("ws.project")}
          </label>
          <Select
            id="session-project"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              setBase(s.projects.find((p) => p.name === e.target.value)?.base ?? "main");
            }}
            options={s.projects.map((p) => ({ value: p.name, label: p.name }))}
          />
        </div>
        <Field label={t("ws.base")} value={base} autoComplete="off" spellCheck={false} onChange={(e) => setBase(e.target.value)} />
        <Field label={t("ws.branch")} hint={t("ws.branchHint")} error={tried ? error : undefined} value={branch} autoComplete="off" spellCheck={false} onChange={(e) => setBranch(e.target.value)} />
        {setup ? (
          <FieldMessage tone="info">
            {t("projects.setup")}: {setup}
          </FieldMessage>
        ) : null}
      </Stack>
    </FormDialog>
  );
}
