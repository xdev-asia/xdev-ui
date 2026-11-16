import { useState, type JSX } from "react";
import { Button, Stack, Textarea } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { STAGE_KEY } from "../pages/run-keys";
import { href, navigate } from "../router";
import { useStore } from "../store";
import type { Run } from "../workspace";
import { CommentDialog, PendingComments } from "./Comments";
import { MdView } from "./MdView";
import { useGate } from "./useGate";

/** A stage gate, decided here with the same rules as on the run's page. */
export function StageDecision({ run, canDecide }: { run: Run; canDecide: boolean }): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  const notify = useNotify();
  const gate = useGate(run);
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);
  const [passage, setPassage] = useState<string | null>(null);
  const text = gate.doc?.versions[gate.doc.versions.length - 1]?.text;
  return (
    <Stack gap={3}>
      {text ? <MdView text={text} onPick={canDecide ? setPassage : undefined} pickLabel={t("comments.addPassage")} /> : null}
      {gate.comments.length > 0 ? <PendingComments scope={gate.scope} /> : null}
      <Textarea label={t("approvals.note")} hint={t("approvals.noteHint")} error={tried && !note.trim() && gate.comments.length === 0 ? t("approvals.noteRequired") : undefined} value={note} disabled={!canDecide} onChange={(e) => setNote(e.target.value)} />
      <p className="app-muted">
        {gate.final ? t("runs.changesHintFinal") : t("runs.changesHint", { stage: t(STAGE_KEY[run.stage]) })} {t("runs.noExpiry")}
      </p>
      <Stack direction="row" gap={2} justify="end" wrap>
        <Button
          variant="secondary"
          icon="arrow-right"
          onClick={() => {
            s.setRunId(run.id);
            navigate(href.runs);
          }}
        >
          {t("approvals.openRun")}
        </Button>
        {gate.doc ? (
          <Button
            variant="secondary"
            icon="edit"
            disabled={!canDecide}
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
        <Button
          variant="secondary"
          disabled={!canDecide}
          onClick={() => {
            if (!gate.requestChanges(note)) return setTried(true);
            notify(t("approvals.changesSent", { title: run.title }));
          }}
        >
          {t("approvals.requestChanges")}
        </Button>
        <Button
          variant="primary"
          icon="check"
          disabled={!canDecide}
          onClick={() => {
            gate.approve();
            notify(t("approvals.approved", { title: run.title }));
          }}
        >
          {t("approvals.approve")}
        </Button>
      </Stack>
      {passage !== null && gate.doc ? <CommentDialog scope={gate.scope} target={gate.doc.file} quote={passage} title={t("comments.addPassage")} onClose={() => setPassage(null)} /> : null}
    </Stack>
  );
}
