import { useEffect, useState, type JSX } from "react";
import { Button, ColorField, Drawer, Field, FormSection, RadioGroup, Segmented, Select, SettingRow, Switch, ThemeSwitch, type ThemePreference } from "@xdev-asia/ui";
import { LOCALES, useI18n, type Locale, type MessageKey } from "../i18n";
import { useNotify } from "./notify";
import { DEFAULT_PREFS, NAV_STYLES, PREFS_KEY, PRESETS, RANGES, TAB_STYLES, TRANSITIONS, type Prefs } from "./prefs";

const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", vi: "Tiếng Việt" };
type Flag = { [K in keyof Prefs]: Prefs[K] extends boolean ? K : never }[keyof Prefs];
type Text = "watermarkText" | "company" | "companySite" | "copyrightYear" | "icp" | "icpLink";
type Size = keyof typeof RANGES;
type Row = { key: Flag; label: MessageKey; hint?: MessageKey; off?: (p: Prefs) => boolean };

const GENERAL: Row[] = [
  { key: "dynamicTitle", label: "prefs.dynamicTitle", hint: "prefs.dynamicTitleHint" },
  { key: "checkUpdates", label: "prefs.checkUpdates", hint: "prefs.checkUpdatesHint" },
  { key: "backToTop", label: "prefs.backToTop", hint: "prefs.backToTopHint" },
  { key: "watermark", label: "prefs.watermark", hint: "prefs.watermarkHint" },
];
const THEME: Row[] = [
  { key: "colorWeak", label: "prefs.colorWeak", hint: "prefs.colorWeakHint" },
  { key: "gray", label: "prefs.gray", hint: "prefs.grayHint" },
];
const sideOff = (p: Prefs) => !p.sidebar || p.navStyle === "top";
const SIDEBAR: Row[] = [
  { key: "sidebar", label: "prefs.sidebar", hint: "prefs.sidebarHint", off: (p) => p.navStyle === "top" },
  { key: "collapsed", label: "prefs.collapsed", hint: "prefs.collapsedHint", off: (p) => sideOff(p) || p.navStyle === "two-column" },
  { key: "accordion", label: "prefs.accordion", hint: "prefs.accordionHint", off: sideOff },
];
const tabsOff = (p: Prefs) => !p.tabs;
const TABS: Row[] = [
  { key: "tabs", label: "prefs.tabs", hint: "prefs.tabsHint" },
  { key: "tabsPersist", label: "prefs.tabsPersist", hint: "prefs.tabsPersistHint", off: tabsOff },
  { key: "tabsDraggable", label: "prefs.tabsDraggable", hint: "prefs.tabsDraggableHint", off: tabsOff },
  { key: "tabsIcons", label: "prefs.tabsIcons", hint: "prefs.tabsIconsHint", off: tabsOff },
  { key: "tabsMore", label: "prefs.tabsMore", hint: "prefs.tabsMoreHint", off: tabsOff },
  { key: "tabsMaximize", label: "prefs.tabsMaximize", hint: "prefs.tabsMaximizeHint", off: tabsOff },
];
const ANIMATION: Row[] = [
  { key: "progress", label: "prefs.progress", hint: "prefs.progressHint" },
  { key: "loading", label: "prefs.loading", hint: "prefs.loadingHint" },
  { key: "transition", label: "prefs.transition", hint: "prefs.transitionHint" },
];
const FOOTER: Row[] = [
  { key: "footer", label: "prefs.footer", hint: "prefs.footerHint" },
  { key: "fixedFooter", label: "prefs.fixedFooter", hint: "prefs.fixedFooterHint", off: (p) => !p.footer },
];

/** A number preference in px: typing keeps its own text, a value inside the range is applied at once. */
function SizeField({ k, label, value, disabled, onChange }: { k: Size; label: string; value: number; disabled?: boolean; onChange: (n: number) => void }): JSX.Element {
  const { t, ui } = useI18n();
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const [min, max] = RANGES[k];
  const n = Number(text);
  const bad = text.trim() === "" || !Number.isFinite(n) || n < min || n > max;
  return (
    <Field
      label={label}
      labels={ui.field}
      name={k}
      type="number"
      inputMode="numeric"
      autoComplete="off"
      min={min}
      max={max}
      step={1}
      value={text}
      disabled={disabled}
      end={t("prefs.px")}
      error={bad ? t("prefs.range", { min, max }) : undefined}
      onChange={(e) => {
        setText(e.target.value);
        const v = e.target.valueAsNumber;
        if (Number.isFinite(v) && v >= min && v <= max) onChange(Math.round(v));
      }}
    />
  );
}

