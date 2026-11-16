import { useEffect, useRef, useState, type Dispatch, type JSX, type SetStateAction } from "react";
import {
  AgentChip,
  Badge,
  Banner,
  Button,
  Card,
  DescriptionList,
  Dialog,
  Drawer,
  EmptyState,
  FieldMessage,
  List,
  ListRow,
  MenuButton,
  PageHeader,
  Segmented,
  Skeleton,
  Stack,
  StatusDot,
  Tag,
  type MenuEntry,
  type StatusTone,
} from "@xdev-asia/ui";
import { AGENTS, agentOf, type Account, type AccountStatus, type AgentId } from "../data";
import { useI18n, type MessageKey } from "../i18n";
import { useNotify } from "../notify";
import { can, useStore } from "../store";
import { AddAccountDialog } from "../parts/AddAccountDialog";
import { SignInPanel } from "../parts/SignInPanel";

type View = "list" | "empty" | "loading" | "error";

const STATUS: Record<AccountStatus, { tone: StatusTone; key: MessageKey }> = {
  signed_in: { tone: "ok", key: "accounts.signedIn" },
  signed_out: { tone: "warn", key: "accounts.signedOut" },
  checking: { tone: "neutral", key: "accounts.checking" },
  error: { tone: "danger", key: "accounts.error" },
};

export interface AccountsPageProps {
  accounts: Account[];
  setAccounts: Dispatch<SetStateAction<Account[]>>;
  defaults: Record<AgentId, string>;
  setDefaults: Dispatch<SetStateAction<Record<AgentId, string>>>;
}

