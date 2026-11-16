import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type JSX, type ReactNode } from "react";
import type { AttentionItem } from "@xdev-asia/ui";
import { SEED_ACCOUNTS, agentOf, type Account, type AgentId } from "./data";
import { SEED_SQUADS, openEscalations, type Squad } from "./squads";
import { SEED_AGENT_CONFIGS, SEED_APPROVAL_RULES, SEED_PIPELINES, SEED_TEMPLATES, type AgentConfig, type ApprovalRule, type PipelineConfig, type SquadTemplate } from "./config";
import { initialLayout, openTab, tabKey, withTabs, type Layout } from "./layout";
import { href, navigate } from "./router";
import {
  SEED_APPROVALS,
  SEED_CHANGES,
  SEED_DOCS,
  SEED_PEERS,
  SEED_PROJECTS,
  SEED_RUNS,
  SEED_RUN_LOG,
  SEED_SESSIONS,
  SEED_TERMINALS,
  type Approval,
  type ChangedFile,
  type Comment,
  type Doc,
  type DocVersion,
  type Peer,
  type Project,
  type Role,
  type Run,
  type RunEvent,
  type Session,
  type Terminal,
} from "./workspace";

// Everything the showcase shows lives here, in memory. The real app keeps the same shapes and
// replaces this file with calls to the daemon.

const NOW = Date.UTC(2026, 10, 16, 10, 0);
const PROJECT_KEY = "xdev-showcase-project";

function storedProject(): string {
  try {
    return window.localStorage.getItem(PROJECT_KEY) ?? "";
  } catch {
    return "";
  }
}

/** What the column on the right of the workspace shows. */
export type Dock = "changes" | "run" | "squad";

function useAppState() {
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  /** The chosen project's name, or "" for all projects. Remembered in this browser. */
  const [project, setProject] = useState(storedProject);
  useEffect(() => {
    try {
      window.localStorage.setItem(PROJECT_KEY, project);
    } catch {
      /* private mode: the choice lasts for this visit */
    }
  }, [project]);
  /** The role this browser was paired with. The showcase lets you change it in Settings. */
  const [role, setRole] = useState<Role>("admin");
  /** False shows the pairing screen. `pairNote` says why the pairing ended, if it did. */
  const [paired, setPaired] = useState(true);
  const [pairNote, setPairNote] = useState(false);
  const [online, setOnline] = useState(true);
  /** Showcase control: the next document save finds a newer version on the server. */
  const [conflictNext, setConflictNext] = useState(false);
  const [notifications, setNotifications] = useState(false);
  /** Prompts sent from the composer, newest last, by terminal. */
  const [prompts, setPrompts] = useState<Record<string, string[]>>({});
  const [sessions, setSessions] = useState<Session[]>(SEED_SESSIONS);
  const [sessionId, setSessionId] = useState("5d1f0a77c3e2");
  const [terminals, setTerminals] = useState<Terminal[]>(SEED_TERMINALS);
  /** Tabs and panes of each worktree, by session id. A worktree without an entry gets `initialLayout`. */
  const [layouts, setLayouts] = useState<Record<string, Layout>>({});
  /** The column on the right of the workspace: which tab it shows, and whether it is open. */
  const [dock, setDock] = useState<Dock>("changes");
  const [dockOpen, setDockOpen] = useState(true);
  const [changes, setChanges] = useState<Record<string, ChangedFile[]>>(SEED_CHANGES);
  const [approvals, setApprovals] = useState<Approval[]>(SEED_APPROVALS);
  const [runs, setRuns] = useState<Run[]>(SEED_RUNS);
  const [runId, setRunId] = useState<string | null>(null);
  const [runLog, setRunLog] = useState<Record<string, RunEvent[]>>(SEED_RUN_LOG);
  // What the server is configured with. The real app reads and writes the files under the xdev config folder.
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>(SEED_AGENT_CONFIGS);
  const [pipelines, setPipelines] = useState<PipelineConfig[]>(SEED_PIPELINES);
  const [templates, setTemplates] = useState<SquadTemplate[]>(SEED_TEMPLATES);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>(SEED_APPROVAL_RULES);
  const [squads, setSquads] = useState<Squad[]>(SEED_SQUADS);
  /** The squad the Squads page shows; null shows the list. */
  const [squadId, setSquadId] = useState<string | null>(null);
  const [docs, setDocs] = useState<Doc[]>(SEED_DOCS);
  const [docId, setDocId] = useState<string | null>(null);
  /** The document being edited and its text so far. It outlives a change of page, so nothing is lost by a wrong click. */
  const [draft, setDraft] = useState<{ doc: string; from: DocVersion; text: string } | null>(null);
  const [accounts, setAccounts] = useState<Account[]>(SEED_ACCOUNTS);
  const [defaults, setDefaults] = useState<Record<AgentId, string>>({ "claude-code": "work", codex: "codex-work" });
  const [peers, setPeers] = useState<Peer[]>(SEED_PEERS);
  const [pinned, setPinned] = useState<string[]>(["5d1f0a77c3e2"]);
  const [unread, setUnread] = useState<string[]>(["c20a8e6d91b4", "e4a41f02d6c7"]);
  /** Comments not sent yet, by session id (diff comments) or document id (passage comments). */
  const [comments, setComments] = useState<Record<string, Comment[]>>({});

  // The showcase's stand-in for an agent: it answers a prompt after a moment. A session the person
  // is not looking at then counts as unread (new output and a new state since they last opened it).
  const openSession = useRef(sessionId);
  openSession.current = sessionId;
  const agentReply = useCallback((ofSession: string, ofTerm: string): void => {
    setTerminals((list) => list.map((x) => (x.id === ofTerm ? { ...x, state: "working" } : x)));
    window.setTimeout(() => {
      setTerminals((list) => list.map((x) => (x.id === ofTerm ? { ...x, state: "idle", output: [...x.output, "Read the request.", "Done. Nothing else to change."] } : x)));
      if (openSession.current !== ofSession) setUnread((list) => (list.includes(ofSession) ? list : [...list, ofSession]));
    }, 2500);
  }, []);

  return {
    agentReply,
    layouts,
    setLayouts,
    dock,
    setDock,
    dockOpen,
    setDockOpen,
    role,
    setRole,
    paired,
    setPaired,
    pairNote,
    setPairNote,
    online,
    setOnline,
    conflictNext,
    setConflictNext,
    notifications,
    setNotifications,
    prompts,
    setPrompts,
    /** This browser's name in the list of devices. */
    device: "Chrome on Linux",
    now: NOW,
    projects,
    setProjects,
    project,
    setProject,
    sessions,
    setSessions,
    sessionId,
    setSessionId,
    terminals,
    setTerminals,
    changes,
    setChanges,
    approvals,
    setApprovals,
    runs,
    setRuns,
    runId,
    setRunId,
    runLog,
    setRunLog,
    agentConfigs,
    setAgentConfigs,
    pipelines,
    setPipelines,
    templates,
    setTemplates,
    approvalRules,
    setApprovalRules,
    squads,
    setSquads,
    squadId,
    setSquadId,
    docs,
    setDocs,
    docId,
    setDocId,
    draft,
    setDraft,
    accounts,
    setAccounts,
    defaults,
    setDefaults,
    peers,
    setPeers,
    pinned,
    setPinned,
    unread,
    setUnread,
    comments,
    setComments,
  };
}

