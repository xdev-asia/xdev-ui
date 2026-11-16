import type { SessionState } from "@xdev-asia/ui";
import type { AgentId, TermAgent } from "./data";

// Mock data for the desktop prototype. Names follow the specs in xdev-internal/specs:
// core design 4.3 (sessions), 4.5 (approvals), AI SDLC 3, 4, 8 and 10 (runs, stages, gates).

export interface Session {
  id: string;
  project: string;
  branch: string;
  /** The repo's main checkout: no worktree of its own. */
  root: boolean;
  status: SessionState;
  diff: { add: number; del: number };
  /** The port given to this session's terminals. */
  port?: number;
  /** How the project's setup script ended in this worktree. */
  setup?: "ok" | "failed" | "running";
  setupLog?: string[];
}

export const SEED_SESSIONS: Session[] = [
  { id: "08c66a159121", project: "demo", branch: "main", root: true, status: "idle", diff: { add: 0, del: 0 } },
  { id: "5d1f0a77c3e2", project: "demo", branch: "feat/login-retry", root: false, status: "working", diff: { add: 128, del: 14 }, port: 4311 },
  { id: "b7e90c214fa8", project: "api", branch: "main", root: true, status: "idle", diff: { add: 0, del: 0 } },
  { id: "c20a8e6d91b4", project: "api", branch: "fix-auth-redirect", root: false, status: "waiting", diff: { add: 42, del: 9 }, port: 4312, setup: "failed", setupLog: ["$ cargo fetch --locked", "error: the lock file needs to be updated but --locked was passed", "exit status 101"] },
  { id: "e4a41f02d6c7", project: "api", branch: "sdlc/a41f-export-csv", root: false, status: "working", diff: { add: 311, del: 27 }, port: 4313 },
  { id: "a7c09c0211e5", project: "api", branch: "sdlc/9c02-rate-limit", root: false, status: "waiting", diff: { add: 0, del: 0 }, port: 4314 },
  { id: "d2e877b1f300", project: "demo", branch: "sdlc/77b1-vi-pairing", root: false, status: "waiting", diff: { add: 96, del: 12 }, port: 4315 },
  { id: "b9f131d8aa42", project: "demo", branch: "sdlc/31d8-devices-empty", root: false, status: "failed", diff: { add: 58, del: 21 }, port: 4316 },
  { id: "c51d0b7e9f66", project: "site", branch: "main", root: true, status: "idle", diff: { add: 0, del: 0 } },
];

export interface Terminal {
  id: string;
  sessionId: string;
  name: string;
  agent: TermAgent;
  /** Account id, or "" when the CLI uses its own sign-in. */
  account: string;
  state: SessionState;
  elapsedMs: number;
  /** Sample output: the real pane is a live terminal. */
  output: string[];
}

export const SEED_TERMINALS: Terminal[] = [
  {
    id: "9e2dc8fce507",
    sessionId: "5d1f0a77c3e2",
    name: "login-retry",
    agent: "claude-code",
    account: "work",
    state: "working",
    elapsedMs: 754000,
    output: ["> add retry with backoff to the sign-in call", "Reading src/auth/retry.ts", "Added exponential backoff, capped at 3 attempts.", "Running pnpm test auth ...", "14 passed"],
  },
  {
    id: "725a3ae3af5a",
    sessionId: "5d1f0a77c3e2",
    name: "review-retry",
    agent: "codex",
    account: "codex-work",
    state: "waiting",
    elapsedMs: 121000,
    output: ["> review the retry change for races", "Reading the diff of feat/login-retry", "Wants to run: pnpm test auth --coverage"],
  },
  {
    id: "1c44a0be7d21",
    sessionId: "c20a8e6d91b4",
    name: "fix-auth-redirect",
    agent: "claude-code",
    account: "work",
    state: "waiting",
    elapsedMs: 432000,
    output: ["> the redirect after sign-in loses the return path", "Found the cause in worker/auth/callback.ts", "Wants to edit: .github/workflows/ci.yml"],
  },
  {
    id: "3fa9d5510c6e",
    sessionId: "e4a41f02d6c7",
    name: "code (attempt 1)",
    agent: "claude-code",
    account: "work",
    state: "working",
    elapsedMs: 1260000,
    output: ["STAGE.md: Code, attempt 1 of 3", "Task 2 of 5: CSV writer with a streaming response", "Running cargo test export ..."],
  },
  {
    id: "3f1a7d20b9c4",
    sessionId: "b9f131d8aa42",
    name: "code (attempt 3)",
    agent: "claude-code",
    account: "work",
    state: "failed",
    elapsedMs: 412000,
    output: ["> stage code, attempt 3", "Editing src/pages/Devices.tsx", "Running pnpm test devices ...", "2 failed, 11 passed", "error: the stage ended with exit code 1"],
  },
  {
    id: "6b0e94c1d7a2",
    sessionId: "d2e877b1f300",
    name: "test (attempt 1)",
    agent: "claude-code",
    account: "work",
    state: "done",
    elapsedMs: 268000,
    output: ["> stage test, attempt 1", "Running pnpm test pair ...", "23 passed", "Wrote 06-test.md", "The stage is done. It waits at its gate."],
  },
];