export function AccountsPage({ accounts, setAccounts, defaults, setDefaults }: AccountsPageProps): JSX.Element {
  const { t, ui, date } = useI18n();
  const notify = useNotify();
  const store = useStore();
  const admin = can(store.role, "admin");
  const [view, setView] = useState<View>("list");
  const [adding, setAdding] = useState<AgentId | null>(null);
  const [signingIn, setSigningIn] = useState<Account | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [removing, setRemoving] = useState<Account | null>(null);
  const [detail, setDetail] = useState<Account | null>(null);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const all = timers.current;
    return () => all.forEach(clearTimeout);
  }, []);

  const setStatus = (ids: string[], status: (a: Account) => AccountStatus): void =>
    setAccounts((list) => list.map((a) => (ids.includes(a.id) ? { ...a, status: status(a), checkedAt: new Date().toISOString() } : a)));

  /** Asks the CLI again whether each account is signed in. The prototype gives back the state it had. */
  const check = (ids: string[], announce: boolean): void => {
    const before = new Map(accounts.map((a) => [a.id, a.status]));
    setStatus(ids, () => "checking");
    timers.current.add(
      setTimeout(() => {
        setStatus(ids, (a) => before.get(a.id) ?? "signed_out");
        if (announce) notify(t("accounts.checked", { count: ids.length }));
      }, 1200),
    );
  };

  const statusText = (a: Account): JSX.Element => <StatusDot tone={STATUS[a.status].tone} pulse={a.status === "checking"} label={t(STATUS[a.status].key)} />;

  const usage = (a: Account): string =>
    a.maxTerminals !== undefined ? t("accounts.terminalsOf", { used: a.terminals, max: a.maxTerminals }) : t("accounts.terminalsUsed", { used: a.terminals });

  const menu = (a: Account): MenuEntry[] => [
    { label: t("accounts.details"), onSelect: () => setDetail(a) },
    // Everything below changes an account: it takes the Admin role.
    ...(admin
      ? ([
          { label: t("accounts.checkNow"), disabled: a.status === "checking", onSelect: () => check([a.id], false) },
          ...(a.auth === "login" ? [{ label: t(a.status === "signed_in" ? "accounts.signInAgain" : "accounts.signIn"), onSelect: () => startSignIn(a) }] : []),
          {
            label: t("accounts.setDefault"),
            disabled: defaults[a.agent] === a.id || a.status !== "signed_in",
            onSelect: () => {
              setDefaults((d) => ({ ...d, [a.agent]: a.id }));
              notify(t("accounts.madeDefault", { name: a.name, agent: agentOf(a.agent).name }));
            },
          },
          { type: "separator" },
          { label: t("accounts.remove"), danger: true, onSelect: () => setRemoving(a) },
        ] satisfies MenuEntry[])
      : []),
  ];

  const startSignIn = (a: Account): void => {
    setSignedIn(false);
    setSigningIn(a);
  };

  const row = (a: Account): JSX.Element => (
    <ListRow
      key={a.id}
      as="li"
      leading={<AgentChip profile={agentOf(a.agent).profile} title={agentOf(a.agent).name} />}
      title={
        <span className="app-row">
          {a.name}
          {defaults[a.agent] === a.id ? <Badge status="neutral">{t("accounts.isDefault")}</Badge> : null}
        </span>
      }
      meta={
        <Stack gap={1}>
          <span className="app-row">
            <Tag>{a.id}</Tag>
            <span>{t(a.auth === "login" ? "accounts.authLogin" : "accounts.authEnvFile")}</span>
            <span>{usage(a)}</span>
          </span>
          {a.status === "error" ? <FieldMessage tone="error">{t("accounts.errorEnvReadable")}</FieldMessage> : null}
        </Stack>
      }
      trailing={
        <Stack direction="row" gap={2} align="center" justify="end" wrap>
          {statusText(a)}
          {admin && a.status === "signed_out" && a.auth === "login" ? (
            <Button variant="secondary" size="sm" onClick={() => startSignIn(a)}>
              {t("accounts.signIn")}
            </Button>
          ) : null}
          {admin && a.status === "error" ? (
            <Button variant="secondary" size="sm" onClick={() => check([a.id], false)}>
              {t("accounts.checkAgain")}
            </Button>
          ) : null}
          <MenuButton variant="icon" align="end" label={t("accounts.actionsFor", { name: a.name })} items={menu(a)} />
        </Stack>
      }
    />
  );

  const shown = view === "empty" ? [] : accounts;

  return (
    <Stack gap={4}>
      <PageHeader
        title={t("accounts.title")}
        description={t("accounts.description")}
        actions={
          admin ? (
            <>
              <Button variant="secondary" icon="refresh" disabled={view !== "list" || accounts.length === 0} onClick={() => check(accounts.map((a) => a.id), true)}>
                {t("accounts.checkAll")}
              </Button>
              <Button variant="primary" icon="plus" onClick={() => setAdding("claude-code")}>
                {t("accounts.add")}
              </Button>
            </>
          ) : undefined
        }
      />
      {!admin ? <Banner tone="info" title={t("accounts.adminOnly")} /> : null}
      <FieldMessage tone="warn">{t("add.consoleNote")}</FieldMessage>

      <div className="app-proto">
        <Tag>{t("app.prototype")}</Tag>
        <Segmented
          label={t("app.protoState")}
          value={view}
          onChange={(v) => setView(v as View)}
          options={[
            { value: "list", label: t("app.protoList") },
            { value: "empty", label: t("app.protoEmpty") },
            { value: "loading", label: t("app.protoLoading") },
            { value: "error", label: t("app.protoError") },
          ]}
        />
      </div>

      {view === "loading" ? (
        <Stack gap={3}>
          <Skeleton shape="block" height="var(--x-space-8)" announce labels={ui.skeleton} />
          <Skeleton lines={4} labels={ui.skeleton} />
        </Stack>
      ) : view === "error" ? (
        <Banner
          tone="danger"
          title={t("accounts.loadFailed")}
          action={
            <Button variant="secondary" onClick={() => setView("list")}>
              {t("app.retry")}
            </Button>
          }
        >
          {t("accounts.loadFailedHint")}
        </Banner>
      ) : shown.length === 0 ? (
        <EmptyState
          size="center"
          icon="accounts"
          title={t("accounts.emptyTitle")}
          hint={t("accounts.emptyHint")}
          labels={ui.emptyState}
          current={1}
          steps={[{ label: t("accounts.emptyStep1") }, { label: t("accounts.emptyStep2") }, { label: t("accounts.emptyStep3") }]}
          actions={
            <Button variant="secondary" icon="plus" onClick={() => setAdding("claude-code")}>
              {t("accounts.add")}
            </Button>
          }
        />
      ) : (
        AGENTS.map((agent) => {
          const mine = shown.filter((a) => a.agent === agent.id);
          return (
            <Card key={agent.id} flush headingLevel={2} title={agent.name} subtitle={t("accounts.groupSummary", { signedIn: mine.filter((a) => a.status === "signed_in").length, total: mine.length })}>
              {mine.length === 0 ? (
                <EmptyState
                  size="inline"
                  title={t("accounts.groupEmpty", { agent: agent.name })}
                  hint={t("accounts.groupEmptyHint", { agent: agent.name })}
                  actions={
                    <Button variant="secondary" size="sm" icon="plus" onClick={() => setAdding(agent.id)}>
                      {t("accounts.addFor", { agent: agent.name })}
                    </Button>
                  }
                />
              ) : (
                <List>{mine.map(row)}</List>
              )}
            </Card>
          );
        })
      )}

      {adding ? (
        <AddAccountDialog
          accounts={accounts}
          agent={adding}
          onCreate={(a) => {
            setAccounts((list) => [...list, a]);
            setView("list");
            notify(t("accounts.created", { name: a.name }));
          }}
          onSignedIn={(id) => setStatus([id], () => "signed_in")}
          onClose={() => setAdding(null)}
        />
      ) : null}

      {signingIn ? (
        <Dialog
          modal
          title={t("signIn.title", { name: signingIn.name })}
          size="wide"
          body="plain"
          confirmLabel={t("add.done")}
          cancelLabel={signedIn ? null : t("signIn.close")}
          confirmDisabled={!signedIn}
          onConfirm={() => setSigningIn(null)}
          onCancel={() => setSigningIn(null)}
        >
          <SignInPanel
            account={signingIn}
            onDone={() => {
              setSignedIn(true);
              setStatus([signingIn.id], () => "signed_in");
            }}
          />
        </Dialog>
      ) : null}

      {removing ? (
        <Dialog
          alert
          modal
          tone="danger"
          title={t("remove.title", { name: removing.name })}
          confirmLabel={t("remove.confirm")}
          cancelLabel={t("add.cancel")}
          confirmDisabled={removing.terminals > 0}
          onCancel={() => setRemoving(null)}
          onConfirm={() => {
            setAccounts((list) => list.filter((a) => a.id !== removing.id));
            setDefaults((d) => (d[removing.agent] === removing.id ? { ...d, [removing.agent]: "" } : d));
            notify(t("accounts.removed", { name: removing.name }));
            setRemoving(null);
          }}
        >
          {removing.terminals > 0 ? t("remove.inUse", { count: removing.terminals }) : t("remove.body")}
        </Dialog>
      ) : null}

      {detail ? (
        <Drawer modal title={detail.name} description={agentOf(detail.agent).name} labels={ui.drawer} onClose={() => setDetail(null)}>
          <Stack gap={4}>
            <DescriptionList
              items={[
                { term: t("detail.agent"), value: agentOf(detail.agent).name },
                { term: t("detail.id"), value: detail.id, mono: true },
                { term: t("detail.auth"), value: t(detail.auth === "login" ? "add.authLogin" : "add.authEnv") },
                { term: t("detail.status"), value: statusText(detail) },
                { term: `${t("detail.configDir")} (${agentOf(detail.agent).configVar})`, value: `~/.xdev/accounts/${detail.id}/${detail.agent}`, mono: true },
                ...(detail.envFile ? [{ term: t("detail.envFile"), value: detail.envFile, mono: true }] : []),
                { term: t("detail.terminals"), value: detail.maxTerminals !== undefined ? usage(detail) : t("detail.noLimit", { used: detail.terminals }) },
                { term: t("detail.checkedAt"), value: date(detail.checkedAt, true) },
              ]}
            />
            <p className="app-muted">{t(detail.auth === "login" ? "detail.privacyLogin" : "detail.privacyEnv")}</p>
            <p className="app-muted">{t("detail.configNote")}</p>
          </Stack>
        </Drawer>
      ) : null}
    </Stack>
  );
}
