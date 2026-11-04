import { useState, type FormEvent, type JSX } from "react";
import { Checkbox, Dialog, Field, Select } from "@xdev-asia/ui";
import { ROLE_IDS, type RoleId } from "../data/seed";
import type { NewUser } from "../data/store";
import { useI18n } from "../i18n";
import { validateUser, type UserErrors } from "../pages/UserDetail";

export interface CreateUserDialogProps {
  onSubmit: (input: NewUser) => Promise<"ok" | "email-taken" | "failed">;
  onCancel: () => void;
  /** Starting state, for tests and screenshots. */
  initial?: { values?: Partial<NewUser>; errors?: UserErrors; saving?: boolean };
}

export function CreateUserDialog({ onSubmit, onCancel, initial }: CreateUserDialogProps): JSX.Element {
  const { t, ui } = useI18n();
  const [values, setValues] = useState<NewUser>({ name: "", email: "", role: "viewer", invite: true, ...initial?.values });
  const [errors, setErrors] = useState<UserErrors>(initial?.errors ?? {});
  const [saving, setSaving] = useState(initial?.saving ?? false);

  const set = (patch: Partial<NewUser>): void => {
    const next = { ...values, ...patch };
    setValues(next);
    if (errors.name || errors.email) {
      const v = validateUser(next);
      setErrors({ name: errors.name && v.name, email: errors.email && v.email });
    }
  };
  const submit = (e?: FormEvent): void => {
    e?.preventDefault();
    if (saving) return;
    const v = validateUser(values);
    setErrors(v);
    if (v.name || v.email) return;
    setSaving(true);
    onSubmit(values).then((r) => {
      setSaving(false);
      if (r === "email-taken") setErrors({ email: "user.emailTaken" });
    });
  };

  return (
    <Dialog
      modal
      title={t("createUser.title")}
      confirmLabel={saving ? t("createUser.saving") : t("createUser.submit")}
      cancelLabel={t("createUser.cancel")}
      confirmDisabled={saving}
      onConfirm={() => submit()}
      onCancel={onCancel}
      labels={ui.dialog}
    >
      <form className="app-form" onSubmit={submit} noValidate>
        <Field label={t("createUser.fullName")} autoComplete="off" value={values.name} onChange={(e) => set({ name: e.target.value })} error={errors.name ? t(errors.name) : undefined} />
        <Field label={t("createUser.email")} type="email" autoComplete="off" value={values.email} onChange={(e) => set({ email: e.target.value })} error={errors.email ? t(errors.email) : undefined} />
        <label className="app-labelled">
          <span className="app-label">{t("createUser.role")}</span>
          <Select value={values.role} onChange={(e) => set({ role: e.target.value as RoleId })} options={ROLE_IDS.map((r) => ({ value: r, label: t(`roles.names.${r}`) }))} />
        </label>
        <Checkbox label={t("createUser.sendInvite")} hint={t("createUser.sendInviteHint")} checked={values.invite} onChange={(e) => set({ invite: e.target.checked })} />
        <button type="submit" hidden />
      </form>
    </Dialog>
  );
}
