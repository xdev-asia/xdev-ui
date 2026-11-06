import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Badge } from "../Badge/Badge";
import { ColorField } from "../ColorField/ColorField";
import { Segmented } from "../Segmented/Segmented";
import { ThemePreview } from "../ThemePreview/ThemePreview";

export type ThemeEditorMode = "dark" | "light";

export interface ThemeEditorGroup {
  id: string;
  /** Legend of the fieldset. */
  title: string;
  keys: { key: string; label: string }[];
}

export interface ThemeEditorIssue {
  /** A key of one of the groups. */
  key: string;
  message: string;
}

export interface ThemeEditorLabels {
  name: string;
  mode: string;
  dark: string;
  light: string;
  /** Reset button of a colour; `{token}` is replaced by the key's label. */
  reset: string;
  /** Swatch name of a colour; `{token}` is replaced by the key's label. */
  picker: string;
  invalid: string;
  preview: { title: string; sample: string; hint: string; button: string };
  issuesTitle: string;
  /** Shown when `issues` is empty. */
  noIssues: string;
}

export interface ThemeEditorProps {
  mode: ThemeEditorMode;
  onMode: (mode: ThemeEditorMode) => void;
  name: string;
  onName: (name: string) => void;
  nameError?: string;
  groups: ThemeEditorGroup[];
  /** The colour of every key in force for `mode`, `#rrggbb`. */
  colors: Record<string, string>;
  /** The keys the theme sets for `mode`. */
  overridden: ReadonlySet<string>;
  onColor: (key: string, hex: string) => void;
  onReset: (key: string) => void;
  issues: ThemeEditorIssue[];
  labels: ThemeEditorLabels;
  /** Extra fields under the name. */
  children?: ReactNode;
  className?: string;
}

export function ThemeEditor({
  mode,
  onMode,
  name,
  onName,
  nameError,
  groups,
  colors,
  overridden,
  onColor,
  onReset,
  issues,
  labels,
  children,
  className,
}: ThemeEditorProps): JSX.Element {
  const keyLabel = new Map(groups.flatMap((g) => g.keys.map((k) => [k.key, k.label] as const)));
  return (
    <div className={cx("x-theme-editor", className)}>
      <label className="ws-field" data-invalid={nameError ? "" : undefined}>
        <span>{labels.name}</span>
        <input type="text" data-field="themeName" value={name} maxLength={60} aria-invalid={nameError ? true : undefined} onChange={(e) => onName(e.target.value)} />
        {nameError ? <small role="alert">{nameError}</small> : null}
      </label>
      {children}
      <div className="ws-field">
        <span>{labels.mode}</span>
        <Segmented
          label={labels.mode}
          value={mode}
          options={[
            { value: "dark", label: labels.dark },
            { value: "light", label: labels.light },
          ]}
          onChange={(next) => onMode(next as ThemeEditorMode)}
        />
      </div>
      {groups.map((g) => (
        <fieldset className="x-theme-editor-group" key={g.id} data-group={g.id}>
          <legend>{g.title}</legend>
          {g.keys.map((k) => (
            <ColorField
              key={`${mode}-${k.key}`}
              data-key={k.key}
              label={k.label}
              value={colors[k.key] ?? ""}
              overridden={overridden.has(k.key)}
              onChange={(hex) => onColor(k.key, hex)}
              onReset={() => onReset(k.key)}
              labels={{ reset: labels.reset.replace("{token}", k.label), picker: labels.picker.replace("{token}", k.label), invalid: labels.invalid }}
            />
          ))}
        </fieldset>
      ))}
      <ThemePreview mode={mode} {...labels.preview} />
      <section className="x-theme-editor-issues" aria-label={labels.issuesTitle}>
        <h5>{labels.issuesTitle}</h5>
        <div className="x-theme-editor-count" role="status" aria-live="polite">
          {issues.length === 0 ? <span>{labels.noIssues}</span> : <Badge>{issues.length}</Badge>}
        </div>
        {issues.length > 0 ? (
          <ul className="x-theme-editor-issue-list" role="list">
            {issues.map((i) => (
              <li key={`${i.key}-${i.message}`} data-key={i.key}>
                <strong>{keyLabel.get(i.key) ?? i.key}</strong> {i.message}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
