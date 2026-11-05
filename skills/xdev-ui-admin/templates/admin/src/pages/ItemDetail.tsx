import { useEffect, useState, type JSX } from "react";
import { Banner, Button, DescriptionList, Field, FormSection, PageHeader, Spinner } from "@xdev-asia/ui";
import { can } from "../auth/permissions";
import type { Session } from "../auth/session";
import { useStore } from "../data/context";
import type { Item } from "../data/store";
import { useLoad, type Load } from "../data/useLoad";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";

export interface ItemDetailViewProps {
  state: Load<Item>;
  canEdit: boolean;
  name: string;
  nameError: boolean;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onRetry: () => void;
}

export function ItemDetailView(p: ItemDetailViewProps): JSX.Element {
  const { t, ui, date } = useI18n();
  if (p.state.status === "loading") return <div className="app-pane"><Spinner size="md" label={ui.spinner.loading} /></div>;
  if (p.state.status === "error")
    return (
      <Banner title={t("app.loadFailed")} action={<Button variant="secondary" onClick={p.onRetry}>{t("app.retry")}</Button>}>
        {t("app.loadFailedHint")}
      </Banner>
    );
  const item = p.state.data;
  return (
    <>
      <PageHeader title={item.name} description={t("item.details")} />
      <div className="app-stack">
        <DescriptionList
          items={[
            { term: t("item.owner"), value: item.owner },
            { term: t("item.status"), value: t(`items.status.${item.status}`) },
            { term: t("item.updated"), value: date(item.updated, true) },
          ]}
        />
        <FormSection title={t("item.edit")} actions={p.canEdit ? <Button onClick={p.onSave}>{t("item.save")}</Button> : undefined}>
          <Field label={t("item.name")} value={p.name} disabled={!p.canEdit} error={p.nameError ? t("item.nameRequired") : undefined} onChange={(e) => p.onNameChange(e.target.value)} />
        </FormSection>
      </div>
    </>
  );
}

export function ItemDetailPage({ id, session }: { id: string; session: Session }): JSX.Element {
  const store = useStore();
  const { t } = useI18n();
  const notify = useNotify();
  const { state, reload, set } = useLoad(() => store.getItem(id), [store, id]);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(false);
  useEffect(() => {
    if (state.status === "ready") setName(state.data.name);
  }, [state]);
  return (
    <ItemDetailView
      state={state}
      canEdit={can(session.role, "items.update")}
      name={name}
      nameError={nameError}
      onNameChange={(v) => {
        setName(v);
        setNameError(false);
      }}
      onSave={() => {
        if (!name.trim()) return setNameError(true);
        store.saveItem(id, { name: name.trim() }).then(
          (item) => {
            set(item);
            notify(t("item.saved"));
          },
          () => notify(t("app.loadFailed")),
        );
      }}
      onRetry={reload}
    />
  );
}
