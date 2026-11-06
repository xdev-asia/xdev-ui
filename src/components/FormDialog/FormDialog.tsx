import { useId, useRef, type FormEvent, type JSX, type ReactNode, type RefObject } from "react";
import { useModal } from "../../internal/modal";
import { Button } from "../Button/Button";

export interface FormDialogLabels {
  submit: string;
  cancel: string;
  /** Shown on the submit button while `busy`. */
  saving: string;
}

const DEFAULT_LABELS: FormDialogLabels = { submit: "Save", cancel: "Cancel", saving: "Saving" };

export interface FormDialogProps {
  title: ReactNode;
  /** One line under the title. */
  description?: ReactNode;
  /** The fields. */
  children?: ReactNode;
  /** Called with the submit event; the default navigation is already prevented. */
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  formId?: undefined;
  /** Cancel, Esc and the backdrop. Not called while `busy`. */
  onCancel: () => void;
  /** Submitting: the submit button shows `labels.saving` with a spinner and every close request is ignored. */
  busy?: boolean;
  /** A server error for the whole form, shown above the actions with role="alert". Field errors go on each Field. */
  error?: ReactNode;
  /** Disables submit, e.g. while nothing changed. */
  submitDisabled?: boolean;
  /** Overrides `labels.submit` with the verb of the action ("Create user"). */
  submitLabel?: string;
  size?: "default" | "wide";
  /** false renders the markup only (previews). Default true. */
  modal?: boolean;
  labels?: Partial<FormDialogLabels>;
}

/** FormDialog around a `<form id={formId}>` you render in `children` (e.g. one owned by a form library). */
export interface FormDialogExternalFormProps extends Omit<FormDialogProps, "onSubmit" | "formId"> {
  /** id of your form: FormDialog renders no form of its own and the submit button gets `form={formId}`. Handle submit and `busy` on that form. */
  formId: string;
  onSubmit?: undefined;
}

export function FormDialog({ title, description, children, onSubmit, formId, onCancel, busy, error, submitDisabled, submitLabel, size = "default", modal = true, labels }: FormDialogProps | FormDialogExternalFormProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const titleId = `x-fdialog-${id}`;
  const descId = `x-fdialog-d-${id}`;
  const root = useRef<HTMLDivElement | null>(null);
  const panel = useRef<HTMLElement | null>(null);
  const cancel = (): void => {
    if (!busy) onCancel();
  };
  const onKeyDown = useModal(modal, root, panel, cancel);
  const submit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!busy) onSubmit?.(e);
  };
  const panelProps = {
    className: "dialog x-form-dialog",
    "data-size": size,
    role: "dialog",
    "aria-modal": modal ? ("true" as const) : undefined,
    "aria-labelledby": titleId,
    "aria-describedby": description ? descId : undefined,
    "aria-busy": busy ? ("true" as const) : undefined,
    tabIndex: modal ? -1 : undefined,
  };
  const content = (
    <>
        <h2 className="dialog-title" id={titleId}>
          {title}
        </h2>
        {description ? (
          <p className="x-form-dialog-desc" id={descId}>
            {description}
          </p>
        ) : null}
        <div className="dialog-body x-form-dialog-fields">{children}</div>
        {error ? (
          <p className="x-form-dialog-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="dialog-actions">
          <Button variant="secondary" onClick={cancel} disabled={busy}>
            {l.cancel}
          </Button>
          <Button type="submit" form={formId} disabled={submitDisabled || busy}>
            {busy ? (
              <span className="x-spinner" data-size="sm" aria-hidden="true">
                <span className="x-spinner-ring" />
              </span>
            ) : null}
            {busy ? l.saving : (submitLabel ?? l.submit)}
          </Button>
        </div>
    </>
  );
  return (
    <div className="dialog-backdrop" ref={root} data-modal={modal ? "true" : undefined} onKeyDown={onKeyDown}>
      {formId ? (
        <div ref={panel as RefObject<HTMLDivElement | null>} {...panelProps}>
          {content}
        </div>
      ) : (
        <form ref={panel as RefObject<HTMLFormElement | null>} {...panelProps} noValidate onSubmit={submit}>
          {content}
        </form>
      )}
    </div>
  );
}