export interface ChangedFile {
  path: string;
  status: "new" | "changed";
  add: number;
  del: number;
  /** Unified diff lines: "+", "-" or " " first. */
  lines: string[];
}

export const SEED_CHANGES: Record<string, ChangedFile[]> = {
  "5d1f0a77c3e2": [
    { path: "src/auth/retry.ts", status: "new", add: 86, del: 0, lines: ["+export async function withRetry<T>(run: () => Promise<T>, attempts = 3): Promise<T> {", "+  let wait = 200;", "+  for (let i = 1; ; i++) {", "+    try {", "+      return await run();", "+    } catch (e) {", "+      if (i >= attempts) throw e;", "+      await sleep(wait);", "+      wait *= 2;", "+    }", "+  }", "+}"] },
    { path: "src/auth/sign-in.ts", status: "changed", add: 12, del: 9, lines: [" import { post } from \"../http\";", "+import { withRetry } from \"./retry\";", " ", " export function signIn(body: SignInBody) {", "-  return post(\"/v1/sign-in\", body);", "+  return withRetry(() => post(\"/v1/sign-in\", body));", " }"] },
    { path: "src/auth/retry.test.ts", status: "new", add: 30, del: 5, lines: ["+test(\"gives up after three attempts\", async () => {", "+  const run = vi.fn().mockRejectedValue(new Error(\"503\"));", "+  await expect(withRetry(run)).rejects.toThrow(\"503\");", "+  expect(run).toHaveBeenCalledTimes(3);", "+});"] },
  ],
  c20a8e6d91b4: [{ path: "worker/auth/callback.ts", status: "changed", add: 42, del: 9, lines: ["-  return redirect(\"/\");", "+  return redirect(safeReturnPath(state.returnTo));"] }],
  d2e877b1f300: [
    { path: "src/i18n/vi.ts", status: "changed", add: 61, del: 4, lines: [" export const vi = {", "+  pair: {", "+    title: \"Ghép trình duyệt này với {host}\",", "+    code: \"Mã ghép\",", "+    submit: \"Ghép\",", "+  },", " };"] },
    { path: "src/pages/Pair.tsx", status: "changed", add: 23, del: 8, lines: ["-      <h1>Pair this browser</h1>", "+      <h1>{t(\"pair.title\", { host })}</h1>", "-      <Button>Pair</Button>", "+      <Button>{t(\"pair.submit\")}</Button>"] },
    { path: "src/pages/Pair.test.tsx", status: "new", add: 12, del: 0, lines: ["+test(\"shows the Vietnamese title\", () => {", "+  render(<PairPage />, { locale: \"vi\" });", "+  expect(screen.getByRole(\"heading\")).toHaveTextContent(\"Ghép trình duyệt này\");", "+});"] },
  ],
  e4a41f02d6c7: [{ path: "crates/api/src/export.rs", status: "new", add: 311, del: 27, lines: ["+pub async fn export_csv(State(db): State<Db>, Query(q): Query<ExportQuery>) -> Response {", "+    let rows = db.invoices(q.from, q.to).await?;", "+    csv_stream(rows)", "+}"] }],
};

export type ApprovalKind = "command" | "edit" | "push" | "stage";

