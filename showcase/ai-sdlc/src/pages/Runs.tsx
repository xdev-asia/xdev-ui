import { useState, type JSX } from "react";
import { Board, BoardCard, BoardColumn, Button, Field, FieldMessage, FormDialog, PageHeader, RadioGroup, Select, Stack, Tag, Textarea } from "@xdev-asia/ui";
import { slugify } from "../data";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { can, inProject, logEvent, useStore } from "../store";
import { PIPELINES, STAGES, boardColumn, type PipelineId, type Run, type StageId } from "../workspace";
import { RunDetail } from "./RunDetail";
import { CARD_STATUS, STAGE_KEY, attemptsOf } from "./run-keys";

export function RunsPage(): JSX.Element {
  const s = useStore();
  const run = s.runs.find((r) => r.id === s.runId);
  return run ? <RunDetail run={run} /> : <RunBoard />;
}

function RunBoard(): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const [creating, setCreating] = useState(false);
  const runs = s.runs.filter((r) => inProject(s.project, r.project));
  const columns: { id: StageId | "gate" | "done"; title: string }[] = [
    ...STAGES.map((id) => ({ id, title: t(STAGE_KEY[id]) })),
    { id: "gate", title: t("runs.colGate") },
    { id: "done", title: t("runs.colDone") },
  ];
  return (
    <Stack gap={4}>
      <PageHeader
        title={t("runs.title")}
        description={t("runs.description")}
        actions={
          can(s.role, "operator") ? (
            <Button variant="primary" icon="plus" onClick={() => setCreating(true)}>
              {t("runs.new")}
            </Button>
          ) : undefined
        }
      />
      <Board aria-label={t("runs.board")}>
        {columns.map((col) => {
          const mine = runs.filter((r) => boardColumn(r) === col.id);
          return (
            <BoardColumn key={col.id} title={col.title} count={mine.length} labels={ui.boardColumn}>
              {mine.map((r) => (
                <BoardCard
                  key={r.id}
                  title={r.title}
                  meta={`${r.project} · ${t(r.pipeline === "feature" ? "runs.pipelineFeature" : "runs.pipelineFix")}`}
                  status={CARD_STATUS[r.state]}
                  tone={r.state === "waiting_gate" || r.state === "blocked" ? "need" : undefined}
                  labels={ui.boardCard}
                  onOpen={() => s.setRunId(r.id)}
                  tags={
                    <>
                      {r.state === "waiting_gate" ? <Tag tone="warn">{t(STAGE_KEY[r.stage])}</Tag> : null}
                      {r.state === "blocked" ? <Tag tone="warn">{t(r.blocked === "interrupted" ? "runs.blockedShortInterrupted" : r.blocked === "agent_exit" ? "runs.blockedShortExit" : "runs.blockedShortMax", { n: attemptsOf(r, r.stage) })}</Tag> : null}
                      {r.state !== "done" && r.state !== "cancelled" ? <Tag>{t("runs.attempt", { stage: t(STAGE_KEY[r.stage]), n: attemptsOf(r, r.stage) })}</Tag> : null}
                    </>
                  }
                />
              ))}
            </BoardColumn>
          );
        })}
      </Board>
      {creating ? <NewRunDialog onClose={() => setCreating(false)} /> : null}
    </Stack>
  );
}

function NewRunDialog({ onClose }: { onClose: () => void }): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [projectName, setProjectName] = useState(s.project || (s.projects[0]?.name ?? ""));
  const [pipeline, setPipeline] = useState<PipelineId>("feature");
  const [base, setBase] = useState("main");
  const [title, setTitle] = useState("");
  const [request, setRequest] = useState("");
  const [tried, setTried] = useState(false);
  const gates = PIPELINES[pipeline].gatesAfter.map((g) => t(STAGE_KEY[g])).join(", ");
  const reviewer = s.accounts.some((a) => a.agent === "codex" && a.status === "signed_in");

  return (
    <FormDialog
      modal
      busy={false}
      size="wide"
      title={t("runs.newTitle")}
      labels={ui.formDialogCreate}
      submitLabel={t("runs.start")}
      onCancel={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim() || !request.trim()) return setTried(true);
        const id = `run-${Math.random().toString(16).slice(2, 6)}`;
        const branch = `sdlc/${id.slice(4)}-${slugify(title).slice(0, 24)}`;
        const run: Run = { id, title: title.trim(), project: projectName, pipeline, branch, base, state: "running", stage: "requirements", diff: { add: 0, del: 0 }, attempts: [{ id: `${id}-1`, stage: "requirements", n: 1, status: "running", at: "now" }] };
        s.setRuns((list) => [...list, run]);
        s.setSessions((list) => [...list, { id: Math.random().toString(16).slice(2, 14).padEnd(12, "0"), project: projectName, branch, root: false, status: "working", diff: { add: 0, del: 0 } }]);
        logEvent(s, id, "run_created", s.device, `${pipeline}, base ${base}`);
        notify(t("runs.started", { title: run.title }));
        onClose();
      }}
    >
      <Stack gap={3}>
        <div className="app-field">
          <label className="app-label" htmlFor="run-project">
            {t("runs.project")}
          </label>
          <Select id="run-project" value={projectName} onChange={(e) => setProjectName(e.target.value)} options={s.projects.map((p) => ({ value: p.name, label: p.name }))} />
        </div>
        <RadioGroup
          name="run-pipeline"
          orientation="vertical"
          label={t("runs.pipeline")}
          value={pipeline}
          onChange={(v) => setPipeline(v as PipelineId)}
          options={[
            { value: "feature", label: t("runs.pipelineFeature"), hint: t("runs.pipelineFeatureHint") },
            { value: "fix", label: t("runs.pipelineFix"), hint: t("runs.pipelineFixHint") },
          ]}
        />
        <Field label={t("runs.base")} value={base} autoComplete="off" spellCheck={false} onChange={(e) => setBase(e.target.value)} />
        <Field label={t("runs.runTitle")} error={tried && !title.trim() ? t("runs.titleRequired") : undefined} value={title} autoComplete="off" onChange={(e) => setTitle(e.target.value)} />
        <Textarea label={t("runs.request")} hint={t("runs.requestHint")} error={tried && !request.trim() ? t("runs.requestRequired") : undefined} value={request} onChange={(e) => setRequest(e.target.value)} />
        <FieldMessage tone="info">
          {t("runs.gates")}: {gates}
        </FieldMessage>
        <FieldMessage tone="info">{reviewer ? t("runs.reviewOther", { agent: "Codex" }) : t("runs.sameAgent")}</FieldMessage>
      </Stack>
    </FormDialog>
  );
}
