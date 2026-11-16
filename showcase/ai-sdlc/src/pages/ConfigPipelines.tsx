import { useState, type JSX } from "react";
import { Button, Card, Checkbox, Drawer, Field, FieldMessage, IconButton, List, ListRow, PageHeader, SaveBar, Select, Stack, Switch, Tag } from "@xdev-asia/ui";
import { pipelineProblems, type GateBy, type PipelineConfig, type StageConfig } from "../config";
import { GateTag } from "../parts/GateTag";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { ConfigNote, move } from "../parts/ConfigNote";
import { can, useStore } from "../store";

/** Pipelines: the stages a run goes through, the agent of each, and where it stops for a person (pipelines/*.toml). */
export function ConfigPipelinesPage(): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [pickedId, setPickedId] = useState(s.pipelines[0]?.id ?? "");
  const saved = s.pipelines.find((p) => p.id === pickedId) ?? s.pipelines[0];
  const [draft, setDraft] = useState<PipelineConfig | undefined>(saved && structuredClone(saved));
  const [stageAt, setStageAt] = useState<number | null>(null);
  const admin = can(s.role, "admin");
  if (!draft || !saved) return <PageHeader title={t("cfg.pipelinesTitle")} />;

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const problems = pipelineProblems(draft, s.agentConfigs);
  const edit = (change: Partial<PipelineConfig>): void => setDraft((d) => (d ? { ...d, ...change } : d));
  const editStage = (i: number, change: Partial<StageConfig>): void => edit({ stages: draft.stages.map((st, j) => (j === i ? { ...st, ...change } : st)) });
  const pick = (id: string): void => {
    const p = s.pipelines.find((x) => x.id === id);
    setPickedId(id);
    setDraft(p && structuredClone(p));
    setStageAt(null);
  };
  const agentName = (id: string): string => s.agentConfigs.find((a) => a.id === id)?.name ?? id;
  const stage = stageAt !== null ? draft.stages[stageAt] : undefined;

  return (
    <Stack gap={4}>
      <PageHeader title={t("cfg.pipelinesTitle")} description={t("cfg.pipelinesDescription")} />
      <ConfigNote source="pipelines/*.toml" />
      <div className="app-split">
        <div className="app-col-narrow">
          <Card flush>
            <List>
              {s.pipelines.map((p) => (
                <ListRow key={p.id} as="li" selected={p.id === draft.id} onClick={() => pick(p.id)} title={p.name} meta={t("cfg.stageCount", { n: p.stages.length, g: p.stages.filter((x) => x.gate.by !== "none").length })} trailing={<Tag>{p.id}</Tag>} />
              ))}
            </List>
          </Card>
        </div>
        <div className="app-col-wide">
          <Card title={draft.name} subtitle={`pipelines/${draft.id}.toml`} monoSubtitle headingLevel={2}>
            <Stack gap={4}>
              <FieldMessage tone="info">{t("cfg.newRunsOnly")}</FieldMessage>
              <div className="app-cfg-flow" role="list" aria-label={t("cfg.stages")}>
                {draft.stages.map((st) => (
                  <span key={st.id} className="app-row" role="listitem">
                    <Tag>{st.name}</Tag>
                    <GateTag by={st.gate.by} />
                  </span>
                ))}
              </div>
              <Field label={t("cfg.name")} value={draft.name} disabled={!admin} onChange={(e) => edit({ name: e.target.value })} />
              <div className="app-cfg-pair">
                <Field label={t("cfg.maxAttempts")} inputMode="numeric" value={String(draft.maxAttempts)} disabled={!admin} onChange={(e) => edit({ maxAttempts: Number(e.target.value) || 0 })} />
                <Field label={t("cfg.exportDir")} hint={t("cfg.exportHint")} value={draft.exportDir} disabled={!admin} spellCheck={false} autoComplete="off" onChange={(e) => edit({ exportDir: e.target.value })} />
              </div>
              <Switch label={`${t("cfg.commitArtifacts")}. ${t("cfg.commitHint")}`} checked={draft.commitArtifacts} disabled={!admin} onChange={(e) => edit({ commitArtifacts: e.target.checked })} />
              <Stack gap={2}>
                <span className="app-label">{t("cfg.stages")}</span>
                <List>
                  {draft.stages.map((st, i) => (
                    <ListRow
                      key={`${st.id}-${i}`}
                      as="li"
                      onClick={() => setStageAt(i)}
                      title={`${i + 1}. ${st.name}`}
                      meta={[agentName(st.agent), st.output, st.verdict && st.onFail ? `${t("cfg.stageOnFail")} ${st.onFail}` : ""].filter(Boolean).join(" · ")}
                      trailing={
                        <span className="app-row">
                          <GateTag by={st.gate.by} />
                          <IconButton icon="arrow-up" size="sm" label={t("cfg.moveUp")} disabled={!admin || i === 0} onClick={(e) => {
                              e.stopPropagation();
                              edit({ stages: move(draft.stages, i, -1) });
                            }} />
                          <IconButton icon="arrow-down" size="sm" label={t("cfg.moveDown")} disabled={!admin || i === draft.stages.length - 1} onClick={(e) => {
                              e.stopPropagation();
                              edit({ stages: move(draft.stages, i, 1) });
                            }} />
                        </span>
                      }
                    />
                  ))}
                </List>
                <Stack direction="row">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="plus"
                    disabled={!admin}
                    onClick={() => {
                      const n = draft.stages.length + 1;
                      edit({ stages: [...draft.stages, { id: `stage-${n}`, name: `Stage ${n}`, agent: "claude-code", skill: `skills/stages/stage-${n}.md`, reads: ["request"], output: `0${n}-stage.md`, gate: { by: "human" } }] });
                      setStageAt(draft.stages.length);
                    }}
                  >
                    {t("cfg.addStage")}
                  </Button>
                </Stack>
              </Stack>
              {problems.map((p, i) => (
                <FieldMessage key={i} tone="error">
                  {t(p.key, p.vars)}
                </FieldMessage>
              ))}
              <SaveBar
                dirty={dirty}
                labels={ui.saveBar}
                saveDisabled={problems.length > 0 || !admin}
                onDiscard={() => setDraft(structuredClone(saved))}
                onSave={() => {
                  s.setPipelines((list) => list.map((p) => (p.id === draft.id ? draft : p)));
                  notify(t("cfg.saved", { name: draft.name }));
                }}
              />
            </Stack>
          </Card>
        </div>
      </div>
      {stage && stageAt !== null ? (
        <Drawer
          modal
          title={t("cfg.editStage", { name: stage.name })}
          description={stage.id}
          labels={ui.drawer}
          onClose={() => setStageAt(null)}
          footer={
            <Button
              variant="danger"
              disabled={!admin}
              onClick={() => {
                edit({ stages: draft.stages.filter((_, j) => j !== stageAt) });
                setStageAt(null);
              }}
            >
              {t("cfg.removeStage")}
            </Button>
          }
        >
          <StageForm stage={stage} earlier={draft.stages.slice(0, stageAt)} disabled={!admin} onChange={(change) => editStage(stageAt, change)} />
        </Drawer>
      ) : null}
    </Stack>
  );
}

