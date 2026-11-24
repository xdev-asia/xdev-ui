import { useState, type JSX } from "react";
import { Button, Icon, IconButton, ListRow, Popover, StatusDot, type IconName } from "@xdev-asia/ui";
import type { Notice, NoticeKind } from "../data/catalog";
import { useI18n } from "../i18n";

const ICON: Record<NoticeKind, IconName> = { security: "shield", user: "accounts", system: "server" };

export interface NotificationsProps {
  notices: Notice[];
  onRead: (ids: string[]) => void;
  /** Open state for tests and screenshots. */
  initialOpen?: boolean;
}

/** Bell in the top bar: unread count on the button, the list in a popover, newest first. */
export function Notifications({ notices, onRead, initialOpen = false }: NotificationsProps): JSX.Element {
  const { t, date } = useI18n();
  const [open, setOpen] = useState(initialOpen);
  const unread = notices.filter((n) => !n.read);
  const name = unread.length ? t("shell.notificationsUnread", { n: unread.length }) : t("shell.notifications");
  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      placement="bottom-end"
      label={t("shell.notifications")}
      className="app-notices"
      trigger={(p) => (
        <span className="app-bell">
          <IconButton icon="bell" label={name} onClick={() => setOpen(!open)} {...p} />
          {unread.length ? (
            <span className="app-bell-count" aria-hidden="true">
              {unread.length > 9 ? "9+" : unread.length}
            </span>
          ) : null}
        </span>
      )}
    >
      <div className="app-notices-head">
        <h2 className="app-notices-title">{t("shell.notifications")}</h2>
        {unread.length ? (
          <Button variant="ghost" size="sm" onClick={() => onRead(unread.map((n) => n.id))}>
            {t("shell.markAllRead")}
          </Button>
        ) : null}
      </div>
      {notices.length && unread.length ? null : <p className="app-notices-empty">{t("shell.caughtUp")}</p>}
      <ul className="app-list">
        {[...notices]
          .sort((a, b) => b.time.localeCompare(a.time))
          .map((n) => (
            <ListRow
              as="li"
              key={n.id}
              leading={<Icon name={ICON[n.kind]} />}
              title={t(`notices.${n.key}`)}
              meta={`${t(`notices.${n.kind}`)} · ${date(n.time, true)}`}
              trailing={n.read ? null : <StatusDot tone="accent" label={t("shell.unreadDot")} />}
              onClick={n.read ? undefined : () => onRead([n.id])}
            />
          ))}
      </ul>
    </Popover>
  );
}