export interface Approval {
  id: string;
  kind: ApprovalKind;
  title: string;
  /** "<repo> / <branch>" of the session it belongs to. */
  session: string;
  sessionId: string;
  termId?: string;
  agent: AgentId;
  /** Minutes it has waited. */
  waitedMin: number;
  /** Minutes until it counts as a refusal. Stage gates never expire. */
  expiresMin?: number;
  command?: string;
  diff?: string[];
  /** The diff was longer than 256 KB and was cut. */
  truncated?: boolean;
  runId?: string;
  /** `agoMin` is how many minutes ago the decision was made. */
  decided?: { choice: "approve" | "changes"; by: string; note?: string; agoMin: number };
}

export const SEED_APPROVALS: Approval[] = [
  { id: "ap-1", kind: "command", title: "pnpm test auth --coverage", session: "demo / feat/login-retry", sessionId: "5d1f0a77c3e2", termId: "725a3ae3af5a", agent: "codex", waitedMin: 2, expiresMin: 8, command: "pnpm test auth --coverage" },
  { id: "ap-2", kind: "edit", title: ".github/workflows/ci.yml", session: "api / fix-auth-redirect", sessionId: "c20a8e6d91b4", termId: "1c44a0be7d21", agent: "claude-code", waitedMin: 6, expiresMin: 4, diff: [" steps:", "   - uses: actions/checkout@v7", "-  - run: pnpm test", "+  - run: pnpm test --shard=${{ matrix.shard }}"] },
  { id: "ap-7", kind: "edit", title: "pnpm-lock.yaml", session: "demo / feat/login-retry", sessionId: "5d1f0a77c3e2", agent: "claude-code", waitedMin: 1, expiresMin: 9, truncated: true, diff: [" lockfileVersion: '9.0'", "-  vitest: 4.1.11", "+  vitest: 4.1.12", " ..."] },
  { id: "ap-3", kind: "stage", title: "Rate-limit sign-in: Design (attempt 1)", session: "api / sdlc/9c02-rate-limit", sessionId: "a7c09c0211e5", agent: "claude-code", waitedMin: 41, runId: "run-2" },
  { id: "ap-4", kind: "stage", title: "Vietnamese strings for pairing: Test (attempt 1)", session: "demo / sdlc/77b1-vi-pairing", sessionId: "d2e877b1f300", agent: "claude-code", waitedMin: 95, runId: "run-4" },
  { id: "ap-5", kind: "push", title: "feat/login-retry -> origin", session: "demo / feat/login-retry", sessionId: "5d1f0a77c3e2", agent: "claude-code", waitedMin: 180, command: "git push origin feat/login-retry", decided: { choice: "approve", by: "you", agoMin: 172 } },
  { id: "ap-6", kind: "command", title: "rm -rf node_modules", session: "api / fix-auth-redirect", sessionId: "c20a8e6d91b4", agent: "claude-code", waitedMin: 260, command: "rm -rf node_modules", decided: { choice: "changes", by: "Pixel", agoMin: 251, note: "Use pnpm install --force instead." } },
];

export type StageId = "requirements" | "design" | "plan" | "code" | "review" | "test";
export const STAGES: StageId[] = ["requirements", "design", "plan", "code", "review", "test"];
export type PipelineId = "feature" | "fix";

export const PIPELINES: Record<PipelineId, { stages: StageId[]; gatesAfter: StageId[] }> = {
  feature: { stages: STAGES, gatesAfter: ["requirements", "design", "plan", "test"] },
  fix: { stages: ["requirements", "plan", "code", "review", "test"], gatesAfter: ["requirements", "test"] },
};

export type RunState = "running" | "waiting_gate" | "blocked" | "done" | "cancelled";
export type BlockReason = "interrupted" | "agent_exit" | "max_attempts";

export interface Attempt {
  id: string;
  stage: StageId;
  n: number;
  status: "done" | "failed" | "running";
  at: string;
  durationMs?: number;
  verdict?: "pass" | "fail";
  /** What a Review or Test stage concluded, in one or two sentences. */
  summary?: string;
  /** The file the stage left, as sections of plain lines. */
  artifact?: { file: string; sections: { heading: string; items: string[] }[] };
  /** Why this attempt started again: a reviewer's note or a failed verdict. */
  reason?: string;
  /** It ran with a document version that a person changed afterwards. */
  stale?: boolean;
}

