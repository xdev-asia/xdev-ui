// What the server is configured with: agent profiles (agents/*.toml), pipelines (pipelines/*.toml), squad
// templates and the approval rules. Agent and pipeline fields follow the phase 2 and AI SDLC specs; squad
// templates and the approval rules page are proposals the specs do not have yet.

import type { AgentProfile } from "@xdev-asia/ui";
import type { Role } from "./workspace";

export type GateKind = "push" | "command" | "edit";

/** One `[[gate]]` line: which tool calls of the agent need a person. Read top down; the first match wins. */
export interface GateRule {
  tools: string;
  /** Regex on the command, only to label a push; it does not protect anything. */
  whenCommand?: string;
  kind: GateKind;
}

export interface AgentConfig {
  id: string;
  name: string;
  profile: AgentProfile;
  command: string[];
  /** May hold `{hooks_file}`, filled in for each run. */
  args: string[];
  hookProtocol: "claude-hooks-v1" | "codex-hooks-v1";
  gates: GateRule[];
  timeoutSecs: number;
  hookTimeoutSecs: number;
  /** `xdevd` refuses to open a terminal whose args equal or contain one of these. */
  forbiddenArgs: string[];
  /** Shipped with xDev: it can be duplicated, not removed. */
  builtin?: boolean;
}

const CLAUDE_GATES: GateRule[] = [
  { tools: "Bash", whenCommand: "^\\s*git\\s+push\\b", kind: "push" },
  { tools: "Bash", kind: "command" },
  { tools: "Edit|Write|NotebookEdit", kind: "edit" },
];
const CODEX_GATES: GateRule[] = [
  { tools: "Bash", whenCommand: "^\\s*git\\s+push\\b", kind: "push" },
  { tools: "Bash", kind: "command" },
  { tools: "apply_patch", kind: "edit" },
];
const CLAUDE_FORBIDDEN = ["--dangerously-skip-permissions", "--permission-mode=bypassPermissions", "bypassPermissions"];
const CODEX_FORBIDDEN = ["--dangerously-bypass-approvals-and-sandbox", "--yolo", "danger-full-access"];

const claude = (id: string, name: string, extra: string[] = []): AgentConfig => ({
  id,
  name,
  profile: "claude",
  command: ["claude"],
  args: ["--settings", "{hooks_file}", "--permission-mode", "default", ...extra],
  hookProtocol: "claude-hooks-v1",
  gates: CLAUDE_GATES,
  timeoutSecs: 540,
  hookTimeoutSecs: 600,
  forbiddenArgs: CLAUDE_FORBIDDEN,
});

export const SEED_AGENT_CONFIGS: AgentConfig[] = [
  { ...claude("claude-code", "Claude Code"), builtin: true },
  {
    id: "codex",
    name: "Codex",
    profile: "codex",
    command: ["codex"],
    args: ["--profile", "xdev", "--sandbox", "workspace-write", "--ask-for-approval", "on-request"],
    hookProtocol: "codex-hooks-v1",
    gates: CODEX_GATES,
    timeoutSecs: 540,
    hookTimeoutSecs: 600,
    forbiddenArgs: CODEX_FORBIDDEN,
    builtin: true,
  },
  claude("claude-code-writer", "Claude Code, writer"),
  claude("claude-code-coder", "Claude Code, coder"),
  { ...claude("claude-code-reader", "Claude Code, reader"), gates: [{ tools: "Bash", kind: "command" }, { tools: "Edit|Write|NotebookEdit", kind: "edit" }] },
  claude("claude-code-tester", "Claude Code, tester"),
];

/** Pure: what keeps a profile from being saved, as message keys with values; empty when it can be saved. */
export function agentProblems(a: AgentConfig): { key: "cfg.errForbidden" | "cfg.errTimeout" | "cfg.errCommand" | "cfg.errPushOrder"; vars?: Record<string, string> }[] {
  const out: ReturnType<typeof agentProblems> = [];
  if (a.command.length === 0 || !a.command[0].trim()) out.push({ key: "cfg.errCommand" });
  for (const arg of a.args) {
    const hit = a.forbiddenArgs.find((f) => f && arg.includes(f));
    if (hit) out.push({ key: "cfg.errForbidden", vars: { arg: hit } });
  }
  if (!(a.timeoutSecs < a.hookTimeoutSecs)) out.push({ key: "cfg.errTimeout" });
  // A push line under a general Bash line never matches: the general line takes every command first.
  const general = a.gates.findIndex((g) => g.kind === "command" && !g.whenCommand);
  const push = a.gates.findIndex((g) => g.kind === "push");
  if (general >= 0 && push > general) out.push({ key: "cfg.errPushOrder" });
  return out;
}

