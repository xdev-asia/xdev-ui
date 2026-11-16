import type { JSX } from "react";
import { Dialog, FieldMessage, Stack } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { can, useStore } from "../store";

/** The lines on top of a configuration page: where its fields come from, and why it is read only when it is. */
export function ConfigNote({ source }: { source: string | null }): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  return (
    <Stack gap={2}>
      <FieldMessage tone={source ? "info" : "warn"}>{source ? t("cfg.fromSpec", { file: source }) : t("cfg.proposal")}</FieldMessage>
      {!can(s.role, "admin") ? <FieldMessage tone="info">{t("cfg.adminOnly", { role: t(`roles.${s.role}`) })}</FieldMessage> : null}
    </Stack>
  );
}

/** Pure: text with one item per line into a list, blank lines dropped. */
export const lines = (text: string): string[] =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

/** Pure: moves item `i` of `list` by `by` places, keeping it inside the list. */
export function move<T>(list: T[], i: number, by: number): T[] {
  const j = i + by;
  if (j < 0 || j >= list.length) return list;
  const out = [...list];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

/** A confirm step before removing a piece of configuration; blocked while something still uses it. */
export function ConfirmRemove({ title, body, blocked, onClose, onConfirm }: { title: string; body: string; blocked: boolean; onClose: () => void; onConfirm: () => void }): JSX.Element {
  const { t } = useI18n();
  return (
    <Dialog alert modal tone="danger" busy={false} title={title} confirmLabel={t("cfg.remove")} cancelLabel={t("add.cancel")} confirmDisabled={blocked} onCancel={onClose} onConfirm={onConfirm}>
      {body}
    </Dialog>
  );
}