export interface Run {
  id: string;
  title: string;
  project: string;
  pipeline: PipelineId;
  branch: string;
  base: string;
  state: RunState;
  stage: StageId;
  blocked?: BlockReason;
  attempts: Attempt[];
  diff: { add: number; del: number };
}

const REQUIREMENTS = {
  file: "01-requirements.md",
  sections: [
    { heading: "Problem", items: ["Sign-in accepts any number of tries, so one address can guess passwords without limit."] },
    { heading: "Acceptance criteria", items: ["AC-1: the sixth failed sign-in from one address in 10 minutes answers 429.", "AC-2: a correct sign-in resets the count for that account.", "AC-3: the answer says how many seconds to wait."] },
    { heading: "Out of scope", items: ["Limits on other endpoints.", "A captcha."] },
    { heading: "Open questions", items: ["Count by address, by account, or by both?"] },
  ],
};

const DESIGN = {
  file: "02-design.md",
  sections: [
    { heading: "Chosen approach", items: ["A fixed window counter in D1, keyed by address and account, checked before the password is compared.", "Why: no new service, and the table is small enough to prune on write."] },
    { heading: "Code affected", items: ["worker/auth/sign-in.ts", "worker/auth/limit.ts (new)", "migrations/0025_sign_in_attempts.sql (new)"] },
    { heading: "Risks", items: ["A shared office address can lock out several people. The limit is per address and account together to reduce that."] },
    { heading: "Considered and rejected", items: ["A Durable Object per address: exact, but one more moving part to run."] },
  ],
};

const TEST_REPORT = {
  file: "06-test.md",
  sections: [
    { heading: "Verdict", items: ["pass"] },
    { heading: "Commands", items: ["npm test -- --ci: 212 passed", "npm run typecheck: no errors"] },
    { heading: "Acceptance criteria", items: ["AC-1 met: pairing screens show Vietnamese text.", "AC-2 met: no string is cut at 375px.", "AC-3 not checked: needs a real phone."] },
  ],
};

const REVIEW_FAIL = {
  file: "05-review.md",
  sections: [
    { heading: "Verdict", items: ["fail"] },
    { heading: "Findings", items: ["src/screens/Devices.tsx:48, high: the empty state still shows while the list loads, so a user with devices sees \"No devices\" first.", "AC-2 not met."] },
  ],
};

