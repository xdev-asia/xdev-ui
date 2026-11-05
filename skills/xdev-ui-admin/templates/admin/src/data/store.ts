export type ItemStatus = "active" | "draft" | "archived";
export interface Item {
  id: string;
  name: string;
  owner: string;
  status: ItemStatus;
  /** ISO timestamp. */
  updated: string;
}
export interface Summary {
  total: number;
  active: number;
  archived: number;
  recent: Item[];
}

export class StoreError extends Error {
  constructor(public code: "failed" | "not-found") {
    super(code);
  }
}

export interface Store {
  listItems(): Promise<Item[]>;
  getItem(id: string): Promise<Item>;
  createItem(name: string, owner: string): Promise<Item>;
  saveItem(id: string, patch: Partial<Pick<Item, "name" | "status">>): Promise<Item>;
  summary(): Promise<Summary>;
}

const NAMES = ["Alpha", "Bravo", "Cedar", "Delta", "Ember", "Fjord", "Garnet", "Harbor", "Iris", "Juniper"];
const OWNERS = ["Ada Lovelace", "Grace Hopper", "Linus Torvalds", "Margaret Hamilton"];
const STATUSES: ItemStatus[] = ["active", "draft", "archived", "active"];
const NOW = Date.UTC(2026, 10, 4, 9, 0, 0);

/** Fixed seed, so tests and screenshots do not change. */
export const seedItems = (): Item[] =>
  Array.from({ length: 25 }, (_, i) => ({
    id: `i${i + 1}`,
    name: `${NAMES[i % NAMES.length]} ${Math.floor(i / NAMES.length) + 1}`,
    owner: OWNERS[i % OWNERS.length],
    status: STATUSES[i % STATUSES.length],
    updated: new Date(NOW - i * 5 * 3_600_000).toISOString(),
  }));

/** In-memory store; swap it for a client of your API. `latency` slows every call; `fail` makes every call reject. */
export function createStore(options: { latency?: number; fail?: boolean } = {}): Store {
  let items = seedItems();
  let next = items.length + 1;
  const run = async <T,>(fn: () => T): Promise<T> => {
    if (options.latency) await new Promise((r) => setTimeout(r, options.latency));
    if (options.fail) throw new StoreError("failed");
    return structuredClone(fn());
  };
  const find = (id: string): Item => {
    const item = items.find((x) => x.id === id);
    if (!item) throw new StoreError("not-found");
    return item;
  };
  return {
    listItems: () => run(() => items),
    getItem: (id) => run(() => find(id)),
    createItem: (name, owner) =>
      run(() => {
        const item: Item = { id: `i${next++}`, name, owner, status: "draft", updated: new Date(NOW).toISOString() };
        items = [item, ...items];
        return item;
      }),
    saveItem: (id, patch) => run(() => Object.assign(find(id), patch, { updated: new Date(NOW).toISOString() })),
    summary: () =>
      run(() => ({
        total: items.length,
        active: items.filter((i) => i.status === "active").length,
        archived: items.filter((i) => i.status === "archived").length,
        recent: items.slice(0, 5),
      })),
  };
}

/** `?fail=1` in the URL makes every call fail; `?latency=400` slows them. */
export function storeFromLocation(search: string): Store {
  const q = new URLSearchParams(search);
  return createStore({ latency: Number(q.get("latency") ?? 250), fail: q.get("fail") === "1" });
}
