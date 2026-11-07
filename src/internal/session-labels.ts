import type { SessionState } from "../types";

/** English words for a session state, shared by the parts that print one. */
export const SESSION_STATE_LABELS: Record<SessionState, string> = {
  working: "Working",
  failed: "Failed",
  waiting: "Needs you",
  done: "Done",
  idle: "Idle",
  exited: "Exited",
};
