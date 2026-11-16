import type { AgentProfile } from "@xdev-asia/ui";

// Mock data for the prototype. Field names follow specs/2026-11-11-xdev-server-accounts-k8s.md, section 4.
export type AgentId = "claude-code" | "codex";
export type AuthKind = "login" | "env_file";
export type AccountStatus = "signed_in" | "signed_out" | "checking" | "error";

export interface Account {
  id: string;
  name: string;
  agent: AgentId;
  auth: AuthKind;
  envFile?: string;
  status: AccountStatus;
  /** Terminals that use the account now. */
  terminals: number;
  maxTerminals?: number;
  checkedAt: string;
}

export interface AgentInfo {
  id: AgentId;
  /** Product name: never translated. */
  name: string;
  profile: AgentProfile;
  command: string;
  /** The environment variable that points the CLI at one account's own config folder. */
  configVar: string;
  /** What the sign-in terminal runs, and what xDev runs to read whether the account is signed in. */
  loginCommand: string;
  statusCommand: string;
}

export const AGENTS: AgentInfo[] = [
  { id: "claude-code", name: "Claude Code", profile: "claude", command: "claude", configVar: "CLAUDE_CONFIG_DIR", loginCommand: "claude auth login", statusCommand: "claude auth status" },
  { id: "codex", name: "Codex", profile: "codex", command: "codex", configVar: "CODEX_HOME", loginCommand: "codex login --device-auth", statusCommand: "codex login status" },
];

/** What a terminal runs: one of the agents, or a plain shell. */
export type TermAgent = AgentId | "shell";

const SHELL = { id: "shell", name: "Shell", profile: "custom" as AgentProfile, command: "sh" };

export const agentOf = (id: TermAgent): Omit<AgentInfo, "id"> & { id: TermAgent } => (id === "shell" ? SHELL : (AGENTS.find((a) => a.id === id) ?? AGENTS[0])) as Omit<AgentInfo, "id"> & { id: TermAgent };

export const SEED_ACCOUNTS: Account[] = [
  { id: "work", name: "Work", agent: "claude-code", auth: "login", status: "signed_in", terminals: 2, maxTerminals: 4, checkedAt: "2026-11-16T07:40:00Z" },
  { id: "personal", name: "Personal", agent: "claude-code", auth: "login", status: "signed_out", terminals: 0, checkedAt: "2026-11-16T07:40:00Z" },
  { id: "ci", name: "Server", agent: "claude-code", auth: "env_file", envFile: "/run/secrets/xdev/ci.env", status: "signed_in", terminals: 0, checkedAt: "2026-11-16T07:40:00Z" },
  { id: "codex-work", name: "Work", agent: "codex", auth: "login", status: "signed_in", terminals: 1, maxTerminals: 2, checkedAt: "2026-11-16T07:40:00Z" },
  { id: "codex-team", name: "Team key", agent: "codex", auth: "env_file", envFile: "/home/you/keys/codex-team.env", status: "error", terminals: 0, checkedAt: "2026-11-16T07:40:00Z" },
];

/** Pure: a profile id from a name ("Team key" -> "team-key"). */
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type IdError = "required" | "format" | "taken" | null;

/** Pure: checks a profile id against the ids already used. */
export function checkId(id: string, taken: readonly string[]): IdError {
  if (!id) return "required";
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) return "format";
  return taken.includes(id) ? "taken" : null;
}

/** Pure: why this account cannot take one more terminal, or null when it can. */
export function blockReason(a: Account): "signedOut" | "error" | "full" | null {
  if (a.status === "signed_out") return "signedOut";
  if (a.status === "error") return "error";
  if (a.maxTerminals !== undefined && a.terminals >= a.maxTerminals) return "full";
  return null;
}
