import { useState, type JSX } from "react";
import { Avatar, Menu, Popover } from "@xdev-asia/ui";
import type { Session } from "../auth/session";
import { useI18n } from "../i18n";

export function AccountMenu({ session, onSettings, onSignOut }: { session: Session; onSettings: () => void; onSignOut: () => void }): JSX.Element {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const pick = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };
  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      placement="bottom-end"
      label={t("account.menu")}
      trigger={(p) => (
        <button type="button" className="app-account" aria-label={t("account.menu")} onClick={() => setOpen(!open)} {...p}>
          <Avatar name={session.name} />
        </button>
      )}
    >
      <p className="app-account-who">{t("account.signedInAs", { email: session.email })}</p>
      <Menu
        label={t("account.menu")}
        items={[
          { label: t("nav.settings"), onSelect: pick(onSettings) },
          { type: "separator" },
          { label: t("account.signOut"), onSelect: pick(onSignOut) },
        ]}
      />
    </Popover>
  );
}
