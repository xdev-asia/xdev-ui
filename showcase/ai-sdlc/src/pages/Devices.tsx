import { useEffect, useState, type JSX } from "react";
import { Badge, Button, Card, CodeBlock, Dialog, EmptyState, FormDialog, List, ListRow, MenuButton, PageHeader, PairingCode, RadioGroup, Select, Spinner, Stack, StatusDot, Tag } from "@xdev-asia/ui";
import { useI18n, type MessageKey } from "../i18n";
import { useNotify } from "../notify";
import { useStore } from "../store";
import { EXPIRY_DAYS, ROLES, type Peer, type Role } from "../workspace";

const ROLE_KEY: Record<Role, MessageKey> = { viewer: "devices.roleViewer", approver: "devices.roleApprover", operator: "devices.roleOperator", admin: "devices.roleAdmin" };
const HINT_KEY: Record<Role, MessageKey> = { viewer: "devices.hintViewer", approver: "devices.hintApprover", operator: "devices.hintOperator", admin: "devices.hintAdmin" };

export function DevicesPage(): JSX.Element {
  const s = useStore();
  const { t, ui, date } = useI18n();
  const notify = useNotify();
  const [pairing, setPairing] = useState<Peer["kind"] | null>(null);
  const [editing, setEditing] = useState<Peer | null>(null);
  const [role, setRole] = useState<Role>("viewer");
  const [days, setDays] = useState("30");
  const [removing, setRemoving] = useState<Peer | null>(null);
  const admin = s.role === "admin";

  return (
    <Stack gap={4}>
      <PageHeader
        title={t("devices.title")}
        description={t("devices.description")}
        actions={
          admin ? (
            <>
              <Button variant="secondary" onClick={() => setPairing("phone")}>
                {t("devices.pairPhone")}
              </Button>
              <Button variant="primary" icon="plus" onClick={() => setPairing("browser")}>
                {t("devices.pairBrowser")}
              </Button>
            </>
          ) : undefined
        }
      />
      {s.peers.length === 0 ? (
        <EmptyState size="center" icon="plug" title={t("devices.emptyTitle")} hint={t("devices.emptyHint")} />
      ) : (
        <Card flush>
          <List>
            {s.peers.map((p) => (
              <ListRow
                key={p.id}
                as="li"
                leading={<StatusDot tone={p.online ? "ok" : "neutral"} />}
                title={
                  <span className="app-row">
                    {p.name}
                    <Tag>{t(p.kind === "browser" ? "devices.kindBrowser" : "devices.kindPhone")}</Tag>
                    <Badge status="neutral">{t(ROLE_KEY[p.role])}</Badge>
                  </span>
                }
                meta={`${t(p.online ? "devices.online" : "devices.offline")} · ${t("devices.expires", { date: date(p.expires) })}`}
                trailing={
                  admin ? (
                    <MenuButton
                      variant="icon"
                      align="end"
                      label={t("devices.actionsFor", { name: p.name })}
                      items={[
                        {
                          label: t("devices.changeRole"),
                          onSelect: () => {
                            setRole(p.role);
                            setDays("30");
                            setEditing(p);
                          },
                        },
                        { type: "separator" },
                        { label: t("devices.remove"), danger: true, onSelect: () => setRemoving(p) },
                      ]}
                    />
                  ) : undefined
                }
              />
            ))}
          </List>
        </Card>
      )}

      {pairing ? <PairDialog kind={pairing} onClose={() => setPairing(null)} /> : null}

      {editing ? (
        <FormDialog
          modal
          busy={false}
          title={t("devices.changeRoleTitle", { name: editing.name })}
          labels={ui.formDialog}
          submitLabel={t("devices.save")}
          onCancel={() => setEditing(null)}
          onSubmit={(e) => {
            e.preventDefault();
            s.setPeers((list) => list.map((p) => (p.id === editing.id ? { ...p, role, expires: new Date(s.now + Number(days) * 86_400_000).toISOString() } : p)));
            notify(t("devices.roleChanged", { name: editing.name, role: t(ROLE_KEY[role]) }));
            setEditing(null);
          }}
        >
          <RolePicker role={role} onRole={setRole} days={days} onDays={setDays} />
        </FormDialog>
      ) : null}

      {removing ? (
        <Dialog
          alert
          modal
          tone="danger"
          busy={false}
          title={t("devices.removeTitle", { name: removing.name })}
          confirmLabel={t("devices.remove")}
          cancelLabel={t("devices.cancel")}
          onCancel={() => setRemoving(null)}
          onConfirm={() => {
            s.setPeers((list) => list.filter((p) => p.id !== removing.id));
            notify(t("devices.removed", { name: removing.name }));
            setRemoving(null);
          }}
        >
          {t("devices.removeBody")}
        </Dialog>
      ) : null}
    </Stack>
  );
}

