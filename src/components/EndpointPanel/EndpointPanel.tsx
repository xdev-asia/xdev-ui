import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Card } from "../Card/Card";
import { CodeBlock, type CodeBlockLabels } from "../CodeBlock/CodeBlock";
import { Tag } from "../Tag/Tag";

export interface EndpointPanelLabels extends CodeBlockLabels {
  /** aria-label of the paths list. */
  paths: string;
}

const DEFAULT_LABELS: EndpointPanelLabels = { copy: "Copy", copied: "Copied", paths: "Paths" };

export interface EndpointPanelProps {
  title: ReactNode;
  /** One line under the title: what to do with the URL. */
  description?: ReactNode;
  /** The base URL a client sets. Shown whole and copied whole. */
  url: string;
  /** Label in the code head ("Base URL"). */
  urlLabel?: string;
  /** Paths under the URL, shown as mono tags ("/v1/chat/completions"). */
  paths?: string[];
  /** Right side on wide screens, under the URL on narrow ones: usually a `RouteDiagram`. */
  aside?: ReactNode;
  /** Controls at the end of the head (a "Create key" button). */
  actions?: ReactNode;
  onCopy?: (url: string) => void;
  /** Heading element of the title. Default 2. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<EndpointPanelLabels>;
  className?: string;
}

/** The address a client points at: the base URL to copy, the paths under it, and room for a picture of the route. */
export function EndpointPanel({ title, description, url, urlLabel, paths, aside, actions, onCopy, headingLevel = 2, labels, className }: EndpointPanelProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  return (
    <Card title={title} subtitle={description} actions={actions} headingLevel={headingLevel} className={cx("x-endpoint", className)}>
      <div className="x-endpoint-body" data-aside={aside ? "" : undefined}>
        <div className="x-endpoint-main">
          <CodeBlock code={url} language={urlLabel} onCopy={onCopy} labels={{ copy: l.copy, copied: l.copied }} />
          {paths?.length ? (
            <ul className="x-endpoint-paths" aria-label={l.paths}>
              {paths.map((p) => (
                <li key={p}>
                  <Tag>
                    <span className="x-endpoint-path">{p}</span>
                  </Tag>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {aside ? <div className="x-endpoint-aside">{aside}</div> : null}
      </div>
    </Card>
  );
}
