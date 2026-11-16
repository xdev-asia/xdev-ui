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

/** "full": hooks report state and stop actions for approval, accounts have their own config folder, quota is
 *  tracked. "basic": the agent runs in a terminal, reports a finished stage with `xdev stage done`, and is kept
 *  safe by the sandbox and the list of allowed commands. */
export type AgentLevel = "full" | "basic";

export interface AgentConfig {
  id: string;
  name: string;
  /** Who makes it, as shown in the catalog. */
  vendor: string;
  level: AgentLevel;
  profile: AgentProfile;
  /** Letter on the chip when the library has no profile for the agent. */
  letter?: string;
  command: string[];
  /** May hold `{hooks_file}`, filled in for each run. */
  args: string[];
  /** Null for an agent without hooks. */
  hookProtocol: "claude-hooks-v1" | "codex-hooks-v1" | null;
  gates: GateRule[];
  /** Commands that run without asking anyone. Everything stays inside the worktree's sandbox. */
  allow: string[];
  /** A file with the API key, for agents billed by key rather than by subscription. */
  envFile?: string;
  /** The command and its flags come from the vendor's docs and were not tried on this server. */
  unverified?: boolean;
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

/** Commands any agent may run without asking: they read, build or test inside the worktree. */
const READ_AND_TEST = ["git status", "git diff", "git log", "ls", "cat", "rg", "pnpm test", "pnpm build", "cargo test", "cargo build"];

const claude = (id: string, name: string, extra: string[] = []): AgentConfig => ({
  id,
  name,
  vendor: "Anthropic",
  level: "full",
  allow: READ_AND_TEST,
  profile: "claude",
  command: ["claude"],
  args: ["--settings", "{hooks_file}", "--permission-mode", "default", ...extra],
  hookProtocol: "claude-hooks-v1",
  gates: CLAUDE_GATES,
  timeoutSecs: 540,
  hookTimeoutSecs: 600,
  forbiddenArgs: CLAUDE_FORBIDDEN,
});

/** An agent of the catalog at the basic level: it runs in a terminal, with no hooks. Commands follow each vendor's
 *  docs and were not tried here. */
const basic = (id: string, name: string, vendor: string, letter: string, command: string[], envFile?: string): AgentConfig => ({
  id,
  name,
  vendor,
  level: "basic",
  profile: "custom",
  letter,
  command,
  args: [],
  hookProtocol: null,
  gates: [],
  allow: READ_AND_TEST,
  timeoutSecs: 540,
  hookTimeoutSecs: 600,
  forbiddenArgs: ["--yolo", "--dangerously-skip-permissions"],
  envFile,
  builtin: true,
  unverified: true,
});

export const SEED_AGENT_CONFIGS: AgentConfig[] = [
  { ...claude("claude-code", "Claude Code"), builtin: true },
  {
    id: "codex",
    name: "Codex",
    vendor: "OpenAI",
    level: "full",
    allow: READ_AND_TEST,
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
  basic("opencode", "OpenCode", "SST", "O", ["opencode"]),
  basic("gemini-cli", "Gemini CLI", "Google", "G", ["gemini"]),
  basic("hermes", "Hermes Agent", "Nous Research", "H", ["hermes"], "~/.xdev/keys/openrouter.env"),
  basic("copilot-cli", "GitHub Copilot CLI", "GitHub", "P", ["copilot"]),
  basic("cursor-cli", "Cursor CLI", "Cursor", "U", ["cursor-agent"]),
  basic("qwen-code", "Qwen Code", "Alibaba", "Q", ["qwen"]),
  basic("aider", "Aider", "Aider", "A", ["aider"], "~/.xdev/keys/openrouter.env"),
  basic("goose", "Goose", "Block", "S", ["goose"]),
  basic("amp", "Amp", "Sourcegraph", "M", ["amp"]),
  basic("kimi", "Kimi CLI", "Moonshot AI", "K", ["kimi"]),
  claude("claude-code-writer", "Claude Code, writer"),
  claude("claude-code-coder", "Claude Code, coder"),
  { ...claude("claude-code-reader", "Claude Code, reader"), gates: [{ tools: "Bash", kind: "command" }, { tools: "Edit|Write|NotebookEdit", kind: "edit" }] },
  claude("claude-code-tester", "Claude Code, tester"),
];

/** Pure: what keeps a profile from being saved, as message keys with values; empty when it can be saved. */
export function agentProblems(a: AgentConfig): { key: "cfg.errForbidden" | "cfg.errTimeout" | "cfg.errCommand" | "cfg.errPushOrder" | "cfg.errAllowPush"; vars?: Record<string, string> }[] {
  const out: ReturnType<typeof agentProblems> = [];
  if (a.command.length === 0 || !a.command[0].trim()) out.push({ key: "cfg.errCommand" });
  for (const arg of a.args) {
    const hit = a.forbiddenArgs.find((f) => f && arg.includes(f));
    if (hit) out.push({ key: "cfg.errForbidden", vars: { arg: hit } });
  }
  if (a.hookProtocol && !(a.timeoutSecs < a.hookTimeoutSecs)) out.push({ key: "cfg.errTimeout" });
  // A push line under a general Bash line never matches: the general line takes every command first.
  const general = a.gates.findIndex((g) => g.kind === "command" && !g.whenCommand);
  const push = a.gates.findIndex((g) => g.kind === "push");
  if (general >= 0 && push > general) out.push({ key: "cfg.errPushOrder" });
  if (a.allow.some((c) => /^\s*git\s+push\b/.test(c))) out.push({ key: "cfg.errAllowPush" });
  return out;
}

export interface StageConfig {
  id: string;
  name: string;
  /** Id of an agent profile. */
  agent: string;
  /** The role brief, relative to pipelines/. */
  /** How to do the stage: a skill in the knowledge repo. */
  skill: string;
  /** "request" or ids of earlier stages. */
  reads: string[];
  output: string;
  gate: GateConfig;
  writesCode?: boolean;
  /** The stage ends with pass or fail; a fail sends the run back to `onFail`. */
  verdict?: boolean;
  onFail?: string;
  /** At this gate, "request changes" goes back to this stage instead of running this one again. */
  onChanges?: string;
}

/** Who decides at the gate after a stage. "ai+human": an agent grades first, a person confirms. */
export type GateBy = "none" | "human" | "ai" | "ai+human";

export interface GateConfig {
  by: GateBy;
  /** With "ai" and "ai+human": the agent that grades. It must not be the agent that wrote the stage. */
  agent?: string;
  /** With "ai" and "ai+human": the criteria, a skill in the knowledge repo. */
  skill?: string;
}

export interface PipelineConfig {
  id: string;
  name: string;
  maxAttempts: number;
  commitArtifacts: boolean;
  exportDir: string;
  stages: StageConfig[];
}

const ai = (stageId: string, agent = "codex", by: GateBy = "ai+human"): GateConfig => ({ by, agent, skill: `skills/gates/${stageId}.md` });
const HUMAN: GateConfig = { by: "human" };
const NONE: GateConfig = { by: "none" };

const stage = (id: string, name: string, agent: string, reads: string[], output: string, gate: GateConfig, extra: Partial<StageConfig> = {}): StageConfig => ({
  id,
  name,
  agent,
  skill: `skills/stages/${id}.md`,
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
      stage("requirements", "Requirements", "claude-code-writer", ["request"], "01-requirements.md", ai("requirements")),
      stage("design", "Design", "claude-code-writer", ["request", "requirements"], "02-design.md", ai("design")),
      stage("plan", "Plan", "claude-code-writer", ["requirements", "design"], "03-plan.md", ai("plan", "codex", "ai")),
      stage("code", "Code", "claude-code-coder", ["requirements", "design", "plan"], "04-changes.md", NONE, { writesCode: true }),
      stage("review", "Review", "codex", ["requirements", "design", "plan", "code"], "05-review.md", NONE, { verdict: true, onFail: "code" }),
      stage("test", "Test", "claude-code-tester", ["requirements", "plan", "code"], "06-test.md", HUMAN, { verdict: true, onFail: "code", onChanges: "code" }),
    ],
  },
  {
    id: "fix",
    name: "Fix",
    maxAttempts: 3,
    commitArtifacts: false,
    exportDir: "",
    stages: [
      stage("requirements", "Requirements", "claude-code-writer", ["request"], "01-requirements.md", ai("requirements")),
      stage("plan", "Plan", "claude-code-writer", ["requirements"], "03-plan.md", NONE),
      stage("code", "Code", "claude-code-coder", ["requirements", "plan"], "04-changes.md", NONE, { writesCode: true }),
      stage("review", "Review", "codex", ["requirements", "plan", "code"], "05-review.md", NONE, { verdict: true, onFail: "code" }),
      stage("test", "Test", "claude-code-tester", ["requirements", "plan", "code"], "06-test.md", HUMAN, { verdict: true, onFail: "code", onChanges: "code" }),
    ],
  },
];

/** Pure: what keeps a pipeline from being saved. */
export function pipelineProblems(p: PipelineConfig, agents: AgentConfig[]): { key: "cfg.errNoStage" | "cfg.errAgent" | "cfg.errOnFail" | "cfg.errReads" | "cfg.errLastGate" | "cfg.errAttempts" | "cfg.errOutput" | "cfg.errGateAgent" | "cfg.errGateSame" | "cfg.errGateSkill"; vars?: Record<string, string> }[] {
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
  if (last && last.gate.by !== "human" && last.gate.by !== "ai+human") out.push({ key: "cfg.errLastGate" });
  for (const st of p.stages) {
    if (st.gate.by !== "ai" && st.gate.by !== "ai+human") continue;
    if (!st.gate.agent || !agents.some((a) => a.id === st.gate.agent)) out.push({ key: "cfg.errGateAgent", vars: { stage: st.name } });
    else if (st.gate.agent === st.agent) out.push({ key: "cfg.errGateSame", vars: { stage: st.name } });
    if (!st.gate.skill?.trim()) out.push({ key: "cfg.errGateSkill", vars: { stage: st.name } });
  }
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

/** One file of a knowledge repo, with its commits newest last. */
export interface KnowledgeFile {
  path: string;
  versions: { n: number; by: string; at: string; note: string; text: string }[];
}

/** A project's knowledge repo: a git repo of its own, read by the agents of every stage, edited by people. */
export interface KnowledgeRepo {
  project: string;
  remote: string;
  path: string;
  files: KnowledgeFile[];
}

const file = (path: string, text: string, at = "Mon 09:12", by = "Chrome on Linux"): KnowledgeFile => ({ path, versions: [{ n: 1, by, at, note: "First version", text }] });

export const SEED_KNOWLEDGE: KnowledgeRepo[] = [
  {
    project: "api",
    remote: "git@build-box:knowledge/api.git",
    path: "/srv/knowledge/api",
    files: [
      file("README.md", "## Knowledge of api\n- Read product.md first.\n- Standards live in standards/, decisions in adr/.\n- Skills for every stage and gate live in skills/."),
      file("product.md", "## Product\n- An invoicing API for small shops.\n- Customers: shops with 1 to 50 staff."),
      file("standards/code.md", "## Code standards\n- Rust 2024, clippy clean.\n- Every endpoint has an integration test.\n- No unwrap outside tests."),
      file("adr/0001-database.md", "## ADR 1: D1 for state\n- Status: accepted.\n- Why: no new service to run."),
      file("skills/stages/requirements.md", "## Write the requirements\n- One problem statement.\n- Acceptance criteria numbered AC-1, AC-2 and testable.\n- List what is out of scope.\n- End with open questions."),
      file("skills/stages/design.md", "## Write the design\n- The chosen approach and why.\n- Code affected, file by file.\n- Risks, and what was rejected."),
      file("skills/stages/plan.md", "## Write the plan\n- Tasks small enough for one commit each.\n- Each task names its files and its test."),
      file("skills/stages/code.md", "## Write the code\n- Follow standards/code.md.\n- One commit per task of the plan."),
      file("skills/stages/review.md", "## Review the change\n- Check every acceptance criterion.\n- Verdict pass or fail, with findings by file and line."),
      file("skills/stages/test.md", "## Test the change\n- Run the whole suite.\n- Check each acceptance criterion and say how."),
      file("skills/gates/requirements.md", "## Grade the requirements\n- Pass when: every criterion is testable; scope is stated; no solution is written as a requirement.\n- Ask for changes when: a criterion cannot be checked; the problem is missing."),
      file("skills/gates/design.md", "## Grade the design\n- Pass when: it covers every acceptance criterion; it names the files; it states risks.\n- Ask for changes when: it adds a service without a reason; a criterion is not covered."),
      file("skills/gates/plan.md", "## Grade the plan\n- Pass when: every task has a test; tasks follow the design.\n- Ask for changes when: a task is too big for one commit."),
    ],
  },
  {
    project: "demo",
    remote: "git@build-box:knowledge/demo.git",
    path: "/srv/knowledge/demo",
    files: [file("README.md", "## Knowledge of demo\n- The demo app of the design system."), file("skills/stages/code.md", "## Write the code\n- Use @xdev-asia/ui components only.")],
  },
];

/** Pure: where a skill is used: stages and gates of pipelines. */
export function skillUsers(path: string, pipelines: PipelineConfig[]): string[] {
  return pipelines.flatMap((p) => p.stages.flatMap((st) => [...(st.skill === path ? [`${p.name} · ${st.name}`] : []), ...(st.gate.skill === path ? [`${p.name} · ${st.name} (gate)`] : [])]));
}

/** What an agent may do without asking while AI runs the stages, and what happens to the rest. */
export interface RunPolicy {
  /** A command outside the allowed list: ask a person, or let an agent grade it. */
  otherCommands: "ask" | "ai";
  otherAgent: string;
  /** When an account of an agent reaches its limit, the next attempt uses another account of the same agent. */
  rotateAccounts: boolean;
}

export const SEED_POLICY: RunPolicy = { otherCommands: "ask", otherAgent: "codex", rotateAccounts: true };
