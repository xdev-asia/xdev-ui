import { useSyncExternalStore } from "react";
import type { RoleId } from "../data/seed";

export interface Session {
  name: string;
  email: string;
  role: RoleId;
}

const ACCOUNTS: (Session & { password: string })[] = [
  { name: "Ada Lovelace", email: "admin@example.com", password: "admin-demo", role: "owner" },
  { name: "Grace Hopper", email: "viewer@example.com", password: "viewer-demo", role: "viewer" },
];

/** Demo only: the accounts the access pages switch between, without their passwords. */
export function demoAccounts(): Session[] {
  return ACCOUNTS.map(({ name, email, role }) => ({ name, email, role }));
}

export type SignInResult = { ok: true; session: Session } | { ok: false };

/** Demo only: checks two hard-coded accounts. A real app calls its server. */
export function checkCredentials(email: string, password: string): SignInResult {
  const a = ACCOUNTS.find((x) => x.email === email.trim().toLowerCase() && x.password === password);
  return a ? { ok: true, session: { name: a.name, email: a.email, role: a.role } } : { ok: false };
}

/** Demo only: the code every demo account receives by email. */
export const DEMO_CODE = "246810";

/** Demo only: signs a demo account in with the emailed code. */
export function checkCode(email: string, code: string): SignInResult {
  const a = ACCOUNTS.find((x) => x.email === email.trim().toLowerCase());
  return a && code === DEMO_CODE ? { ok: true, session: { name: a.name, email: a.email, role: a.role } } : { ok: false };
}

/** What the device preview puts on its window while it shows, for the console in its frames to read. */
type Sharing = Window & { acmeSharedSession?: () => Session | null };

/** True when this console runs inside a frame of a page on the same origin (the device preview). */
export function inFrame(): boolean {
  try {
    return typeof window !== "undefined" && window.frameElement !== null;
  } catch {
    return false;
  }
}

/**
 * Demo only: the session is kept in memory, so a console opened in a frame or a new tab would start signed out. The
 * device preview shares its session while it shows (see `shareSession`), and a console in one of its frames, or in a
 * tab it opened, starts with it. A page on another origin throws on access and is ignored.
 */
function fromHost(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const host = inFrame() ? window.parent : (window.opener as Window | null);
    return (host as Sharing | null)?.acmeSharedSession?.() ?? null;
  } catch {
    return null;
  }
}

/** Demo only: lets consoles in same-origin frames start signed in as `s`; call the returned function to stop. */
export function shareSession(s: Session): () => void {
  const w = window as Sharing;
  w.acmeSharedSession = () => s;
  return () => {
    delete w.acmeSharedSession;
  };
}

let current: Session | null = fromHost();
const listeners = new Set<() => void>();
const emit = (): void => listeners.forEach((l) => l());

export const signIn = (s: Session): void => {
  current = s;
  emit();
};
export const signOut = (): void => {
  current = null;
  emit();
};

/** The signed-in user, or null. In memory only: a reload signs out. */
export function useSession(): Session | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => null,
  );
}
