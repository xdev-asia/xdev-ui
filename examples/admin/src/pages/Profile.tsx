import { useRef, useState, type JSX } from "react";
import { Avatar, Field, FormSection, PageHeader, SaveBar, Textarea, useUnsavedGuard } from "@xdev-asia/ui";
import type { Session } from "../auth/session";
import { useI18n, type MessageKey } from "../i18n";
import { useNotify } from "../shell/notify";
import { focusFirstInvalid } from "../parts/focus";

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  bio: string;
}

export const BIO_MAX = 200;

/** Pure: profile form errors. */
export function validateProfile(p: ProfileData): Partial<Record<keyof ProfileData, MessageKey>> {
  const e: Partial<Record<keyof ProfileData, MessageKey>> = {};
  if (!p.name.trim()) e.name = "profile.nameRequired";
  if (p.bio.length > BIO_MAX) e.bio = "profile.bioTooLong";
  return e;
}

export interface ProfileViewProps {
  saved: ProfileData;
  onSave: (next: ProfileData) => Promise<void>;
  /** Starting draft, for tests and screenshots. */
  initialDraft?: ProfileData;
}

export function ProfileView({ saved, onSave, initialDraft }: ProfileViewProps): JSX.Element {
  const { t, ui } = useI18n();
  const [draft, setDraft] = useState(initialDraft ?? saved);
  const [busy, setBusy] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  useUnsavedGuard(dirty, t("profile.leave"), { guardLinks: true });
  const errors = validateProfile(draft);
  const set = (patch: Partial<ProfileData>): void => setDraft((d) => ({ ...d, ...patch }));
  return (
    <>
      <PageHeader title={t("profile.title")} description={t("profile.description")} />
      <form ref={form} className="app-form" onSubmit={(e) => e.preventDefault()}>
        <FormSection title={t("profile.photo")} description={t("profile.photoHint")}>
          <Avatar name={draft.name || saved.name} size="lg" />
        </FormSection>
        <FormSection columns={2}>
          <Field label={t("profile.name")} name="name" value={draft.name} onChange={(e) => set({ name: e.target.value })} error={errors.name ? t(errors.name) : undefined} autoComplete="name" required />
          <Field label={t("profile.email")} type="email" name="email" spellCheck={false} value={draft.email} readOnly hint={t("profile.emailHint")} autoComplete="email" />
          <Field label={t("profile.phone")} type="tel" name="phone" inputMode="tel" value={draft.phone} onChange={(e) => set({ phone: e.target.value })} autoComplete="tel" />
        </FormSection>
        <FormSection>
          <Textarea label={t("profile.bio")} name="bio" value={draft.bio} onChange={(e) => set({ bio: e.target.value })} hint={t("profile.bioHint")} error={errors.bio ? t(errors.bio) : undefined} />
        </FormSection>
      </form>
      <SaveBar
        dirty={dirty}
        busy={busy}
        labels={ui.saveBar}
        onDiscard={() => setDraft(saved)}
        onSave={() => {
          if (Object.keys(errors).length) return focusFirstInvalid(form.current);
          setBusy(true);
          onSave({ ...draft, name: draft.name.trim() }).finally(() => setBusy(false));
        }}
      />
    </>
  );
}

export function ProfilePage({ session }: { session: Session }): JSX.Element {
  const { t } = useI18n();
  const notify = useNotify();
  const [saved, setSaved] = useState<ProfileData>({ name: session.name, email: session.email, phone: "", bio: "" });
  return (
    <ProfileView
      key={JSON.stringify(saved)}
      saved={saved}
      onSave={async (next) => {
        await new Promise((r) => setTimeout(r, 300));
        setSaved(next);
        notify(t("profile.saved"));
      }}
    />
  );
}
