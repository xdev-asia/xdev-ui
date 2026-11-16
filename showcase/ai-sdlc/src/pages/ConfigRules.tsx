import { useState, type JSX } from "react";
import { Card, DescriptionList, FieldMessage, PageHeader, RadioGroup, SaveBar, Select, SettingRow, Stack, Switch } from "@xdev-asia/ui";
import type { ApprovalRule, RunPolicy } from "../config";
import { useI18n, type MessageKey } from "../i18n";
import { useNotify } from "../notify";
import { ConfigNote } from "../parts/ConfigNote";
import { can, useStore } from "../store";
import { ROLES, type Role } from "../workspace";

const KIND_KEY: Record<ApprovalRule["kind"], MessageKey> = { command: "cfg.kindCommand", edit: "cfg.kindEdit", push: "cfg.kindPush", stage: "cfg.kindStage" };

/**
 * What an agent may do without asking while AI runs the stages end to end, who decides the rest, and the limits
 * around it. Follows the v2 spec: gates may be decided by AI, push always waits for a person.
 */
export function ConfigRulesPage(): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [rules, setRules] = useState<ApprovalRule[]>(s.approvalRules);
  const [policy, setPolicy] = useState<RunPolicy>(s.policy);
  const admin = can(s.role, "admin");
  const dirty = JSON.stringify(rules) !== JSON.stringify(s.approvalRules) || JSON.stringify(policy) !== JSON.stringify(s.policy);

  return (
    <Stack gap={4}>
      <PageHeader title={t("cfg.rulesTitle")} description={t("cfg.rulesDescriptionV2")} />
      <ConfigNote source="2026-11-16-xdev-ai-sdlc-v2.md" />
      <Card title={t("cfg.rules")} headingLevel={2}>
        <DescriptionList
          items={[
            { term: t("cfg.policyEdit"), value: t("cfg.policyEditHow") },
            { term: t("cfg.policyAllowed"), value: t("cfg.policyAllowedHow") },
            { term: t("cfg.policyOther"), value: t(policy.otherCommands === "ask" ? "cfg.otherAsk" : "cfg.otherAi") },
            { term: t("cfg.policyPush"), value: t("cfg.policyPushHow") },
            { term: t("cfg.policyGate"), value: t("cfg.policyGateHow") },
          ]}
        />
      </Card>
      <Card title={t("cfg.policyOther")} headingLevel={2}>
        <Stack gap={3}>
          <RadioGroup
            name="other-commands"
            orientation="vertical"
            label={t("cfg.policyOther")}
            value={policy.otherCommands}
            disabled={!admin}
            onChange={(v) => setPolicy((p) => ({ ...p, otherCommands: v as RunPolicy["otherCommands"] }))}
            options={[
              { value: "ask", label: t("cfg.otherAsk") },
              { value: "ai", label: t("cfg.otherAi") },
            ]}
          />
          {policy.otherCommands === "ai" ? (
            <div className="app-field">
              <label className="app-label" htmlFor="other-agent">
                {t("cfg.otherAgent")}
              </label>
              <Select id="other-agent" value={policy.otherAgent} disabled={!admin} onChange={(e) => setPolicy((p) => ({ ...p, otherAgent: e.target.value }))} options={s.agentConfigs.map((a) => ({ value: a.id, label: a.name }))} />
            </div>
          ) : null}
        </Stack>
      </Card>
      <Card flush title={t("cfg.whoPerson")} headingLevel={2}>
        {rules.map((rule) => (
          <SettingRow
            key={rule.kind}
            id={`rule-${rule.kind}`}
            controlId={`rule-role-${rule.kind}`}
            label={t(KIND_KEY[rule.kind])}
            control={
              <Select
                id={`rule-role-${rule.kind}`}
                aria-label={`${t(KIND_KEY[rule.kind])}: ${t("cfg.ruleRole")}`}
                value={rule.minRole}
                disabled={!admin}
                onChange={(e) => setRules((list) => list.map((r) => (r.kind === rule.kind ? { ...r, minRole: e.target.value as Role } : r)))}
                options={ROLES.filter((r) => r !== "viewer").map((r) => ({ value: r, label: t("cfg.roleAndUp", { role: t(`roles.${r}`) }) }))}
              />
            }
          />
        ))}
      </Card>
      <Card title={t("dock.run")} headingLevel={2}>
        <Stack gap={3}>
          <Switch label={t("cfg.rotate")} checked={policy.rotateAccounts} disabled={!admin} onChange={(e) => setPolicy((p) => ({ ...p, rotateAccounts: e.target.checked }))} />
          <span className="app-muted">{t("cfg.rotateHint")}</span>
          <Switch label={t("cfg.budget")} checked={false} disabled onChange={() => undefined} />
          <span className="app-muted">{t("cfg.budgetHint")}</span>
          <Switch label={t("cfg.bypass")} checked={false} disabled onChange={() => undefined} />
          <FieldMessage tone="info">{t("cfg.bypassOff")}</FieldMessage>
        </Stack>
      </Card>
      <SaveBar
        dirty={dirty}
        labels={ui.saveBar}
        saveDisabled={!admin}
        onDiscard={() => {
          setRules(s.approvalRules);
          setPolicy(s.policy);
        }}
        onSave={() => {
          s.setApprovalRules(rules);
          s.setPolicy(policy);
          notify(t("cfg.saved", { name: t("cfg.rulesTitle") }));
        }}
      />
    </Stack>
  );
}
