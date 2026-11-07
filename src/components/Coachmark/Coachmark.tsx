import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { restoreFocus } from "../../internal/focus";
import { Button } from "../Button/Button";
import { StepDots } from "../StepDots/StepDots";
import { placeCoachmark, type CoachmarkPlacement, type RectLike, type CoachmarkSize } from "./placeCoachmark";

export interface CoachmarkLabels {
  back: string;
  next: string;
  done: string;
  skip: string;
  /** Names the step dots ("Step 2 of 3"). */
  step: (current: number, total: number) => string;
}

const DEFAULT_LABELS: CoachmarkLabels = { back: "Back", next: "Next", done: "Done", skip: "Skip tour", step: (current, total) => `Step ${current} of ${total}` };

/** Used until the card has measured itself. */
const ESTIMATE: CoachmarkSize = { width: 320, height: 160 };

export interface CoachmarkProps {
  /** Viewport rect of the part the card points at (getBoundingClientRect). Null renders nothing. */
  anchor: RectLike | null;
  /** Preferred side; flips to the opposite one when there is no room. Default "bottom". */
  placement?: CoachmarkPlacement;
  title: ReactNode;
  children?: ReactNode;
  /** 1-based. */
  step: number;
  total: number;
  /** Shown from step 2 on. */
  onBack?: () => void;
  /** Also the last step's Done. */
  onNext: () => void;
  /** Skip tour, and Esc. */
  onSkip: () => void;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<CoachmarkLabels>;
  className?: string;
}

function viewportSize(): CoachmarkSize {
  return typeof window === "undefined" ? { width: 1280, height: 800 } : { width: window.innerWidth, height: window.innerHeight };
}

export function Coachmark({ anchor, placement = "bottom", title, children, step, total, onBack, onNext, onSkip, labels, className }: CoachmarkProps): JSX.Element | null {
  const l = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<CoachmarkSize>(ESTIMATE);
  const [viewport, setViewport] = useState<CoachmarkSize>(viewportSize);
  const skip = useRef(onSkip);
  skip.current = onSkip;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const next = { width: el.offsetWidth, height: el.offsetHeight };
    if (next.width !== size.width || next.height !== size.height) setSize(next);
  });
  useEffect(() => {
    const onResize = (): void => setViewport(viewportSize());
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") skip.current();
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    return () => restoreFocus(trigger);
  }, []);
  // Back disappears at step 1, so focus Next on every step, not only on mount.
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>(".x-coachmark-next")?.focus();
  }, [step]);

  const pos = placeCoachmark(anchor, size, viewport, placement);
  if (!pos) return null;
  const last = step >= total;
  const style = { top: pos.top, left: pos.left, "--coachmark-arrow": `${pos.arrow}px` } as CSSProperties;
  return (
    <div className={cx("x-coachmark", className)} ref={ref} role="dialog" aria-labelledby={`${id}-t`} aria-describedby={children ? `${id}-b` : undefined} data-placement={pos.placement} style={style}>
      <span className="x-coachmark-arrow" aria-hidden="true" />
      <h2 className="x-coachmark-title" id={`${id}-t`}>
        {title}
      </h2>
      {children ? (
        <div className="x-coachmark-body" id={`${id}-b`}>
          {children}
        </div>
      ) : null}
      <div className="x-coachmark-foot">
        <StepDots total={total} current={step} labels={{ step: l.step }} />
        <div className="x-coachmark-actions">
          <Button variant="secondary" onClick={onSkip}>
            {l.skip}
          </Button>
          {step > 1 && onBack ? (
            <Button variant="secondary" onClick={onBack}>
              {l.back}
            </Button>
          ) : null}
          <Button variant="primary" className="x-coachmark-next" onClick={onNext}>
            {last ? l.done : l.next}
          </Button>
        </div>
      </div>
    </div>
  );
}
