import { logEvent, useStore } from "../store";
import { PIPELINES, nextStage, type Comment, type Doc, type Run, type StageId } from "../workspace";

export interface Gate {
  /** The document the gate decides on. */
  doc: Doc | undefined;
  /** The last gate of the pipeline. */
  final: boolean;
  /** Where passage comments for this gate are kept until they are sent. */
  scope: string;
  comments: Comment[];
  approve: () => void;
  /** False when there is neither a note nor a comment: nothing was sent. */
  requestChanges: (note: string) => boolean;
}

/** The decision at a run's gate. The run's page and the Approvals page both use it, so a decision made in one
 *  place is the same decision in the other. */
export function useGate(run: Run): Gate {
  const s = useStore();
  const stages = PIPELINES[run.pipeline].stages;
  const final = run.stage === stages[stages.length - 1];
  const doc = s.docs.find((d) => d.runId === run.id && d.stage === run.stage);
  const scope = `gate:${run.id}`;
  const comments = s.comments[scope] ?? [];

  const patch = (change: Partial<Run>): void => s.setRuns((list) => list.map((r) => (r.id === run.id ? { ...r, ...change } : r)));
  const attempt = (stage: StageId, reason?: string): Run["attempts"] => [
    ...run.attempts,
    { id: `${run.id}-${run.attempts.length + 1}`, stage, n: run.attempts.filter((a) => a.stage === stage).length + 1, status: "running", at: "now", reason },
  ];
  const settle = (choice: "approve" | "changes", note?: string): void => {
    s.setApprovals((list) => list.map((a) => (a.runId === run.id && !a.decided ? { ...a, decided: { choice, by: s.device, note, agoMin: 0 } } : a)));
    s.setComments((all) => ({ ...all, [scope]: [] }));
  };

  return {
    doc,
    final,
    scope,
    comments,
    approve: () => {
      const next = nextStage(run.pipeline, run.stage);
      if (doc) s.setDocs((list) => list.map((d) => (d.id === doc.id ? { ...d, status: "approved", versions: d.versions.map((v, i) => (i === d.versions.length - 1 ? { ...v, approvedBy: s.device, approvedAt: "now" } : v)) } : d)));
      logEvent(s, run.id, "gate_decided", s.device, "approve");
      if (next) patch({ state: "running", stage: next, attempts: attempt(next) });
      else {
        patch({ state: "done" });
        logEvent(s, run.id, "run_done", "xdevd", run.branch);
      }
      settle("approve");
    },
    requestChanges: (note) => {
      const text = note.trim();
      if (!text && comments.length === 0) return false;
      // At the last gate the thing to change is the code, not the test report.
      const back: StageId = final ? "code" : run.stage;
      const reason = [text, ...comments.map((c) => `"${c.quote}": ${c.text}`)].filter(Boolean).join(" · ");
      if (doc) s.setDocs((list) => list.map((d) => (d.id === doc.id ? { ...d, status: "changes" } : d)));
      logEvent(s, run.id, "gate_decided", s.device, `changes: ${reason}`);
      patch({ state: "running", stage: back, attempts: attempt(back, reason) });
      settle("changes", text || undefined);
      return true;
    },
  };
}
