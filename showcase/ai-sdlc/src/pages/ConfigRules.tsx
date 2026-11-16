import { useState, type JSX } from "react";
import { Card, FieldMessage, PageHeader, RadioGroup, SaveBar, Select, SettingRow, Stack, Switch } from "@xdev-asia/ui";
import type { ApprovalRule } from "../config";
import { useI18n, type MessageKey } from "../i18n";
import { useNotify } from "../notify";
import { ConfigNote } from "../parts/ConfigNote";
import { can, useStore } from "../store";
import { ROLES, type Role } from "../workspace";

const KIND_KEY: Record<ApprovalRule["kind"], MessageKey> = { command: "cfg.kindCommand", edit: "cfg.kindEdit", push: "cfg.kindPush", stage: "cfg.kindStage" };

/**
 * Who may decide each kind of request, how long it waits, and the modes other tools offer that xDev does not.
 * A proposal: the specs fix Approver for every kind and forbid approving without a person.
 */
export function ConfigRulesPage(): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [draft, setDraft] = useState<ApprovalRule[]>(s.approvalRules);
  const admin = can(s.role, "admin");
  const dirty = JSON.stringify(draft) !== JSON.stringify(s.approvalRules);
  // How long a request waits is set per agent profile; list the ones in use.
  const waits = s.agentConfigs
    .filter((a) => a.builtin)
    .map((a) => `${a.name} ${a.timeoutSecs} s`)
    .join(" · ");

  return (
    <Stack gap={4}>
      <PageHeader title={t("cfg.rulesTitle")} description={t("cfg.rulesDescription")} />
      <ConfigNote source={null} />
      <Card flush>
        {draft.map((rule) => (
          <SettingRow
            key={rule.kind}
            id={`rule-${rule.kind}`}
            controlId={`rule-role-${rule.kind}`}
            label={t(KIND_KEY[rule.kind])}
            description={`${t("cfg.ruleWait")}: ${rule.kind === "stage" ? t("cfg.ruleNever") : waits}`}
            control={
              <Select
                id={`rule-role-${rule.kind}`}
                aria-label={`${t(KIND_KEY[rule.kind])}: ${t("cfg.ruleRole")}`}
                value={rule.minRole}
                disabled={!admin}
                onChange={(e) => setDraft((list) => list.map((r) => (r.kind === rule.kind ? { ...r, minRole: e.target.value as Role } : r)))}
                options={ROLES.filter((r) => r !== "viewer").map((r) => ({ value: r, label: t("cfg.roleAndUp", { role: t(`roles.${r}`) }) }))}
              />
            }
          />
        ))}
      </Card>
      <SaveBar
        dirty={dirty}
        labels={ui.saveBar}
        saveDisabled={!admin}
        onDiscard={() => setDraft(s.approvalRules)}
        onSave={() => {
          s.setApprovalRules(draft);
          notify(t("cfg.saved", { name: t("cfg.rulesTitle") }));
        }}
      />
      <Card title={t("cfg.mode")} headingLevel={2}>
        <Stack gap={3}>
          <RadioGroup
            name="approval-mode"
            orientation="vertical"
            label={t("cfg.mode")}
            value="manual"
            onChange={() => undefined}
            options={[
              { value: "manual", label: t("cfg.modeManual") },
              { value: "auto", label: t("cfg.modeAuto"), disabled: true },
              { value: "none", label: t("cfg.modeYolo"), disabled: true },
            ]}
          />
          <Switch label={t("cfg.always")} checked={false} disabled onChange={() => undefined} />
          <FieldMessage tone="info">{`${t("cfg.modeOff")} ${t("cfg.alwaysOff")}`}</FieldMessage>
        </Stack>
      </Card>
    </Stack>
  );
}
