import type { JSX } from "react";
import { Segmented } from "../Segmented/Segmented";
import { THEME_PREFERENCES, type ThemePreference } from "../../theme/theme";

export interface ThemeSwitchLabels {
  /** aria-label of the group. */
  group: string;
  system: string;
  dark: string;
  light: string;
}

const DEFAULT_LABELS: ThemeSwitchLabels = { group: "Theme", system: "System", dark: "Dark", light: "Light" };

export interface ThemeSwitchProps {
  value: ThemePreference;
  onChange: (value: ThemePreference) => void;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<ThemeSwitchLabels>;
  disabled?: boolean;
}

export function ThemeSwitch({ value, onChange, labels, disabled }: ThemeSwitchProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  return (
    <Segmented
      label={l.group}
      disabled={disabled}
      value={value}
      options={THEME_PREFERENCES.map((p) => ({ value: p, label: l[p] }))}
      onChange={(v) => {
        if ((THEME_PREFERENCES as readonly string[]).includes(v)) onChange(v as ThemePreference);
      }}
    />
  );
}