export const SEED_RUNS: Run[] = [
  {
    id: "run-1",
    title: "Export invoices as CSV",
    project: "api",
    pipeline: "feature",
    branch: "sdlc/a41f-export-csv",
    base: "main",
    state: "running",
    stage: "code",
    diff: { add: 311, del: 27 },
    attempts: [
      { id: "r1-1", stage: "requirements", n: 1, status: "done", at: "09:02", durationMs: 240000 },
      { id: "r1-2", stage: "design", n: 1, status: "done", at: "09:14", durationMs: 420000 },
      { id: "r1-2b", stage: "design", n: 2, status: "done", at: "09:21", durationMs: 380000, reason: "Stream the rows instead of building the whole file in memory." },
      { id: "r1-3", stage: "plan", n: 1, status: "done", at: "09:31", durationMs: 300000 },
      { id: "r1-4", stage: "code", n: 1, status: "running", at: "09:44" },
    ],
  },
  {
    id: "run-2",
    title: "Rate-limit sign-in",
    project: "api",
    pipeline: "feature",
    branch: "sdlc/9c02-rate-limit",
    base: "main",
    state: "waiting_gate",
    stage: "design",
    diff: { add: 0, del: 0 },
    attempts: [
      { id: "r2-1", stage: "requirements", n: 1, status: "done", at: "08:10", durationMs: 200000, artifact: REQUIREMENTS },
      { id: "r2-2", stage: "design", n: 1, status: "done", at: "08:21", durationMs: 510000, artifact: DESIGN },
    ],
  },
  {
    id: "run-3",
    title: "Empty state on Devices",
    project: "demo",
    pipeline: "fix",
    branch: "sdlc/31d8-devices-empty",
    base: "main",
    state: "blocked",
    stage: "code",
    blocked: "max_attempts",
    diff: { add: 58, del: 21 },
    attempts: [
      { id: "r3-1", stage: "requirements", n: 1, status: "done", at: "Mon 14:02", durationMs: 180000 },
      { id: "r3-2", stage: "plan", n: 1, status: "done", at: "Mon 14:09", durationMs: 150000 },
      { id: "r3-3", stage: "code", n: 1, status: "done", at: "Mon 14:14", durationMs: 600000 },
      { id: "r3-4", stage: "review", n: 1, status: "failed", at: "Mon 14:25", durationMs: 120000, verdict: "fail", artifact: REVIEW_FAIL },
      { id: "r3-5", stage: "code", n: 2, status: "done", at: "Mon 14:28", durationMs: 480000 },
      { id: "r3-6", stage: "review", n: 2, status: "failed", at: "Mon 14:37", durationMs: 110000, verdict: "fail", artifact: REVIEW_FAIL },
      { id: "r3-7", stage: "code", n: 3, status: "done", at: "Mon 14:40", durationMs: 520000 },
      { id: "r3-8", stage: "review", n: 3, status: "failed", at: "Mon 14:50", durationMs: 100000, verdict: "fail", artifact: REVIEW_FAIL },
    ],
  },
  {
    id: "run-4",
    title: "Vietnamese strings for pairing",
    project: "demo",
    pipeline: "feature",
    branch: "sdlc/77b1-vi-pairing",
    base: "main",
    state: "waiting_gate",
    stage: "test",
    diff: { add: 96, del: 12 },
    attempts: [
      { id: "r4-1", stage: "requirements", n: 1, status: "done", at: "Fri 10:00", durationMs: 200000 },
      { id: "r4-2", stage: "design", n: 1, status: "done", at: "Fri 10:08", durationMs: 260000 },
      { id: "r4-3", stage: "plan", n: 1, status: "done", at: "Fri 10:20", durationMs: 190000 },
      { id: "r4-4", stage: "code", n: 1, status: "done", at: "Fri 10:31", durationMs: 900000 },
      { id: "r4-5", stage: "review", n: 1, status: "done", at: "Fri 10:47", durationMs: 140000, verdict: "pass", summary: "No finding above low. AC-1 and AC-2 are covered by the diff." },
      { id: "r4-6", stage: "test", n: 1, status: "done", at: "Fri 10:51", durationMs: 230000, verdict: "pass", summary: "212 tests passed and the type check is clean. AC-3 was not checked: it needs a real phone.", artifact: TEST_REPORT },
    ],
  },
  {
    id: "run-5",
    title: "Pin the Rust toolchain",
    project: "demo",
    pipeline: "fix",
    branch: "sdlc/0b6e-toolchain",
    base: "main",
    state: "done",
    stage: "test",
    diff: { add: 4, del: 1 },
    attempts: [
      { id: "r5-1", stage: "requirements", n: 1, status: "done", at: "Thu 16:00", durationMs: 90000 },
      { id: "r5-2", stage: "plan", n: 1, status: "done", at: "Thu 16:04", durationMs: 60000 },
      { id: "r5-3", stage: "code", n: 1, status: "done", at: "Thu 16:06", durationMs: 120000 },
      { id: "r5-4", stage: "review", n: 1, status: "done", at: "Thu 16:09", durationMs: 70000, verdict: "pass" },
      { id: "r5-5", stage: "test", n: 1, status: "done", at: "Thu 16:11", durationMs: 150000, verdict: "pass" },
    ],
  },
];

export type Role = "viewer" | "approver" | "operator" | "admin";
export const ROLES: Role[] = ["viewer", "approver", "operator", "admin"];
export const EXPIRY_DAYS = [7, 30, 90];

export interface Peer {
  id: string;
  name: string;
  kind: "browser" | "phone";
  role: Role;
  expires: string;
  online: boolean;
}

export const SEED_PEERS: Peer[] = [
  { id: "31a4dbab97b6", name: "Chrome on Linux", kind: "browser", role: "admin", expires: "2026-12-16T10:00:00Z", online: true },
  { id: "5b1c0e7a93d2", name: "Pixel", kind: "phone", role: "operator", expires: "2026-12-10T23:58:00Z", online: true },
  { id: "a09f4c2b7711", name: "iPad", kind: "phone", role: "approver", expires: "2026-11-21T09:00:00Z", online: false },
];

