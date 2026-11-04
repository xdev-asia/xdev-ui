import { useEffect, useRef, useState, type JSX } from "react";
import { cx } from "../../internal/cx";
import { Icon } from "../Icon/Icon";

export interface CodeBlockLabels {
  /** Copy button text. */
  copy: string;
  /** Button text for a short while after a copy. */
  copied: string;
}

const DEFAULT_LABELS: CodeBlockLabels = { copy: "Copy", copied: "Copied" };

export interface CodeBlockProps {
  /** Exact text to show and copy. Not highlighted. */
  code: string;
  /** Small label in the head ("bash", "json", "MCP config"). */
  language?: string;
  /** Called after a successful copy. */
  onCopy?: (code: string) => void;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<CodeBlockLabels>;
  className?: string;
}

const COPIED_MS = 1500;

export function CodeBlock({ code, language, onCopy, labels, className }: CodeBlockProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const [canCopy, setCanCopy] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setCanCopy(typeof navigator !== "undefined" && typeof navigator.clipboard?.writeText === "function");
    return () => clearTimeout(timer.current);
  }, []);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return;
    }
    setCopied(true);
    onCopy?.(code);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  };

  return (
    <div className={cx("connect-snippet", className)}>
      <div className="connect-head">
        {language ? <span className="connect-lang">{language}</span> : <span />}
        <button
          type="button"
          className="connect-copy"
          data-copy={copied ? "copied" : "idle"}
          hidden={!canCopy}
          onClick={() => void copy()}
        >
          <Icon name={copied ? "check" : "copy"} size={14} />
          <span aria-live="polite">{copied ? l.copied : l.copy}</span>
        </button>
      </div>
      <div className="connect-code">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
