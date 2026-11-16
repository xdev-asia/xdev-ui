import { useEffect, useRef, type JSX } from "react";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import type { Terminal } from "../workspace";

export interface TermViewProps {
  term: Terminal;
  /** Typing is off: the browser's role cannot send to agents, or the terminal is gone. */
  readOnly: boolean;
  /** A line the person typed and sent with Enter. */
  onLine: (text: string) => void;
  label: string;
}

/** Reads a token off the page, so the terminal follows the theme it was opened in. Undefined when it is not set. */
const token = (el: Element, name: string): string | undefined => getComputedStyle(el).getPropertyValue(name).trim() || undefined;

/**
 * An agent's terminal, drawn by xterm.js like the real app. The showcase has no PTY: it writes the sample output,
 * echoes what the person types, and hands each line to `onLine` on Enter. The real app wires the same view to the
 * daemon's terminal socket.
 */
export function TermView({ term, readOnly, onLine, label }: TermViewProps): JSX.Element {
  const host = useRef<HTMLDivElement>(null);
  const xterm = useRef<XTerm | null>(null);
  const written = useRef(0);
  const typed = useRef("");
  const send = useRef(onLine);
  send.current = onLine;
  const locked = useRef(readOnly);
  locked.current = readOnly;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const x = new XTerm({
      convertEol: true,
      cursorBlink: true,
      fontFamily: token(el, "--font-mono"),
      fontSize: 13,
      scrollback: 2000,
      theme: { background: token(el, "--term"), foreground: token(el, "--text-1"), cursor: token(el, "--accent") },
    });
    const fit = new FitAddon();
    x.loadAddon(fit);
    x.open(el);
    written.current = 0;
    typed.current = "";
    const refit = (): void => {
      try {
        fit.fit();
      } catch {
        /* hidden: no size to fit to */
      }
    };
    refit();
    // The page font may load after the terminal measured its cells: measure again once it is there.
    let live = true;
    document.fonts?.ready.then(() => {
      if (!live) return;
      x.options.fontFamily = token(el, "--font-mono");
      refit();
    });
    const watch = new ResizeObserver(refit);
    watch.observe(el);
    const input = x.onData((data) => {
      if (locked.current) return;
      for (const ch of data) {
        if (ch === "\r") {
          const text = typed.current.trim();
          typed.current = "";
          // Clear the echoed line: the sent prompt comes back as output.
          x.write("\r\x1b[2K");
          if (text) send.current(text);
        } else if (ch === "\x7f") {
          if (typed.current) {
            typed.current = typed.current.slice(0, -1);
            x.write("\b \b");
          }
        } else if (ch >= " ") {
          typed.current += ch;
          x.write(ch);
        }
      }
    });
    xterm.current = x;
    return () => {
      live = false;
      input.dispose();
      watch.disconnect();
      x.dispose();
      xterm.current = null;
    };
  }, [term.id]);

  useEffect(() => {
    const x = xterm.current;
    if (!x) return;
    for (const line of term.output.slice(written.current)) x.writeln(line);
    written.current = term.output.length;
  }, [term.output, term.id]);

  useEffect(() => {
    if (xterm.current) xterm.current.options.disableStdin = readOnly;
  }, [readOnly]);

  return <div className="app-xterm" ref={host} role="region" aria-label={label} />;
}
