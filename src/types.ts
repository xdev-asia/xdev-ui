export type SessionState = "working" | "failed" | "waiting" | "done" | "idle" | "exited";
export type PrState = "open" | "draft" | "merged" | "closed";
export type CheckState = "pass" | "skipping" | "fail" | "cancel" | "pending";
export type AgentProfile = "claude" | "codex" | "custom";
/** 1–10 → --x-tab-color-N. 5, 7, 9 are color-mix blends in base.css. */
export type TabColor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
