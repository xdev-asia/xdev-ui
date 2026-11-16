import { useState, type JSX } from "react";
import { Button, CodeBlock, FieldMessage, FormDialog, Select, Stack } from "@xdev-asia/ui";
import { AGENTS, agentOf, blockReason, type Account, type AgentId } from "../data";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { href } from "../router";
import { useStore } from "../store";

/** Opens an agent terminal in a session: pick the agent, then the account it signs in with. */
export function OpenTerminalDialog({ sessionId, onClose }: { sessionId: string; onClose: () => void }): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [agent, setAgent] = useState<AgentId>("claude-code");
  const [accountId, setAccountId] = useState(s.defaults["claude-code"]);

  const mine = s.accounts.filter((a) => a.agent === agent);
  const picked = mine.find((a) => a.id === accountId);
  const reason = picked ? blockReason(picked) : null;
  const nameOf = (id: string): string => s.accounts.find((a) => a.id === id)?.name ?? t("terminals.noAccount");

  const optionLabel = (a: Account): string => {
    const why = blockReason(a);
    if (why === "signedOut") return t("terminals.optionSignedOut", { name: a.name });
    if (why === "error") return t("terminals.optionError", { name: a.name });
    if (why === "full") return t("terminals.optionFull", { name: a.name, used: a.terminals, max: a.maxTerminals ?? 0 });
    return s.defaults[agent] === a.id ? t("terminals.optionDefault", { name: a.name }) : a.name;
  };

  return (
    <FormDialog
      modal
      busy={false}
      title={t("terminals.open")}
      labels={ui.formDialog}
      submitLabel={t("terminals.submit")}
      submitDisabled={reason !== null}
      onCancel={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        if (reason !== null) return;
        const id = Math.random().toString(16).slice(2, 14).padEnd(12, "0");
        s.setTerminals((list) => [...list, { id, sessionId, name: agentOf(agent).command, agent, account: accountId, state: "working", elapsedMs: 0, output: [`$ ${agentOf(agent).command}`] }]);
        s.setAccounts((list) => list.map((a) => (a.id === accountId ? { ...a, terminals: a.terminals + 1 } : a)));
        s.setSessions((list) => list.map((x) => (x.id === sessionId ? { ...x, status: "working" } : x)));
        notify(t("terminals.opened", { agent: agentOf(agent).name, account: nameOf(accountId) }));
        onClose();
      }}
    >
      <Stack gap={3}>
        <div className="app-field">
          <label className="app-label" htmlFor="term-agent">
            {t("terminals.agent")}
          </label>
          <Select
            id="term-agent"
            value={agent}
            onChange={(e) => {
              const next = e.target.value as AgentId;
              setAgent(next);
              setAccountId(s.defaults[next]);
            }}
            options={AGENTS.map((a) => ({ value: a.id, label: a.name }))}
          />
        </div>
        <div className="app-field">
          <label className="app-label" htmlFor="term-account">
            {t("terminals.account")}
          </label>
          <Select
            id="term-account"
            value={accountId}
            aria-describedby={reason ? "term-account-msg" : undefined}
            onChange={(e) => setAccountId(e.target.value)}
            options={[...mine.map((a) => ({ value: a.id, label: optionLabel(a) })), { value: "", label: t("terminals.accountNone") }]}
          />
          {picked && reason ? (
            <Stack gap={1} align="start">
              <FieldMessage id="term-account-msg" tone={reason === "signedOut" ? "warn" : "error"}>
                {reason === "signedOut"
                  ? t("terminals.blockedSignedOut", { name: picked.name })
                  : reason === "error"
                    ? t("terminals.blockedError", { name: picked.name })
                    : t("terminals.blockedFull", { name: picked.name, max: picked.maxTerminals ?? 0 })}
              </FieldMessage>
              {reason !== "full" ? (
                <Button variant="link" href={href.accounts}>
                  {t("terminals.goAccounts")}
                </Button>
              ) : null}
            </Stack>
          ) : null}
        </div>
        <div className="app-field">
          <span className="app-label">{t("terminals.command")}</span>
          <CodeBlock language="sh" labels={ui.codeBlock} code={`xdev term open ${sessionId} --agent ${agent}${accountId ? ` --account ${accountId}` : ""}`} />
        </div>
      </Stack>
    </FormDialog>
  );
}
