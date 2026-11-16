import type { BoardCardStatus } from "@xdev-asia/ui";
import type { MessageKey } from "../i18n";
import type { Run, RunState, StageId } from "../workspace";

export const STAGE_KEY: Record<StageId, MessageKey> = {
  requirements: "runs.stageRequirements",
  design: "runs.stageDesign",
  plan: "runs.stagePlan",
  code: "runs.stageCode",
  review: "runs.stageReview",
  test: "runs.stageTest",
};
export const STATE_KEY: Record<RunState, MessageKey> = { running: "runs.stateRunning", waiting_gate: "runs.stateWaiting", blocked: "runs.stateBlocked", done: "runs.stateDone", cancelled: "runs.stateCancelled" };
export const CARD_STATUS: Record<RunState, BoardCardStatus> = { running: "running", waiting_gate: "waiting", blocked: "error", done: "idle", cancelled: "idle" };

export const attemptsOf = (run: Run, stage: StageId): number => run.attempts.filter((a) => a.stage === stage).length;
