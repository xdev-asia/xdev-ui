import { useState, type FormEvent, type JSX } from "react";
import {
  Banner, Button, Checkbox, DescriptionList, EmptyState, Field, FormSection, ListRow, PageHeader, RadioGroup, StatusDot, Tabs, Tag,
  type StatusTone,
} from "@xdev-asia/ui";
import { can } from "../auth/permissions";
import type { Session } from "../auth/session";
import { useStore } from "../data/context";
import { ROLE_IDS, type AuditEvent, type Role, type RoleId, type User, type UserStatus } from "../data/seed";
import { StoreError } from "../data/store";
import { useLoad, type Load } from "../data/useLoad";
import { useI18n, type MessageKey } from "../i18n";
import { hrefFor, navigate } from "../router";
import { useNotify } from "../shell/notify";

const TONE: Record<UserStatus, StatusTone> = { active: "ok", invited: "warn", suspended: "danger" };

export interface UserValues {
  name: string;
  email: string;
  role: RoleId;
  notify: boolean;
}
export type UserErrors = Partial<Record<"name" | "email", MessageKey>>;

/** Pure validation, shared with the create dialog. */
export function validateUser(v: Pick<UserValues, "name" | "email">): UserErrors {
  const errors: UserErrors = {};
  if (!v.name.trim()) errors.name = "user.nameRequired";
  if (!v.email.trim()) errors.email = "user.emailRequired";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) errors.email = "user.emailInvalid";
  return errors;
}

export interface UserDetailViewProps {
  user: User;
  activity: AuditEvent[];
  viewer: Pick<Session, "role">;
  roles: Role[];
  onSave: (values: UserValues) => Promise<"ok" | "email-taken" | "failed">;
  onToggleStatus: () => void;
  onDelete: () => void;
  /** Starting state, for tests and screenshots. */
  initial?: { tab?: "profile" | "activity"; errors?: UserErrors; saveFailed?: boolean; values?: Partial<UserValues> };
}

export function UserDetailView({ user, activity, viewer, roles, onSave, onToggleStatus, onDelete, initial }: UserDetailViewProps): JSX.Element {
  const { t, date } = useI18n();
  const editable = can(roles, viewer.role, "users.update");
  const canDelete = can(roles, viewer.role, "users.delete");
  const [tab, setTab] = useState(initial?.tab ?? "profile");
  const base: UserValues = { name: user.name, email: user.email, role: user.role, notify: user.notify };
  const [values, setValues] = useState<UserValues>({ ...base, ...initial?.values });
  const [errors, setErrors] = useState<UserErrors>(initial?.errors ?? {});
  const [saveFailed, setSaveFailed] = useState(initial?.saveFailed ?? false);
  const [saving, setSaving] = useState(false);
  const dirty = values.name !== base.name || values.email !== base.email || values.role !== base.role || values.notify !== base.notify;

  const set = (patch: Partial<UserValues>): void => {
    const next = { ...values, ...patch };
    setValues(next);
    // Validate on submit first; after that, re-check fields that already show an error.
    if (errors.name || errors.email) {
      const v = validateUser(next);
      setErrors({ name: errors.name && v.name, email: errors.email && v.email });
    }
  };
  const submit = (e: FormEvent): void => {
    e.preventDefault();
    const v = validateUser(values);
    setErrors(v);
    setSaveFailed(false);
    if (v.name || v.email) return;
    setSaving(true);
    onSave(values).then((r) => {
      setSaving(false);
      if (r === "email-taken") setErrors({ email: "user.emailTaken" });
      else if (r === "failed") setSaveFailed(true);
    });
  };

  const actions = (
    <>
      {editable ? (
        <Button variant="secondary" onClick={onToggleStatus}>
          {user.status === "suspended" ? t("user.reactivate") : t("user.suspend")}
        </Button>
      ) : null}
      {canDelete ? (
        <Button variant="secondary" onClick={onDelete}>
          {t("user.delete")}
        </Button>
      ) : null}
    </>
  );

  return (
    <>
      <PageHeader
        title={user.name}
        meta={
          <>
            <StatusDot tone={TONE[user.status]} label={t(`users.status.${user.status}`)} />
            <Tag>{t(`roles.names.${user.role}`)}</Tag>
          </>
        }
        actions={actions}
      />
      <Tabs
        label={user.name}
        idPrefix="user-tabs"
        value={tab}
        onChange={(id) => setTab(id as "profile" | "activity")}
        items={[
          { id: "profile", label: t("user.profile") },
          { id: "activity", label: t("user.activity") },
        ]}
      />
      {tab === "profile" ? (
        <div className="app-stack app-panel" role="tabpanel" id="user-tabs-panel-profile" aria-labelledby="user-tabs-tab-profile">
          <DescriptionList
            layout="columns"
            items={[
              { term: t("user.email"), value: user.email, mono: true },
              { term: t("user.role"), value: t(`roles.names.${user.role}`) },
              { term: t("user.status"), value: t(`users.status.${user.status}`) },
              { term: t("user.created"), value: date(user.created) },
              { term: t("user.lastSeen"), value: user.lastSeen ? date(user.lastSeen, true) : t("users.never") },
            ]}
          />
          {saveFailed ? <Banner title={t("user.saveFailed")}>{t("user.saveFailedHint")}</Banner> : null}
          <form className="app-stack" onSubmit={submit} noValidate>
            <FormSection title={t("user.profileSection")} description={t("user.profileHint")} columns={2}>
              <Field label={t("user.fullName")} value={values.name} disabled={!editable} onChange={(e) => set({ name: e.target.value })} error={errors.name ? t(errors.name) : undefined} />
              <Field label={t("user.email")} type="email" autoComplete="off" value={values.email} disabled={!editable} onChange={(e) => set({ email: e.target.value })} error={errors.email ? t(errors.email) : undefined} />
            </FormSection>
            <FormSection
              title={t("user.accessSection")}
              description={t("user.accessHint")}
              actions={
                editable ? (
                  <>
                    <Button variant="secondary" disabled={!dirty || saving} onClick={() => { setValues(base); setErrors({}); setSaveFailed(false); }}>
                      {t("user.cancel")}
                    </Button>
                    <Button variant="primary" type="submit" disabled={!dirty || saving}>
                      {t("user.save")}
                    </Button>
                  </>
                ) : undefined
              }
            >
              <RadioGroup
                name="role"
                label={t("user.role")}
                orientation="horizontal"
                disabled={!editable}
                value={values.role}
                onChange={(v) => set({ role: v as RoleId })}
                options={ROLE_IDS.map((r) => ({ value: r, label: t(`roles.names.${r}`) }))}
              />
              <Checkbox label={t("user.notifyByEmail")} disabled={!editable} checked={values.notify} onChange={(e) => set({ notify: e.target.checked })} />
            </FormSection>
          </form>
        </div>
      ) : (
        <div className="app-panel" role="tabpanel" id="user-tabs-panel-activity" aria-labelledby="user-tabs-tab-activity">
          {activity.length ? (
            <ul className="app-list">
              {activity.map((e) => (
                <ListRow as="li" key={e.id} title={t(`audit.actions.${e.kind}`)} meta={`${date(e.time, true)} · ${e.target}`} />
              ))}
            </ul>
          ) : (
            <EmptyState size="inline" icon="history" title={t("user.noActivity")} />
          )}
        </div>
      )}
    </>
  );
}

