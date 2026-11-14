import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";

export interface RouteNode {
  id: string;
  label: ReactNode;
  /** 16px icon before the label. */
  icon?: IconName;
  /** Quiet second line: a count, a host, a model. */
  detail?: ReactNode;
}

export interface RouteDiagramProps {
  /** Accessible name of the figure ("Request route"). */
  label: string;
  /** What sends traffic in, on the left (clients, agents, apps). */
  inputs: RouteNode[];
  /** The router in the middle. `mark` is your product mark, usually `BrandMark variant="tile"`. */
  hub: { name: ReactNode; mark?: ReactNode; detail?: ReactNode };
  /** Where traffic leaves to, on the right (providers, accounts, keys). */
  outputs: RouteNode[];
  className?: string;
}

function Side({ side, nodes }: { side: "in" | "out"; nodes: RouteNode[] }): JSX.Element {
  return (
    <ul className="x-route-side" data-side={side}>
      {nodes.map((n) => (
        <li key={n.id} className="x-route-node">
          {n.icon ? <Icon name={n.icon} size={16} className="x-route-icon" /> : null}
          <span className="x-route-text">
            <span className="x-route-label">{n.label}</span>
            {n.detail != null ? <span className="x-route-detail">{n.detail}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Traffic in on the left, the router in the middle, traffic out on the right. Stacks top to bottom in a narrow container. */
export function RouteDiagram({ label, inputs, hub, outputs, className }: RouteDiagramProps): JSX.Element {
  return (
    <figure className={cx("x-route", className)} aria-label={label}>
      <div className="x-route-body">
        <Side side="in" nodes={inputs} />
        <span className="x-route-line" data-side="in" aria-hidden="true" />
        <div className="x-route-hub">
          {hub.mark ? <span className="x-route-hub-mark">{hub.mark}</span> : null}
          <span className="x-route-hub-name">{hub.name}</span>
          {hub.detail != null ? <span className="x-route-detail">{hub.detail}</span> : null}
        </div>
        <span className="x-route-line" data-side="out" aria-hidden="true" />
        <Side side="out" nodes={outputs} />
      </div>
    </figure>
  );
}
