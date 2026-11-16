import type { JSX } from "react";
import { Button, Card, Stack } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { canDecide, useStore } from "../store";

/** A push of the worktree that waits for a person. Push requests have no terminal, so they are answered here. */
export function PushCard({ id, command }: { id: string; command?: string }): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  const notify = useNotify();
  const approver = canDecide(s, "push");
  const decide = (allow: boolean): void => {
    s.setApprovals((list) => list.map((a) => (a.id === id ? { ...a, decided: { choice: allow ? "approve" : "changes", by: s.device, agoMin: 0 } } : a)));
    notify(t(allow ? "ws.allowed" : "ws.denied"));
  };
  return (
    <Card title={t("dock.pushWaits")} subtitle={command} monoSubtitle>
      <Stack direction="row" gap={2} justify="end" wrap>
        <Button variant="secondary" disabled={!approver} onClick={() => decide(false)}>
          {t("dock.deny")}
        </Button>
        <Button variant="primary" disabled={!approver} onClick={() => decide(true)}>
          {t("dock.allow")}
        </Button>
      </Stack>
    </Card>
  );
}