export interface UserDetailPageProps {
  id: string;
  session: Session;
  roles: Role[];
  onDelete: (users: Pick<User, "id" | "name">[], done: () => void) => void;
}

export function UserDetailPage({ id, session, roles, onDelete }: UserDetailPageProps): JSX.Element {
  const store = useStore();
  const { t } = useI18n();
  const notify = useNotify();
  const { state, reload, set } = useLoad<{ user: User | null; activity: AuditEvent[] }>(
    async () => {
      try {
        const [user, audit] = await Promise.all([store.getUser(id), store.listAudit().catch(() => [] as AuditEvent[])]);
        return { user, activity: audit.filter((e) => e.target === user.email || e.actor === user.name).slice(0, 10) };
      } catch (e) {
        if (e instanceof StoreError && e.code === "not-found") return { user: null, activity: [] };
        throw e;
      }
    },
    [store, id],
  );
  return <DetailBody state={state} reload={reload} set={set} id={id} session={session} roles={roles} onDelete={onDelete} store={store} t={t} notify={notify} />;
}

type Body = Load<{ user: User | null; activity: AuditEvent[] }>;
function DetailBody(p: { state: Body; reload: () => void; set: (d: { user: User | null; activity: AuditEvent[] }) => void; id: string; session: Session; roles: Role[]; onDelete: UserDetailPageProps["onDelete"]; store: ReturnType<typeof useStore>; t: ReturnType<typeof useI18n>["t"]; notify: (m: string) => void }): JSX.Element {
  const { state, store, t, notify } = p;
  if (state.status === "loading") return <PageHeader title={t("app.loading")} />;
  if (state.status === "error")
    return (
      <Banner title={t("app.loadFailed")} action={<Button variant="secondary" onClick={p.reload}>{t("app.retry")}</Button>}>
        {t("app.loadFailedHint")}
      </Banner>
    );
  const { user, activity } = state.data;
  if (!user) return <UserNotFound />;
  return (
    <UserDetailView
      key={user.id + user.status}
      user={user}
      activity={activity}
      viewer={p.session}
      roles={p.roles}
      onSave={async (values) => {
        try {
          const updated = await store.updateUser(user.id, values);
          p.set({ user: updated, activity });
          notify(t("user.saved"));
          return "ok";
        } catch (e) {
          return e instanceof StoreError && e.code === "email-taken" ? "email-taken" : "failed";
        }
      }}
      onToggleStatus={() =>
        store.setStatus([user.id], user.status === "suspended" ? "active" : "suspended").then(
          () => {
            notify(t("user.statusUpdated"));
            p.reload();
          },
          () => notify(t("user.saveFailed")),
        )
      }
      onDelete={() => p.onDelete([{ id: user.id, name: user.name }], () => navigate(hrefFor.users()))}
    />
  );
}

export function UserNotFound(): JSX.Element {
  const { t } = useI18n();
  return (
    <EmptyState
      size="center"
      icon="accounts"
      title={t("user.notFoundTitle")}
      hint={t("user.notFoundHint")}
      actions={<Button variant="primary" onClick={() => navigate(hrefFor.users())}>{t("user.backToUsers")}</Button>}
    />
  );
}