/** Pure: the stage that follows `stage` in a pipeline, or null after the last one. */
export function nextStage(pipeline: PipelineId, stage: StageId): StageId | null {
  const list = PIPELINES[pipeline].stages;
  return list[list.indexOf(stage) + 1] ?? null;
}

/** Pure: where a run sits on the board. */
export function boardColumn(run: Run): StageId | "gate" | "done" {
  if (run.state === "done" || run.state === "cancelled") return "done";
  return run.state === "waiting_gate" ? "gate" : run.stage;
}

export interface Project {
  id: string;
  name: string;
  /** A folder on the server; shown to Admin only. */
  path: string;
  base: string;
  /** How a new session is prepared: a script run in the new worktree, and git-ignored files copied from the main checkout. */
  setupScript: string;
  copyFiles: string[];
  /** Folders of the repository whose Markdown files the Documents page lists. */
  docFolders: string[];
  /** Markdown files the agent of every stage is told to read. */
  steering: string[];
  /** Where approved documents of runs are copied to, if anywhere. */
  exportDir?: string;
}

export const SEED_PROJECTS: Project[] = [
  { id: "f8775985cb5f", name: "demo", path: "/srv/repos/demo", base: "main", setupScript: "pnpm install --frozen-lockfile", copyFiles: [".env.local"], docFolders: ["."], steering: [] },
  { id: "2ab19c07e4d1", name: "api", path: "/srv/repos/api", base: "main", setupScript: "cargo fetch --locked", copyFiles: [".env", "config/local.toml"], docFolders: [".", "docs/"], steering: ["docs/steering/product.md", "docs/steering/tech.md"], exportDir: "/srv/xdev-docs/api" },
  { id: "9d30f6a2b8c4", name: "site", path: "/srv/repos/site", base: "main", setupScript: "", copyFiles: [], docFolders: [], steering: [] },
];

export type DocGroup = "steering" | "run" | "repo";
export type DocStatus = "writing" | "waiting" | "approved" | "changes";

export interface DocVersion {
  n: number;
  /** Who wrote this version. */
  by: "agent" | "person";
  /** The agent's stage and attempt, or the device that saved it. */
  who: string;
  at: string;
  text: string;
  approvedBy?: string;
  approvedAt?: string;
  note?: string;
}

export interface Doc {
  id: string;
  project: string;
  group: DocGroup;
  file: string;
  /** Where the file is, relative to the worktree. */
  folder: string;
  inGit: boolean;
  runId?: string;
  stage?: StageId;
  status?: DocStatus;
  /** The file is longer than 256 KB: the page shows its first 256 KB. */
  truncated?: boolean;
  versions: DocVersion[];
}

export const md = (sections: { heading: string; items: string[] }[]): string => sections.map((s) => `## ${s.heading}\n${s.items.map((i) => `- ${i}`).join("\n")}`).join("\n\n");