export interface StageConfig {
  id: string;
  name: string;
  /** Id of an agent profile. */
  agent: string;
  /** The role brief, relative to pipelines/. */
  role: string;
  /** "request" or ids of earlier stages. */
  reads: string[];
  output: string;
  gate: "human" | "none";
  writesCode?: boolean;
  /** The stage ends with pass or fail; a fail sends the run back to `onFail`. */
  verdict?: boolean;
  onFail?: string;
  /** At this gate, "request changes" goes back to this stage instead of running this one again. */
  onChanges?: string;
}

export interface PipelineConfig {
  id: string;
  name: string;
  maxAttempts: number;
  commitArtifacts: boolean;
  exportDir: string;
  stages: StageConfig[];
}

const stage = (id: string, name: string, agent: string, reads: string[], output: string, gate: "human" | "none", extra: Partial<StageConfig> = {}): StageConfig => ({
  id,
  name,
  agent,
  role: `roles/${{ requirements: "analyst", design: "architect", plan: "planner", code: "implementer", review: "reviewer", test: "tester" }[id] ?? id}.md`,
  reads,
  output,
  gate,
  ...extra,
});

export const SEED_PIPELINES: PipelineConfig[] = [
  {
    id: "feature",
    name: "Feature",
    maxAttempts: 3,
    commitArtifacts: false,
    exportDir: "",
    stages: [
      stage("requirements", "Requirements", "claude-code-writer", ["request"], "01-requirements.md", "human"),
      stage("design", "Design", "claude-code-writer", ["request", "requirements"], "02-design.md", "human"),
      stage("plan", "Plan", "claude-code-writer", ["requirements", "design"], "03-plan.md", "human"),
      stage("code", "Code", "claude-code-coder", ["requirements", "design", "plan"], "04-changes.md", "none", { writesCode: true }),
      stage("review", "Review", "codex", ["requirements", "design", "plan", "code"], "05-review.md", "none", { verdict: true, onFail: "code" }),
      stage("test", "Test", "claude-code-tester", ["requirements", "plan", "code"], "06-test.md", "human", { verdict: true, onFail: "code", onChanges: "code" }),
    ],
  },
  {
    id: "fix",
    name: "Fix",
    maxAttempts: 3,
    commitArtifacts: false,
    exportDir: "",
    stages: [
      stage("requirements", "Requirements", "claude-code-writer", ["request"], "01-requirements.md", "human"),
      stage("plan", "Plan", "claude-code-writer", ["requirements"], "03-plan.md", "none"),
      stage("code", "Code", "claude-code-coder", ["requirements", "plan"], "04-changes.md", "none", { writesCode: true }),
      stage("review", "Review", "codex", ["requirements", "plan", "code"], "05-review.md", "none", { verdict: true, onFail: "code" }),
      stage("test", "Test", "claude-code-tester", ["requirements", "plan", "code"], "06-test.md", "human", { verdict: true, onFail: "code", onChanges: "code" }),
    ],
  },
];