export interface PreferencesDrawerProps {
  prefs: Prefs;
  onPrefs: (next: Prefs) => void;
  theme: ThemePreference;
  onTheme: (value: ThemePreference) => void;
  onClose: () => void;
  /** "Clear preferences and sign out". */
  onSignOut?: () => void;
  /** false renders the markup only, for tests. */
  modal?: boolean;
}

/** Every look and layout choice of react-antd-admin's preferences, applied as you change them; "Done" only closes. */
export function PreferencesDrawer({ prefs, onPrefs, theme, onTheme, onClose, onSignOut, modal = true }: PreferencesDrawerProps): JSX.Element {
  const { t, ui, locale, setLocale } = useI18n();
  const notify = useNotify();
  const set = (patch: Partial<Prefs>) => onPrefs({ ...prefs, ...patch });
  const row = (r: Row) => (
    <SettingRow
      key={r.key}
      controlId={`prefs-${r.key}`}
      label={t(r.label)}
      description={r.hint ? t(r.hint) : undefined}
      control={<Switch id={`prefs-${r.key}`} aria-describedby={r.hint ? `prefs-${r.key}-hint` : undefined} checked={prefs[r.key]} disabled={r.off?.(prefs) ?? false} onChange={(e) => set({ [r.key]: e.target.checked })} />}
    />
  );
  const text = (k: Text, label: MessageKey, disabled = false, type = "text") => (
    <Field label={t(label)} labels={ui.field} name={k} type={type} autoComplete="off" spellCheck={k === "company" || k === "watermarkText"} value={prefs[k]} disabled={disabled} onChange={(e) => set({ [k]: e.target.value })} />
  );
  const size = (k: Size, label: MessageKey, disabled = false) => <SizeField k={k} label={t(label)} value={prefs[k]} disabled={disabled} onChange={(n) => set({ [k]: n })} />;
  return (
    <Drawer
      title={t("prefs.title")}
      description={t("prefs.description")}
      onClose={onClose}
      modal={modal}
      labels={ui.drawer}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => {
              onPrefs(DEFAULT_PREFS);
              onTheme("dark");
            }}
          >
            {t("prefs.reset")}
          </Button>
          <Button variant="primary" onClick={onClose}>
            {t("prefs.done")}
          </Button>
        </>
      }
    >
      <FormSection title={t("prefs.general")}>
        <SettingRow
          controlId="prefs-language"
          label={t("prefs.language")}
          control={<Select id="prefs-language" icon="globe" value={locale} onChange={(e) => setLocale(e.target.value as Locale)} options={LOCALES.map((l) => ({ value: l, label: LANGUAGE_NAMES[l] }))} />}
        />
        {GENERAL.map(row)}
        {text("watermarkText", "prefs.watermarkText", !prefs.watermark)}
      </FormSection>

      <FormSection title={t("prefs.themeSection")}>
        <SettingRow label={t("prefs.theme")} control={<ThemeSwitch variant="icons" value={theme} onChange={onTheme} labels={ui.themeSwitch} />} />
        <SettingRow
          controlId="prefs-preset"
          label={t("prefs.preset")}
          control={<Select id="prefs-preset" value={prefs.preset} onChange={(e) => set({ preset: e.target.value as Prefs["preset"] })} options={PRESETS.map((p) => ({ value: p, label: t(`prefs.presets.${p}`) }))} />}
        />
        {prefs.preset === "custom" ? (
          <ColorField
            label={t("prefs.customColor")}
            value={prefs.customColor}
            overridden={prefs.customColor !== DEFAULT_PREFS.customColor}
            onChange={(hex) => set({ customColor: hex })}
            onReset={() => set({ customColor: DEFAULT_PREFS.customColor })}
            labels={{ reset: t("prefs.colorReset"), picker: t("prefs.colorPicker"), invalid: t("prefs.colorInvalid") }}
          />
        ) : null}
        {size("radius", "prefs.radius")}
        {THEME.map(row)}
      </FormSection>

      <FormSection title={t("prefs.layout")}>
        <RadioGroup
          name="prefs-nav-style"
          label={t("prefs.navStyle")}
          orientation="vertical"
          value={prefs.navStyle}
          onChange={(v) => set({ navStyle: v as Prefs["navStyle"] })}
          options={NAV_STYLES.map((s) => ({ value: s, label: t(`prefs.navStyles.${s}`), hint: t(`prefs.navHints.${s}`) }))}
        />
        {row({ key: "crumbs", label: "prefs.crumbs", hint: "prefs.crumbsHint", off: (p) => p.navStyle === "top" || p.navStyle === "mixed" })}
      </FormSection>

      <FormSection title={t("prefs.sidebarSection")}>
        {SIDEBAR.map(row)}
        <SettingRow
          label={t("prefs.sideTheme")}
          control={
            <Segmented
              label={t("prefs.sideTheme")}
              value={prefs.sideTheme}
              disabled={sideOff(prefs)}
              onChange={(v) => set({ sideTheme: v as Prefs["sideTheme"] })}
              options={(["auto", "dark", "light"] as const).map((v) => ({ value: v, label: t(`prefs.sideThemes.${v}`) }))}
            />
          }
        />
        {size("sideWidth", "prefs.sideWidth", sideOff(prefs) || prefs.navStyle === "two-column")}
        {size("railWidth", "prefs.railWidth", sideOff(prefs) || prefs.navStyle === "two-column")}
        {size("columnWidth", "prefs.columnWidth", prefs.navStyle !== "two-column")}
      </FormSection>

      <FormSection title={t("prefs.tabsSection")}>
        {TABS.map(row)}
        <SettingRow
          label={t("prefs.tabsStyle")}
          control={<Segmented label={t("prefs.tabsStyle")} value={prefs.tabsStyle} disabled={!prefs.tabs} onChange={(v) => set({ tabsStyle: v as Prefs["tabsStyle"] })} options={TAB_STYLES.map((s) => ({ value: s, label: t(`prefs.tabStyles.${s}`) }))} />}
        />
      </FormSection>

      <FormSection title={t("prefs.animation")}>
        {ANIMATION.map(row)}
        <SettingRow
          controlId="prefs-transition-name"
          label={t("prefs.transitionName")}
          control={
            <Select
              id="prefs-transition-name"
              value={prefs.transitionName}
              disabled={!prefs.transition}
              onChange={(e) => set({ transitionName: e.target.value as Prefs["transitionName"] })}
              options={TRANSITIONS.map((n) => ({ value: n, label: t(`prefs.transitions.${n}`) }))}
            />
          }
        />
      </FormSection>

      <FormSection title={t("prefs.footerSection")}>
        {FOOTER.map(row)}
        {text("company", "prefs.company", !prefs.footer)}
        {text("companySite", "prefs.companySite", !prefs.footer, "url")}
        {text("copyrightYear", "prefs.copyrightYear", !prefs.footer)}
        {text("icp", "prefs.icp", !prefs.footer)}
        {text("icpLink", "prefs.icpLink", !prefs.footer, "url")}
      </FormSection>

      <div className="app-row">
        <Button
          variant="secondary"
          icon="copy"
          onClick={() => {
            void navigator.clipboard?.writeText(JSON.stringify({ ...prefs, theme, locale }, null, 2)).then(() => notify(t("prefs.copied")), () => {});
          }}
        >
          {t("prefs.copy")}
        </Button>
        {onSignOut ? (
          <Button
            variant="secondary"
            icon="sign-out"
            onClick={() => {
              try {
                window.localStorage.removeItem(PREFS_KEY);
                window.sessionStorage.clear();
              } catch {
                /* storage blocked: nothing kept */
              }
              onPrefs(DEFAULT_PREFS);
              onClose();
              onSignOut();
            }}
          >
            {t("prefs.clearSignOut")}
          </Button>
        ) : null}
      </div>
    </Drawer>
  );
}
