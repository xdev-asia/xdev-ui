import { useSyncExternalStore } from "react";
import type { RoleId } from "./permissions";

export interface Session {
  name: string;
  email: string;
  role: RoleId;
}

const ACCOUNTS: (Session & { password: string })[] = [
  { name: "Ada Lovelace", email: "admin@example.com", password: "admin-demo", role: "admin" },
  { name: "Grace Hopper", email: "viewer@example.com", password: "viewer-demo", role: "viewer" },
];

export type SignInResult = { ok: true; session: Session } | { ok: false };

/** Demo only: checks two hard-coded accounts. A real app calls its server. */
export function checkCredentials(email: string, password: string): SignInResult {
  const a = ACCOUNTS.find((x) => x.email === email.trim().toLowerCase() && x.password === password);
  return a ? { ok: true, session: { name: a.name, email: a.email, role: a.role } } : { ok: false };
}

let current: Session | null = null;
const listeners = new Set<() => void>();
const set = (s: Session | null): void => {
  current = s;
  listeners.forEach((l) => l());
};
export const signIn = (s: Session): void => set(s);
export const signOut = (): void => set(null);

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