export const SEED_DOCS: Doc[] = [
  { id: "d-api-product", project: "api", group: "steering", file: "product.md", folder: "docs/steering/", inGit: true, versions: [{ n: 1, by: "person", who: "Chrome on Linux", at: "Mon 09:12", text: "## Product\n- An invoicing API for small shops.\n- Customers call it from their own back office.\n\n## Not goals\n- A hosted dashboard." }] },
  { id: "d-api-tech", project: "api", group: "steering", file: "tech.md", folder: "docs/steering/", inGit: true, versions: [{ n: 1, by: "person", who: "Chrome on Linux", at: "Mon 09:20", text: "## Stack\n- Rust, axum, SQLite through sqlx.\n- Tests run with cargo test; no network in tests.\n\n## Rules\n- Every endpoint has a rate limit.\n- No new dependency without a note in the design." }] },
  { id: "d-r2-req", project: "api", group: "run", runId: "run-2", stage: "requirements", status: "approved", file: "01-requirements.md", folder: ".xdev/runs/9c02/", inGit: false, versions: [{ n: 1, by: "agent", who: "Requirements, attempt 1", at: "08:13", approvedBy: "Pixel", approvedAt: "08:16", text: md(REQUIREMENTS.sections) }] },
  {
    id: "d-r2-design",
    project: "api",
    group: "run",
    runId: "run-2",
    stage: "design",
    status: "waiting",
    file: "02-design.md",
    folder: ".xdev/runs/9c02/",
    inGit: false,
    versions: [{ n: 1, by: "agent", who: "Design, attempt 1", at: "08:30", text: md(DESIGN.sections) }],
  },
  { id: "d-r1-req", project: "api", group: "run", runId: "run-1", stage: "requirements", status: "approved", file: "01-requirements.md", folder: ".xdev/runs/a41f/", inGit: false, versions: [{ n: 1, by: "agent", who: "Requirements, attempt 1", at: "09:06", approvedBy: "Chrome on Linux", approvedAt: "09:10", text: "## Problem\n- Shops cannot get their invoices out of the API in bulk.\n\n## Acceptance criteria\n- AC-1: GET /v1/invoices/export answers a CSV file for a date range.\n- AC-2: 80,000 invoices export without a timeout.\n\n## Out of scope\n- Excel files." }] },
  {
    id: "d-r1-design",
    project: "api",
    group: "run",
    runId: "run-1",
    stage: "design",
    status: "approved",
    file: "02-design.md",
    folder: ".xdev/runs/a41f/",
    inGit: false,
    versions: [
      { n: 1, by: "agent", who: "Design, attempt 1", at: "09:14", text: "## Chosen approach\n- Build the whole CSV in memory, then answer it.\n\n## Code affected\n- crates/api/src/export.rs (new)", note: "Changes requested: this will not fit 80,000 invoices in memory." },
      { n: 2, by: "agent", who: "Design, attempt 2", at: "09:21", approvedBy: "Pixel", approvedAt: "09:28", text: "## Chosen approach\n- Stream the rows from the database as CSV, 500 rows per chunk.\n- Why: the largest shop has 80,000 invoices.\n\n## Code affected\n- crates/api/src/export.rs (new)\n- crates/api/src/routes.rs\n\n## Risks\n- A client that reads slowly keeps the stream open." },
    ],
  },
  { id: "d-r1-plan", project: "api", group: "run", runId: "run-1", stage: "plan", status: "approved", truncated: true, file: "03-plan.md", folder: ".xdev/runs/a41f/", inGit: false, versions: [{ n: 1, by: "agent", who: "Plan, attempt 1", at: "09:36", approvedBy: "Chrome on Linux", approvedAt: "09:40", text: "## Tasks\n- 1. Query invoices by date range, in pages. Test: export_pages. Serves AC-1.\n- 2. CSV writer with a streaming response. Test: export_stream. Serves AC-2.\n- 3. Route and rate limit. Test: export_route. Serves AC-1." }] },
  { id: "d-r1-changes", project: "api", group: "run", runId: "run-1", stage: "code", status: "writing", file: "04-changes.md", folder: ".xdev/runs/a41f/", inGit: false, versions: [{ n: 1, by: "agent", who: "Code, attempt 1", at: "09:44", text: "## Task 1\n- Done. Commit 4c1e9aa. cargo test export_pages: passed.\n\n## Task 2\n- In progress." }] },
  { id: "d-api-readme", project: "api", group: "repo", file: "README.md", folder: "", inGit: true, versions: [{ n: 1, by: "person", who: "git", at: "last week", text: "## api\n- The invoicing API. Run it with cargo run.\n- Configuration is in config/." }] },
  { id: "d-api-arch", project: "api", group: "repo", file: "architecture.md", folder: "docs/", inGit: true, versions: [{ n: 1, by: "person", who: "git", at: "last month", text: "## Layers\n- routes: HTTP only.\n- services: rules.\n- store: SQL only." }] },
  { id: "d-r4-test", project: "demo", group: "run", runId: "run-4", stage: "test", status: "waiting", file: "06-test.md", folder: ".xdev/runs/77b1/", inGit: false, versions: [{ n: 1, by: "agent", who: "Test, attempt 1", at: "Fri 10:55", text: md(TEST_REPORT.sections) }] },
  { id: "d-r3-review", project: "demo", group: "run", runId: "run-3", stage: "review", status: "changes", file: "05-review.md", folder: ".xdev/runs/31d8/", inGit: false, versions: [{ n: 1, by: "agent", who: "Review, attempt 3", at: "Mon 14:52", text: md(REVIEW_FAIL.sections) }] },
  { id: "d-demo-readme", project: "demo", group: "repo", file: "README.md", folder: "", inGit: true, versions: [{ n: 1, by: "person", who: "git", at: "last week", text: "## demo\n- The phone app's web companion." }] },
];