export type Store = ReturnType<typeof useAppState>;

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }): JSX.Element {
  const store = useAppState();
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore needs <StoreProvider>");
  return s;
}

/** Pure: whether something of `projectName` shows under the chosen project ("" shows all). */
export const inProject = (chosen: string, projectName: string): boolean => chosen === "" || chosen === projectName;

/** Pure: the project a session label ("api / main") belongs to. */
export const projectOfLabel = (label: string): string => label.split(" / ")[0] ?? "";

/** Pure: approvals nobody has decided yet. */
export const pending = (approvals: readonly Approval[]): Approval[] => approvals.filter((a) => !a.decided);

/** Everything that waits for a person: pending approvals, stopped runs and escalations of squads, longest wait first. */
export function useAttention(): AttentionItem[] {
  const { approvals, runs, squads, now } = useStore();
  return useMemo(() => {
    const fromApprovals: AttentionItem[] = pending(approvals).map((a) => ({
      id: a.id,
      agent: agentOf(a.agent).profile,
      worktree: a.session,
      text: a.title,
      since: now - a.waitedMin * 60_000,
      kind: "approval",
    }));
    const fromRuns: AttentionItem[] = runs
      .filter((r) => r.state === "blocked")
      .map((r) => ({ id: r.id, agent: "claude", worktree: `${r.project} / ${r.branch}`, text: r.title, since: now - 200 * 60_000, kind: "failed" }));
    const fromSquads: AttentionItem[] = squads
      .filter((q) => q.state === "active")
      .flatMap((q) =>
        openEscalations(q).map((e) => ({
          id: `squad:${q.id}`,
          agent: q.seats.find((x) => x.id === e.from)?.agent?.profile ?? "custom",
          worktree: `${q.project} / ${q.name}`,
          text: e.text,
          since: now - e.waitedMin * 60_000,
          kind: "question" as const,
        })),
      );
    return [...fromApprovals, ...fromRuns, ...fromSquads].sort((a, b) => Number(a.since) - Number(b.since));
  }, [approvals, runs, squads, now]);
}

/** Appends one line to a run's log. */
export function logEvent(store: Store, runId: string, kind: RunEvent["kind"], actor: string, detail: string): void {
  store.setRunLog((log) => ({ ...log, [runId]: [...(log[runId] ?? []), { at: "now", kind, actor, detail }] }));
}

const ROLE_ORDER: Role[] = ["viewer", "approver", "operator", "admin"];

/** Pure: whether a browser paired as `role` may do something that needs `need`. */
export const can = (role: Role, need: Role): boolean => ROLE_ORDER.indexOf(role) >= ROLE_ORDER.indexOf(need);

/** The tabs and panes of a worktree as they are now: terminals opened or closed since are added or dropped. */
export function layoutOf(store: Store, sessionId: string): Layout {
  const terms = store.terminals.filter((x) => x.sessionId === sessionId).map((x) => x.id);
  const base = store.layouts[sessionId] ?? initialLayout(terms, store.changes[sessionId]?.[0]?.path);
  return withTabs(base, terms.map((id) => tabKey({ kind: "term", id })));
}

/** Opens a worktree in the workspace, with a tab in front and the right column on a given tab. */
export function showInWorkspace(store: Store, sessionId: string, opts: { tab?: string; dock?: Dock } = {}): void {
  store.setSessionId(sessionId);
  store.setUnread((list) => list.filter((x) => x !== sessionId));
  if (opts.tab) {
    const tab = opts.tab;
    store.setLayouts((all) => ({ ...all, [sessionId]: openTab(layoutOf(store, sessionId), tab) }));
  }
  if (opts.dock) {
    store.setDock(opts.dock);
    store.setDockOpen(true);
  }
  navigate(href.workspace);
}

/** Whether this browser may decide a request of this kind, by the approval rules. */
export function canDecide(store: Store, kind: ApprovalRule["kind"]): boolean {
  return can(store.role, store.approvalRules.find((r) => r.kind === kind)?.minRole ?? "approver");
}
