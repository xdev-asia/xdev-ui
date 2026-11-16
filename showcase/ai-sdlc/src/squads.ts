import type { AgentProfile, SessionState } from "@xdev-asia/ui";

// A squad: seats in a tree, each held by one agent with a role, and links between seats.
// The showcase draws what the mobile design shows. What the rules are (what a link allows, what
// counts as a violation, how a squad is made) is not decided yet: see `squads.openPoints`.

export interface SeatAgent {
  /** Product name: never translated. */
  name: string;
  profile: AgentProfile;
  /** Letter on the chip for an agent the library has no profile for. */
  letter?: string;
}

export interface Seat {
  id: string;
  /** The seat's role in the squad ("Lead", "Review"). */
  role: string;
  /** The seat it reports to; null for the top seat. */
  parent: string | null;
  /** Missing while the seat is vacant. */
  agent?: SeatAgent;
  /** Account name, or "" for the CLI's own sign-in. */
  account?: string;
  /** "waiting" is a seat that needs a person. */
  state: Extract<SessionState, "working" | "waiting" | "idle">;
  /** Share of the agent's context window in use, 0 to 100. */
  context?: number;
  /** What the agent is doing now. */
  task?: string;
}

export interface SquadLink {
  a: string;
  b: string;
  /** "reports": b reports to a. "peer": two seats on a level. */
  kind: "reports" | "peer";
}

export interface Escalation {
  id: string;
  from: string;
  to: string;
  text: string;
  /** Minutes it has waited. */
  waitedMin: number;
  answered?: { by: string; text: string };
}

export interface SquadEvent {
  at: string;
  text: string;
}

export interface Squad {
  id: string;
  name: string;
  /** The only kind the design shows. */
  topology: "hierarchy";
  project: string;
  /** The worktree the squad works in. */
  sessionId: string;
  /** Minutes since it was started. */
  startedMin: number;
  state: "active" | "inactive";
  seats: Seat[];
  links: SquadLink[];
  escalations: Escalation[];
  /** Rules a seat broke. The design shows a count; what a rule is, is not decided yet. */
  violations: string[];
  events: SquadEvent[];
}

const CLAUDE: SeatAgent = { name: "Claude", profile: "claude" };
const CODEX: SeatAgent = { name: "Codex", profile: "codex" };
const GEMINI: SeatAgent = { name: "Gemini", profile: "custom", letter: "G" };

export const SEED_SQUADS: Squad[] = [
  {
    id: "sq-feature",
    name: "Feature squad",
    topology: "hierarchy",
    project: "api",
    sessionId: "a7c09c0211e5",
    startedMin: 41,
    state: "active",
    seats: [
      { id: "lead", role: "Lead", parent: null, agent: CLAUDE, account: "Work", state: "working", context: 62, task: "Splits the sign-in rate limit into tasks and answers the seats below." },
      { id: "implement", role: "Implement", parent: "lead", agent: CODEX, account: "Work", state: "waiting", context: 38, task: "Stopped before worker/auth/limit.ts: it needs the token TTL first." },
      { id: "review", role: "Review", parent: "lead", agent: GEMINI, account: "", state: "working", context: 71, task: "Reads the limiter design against AC-1 to AC-3." },
      { id: "tests", role: "Tests", parent: "implement", state: "idle" },
    ],
    links: [
      { a: "lead", b: "implement", kind: "reports" },
      { a: "lead", b: "review", kind: "reports" },
      { a: "implement", b: "tests", kind: "reports" },
      { a: "implement", b: "review", kind: "peer" },
      { a: "review", b: "tests", kind: "peer" },
    ],
    escalations: [
      {
        id: "esc-1",
        from: "implement",
        to: "lead",
        text: "Blocked on token TTL decision: the design says a 10 minute window, the requirements say a correct sign-in resets the count. Which one sets how long a count lives?",
        waitedMin: 12,
      },
    ],
    violations: [],
    events: [
      { at: "09:19", text: "Started by Chrome on Linux" },
      { at: "09:20", text: "Lead → Implement: Write worker/auth/limit.ts with a fixed window counter." },
      { at: "09:20", text: "Lead → Review: Check the design against the acceptance criteria." },
      { at: "09:41", text: "Review → Lead: The design covers AC-1 and AC-3. AC-2 needs a test." },
      { at: "09:48", text: "Implement → Lead: Blocked on token TTL decision." },
    ],
  },
  {
    id: "sq-docs",
    name: "Docs pair",
    topology: "hierarchy",
    project: "demo",
    sessionId: "08c66a159121",
    startedMin: 1500,
    state: "inactive",
    seats: [
      { id: "lead", role: "Lead", parent: null, agent: CLAUDE, account: "Work", state: "idle", context: 18, task: "Outlined the README sections." },
      { id: "write", role: "Write", parent: "lead", agent: CODEX, account: "Work", state: "idle", context: 44, task: "Wrote the install section." },
    ],
    links: [{ a: "lead", b: "write", kind: "reports" }],
    escalations: [],
    violations: [],
    events: [
      { at: "Sun 09:00", text: "Started by Chrome on Linux" },
      { at: "Sun 10:12", text: "Deactivated by Chrome on Linux" },
    ],
  },
];

/** Pure: the seats that report to `parent` (null gives the top seats), in the squad's order. */
export const childrenOf = (squad: Squad, parent: string | null): Seat[] => squad.seats.filter((s) => s.parent === parent);

/** Pure: a seat's role, or the id when the seat is gone. */
export const roleOf = (squad: Squad, seatId: string): string => squad.seats.find((s) => s.id === seatId)?.role ?? seatId;

/** Pure: escalations nobody answered yet. */
export const openEscalations = (squad: Squad): Escalation[] => squad.escalations.filter((e) => !e.answered);

/** Pure: how many seats hold an agent, and how many do not. */
export function seatCounts(squad: Squad): { active: number; vacant: number } {
  const active = squad.seats.filter((s) => s.agent).length;
  return { active, vacant: squad.seats.length - active };
}

/** Pure: the seats linked to `seatId`, whatever the kind of link. */
export const linkedTo = (squad: Squad, seatId: string): string[] => squad.links.filter((l) => l.a === seatId || l.b === seatId).map((l) => (l.a === seatId ? l.b : l.a));