function StageForm({ stage, earlier, disabled, onChange }: { stage: StageConfig; earlier: StageConfig[]; disabled: boolean; onChange: (change: Partial<StageConfig>) => void }): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  const back = [{ value: "", label: t("cfg.same") }, ...earlier.map((x) => ({ value: x.id, label: x.name }))];
  const reads = [{ id: "request", name: t("cfg.stageRequest") }, ...earlier.map((x) => ({ id: x.id, name: x.name }))];
  return (
    <Stack gap={3}>
      <div className="app-cfg-pair">
        <Field label={t("cfg.id")} value={stage.id} disabled={disabled} spellCheck={false} autoComplete="off" onChange={(e) => onChange({ id: e.target.value.trim() })} />
        <Field label={t("cfg.name")} value={stage.name} disabled={disabled} onChange={(e) => onChange({ name: e.target.value })} />
      </div>
      <div className="app-field">
        <label className="app-label" htmlFor="stage-agent">
          {t("cfg.stageAgent")}
        </label>
        <Select id="stage-agent" value={stage.agent} disabled={disabled} onChange={(e) => onChange({ agent: e.target.value })} options={s.agentConfigs.map((a) => ({ value: a.id, label: `${a.name} (${a.id})` }))} />
      </div>
      <Field label={t("cfg.stageSkill")} hint={t("cfg.skillHint")} value={stage.skill} disabled={disabled} spellCheck={false} autoComplete="off" onChange={(e) => onChange({ skill: e.target.value })} />
      <Field label={t("cfg.stageOutput")} value={stage.output} disabled={disabled} spellCheck={false} autoComplete="off" onChange={(e) => onChange({ output: e.target.value })} />
      <fieldset className="app-cfg-set">
        <legend className="app-label">{t("cfg.stageReads")}</legend>
        {reads.map((r) => (
          <Checkbox key={r.id} label={r.name} checked={stage.reads.includes(r.id)} disabled={disabled} onChange={(e) => onChange({ reads: e.target.checked ? [...stage.reads, r.id] : stage.reads.filter((x) => x !== r.id) })} />
        ))}
      </fieldset>
      <div className="app-field">
        <label className="app-label" htmlFor="stage-gate">
          {t("cfg.gateBy")}
        </label>
        <Select
          id="stage-gate"
          value={stage.gate.by}
          disabled={disabled}
          onChange={(e) => {
            const by = e.target.value as GateBy;
            const graded = by === "ai" || by === "ai+human";
            onChange({ gate: graded ? { by, agent: stage.gate.agent ?? s.agentConfigs.find((a) => a.id !== stage.agent)?.id, skill: stage.gate.skill ?? `skills/gates/${stage.id}.md` } : { by }, onChanges: by === "none" ? undefined : stage.onChanges });
          }}
          options={[
            { value: "none", label: t("cfg.gateNone") },
            { value: "human", label: t("cfg.gatePerson") },
            { value: "ai", label: t("cfg.gateAi") },
            { value: "ai+human", label: t("cfg.gateAiPerson") },
          ]}
        />
      </div>
      {stage.gate.by === "ai" || stage.gate.by === "ai+human" ? (
        <div className="app-cfg-pair">
          <div className="app-field">
            <label className="app-label" htmlFor="stage-gate-agent">
              {t("cfg.gateAgent")}
            </label>
            <Select id="stage-gate-agent" value={stage.gate.agent ?? ""} disabled={disabled} onChange={(e) => onChange({ gate: { ...stage.gate, agent: e.target.value } })} options={s.agentConfigs.map((a) => ({ value: a.id, label: `${a.name} (${a.id})` }))} />
          </div>
          <Field label={t("cfg.gateSkill")} hint={t("cfg.skillHint")} value={stage.gate.skill ?? ""} disabled={disabled} spellCheck={false} autoComplete="off" onChange={(e) => onChange({ gate: { ...stage.gate, skill: e.target.value } })} />
        </div>
      ) : null}
      <Switch label={t("cfg.stageWrites")} checked={Boolean(stage.writesCode)} disabled={disabled} onChange={(e) => onChange({ writesCode: e.target.checked || undefined })} />
      <Switch label={t("cfg.stageVerdict")} checked={Boolean(stage.verdict)} disabled={disabled} onChange={(e) => onChange({ verdict: e.target.checked || undefined, onFail: e.target.checked ? stage.onFail : undefined })} />
      {stage.verdict ? (
        <div className="app-field">
          <label className="app-label" htmlFor="stage-fail">
            {t("cfg.stageOnFail")}
          </label>
          <Select id="stage-fail" value={stage.onFail ?? ""} disabled={disabled} onChange={(e) => onChange({ onFail: e.target.value || undefined })} options={back} />
        </div>
      ) : null}
      {stage.gate.by !== "none" ? (
        <div className="app-field">
          <label className="app-label" htmlFor="stage-changes">
            {t("cfg.stageOnChanges")}
          </label>
          <Select id="stage-changes" value={stage.onChanges ?? ""} disabled={disabled} onChange={(e) => onChange({ onChanges: e.target.value || undefined })} options={back} />
        </div>
      ) : null}
    </Stack>
  );
}
