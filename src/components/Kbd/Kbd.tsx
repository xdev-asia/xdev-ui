import type { JSX, ReactNode } from "react";

export interface KbdProps {
  children: ReactNode;
}

export function Kbd({ children }: KbdProps): JSX.Element {
  return <kbd className="kbd">{children}</kbd>;
}