function RolePicker({ role, onRole, days, onDays }: { role: Role; onRole: (r: Role) => void; days: string; onDays: (d: string) => void }): JSX.Element {
  const { t } = useI18n();
  return (
    <Stack gap={3}>
      <RadioGroup name="device-role" orientation="vertical" label={t("devices.role")} value={role} onChange={(v) => onRole(v as Role)} options={ROLES.map((r) => ({ value: r, label: t(ROLE_KEY[r]), hint: t(HINT_KEY[r]) }))} />
      <div className="app-field">
        <label className="app-label" htmlFor="device-days">
          {t("devices.expiry")}
        </label>
        <Select id="device-days" value={days} onChange={(e) => onDays(e.target.value)} options={EXPIRY_DAYS.map((n) => ({ value: String(n), label: t("devices.days", { n }) }))} />
      </div>
    </Stack>
  );
}

/** Pairing a browser needs only the one-time code: the page is reached over HTTPS. A phone is paired over the
 *  link protocol, so the person also compares six digits on both screens. */
function PairDialog({ kind, onClose }: { kind: Peer["kind"]; onClose: () => void }): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [step, setStep] = useState<"choose" | "code" | "compare">("choose");
  const [role, setRole] = useState<Role>(kind === "browser" ? "admin" : "viewer");
  const [days, setDays] = useState("30");
  const name = kind === "browser" ? "Firefox on macOS" : "Galaxy";

  const finish = (): void => {
    s.setPeers((list) => [...list, { id: Math.random().toString(16).slice(2, 14).padEnd(12, "0"), name, kind, role, expires: new Date(s.now + Number(days) * 86_400_000).toISOString(), online: true }]);
    notify(t("devices.paired", { name, role: t(ROLE_KEY[role]), n: days }));
    onClose();
  };

  // The showcase plays the other device: it answers a few seconds after the code is shown.
  useEffect(() => {
    if (step !== "code") return;
    const timer = setTimeout(() => (kind === "browser" ? finish() : setStep("compare")), 3500);
    return () => clearTimeout(timer);
    // `finish` reads the current role and days; the timer must not restart when they are re-created.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, kind]);

  return (
    <Dialog
      modal
      body="plain"
      title={t(kind === "browser" ? "devices.pairBrowser" : "devices.pairPhone")}
      confirmLabel={step === "choose" ? t("devices.showCode") : step === "compare" ? t("devices.sasYes") : t("devices.close")}
      cancelLabel={step === "compare" ? t("devices.sasNo") : step === "choose" ? t("devices.cancel") : null}
      onCancel={() => {
        if (step === "compare") notify(t("devices.refused"));
        onClose();
      }}
      onConfirm={() => (step === "choose" ? setStep("code") : step === "compare" ? finish() : onClose())}
    >
      {step === "choose" ? <RolePicker role={role} onRole={setRole} days={days} onDays={setDays} /> : null}
      {step === "code" ? (
        <Stack gap={3}>
          <PairingCode value="7K4QM2XD9P" groupSize={5} label={t("devices.code")} />
          <p className="app-muted">{t(kind === "browser" ? "devices.browserHint" : "devices.codeHint")}</p>
          <CodeBlock language="sh" labels={ui.codeBlock} code={kind === "browser" ? `xdev web pair --role ${role} --days ${days}` : `xdev pair --role ${role} --days ${days}`} />
          <div className="app-row" role="status">
            <Spinner size="sm" labels={ui.spinner} />
            <span className="app-muted">{t("devices.waiting")}</span>
          </div>
        </Stack>
      ) : null}
      {step === "compare" ? (
        <Stack gap={3}>
          <p className="app-text">{t("devices.requestFrom", { name })}</p>
          <PairingCode value="123456" groupSize={3} label={t("devices.sasQuestion")} size="lg" />
          <p className="app-muted">{t("devices.sasHint")}</p>
        </Stack>
      ) : null}
    </Dialog>
  );
}
