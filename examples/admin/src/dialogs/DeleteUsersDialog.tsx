import type { JSX } from "react";
import { Dialog } from "@xdev-asia/ui";
import type { User } from "../data/seed";
import { useI18n } from "../i18n";

export interface DeleteUsersDialogProps {
  users: Pick<User, "id" | "name">[];
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Destructive confirm: the title names the object, the primary button repeats the verb. */
export function DeleteUsersDialog({ users, busy, onConfirm, onCancel }: DeleteUsersDialogProps): JSX.Element {
  const { t, ui } = useI18n();
  const one = users.length === 1;
  return (
    <Dialog
      alert
      modal
      title={one ? t("deleteUsers.titleOne", { name: users[0].name }) : t("deleteUsers.titleMany", { count: users.length })}
      confirmLabel={one ? t("deleteUsers.confirmOne") : t("deleteUsers.confirmMany", { count: users.length })}
      cancelLabel={t("deleteUsers.cancel")}
      confirmDisabled={busy}
      onConfirm={onConfirm}
      onCancel={onCancel}
      labels={ui.dialog}
    >
      {one ? t("deleteUsers.bodyOne") : t("deleteUsers.bodyMany")}
    </Dialog>
  );
}