export interface RunEvent {
  at: string;
  /** One of a fixed list of event kinds. */
  kind: "run_created" | "attempt_started" | "stage_done" | "verdict" | "gate_opened" | "gate_decided" | "doc_edited" | "approved_overwritten" | "stage_retried" | "run_stopped" | "run_cancelled" | "run_done";
  actor: string;
  detail: string;
}

export const SEED_RUN_LOG: Record<string, RunEvent[]> = {
  "run-2": [
    { at: "08:10", kind: "run_created", actor: "Chrome on Linux", detail: "feature, base main" },
    { at: "08:10", kind: "attempt_started", actor: "xdevd", detail: "Requirements, attempt 1, account work" },
    { at: "08:13", kind: "stage_done", actor: "claude-code", detail: "01-requirements.md" },
    { at: "08:13", kind: "gate_opened", actor: "xdevd", detail: "after Requirements" },
    { at: "08:16", kind: "gate_decided", actor: "Pixel", detail: "approve" },
    { at: "08:21", kind: "attempt_started", actor: "xdevd", detail: "Design, attempt 1, account work" },
    { at: "08:30", kind: "stage_done", actor: "claude-code", detail: "02-design.md" },
    { at: "08:30", kind: "gate_opened", actor: "xdevd", detail: "after Design" },
  ],
};

/** A comment on lines of a diff or on a passage of a document, kept until it is sent to an agent. */
export interface Comment {
  id: string;
  /** A file path with a line number, or a document id with the quoted passage. */
  target: string;
  quote: string;
  text: string;
}

/** Pure: a time of day as HH:MM (UTC), from milliseconds. */
export const clock = (ms: number): string => new Date(ms).toISOString().slice(11, 16);

/** Pure: the name xDev gives the terminal of one attempt. */
export const attemptTerminal = (a: Attempt): string => `${a.stage} (attempt ${a.n})`;

/** Pure: the session of a run, found by its branch. */
export function sessionOfRun(run: Run, sessions: readonly Session[]): Session | undefined {
  return sessions.find((s) => s.project === run.project && s.branch === run.branch);
}

/** Pure: a small Markdown subset as blocks: "## " headings, "- " list items and paragraphs. */
export type MdBlock = { kind: "h"; text: string } | { kind: "ul"; items: string[] } | { kind: "p"; text: string };
export function mdBlocks(text: string): MdBlock[] {
  const out: MdBlock[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) continue;
    if (line.startsWith("## ")) out.push({ kind: "h", text: line.slice(3) });
    else if (line.startsWith("- ")) {
      const last = out[out.length - 1];
      if (last?.kind === "ul") last.items.push(line.slice(2));
      else out.push({ kind: "ul", items: [line.slice(2)] });
    } else out.push({ kind: "p", text: line });
  }
  return out;
}

/** Pure: a line diff of two texts, longest common subsequence. Each row starts with "+", "-" or " ". */
export function lineDiff(before: string, after: string): string[] {
  const a = before.split("\n");
  const b = after.split("\n");
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
  const rows: string[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      rows.push(` ${a[i]}`);
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) rows.push(`-${a[i++]}`);
    else rows.push(`+${b[j++]}`);
  }
  while (i < a.length) rows.push(`-${a[i++]}`);
  while (j < b.length) rows.push(`+${b[j++]}`);
  return rows;
}

/** Pure: a short stand-in for a document hash. The daemon stores the SHA-256 of the approved copy. */
export function fakeHash(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193) >>> 0;
  const hex = h.toString(16).padStart(8, "0");
  return `${hex}${hex.split("").reverse().join("")}`.slice(0, 12);
}
