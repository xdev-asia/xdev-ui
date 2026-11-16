import { createContext, useContext, useMemo, useState, type JSX, type ReactNode } from "react";
import type { AttentionItem } from "@xdev-asia/ui";
import { SEED_ACCOUNTS, agentOf, type Account, type AgentId } from "./data";
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

function useAppState() {
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  /** The chosen project's name, or "" for all projects. */
  const [project, setProject] = useState("");
  const [sessions, setSessions] = useState<Session[]>(SEED_SESSIONS);
  const [sessionId, setSessionId] = useState("5d1f0a77c3e2");
  const [terminals, setTerminals] = useState<Terminal[]>(SEED_TERMINALS);
  const [changes, setChanges] = useState<Record<string, ChangedFile[]>>(SEED_CHANGES);
  const [approvals, setApprovals] = useState<Approval[]>(SEED_APPROVALS);
  const [runs, setRuns] = useState<Run[]>(SEED_RUNS);
  const [runId, setRunId] = useState<string | null>(null);
  const [runLog, setRunLog] = useState<Record<string, RunEvent[]>>(SEED_RUN_LOG);
  const [docs, setDocs] = useState<Doc[]>(SEED_DOCS);
  const [docId, setDocId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>(SEED_ACCOUNTS);
  const [defaults, setDefaults] = useState<Record<AgentId, string>>({ "claude-code": "work", codex: "codex-work" });
  const [peers, setPeers] = useState<Peer[]>(SEED_PEERS);
  const [pinned, setPinned] = useState<string[]>(["5d1f0a77c3e2"]);
  const [unread, setUnread] = useState<string[]>(["c20a8e6d91b4", "e4a41f02d6c7"]);
  /** Comments not sent yet, by session id (diff comments) or document id (passage comments). */
  const [comments, setComments] = useState<Record<string, Comment[]>>({});

  return {
    /** The role of this browser. The showcase is paired as Admin. */
    role: "admin" as Role,
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
    docs,
    setDocs,
    docId,
    setDocId,
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

/** Everything that waits for a person: pending approvals and stopped runs, longest wait first. */
export function useAttention(): AttentionItem[] {
  const { approvals, runs, now } = useStore();
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
    return [...fromApprovals, ...fromRuns].sort((a, b) => Number(a.since) - Number(b.since));
  }, [approvals, runs, now]);
}

/** Appends one line to a run's log. */
export function logEvent(store: Store, runId: string, kind: RunEvent["kind"], actor: string, detail: string): void {
  store.setRunLog((log) => ({ ...log, [runId]: [...(log[runId] ?? []), { at: "now", kind, actor, detail }] }));
}
