import { createContext, useContext } from "react";
import type { Store } from "./store";

export const StoreContext = createContext<Store | null>(null);

/** The data store; swap it for a client of your API. */
export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error("useStore needs <StoreContext.Provider>");
  return s;
}
