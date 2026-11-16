import { useState, type JSX } from "react";
import { AddAgentDialog } from "../parts/AddAgentDialog";
import { AgentRow, Button, DescriptionList, Field, FieldMessage, FilterChip, IconButton, MenuButton, PageHeader, SaveBar, Select, Stack, Tag, Textarea } from "@xdev-asia/ui";
import { agentProblems, type AgentConfig, type AgentLevel, type GateKind } from "../config";
import { useI18n, type MessageKey } from "../i18n";
import { useNotify } from "../notify";
import { ConfigNote, ConfirmRemove, lines, move } from "../parts/ConfigNote";
import { can, useStore } from "../store";

const KIND_KEY: Record<GateKind, MessageKey> = { push: "cfg.kindPush", command: "cfg.kindCommand", edit: "cfg.kindEdit" };

/** Agent profiles: the CLI, its arguments, and which of its actions stop for a person (agents/*.toml). */
export function ConfigAgentsPage(): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AgentConfig | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [level, setLevel] = useState<AgentLevel | null>(null);
  const [adding, setAdding] = useState(false);
  const admin = can(s.role, "admin");

  /** Where a profile is used: stages of pipelines and seats of squad templates. */
  const usedBy = (id: string): string[] => [
    ...s.pipelines.filter((p) => p.stages.some((st) => st.agent === id || st.gate.agent === id)).map((p) => p.name),
    ...s.templates.filter((tp) => tp.seats.some((x) => x.agent === id)).map((tp) => tp.name),
  ];

  const open = (a: AgentConfig | null): void => {
    setOpenId(a?.id ?? null);
    setDraft(a ? structuredClone(a) : null);
  };
  const saved = s.agentConfigs.find((a) => a.id === openId);
  const dirty = Boolean(draft && saved && JSON.stringify(draft) !== JSON.stringify(saved));
  const problems = draft ? agentProblems(draft) : [];
  const edit = (change: Partial<AgentConfig>): void => setDraft((d) => (d ? { ...d, ...change } : d));

  const duplicate = (a: AgentConfig): void => {
    let id = `${a.id}-copy`;
    for (let n = 2; s.agentConfigs.some((x) => x.id === id); n++) id = `${a.id}-copy-${n}`;
    const copy: AgentConfig = { ...structuredClone(a), id, name: t("cfg.copyOf", { name: a.name }), builtin: false };
    s.setAgentConfigs((list) => [...list, copy]);
    open(copy);
  };

  return (
    <Stack gap={4}>
      <PageHeader
        title={t("cfg.agentsTitle")}
        description={t("cfg.agentsDescription")}
        actions={
          admin ? (
            <Button variant="secondary" icon="plus" onClick={() => setAdding(true)}>
              {t("cfg.addAgent")}
            </Button>
          ) : undefined
        }
      />
      <ConfigNote source="agents/*.toml" />
      <div className="app-row" role="group" aria-label={t("cfg.filters")}>
        <FilterChip pressed={level === null} count={s.agentConfigs.length} onClick={() => setLevel(null)}>
          {t("cfg.allFilter")}
        </FilterChip>
        {(["full", "basic"] as AgentLevel[]).map((l) => (
          <FilterChip key={l} pressed={level === l} count={s.agentConfigs.filter((a) => a.level === l).length} onClick={() => setLevel(l)}>
            {t(l === "full" ? "cfg.levelFull" : "cfg.levelBasic")}
          </FilterChip>
        ))}
      </div>
      <Stack gap={2}>
        {s.agentConfigs.filter((a) => !level || a.level === level).map((a) => {
          const used = usedBy(a.id);
          const expanded = openId === a.id && draft !== null;
          return (
            <AgentRow
              key={a.id}
              name={a.name}
              cli={[...a.command, ...a.args].join(" ")}
              labels={ui.agentRow}
              summary={
                <span className="app-row">
                  <Tag>{a.id}</Tag>
                  <Tag tone={a.level === "full" ? "default" : "warn"}>{t(a.level === "full" ? "cfg.levelFull" : "cfg.levelBasic")}</Tag>
                  <span className="app-muted">{a.vendor}</span>
                  {a.builtin ? <Tag>{t("cfg.builtin")}</Tag> : null}
                  <span className="app-muted">{used.length > 0 ? t("cfg.usedBy", { list: used.join(", ") }) : t("cfg.unused")}</span>
                </span>
              }
              expanded={expanded}
              onToggle={(on) => open(on ? a : null)}
              actions={
                admin ? (
                  <MenuButton
                    variant="icon"
                    align="end"
                    label={a.name}
                    items={[
                      { label: t("cfg.duplicate"), onSelect: () => duplicate(a) },
                      ...(a.builtin ? [] : [{ type: "separator" as const }, { label: t("cfg.remove"), danger: true, onSelect: () => setRemoving(a.id) }]),
                    ]}
                  />
                ) : undefined
              }
            >
              {expanded && draft ? (
                <Stack gap={4}>
                  <DescriptionList
                    items={[
                      { term: t("cfg.id"), value: draft.id, mono: true },
                      { term: t("cfg.vendor"), value: draft.vendor },
                      { term: t("cfg.level"), value: `${t(draft.level === "full" ? "cfg.levelFull" : "cfg.levelBasic")}: ${t(draft.level === "full" ? "cfg.levelFullHint" : "cfg.levelBasicHint")}` },
                      { term: t("cfg.hookProtocol"), value: draft.hookProtocol ?? t("cfg.noHooks"), mono: Boolean(draft.hookProtocol) },
                    ]}
                  />
                  {draft.unverified ? <FieldMessage tone="warn">{t("cfg.unverified")}</FieldMessage> : null}
                  <Field label={t("cfg.name")} value={draft.name} disabled={!admin} onChange={(e) => edit({ name: e.target.value })} />
                  <Field label={t("cfg.command")} value={draft.command.join(" ")} disabled={!admin} spellCheck={false} autoComplete="off" onChange={(e) => edit({ command: e.target.value.split(/\s+/).filter(Boolean) })} />
                  <Textarea label={t("cfg.args")} hint={t("cfg.argsHint")} mono value={draft.args.join("\n")} disabled={!admin} spellCheck={false} onChange={(e) => edit({ args: lines(e.target.value) })} />
                  <Textarea label={t("cfg.allow")} hint={t("cfg.allowHint")} mono value={draft.allow.join("\n")} disabled={!admin} spellCheck={false} onChange={(e) => edit({ allow: lines(e.target.value) })} />
                  {draft.level === "basic" || draft.envFile ? <Field label={t("cfg.envFile")} hint={t("cfg.envFileHint")} value={draft.envFile ?? ""} disabled={!admin} spellCheck={false} autoComplete="off" onChange={(e) => edit({ envFile: e.target.value || undefined })} /> : null}
                  {draft.hookProtocol ? (
                  <>
                  <Stack gap={2}>
                    <span className="app-label">{t("cfg.gates")}</span>
                    <span className="app-muted">{t("cfg.gatesHint")}</span>
                    <ol className="app-cfg-list">
                      {draft.gates.map((g, i) => (
                        <li key={i} className="app-cfg-row">
                          <span className="app-cfg-n">{i + 1}</span>
                          <div className="app-field">
                            <label className="app-label" htmlFor={`gate-kind-${i}`}>
                              {t("cfg.kind")}
                            </label>
                            <Select id={`gate-kind-${i}`} value={g.kind} disabled={!admin} onChange={(e) => edit({ gates: draft.gates.map((x, j) => (j === i ? { ...x, kind: e.target.value as GateKind } : x)) })} options={(["push", "command", "edit"] as GateKind[]).map((k) => ({ value: k, label: t(KIND_KEY[k]) }))} />
                          </div>
                          <Field label={t("cfg.tools")} value={g.tools} disabled={!admin} spellCheck={false} autoComplete="off" onChange={(e) => edit({ gates: draft.gates.map((x, j) => (j === i ? { ...x, tools: e.target.value } : x)) })} />
                          <Field label={t("cfg.whenCommand")} hint={g.kind === "push" ? t("cfg.whenHint") : undefined} value={g.whenCommand ?? ""} disabled={!admin} spellCheck={false} autoComplete="off" onChange={(e) => edit({ gates: draft.gates.map((x, j) => (j === i ? { ...x, whenCommand: e.target.value || undefined } : x)) })} />
                          <span className="app-cfg-tools">
                            <IconButton icon="arrow-up" size="sm" label={t("cfg.moveUp")} disabled={!admin || i === 0} onClick={() => edit({ gates: move(draft.gates, i, -1) })} />
                            <IconButton icon="arrow-down" size="sm" label={t("cfg.moveDown")} disabled={!admin || i === draft.gates.length - 1} onClick={() => edit({ gates: move(draft.gates, i, 1) })} />
                            <IconButton icon="close" size="sm" label={t("cfg.removeGate", { n: i + 1 })} disabled={!admin} onClick={() => edit({ gates: draft.gates.filter((_, j) => j !== i) })} />
                          </span>
                        </li>
                      ))}
                    </ol>
                    <Stack direction="row">
                      <Button variant="secondary" size="sm" icon="plus" disabled={!admin} onClick={() => edit({ gates: [...draft.gates, { tools: "Bash", kind: "command" }] })}>
                        {t("cfg.addGate")}
                      </Button>
                    </Stack>
                  </Stack>
                  </>
                  ) : null}
                  {draft.hookProtocol ? (
                  <div className="app-cfg-pair">
                    <Field label={t("cfg.timeout")} inputMode="numeric" value={String(draft.timeoutSecs)} disabled={!admin} onChange={(e) => edit({ timeoutSecs: Number(e.target.value) || 0 })} />
                    <Field label={t("cfg.hookTimeout")} inputMode="numeric" value={String(draft.hookTimeoutSecs)} disabled={!admin} onChange={(e) => edit({ hookTimeoutSecs: Number(e.target.value) || 0 })} />
                  </div>
                  ) : null}
                  <Textarea label={t("cfg.forbidden")} hint={t("cfg.forbiddenHint")} mono value={draft.forbiddenArgs.join("\n")} disabled={!admin} spellCheck={false} onChange={(e) => edit({ forbiddenArgs: lines(e.target.value) })} />
                  {problems.map((p, i) => (
                    <FieldMessage key={i} tone="error">
                      {t(p.key, p.vars)}
                    </FieldMessage>
                  ))}
                  <SaveBar
                    dirty={dirty}
                    labels={ui.saveBar}
                    saveDisabled={problems.length > 0 || !admin}
                    onDiscard={() => open(saved ?? null)}
                    onSave={() => {
                      s.setAgentConfigs((list) => list.map((x) => (x.id === draft.id ? draft : x)));
                      notify(t("cfg.saved", { name: draft.name }));
                    }}
                  />
                </Stack>
              ) : null}
            </AgentRow>
          );
        })}
      </Stack>
      {adding ? (
        <AddAgentDialog
          onClose={() => setAdding(false)}
          onAdded={(a) => {
            setLevel(null);
            open(a);
          }}
        />
      ) : null}
      {removing ? <RemoveAgent id={removing} usedBy={usedBy(removing)} onClose={() => setRemoving(null)} onRemoved={() => open(null)} /> : null}
    </Stack>
  );
}

function RemoveAgent({ id, usedBy, onClose, onRemoved }: { id: string; usedBy: string[]; onClose: () => void; onRemoved: () => void }): JSX.Element | null {
  const s = useStore();
  const { t } = useI18n();
  const notify = useNotify();
  const a = s.agentConfigs.find((x) => x.id === id);
  if (!a) return null;
  return (
    <ConfirmRemove
      title={`${t("cfg.remove")} ${a.name}`}
      body={usedBy.length > 0 ? t("cfg.errInUse", { name: a.name, list: usedBy.join(", ") }) : a.id}
      blocked={usedBy.length > 0}
      onClose={onClose}
      onConfirm={() => {
        s.setAgentConfigs((list) => list.filter((x) => x.id !== id));
        notify(t("cfg.removed", { name: a.name }));
        onRemoved();
        onClose();
      }}
    />
  );
}
