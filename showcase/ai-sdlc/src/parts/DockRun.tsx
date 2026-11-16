import { useState, type JSX } from "react";
import { Badge, Banner, Button, Card, EmptyState, FieldMessage, FormDialog, Stack, StatusDot, Tag, Textarea, type StatusTone } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { tabKey } from "../layout";
import { useNotify } from "../notify";
import { STAGE_KEY, STATE_KEY } from "../pages/run-keys";
import { href, navigate } from "../router";
import { canDecide, useStore } from "../store";
import { PIPELINES, type Run, type Session, type StageId } from "../workspace";
import { useGate } from "./useGate";

/** The run of the worktree: its stages, and the gate that waits, decided here. */
export function RunDock({ session, run, onOpen }: { session: Session; run?: Run; onOpen: (key: string) => void }): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  if (!run) return <EmptyState size="inline" icon="workflow" title={t("dock.noRun")} hint={t("dock.noRunHint")} />;
  const openPage = (): void => {
    s.setRunId(run.id);
    navigate(href.runs);
  };
  return <RunDockBody key={run.id} session={session} run={run} onOpen={onOpen} openPage={openPage} />;
}

function RunDockBody({ run, onOpen, openPage }: { session: Session; run: Run; onOpen: (key: string) => void; openPage: () => void }): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const gate = useGate(run);
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState("");
  const approver = canDecide(s, "stage");
  const stages = PIPELINES[run.pipeline].stages;
  const tone = (stage: StageId): StatusTone => {
    const i = stages.indexOf(stage);
    const at = stages.indexOf(run.stage);
    if (run.state === "done" || i < at) return "ok";
    if (i > at) return "neutral";
    return run.state === "blocked" ? "danger" : run.state === "waiting_gate" ? "warn" : "accent";
  };
  const last = gate.doc?.versions[gate.doc.versions.length - 1];

  return (
    <Stack gap={4}>
      <Stack gap={1}>
        <span className="app-text">{run.title}</span>
        <span className="app-row">
          <Badge status={run.state === "done" ? "unchanged" : "changed"}>{t(STATE_KEY[run.state])}</Badge>
          <Tag>{t(run.pipeline === "feature" ? "runs.pipelineFeature" : "runs.pipelineFix")}</Tag>
        </span>
      </Stack>
      <ol className="app-dock-stages">
        {stages.map((st) => (
          <li key={st}>
            <StatusDot tone={tone(st)} label={t(STAGE_KEY[st])} />
          </li>
        ))}
      </ol>
      {run.state === "blocked" ? <Banner tone="warn" title={t("runs.blockedTitle")} /> : null}
      {run.state === "waiting_gate" ? (
        <Card title={t("dock.gateWaits", { stage: t(STAGE_KEY[run.stage]) })} subtitle={gate.doc && last ? t("dock.gateDoc", { file: gate.doc.file, n: last.n }) : undefined}>
          <Stack gap={3}>
            <p className="app-muted">
              {gate.final ? t("runs.changesHintFinal") : t("runs.changesHint", { stage: t(STAGE_KEY[run.stage]) })} {t("runs.noExpiry")}
            </p>
            {!approver ? <FieldMessage tone="info">{t("roles.needApprover", { role: t(`roles.${s.role}`) })}</FieldMessage> : null}
            <Stack direction="row" gap={2} wrap>
              {gate.doc ? (
                <Button variant="secondary" icon="docs" onClick={() => gate.doc && onOpen(tabKey({ kind: "doc", id: gate.doc.id }))}>
                  {t("dock.readDoc")}
                </Button>
              ) : null}
              {gate.doc ? (
                <Button
                  variant="secondary"
                  icon="edit"
                  disabled={!approver}
                  onClick={() => {
                    if (!gate.doc) return;
                    s.setProject(run.project);
                    s.setDocId(gate.doc.id);
                    navigate(href.documents);
                  }}
                >
                  {t("runs.editDoc")}
                </Button>
              ) : null}
            </Stack>
            <Stack direction="row" gap={2} justify="end" wrap>
              <Button
                variant="secondary"
                disabled={!approver}
                onClick={() => {
                  setNote("");
                  setAsking(true);
                }}
              >
                {t("approvals.requestChanges")}
              </Button>
              <Button
                variant="primary"
                icon="check"
                disabled={!approver}
                onClick={() => {
                  gate.approve();
                  notify(t("approvals.approved", { title: run.title }));
                }}
              >
                {t("approvals.approve")}
              </Button>
            </Stack>
          </Stack>
        </Card>
      ) : null}
      <Button variant="ghost" icon="arrow-right" onClick={openPage}>
        {t("dock.openRunPage")}
      </Button>
      {asking ? (
        <FormDialog
          modal
          busy={false}
          title={t("dock.changesTitle", { stage: t(STAGE_KEY[run.stage]) })}
          labels={ui.formDialog}
          submitLabel={t("approvals.requestChanges")}
          submitDisabled={!note.trim()}
          onCancel={() => setAsking(false)}
          onSubmit={(e) => {
            e.preventDefault();
            if (!gate.requestChanges(note)) return;
            notify(t("approvals.changesSent", { title: run.title }));
            setAsking(false);
          }}
        >
          <Textarea label={t("approvals.note")} hint={t("approvals.noteHint")} value={note} onChange={(e) => setNote(e.target.value)} />
        </FormDialog>
      ) : null}
    </Stack>
  );
}