/** Pure: what keeps a pipeline from being saved. */
export function pipelineProblems(p: PipelineConfig, agents: AgentConfig[]): { key: "cfg.errNoStage" | "cfg.errAgent" | "cfg.errOnFail" | "cfg.errReads" | "cfg.errLastGate" | "cfg.errAttempts" | "cfg.errOutput"; vars?: Record<string, string> }[] {
  const out: ReturnType<typeof pipelineProblems> = [];
  if (p.stages.length === 0) out.push({ key: "cfg.errNoStage" });
  if (!(p.maxAttempts >= 1 && p.maxAttempts <= 10)) out.push({ key: "cfg.errAttempts" });
  p.stages.forEach((st, i) => {
    const earlier = p.stages.slice(0, i).map((x) => x.id);
    if (!agents.some((a) => a.id === st.agent)) out.push({ key: "cfg.errAgent", vars: { stage: st.name } });
    if (!st.output.trim().endsWith(".md")) out.push({ key: "cfg.errOutput", vars: { stage: st.name } });
    for (const r of st.reads) if (r !== "request" && !earlier.includes(r)) out.push({ key: "cfg.errReads", vars: { stage: st.name, read: r } });
    for (const back of [st.onFail, st.onChanges]) if (back && !earlier.includes(back)) out.push({ key: "cfg.errOnFail", vars: { stage: st.name, back } });
  });
  // The last stage ends the run: a person always looks at it before it does.
  const last = p.stages[p.stages.length - 1];
  if (last && last.gate !== "human") out.push({ key: "cfg.errLastGate" });
  return out;
}

export interface TemplateSeat {
  id: string;
  role: string;
  parent: string | null;
  /** Id of an agent profile; "" leaves the seat vacant until someone fills it. */
  agent: string;
  brief: string;
}

export interface SquadTemplate {
  id: string;
  name: string;
  seats: TemplateSeat[];
  /** Peer links beyond who reports to whom. */
  peers: [string, string][];
  /** Rules whose breaking counts as a violation. Proposal: the specs do not define violations yet. */
  rules: { linkedOnly: boolean; escalateUp: boolean; editsByWriters: boolean };
}

export const SEED_TEMPLATES: SquadTemplate[] = [
  {
    id: "tpl-feature",
    name: "Feature squad",
    seats: [
      { id: "lead", role: "Lead", parent: null, agent: "claude-code", brief: "Split the request into tasks, answer the seats below, decide what goes back to a person." },
      { id: "implement", role: "Implement", parent: "lead", agent: "codex", brief: "Write the code for one task at a time." },
      { id: "review", role: "Review", parent: "lead", agent: "claude-code-reader", brief: "Read every change against the acceptance criteria." },
      { id: "tests", role: "Tests", parent: "implement", agent: "", brief: "Write and run the tests of each task." },
    ],
    peers: [
      ["implement", "review"],
      ["review", "tests"],
    ],
    rules: { linkedOnly: true, escalateUp: true, editsByWriters: true },
  },
  {
    id: "tpl-pair",
    name: "Pair",
    seats: [
      { id: "lead", role: "Lead", parent: null, agent: "claude-code", brief: "Plan and review." },
      { id: "write", role: "Write", parent: "lead", agent: "codex", brief: "Write what the lead asks for." },
    ],
    peers: [],
    rules: { linkedOnly: true, escalateUp: true, editsByWriters: false },
  },
];

/** Pure: what keeps a template from being saved. */
export function templateProblems(tpl: SquadTemplate): { key: "cfg.errOneTop" | "cfg.errRole" | "cfg.errLoop"; vars?: Record<string, string> }[] {
  const out: ReturnType<typeof templateProblems> = [];
  if (tpl.seats.filter((x) => x.parent === null).length !== 1) out.push({ key: "cfg.errOneTop" });
  const roles = tpl.seats.map((x) => x.role.trim().toLowerCase());
  if (roles.some((r, i) => !r || roles.indexOf(r) !== i)) out.push({ key: "cfg.errRole" });
  for (const seat of tpl.seats) {
    // Following parents must reach the top seat without coming back.
    const seen = new Set<string>();
    let at: TemplateSeat | undefined = seat;
    while (at && at.parent !== null) {
      if (seen.has(at.id)) {
        out.push({ key: "cfg.errLoop", vars: { role: seat.role } });
        break;
      }
      seen.add(at.id);
      at = tpl.seats.find((x) => x.id === at?.parent);
    }
  }
  return out;
}

/** Who may decide each kind of request. How long a request waits is set per agent (`timeoutSecs`); a gate of a
 *  run never expires. Proposal: the specs fix Approver as the role for every kind. */
export interface ApprovalRule {
  kind: GateKind | "stage";
  minRole: Role;
}

export const SEED_APPROVAL_RULES: ApprovalRule[] = [
  { kind: "command", minRole: "approver" },
  { kind: "edit", minRole: "approver" },
  { kind: "push", minRole: "approver" },
  { kind: "stage", minRole: "approver" },
];
