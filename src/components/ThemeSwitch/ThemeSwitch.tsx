import type { JSX } from "react";
import { Icon } from "../Icon/Icon";
import { IconButton } from "../IconButton/IconButton";
import { Segmented } from "../Segmented/Segmented";
import { THEME_PREFERENCES, type ResolvedTheme, type ThemePreference } from "../../theme/theme";

export interface ThemeSwitchLabels {
  /** aria-label of the group. */
  group: string;
  system: string;
  dark: string;
  light: string;
  /** aria-label and title of the icon button while the page is light. */
  toDark: string;
  /** aria-label and title of the icon button while the page is dark. */
  toLight: string;
}

const DEFAULT_LABELS: ThemeSwitchLabels = {
  group: "Theme",
  system: "System",
  dark: "Dark",
  light: "Light",
  toDark: "Switch to dark mode",
  toLight: "Switch to light mode",
};

export interface ThemeSwitchProps {
  value: ThemePreference;
  onChange: (value: ThemePreference) => void;
  /**
   * "segmented" (default): System, Dark, Light.
   * "icon": one round button for a top bar that flips dark and light; offer System elsewhere (a menu).
   * "icons": System, Dark and Light as three icon segments (monitor, moon, sun), each named and titled, for a
   * settings row or a sign-in footer where words would crowd the control.
   */
  variant?: "segmented" | "icon" | "icons";
  /** The theme on screen. The icon variant needs it while `value` is "system". Default: `value`, or "dark". */
  resolved?: ResolvedTheme;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<ThemeSwitchLabels>;
  disabled?: boolean;
}

export function ThemeSwitch({ value, onChange, variant = "segmented", resolved, labels, disabled }: ThemeSwitchProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  if (variant === "icon") {
    const shown: ResolvedTheme = value === "system" ? (resolved ?? "dark") : value;
    const next: ResolvedTheme = shown === "dark" ? "light" : "dark";
    return (
      <IconButton
        className="x-theme-toggle"
        icon={shown === "dark" ? "sun" : "moon"}
        label={next === "dark" ? l.toDark : l.toLight}
        disabled={disabled}
        onClick={() => onChange(next)}
      />
    );
  }
  if (variant === "icons") {
    const ICON = { system: "monitor", dark: "moon", light: "sun" } as const;
    return (
      <div className="segmented x-theme-icons" role="group" aria-label={l.group}>
        {THEME_PREFERENCES.map((p) => (
          <button key={p} type="button" aria-pressed={p === value} aria-label={l[p]} title={l[p]} disabled={disabled} onClick={() => onChange(p)}>
            <Icon name={ICON[p]} size={16} />
          </button>
        ))}
      </div>
    );
  }
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
