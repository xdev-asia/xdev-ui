import { useEffect, useState, type JSX } from "react";
import { Badge, Banner, Button, Card, DescriptionList, Dialog, Disclosure, EmptyState, Field, FieldMessage, FilterChip, List, ListRow, PageHeader, RadioGroup, SearchInput, Segmented, Select, Stack, Tag, Textarea } from "@xdev-asia/ui";
import { useI18n, type MessageKey } from "../i18n";
import { useNotify } from "../notify";
import { DiffView } from "../parts/DiffView";
import { MdView } from "../parts/MdView";
import { href, navigate } from "../router";
import { can, logEvent, showInWorkspace, useStore } from "../store";
import { PIPELINES, STAGES, sessionOfRun, fakeHash, lineDiff, nextStage, type Doc, type DocStatus, type DocVersion, type StageId } from "../workspace";
import { tabKey } from "../layout";
import { STAGE_KEY } from "./run-keys";

const STATUS_KEY: Record<DocStatus, MessageKey> = { writing: "docs.statusWriting", waiting: "docs.statusWaiting", approved: "docs.statusApproved", changes: "docs.statusChanges" };
const last = (d: Doc): DocVersion => d.versions[d.versions.length - 1];

export function DocumentsPage(): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<StageId | null>(null);
  // The open editor lives in the store: its text survives a change of page.
  const editing = s.draft;
  const setEditing = (e: { doc: string; from: DocVersion } | null): void => s.setDraft(e ? { ...e, text: e.from.text } : null);
  const [viewing, setViewing] = useState<number | null>(null);
  const [leavingTo, setLeavingTo] = useState<Doc | null>(null);
  const admin = can(s.role, "admin");

  if (s.project === "") {
    return (
      <Stack gap={4}>
        <PageHeader title={t("docs.title")} description={t("docs.description")} />
        <EmptyState
          size="center"
          icon="docs"
          title={t("docs.pickProject")}
          hint={t("docs.pickProjectHint")}
          actions={
            <>
              {s.projects.map((p) => (
                <Button key={p.id} variant="secondary" onClick={() => s.setProject(p.name)}>
                  {p.name}
                </Button>
              ))}
            </>
          }
        />
      </Stack>
    );
  }

  const project = s.projects.find((p) => p.name === s.project);
  const q = query.trim().toLowerCase();
  const all = s.docs.filter((d) => d.project === s.project);
  // The search reads names and the text of the current version.
  const mine = all.filter((d) => (!q || d.file.toLowerCase().includes(q) || last(d).text.toLowerCase().includes(q)) && (!stage || d.stage === stage));
  const doc = mine.find((d) => d.id === s.docId) ?? mine[0];
  const runs = s.runs.filter((r) => r.project === s.project && mine.some((d) => d.runId === r.id));
  const shown = doc ? (doc.versions.find((v) => v.n === viewing) ?? last(doc)) : undefined;
  const run = doc?.runId ? s.runs.find((r) => r.id === doc.runId) : undefined;
  // A stage's document is what gets approved, so editing it takes the role that approves. A repository file is a
  // write into a worktree, so it takes the role that writes.
  const need = doc?.group === "run" ? "approver" : "operator";
  const canEdit = can(s.role, need);
  const roleName = t(`roles.${s.role}`);

  const editingDoc = editing ? s.docs.find((d) => d.id === editing.doc) : undefined;
  const dirty = Boolean(editing && editingDoc && editing.text !== last(editingDoc).text);
  const agentOf = doc ? [...doc.versions].reverse().find((v) => v.by === "agent") : undefined;
  const attemptsOfDoc = (d: Doc): number => s.runs.find((r) => r.id === d.runId)?.attempts.filter((a) => a.stage === d.stage).length ?? 0;

  const pick = (d: Doc): void => {
    if (dirty && d.id !== editing?.doc) return setLeavingTo(d);
    open(d);
  };
  const open = (d: Doc): void => {
    s.setDocId(d.id);
    setViewing(null);
    setEditing(null);
  };

  const group = (title: string, hint: string | undefined, docs: Doc[]): JSX.Element | null =>
    docs.length === 0 ? null : (
      <Card key={title} flush title={title} subtitle={hint} headingLevel={2}>
        <List>
          {docs.map((d) => (
            <ListRow
              key={d.id}
              as="li"
              selected={d.id === doc?.id}
              onClick={() => pick(d)}
              title={d.file}
              meta={d.status ? [d.stage ? t(STAGE_KEY[d.stage]) : "", t(STATUS_KEY[d.status]), t("docs.attempts", { n: attemptsOfDoc(d) })].filter(Boolean).join(" · ") : d.folder || undefined}
              trailing={d.versions.length > 1 ? <Tag>{t("docs.version", { n: last(d).n })}</Tag> : undefined}
            />
          ))}
        </List>
      </Card>
    );

  return (
    <Stack gap={4}>
      <PageHeader title={t("docs.titleOf", { name: s.project })} description={t("docs.description")} />
      <div className="app-split">
        <div className="app-col-narrow">
          <Stack gap={3}>
            <SearchInput aria-label={t("docs.search")} placeholder={t("docs.search")} value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery("")} labels={ui.searchInput} />
            <div className="app-row" role="group" aria-label={t("docs.types")}>
              {STAGES.map((st) => (
                <FilterChip key={st} pressed={stage === st} count={all.filter((d) => d.stage === st).length} onClick={() => setStage((cur) => (cur === st ? null : st))}>
                  {t(STAGE_KEY[st])}
                </FilterChip>
              ))}
            </div>
            {mine.length === 0 ? <EmptyState size="inline" title={t(q || stage ? "docs.noMatch" : "docs.none")} hint={q || stage ? undefined : t("docs.noneHint")} /> : null}
            {group(t("docs.steering"), t("docs.steeringHint"), mine.filter((d) => d.group === "steering"))}
            {runs.map((r) => group(r.title, undefined, mine.filter((d) => d.runId === r.id)))}
            {group(t("docs.repo"), project?.docFolders.length ? t("docs.repoHint", { folders: project.docFolders.join(", ") }) : t("docs.repoNone"), mine.filter((d) => d.group === "repo"))}
          </Stack>
        </div>
        <div className="app-col-wide">
          {!doc || !shown ? (
            <EmptyState size="inline" title={t("docs.pick")} />
          ) : editing?.doc === doc.id ? (
            <Editor key={`${doc.id}:${editing.from.n}`} doc={doc} from={editing.from} onClose={() => setEditing(null)} />
          ) : (
            <Stack gap={4}>
              <Card
                title={doc.file}
                titleAside={<Tag>{t("docs.version", { n: shown.n })}</Tag>}
                subtitle={run?.title}
                headingLevel={2}
                actions={
                  <Button variant="secondary" icon="edit" disabled={!canEdit || doc.status === "writing"} onClick={() => setEditing({ doc: doc.id, from: last(doc) })}>
                    {t("docs.edit")}
                  </Button>
                }
              >
                <Stack gap={3}>
                  {doc.status === "writing" ? <FieldMessage tone="info">{t("docs.locked")}</FieldMessage> : null}
                  {!canEdit ? <FieldMessage tone="info">{t(doc.group === "run" ? "docs.roleRun" : "docs.roleRepo", { role: roleName })}</FieldMessage> : null}
                  {doc.group === "steering" ? <FieldMessage tone="info">{t("docs.steeringNote")}</FieldMessage> : null}
                  <MdView text={shown.text} />
                  {doc.truncated ? <FieldMessage tone="warn">{t("docs.truncated")}</FieldMessage> : null}
                  {agentOf && agentOf.n !== shown.n ? (
                    <Disclosure title={t("docs.compareAgent", { n: agentOf.n })}>
                      <DiffView lines={lineDiff(agentOf.text, shown.text)} label={t("docs.compareAgent", { n: agentOf.n })} />
                    </Disclosure>
                  ) : null}
                </Stack>
              </Card>
              <div className="app-split">
                <div className="app-col-narrow">
                  <Card title={t("docs.info")} headingLevel={2}>
                    <Stack gap={3}>
                      <DescriptionList
                        items={[
                          ...(run ? [{ term: t("docs.run"), value: run.title }] : []),
                          ...(doc.stage ? [{ term: t("docs.stage"), value: `${t(STAGE_KEY[doc.stage])} · ${t("docs.attempts", { n: attemptsOfDoc(doc) })}` }] : []),
                          { term: t("docs.writtenBy"), value: `${t(shown.by === "agent" ? "docs.byAgent" : "docs.byPerson")}: ${shown.who}, ${shown.at}` },
                          ...(doc.status ? [{ term: t("docs.state"), value: t(STATUS_KEY[doc.status]) }] : []),
                          ...(shown.approvedBy ? [{ term: t("docs.approvedBy"), value: shown.approvedBy }] : []),
                          ...(shown.approvedBy && shown.approvedAt ? [{ term: t("docs.approvedAt"), value: shown.approvedAt }] : []),
                          { term: t("docs.sha"), value: fakeHash(shown.text), mono: true },
                          { term: t("docs.location"), value: `${doc.folder}${doc.file}`, mono: true },
                          { term: t("docs.inGit"), value: t(doc.inGit ? "docs.yes" : "docs.no") },
                          ...(admin && doc.group === "run" && shown.approvedBy && project?.exportDir ? [{ term: t("docs.exportDir"), value: `${project.exportDir}/${doc.file}`, mono: true }] : []),
                        ]}
                      />
                      {run?.attempts.some((a) => a.stale) ? <Badge status="foreign">{t("docs.basedOnOld")}</Badge> : null}
                      {run ? (
                        <Stack direction="row" gap={2} wrap>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              s.setRunId(run.id);
                              navigate(href.runs);
                            }}
                          >
                            {t("docs.openRun")}
                          </Button>
                          {doc.status === "waiting" ? (
                            <Button
                              variant="secondary"
                              icon="inbox"
                              onClick={() => {
                                // The gate is answered in the worktree of the run, beside the document.
                                const at = sessionOfRun(run, s.sessions);
                                if (at) showInWorkspace(s, at.id, { tab: tabKey({ kind: "doc", id: doc.id }), dock: "run" });
                              }}
                            >
                              {t("docs.openGate")}
                            </Button>
                          ) : null}
                        </Stack>
                      ) : null}
                    </Stack>
                  </Card>
                </div>
                <div className="app-col-narrow">
                  <Card flush title={t("docs.versions")} headingLevel={2}>
                    <List>
                      {[...doc.versions].reverse().map((v) => (
                        <ListRow
                          key={v.n}
                          as="li"
                          selected={v.n === shown.n}
                          onClick={() => setViewing(v.n)}
                          title={
                            <span className="app-row">
                              {t("docs.version", { n: v.n })}
                              <Badge status={v.by === "agent" ? "neutral" : "changed"}>{t(v.by === "agent" ? "docs.byAgent" : "docs.byPerson")}</Badge>
                              {v.n === last(doc).n ? <Tag>{t("docs.current")}</Tag> : null}
                            </span>
                          }
                          meta={[v.who, v.at, v.note, fakeHash(v.text).slice(0, 12)].filter(Boolean).join(" · ")}
                          trailing={
                            v.n !== last(doc).n && canEdit && doc.status !== "writing" ? (
                              <Button variant="ghost" size="sm" icon="restore" onClick={() => setEditing({ doc: doc.id, from: v })}>
                                {t("docs.restore")}
                              </Button>
                            ) : undefined
                          }
                        />
                      ))}
                    </List>
                  </Card>
                </div>
              </div>
            </Stack>
          )}
        </div>
      </div>
      {leavingTo && editingDoc ? (
        <Dialog
          alert
          modal
          busy={false}
          tone="danger"
          title={t("docs.leaveTitle", { file: editingDoc.file })}
          confirmLabel={t("docs.discard")}
          cancelLabel={t("docs.leaveBack")}
          onCancel={() => setLeavingTo(null)}
          onConfirm={() => {
            open(leavingTo);
            setLeavingTo(null);
          }}
        >
          {t("docs.leaveBody")}
        </Dialog>
      ) : null}
    </Stack>
  );
}

/** Edits a document, or restores an older version: both end in a new version. A stage's document needs a note, and
 *  the person must say what happens to the stages that already ran with the version before. A file of the
 *  repository is written into a session's worktree and shows in that session's changes. */
function Editor({ doc, from, onClose }: { doc: Doc; from: DocVersion; onClose: () => void }): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  const notify = useNotify();
  // Read from the store, so a version someone else saved meanwhile is the one this save is checked against.
  const live = s.docs.find((d) => d.id === doc.id) ?? doc;
  const current = last(live);
  const text = s.draft?.doc === doc.id ? s.draft.text : from.text;
  const setText = (value: string): void => s.setDraft((d) => (d ? { ...d, text: value } : d));
  const [mode, setMode] = useState("write");
  const [note, setNote] = useState("");
  const [after, setAfter] = useState("");
  const [tried, setTried] = useState(false);
  const [conflict, setConflict] = useState<DocVersion | null>(null);
  const [leaving, setLeaving] = useState(false);
  const roots = s.sessions.filter((x) => x.project === doc.project);
  const [target, setTarget] = useState(roots.find((x) => x.root)?.id ?? roots[0]?.id ?? "");

  const run = doc.runId ? s.runs.find((r) => r.id === doc.runId) : undefined;
  const stages = run ? PIPELINES[run.pipeline].stages : [];
  const later = run && doc.stage ? run.attempts.filter((a) => stages.indexOf(a.stage) > stages.indexOf(doc.stage as StageId)) : [];
  const stale = doc.status === "approved" && later.length > 0;
  const changed = text !== current.text;
  const ofRun = doc.group === "run";
  const agentVersion = [...live.versions].reverse().find((v) => v.by === "agent");
  const noteError = tried && ofRun && !note.trim() ? t("docs.noteRequired") : undefined;
  const choiceError = tried && stale && !after ? t("docs.choose") : undefined;
  // Saving an approved document makes the new version the approved one. One that waits at its gate stays waiting.
  const approvedNow = ofRun && doc.status === "approved";
  const laterStages = Array.from(new Set(later.map((a) => a.stage)))
    .map((st) => `${t(STAGE_KEY[st])} (${later.filter((a) => a.stage === st).length})`)
    .join(", ");

  // Closing the tab with unsaved text asks first, like leaving the page does.
  useEffect(() => {
    if (!changed) return;
    const warn = (e: BeforeUnloadEvent): void => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changed]);

  const save = (): void => {
    if ((ofRun && !note.trim()) || (stale && !after)) return setTried(true);
    if (s.conflictNext) {
      // Someone else saved first: their version goes in, and nothing of this text is saved.
      const theirs: DocVersion = { n: current.n + 1, by: "person", who: "Pixel", at: "now", text: `${current.text}\n- Checked by Pixel.`, approvedBy: ofRun ? "Pixel" : undefined };
      s.setDocs((list) => list.map((d) => (d.id === doc.id ? { ...d, versions: [...d.versions, theirs] } : d)));
      s.setConflictNext(false);
      setMode("write");
      return setConflict(theirs);
    }
    const n = current.n + 1;
    const version: DocVersion = { n, by: "person", who: s.device, at: "now", text, note: note.trim() || undefined, approvedBy: approvedNow ? s.device : undefined, approvedAt: approvedNow ? "now" : undefined };
    s.setDocs((list) => list.map((d) => (d.id === doc.id ? { ...d, versions: [...d.versions, version] } : d)));
    if (!ofRun) {
      const path = `${doc.folder}${doc.file}`;
      const rows = lineDiff(current.text, text);
      const file = { path, status: "changed" as const, add: rows.filter((r) => r.startsWith("+")).length, del: rows.filter((r) => r.startsWith("-")).length, lines: rows };
      s.setChanges((all) => ({ ...all, [target]: [...(all[target] ?? []).filter((f) => f.path !== path), file] }));
      const session = s.sessions.find((x) => x.id === target);
      notify(t("docs.savedInto", { file: doc.file, session: session ? `${session.project} / ${session.branch}` : "" }));
      return onClose();
    }
    if (run && doc.stage) {
      const next = nextStage(run.pipeline, doc.stage);
      const choice = !stale ? "" : after === "rerun" && next ? `, rerun from ${next}` : ", later stages kept";
      logEvent(s, run.id, "doc_edited", s.device, `${doc.file} v${n}: ${note.trim()}${choice}`);
      if (approvedNow) logEvent(s, run.id, "approved_overwritten", s.device, `${doc.file} v${current.n} -> v${n}`);
      if (stale && after === "rerun" && next) {
        s.setRuns((list) =>
          list.map((r) => (r.id === run.id ? { ...r, state: "running", stage: next, attempts: [...r.attempts, { id: `${r.id}-${r.attempts.length + 1}`, stage: next, n: r.attempts.filter((a) => a.stage === next).length + 1, status: "running", at: "now", reason: note.trim() }] } : r)),
        );
        logEvent(s, run.id, "stage_retried", s.device, next);
      } else if (stale) {
        s.setRuns((list) => list.map((r) => (r.id === run.id ? { ...r, attempts: r.attempts.map((a) => (later.some((x) => x.id === a.id) ? { ...a, stale: true } : a)) } : r)));
      }
    }
    notify(from.n !== current.n && !conflict ? t("docs.restored", { n: from.n, m: n }) : t(approvedNow ? "docs.savedApproved" : doc.status === "waiting" ? "docs.savedWaiting" : "docs.saved", { n, file: doc.file }));
    onClose();
  };

  return (
    <Card title={doc.file} titleAside={<Tag tone="warn">{t("docs.editing")}</Tag>} subtitle={run?.title} headingLevel={2}>
      <Stack gap={3} className="app-editor">
        {conflict ? (
          <Banner tone="danger" title={t("docs.conflictTitle")}>
            <Stack gap={2}>
              <span>{t("docs.conflictHint", { who: conflict.who, n: conflict.n })}</span>
              <DiffView lines={lineDiff(conflict.text, text)} label={t("docs.diff")} />
            </Stack>
          </Banner>
        ) : null}
        <Segmented
          label={t("docs.modes")}
          value={mode}
          onChange={setMode}
          options={[
            { value: "write", label: t("docs.write") },
            { value: "preview", label: t("docs.preview") },
            { value: "diff", label: t("docs.diff") },
            ...(agentVersion && agentVersion.n !== current.n ? [{ value: "agent", label: t("docs.diffAgent") }] : []),
          ]}
        />
        {mode === "write" ? <Textarea label={t("docs.content")} mono resize="vertical" value={text} spellCheck={false} onChange={(e) => setText(e.target.value)} /> : null}
        {mode === "preview" ? <MdView text={text} /> : null}
        {mode === "diff" ? changed ? <DiffView lines={lineDiff(current.text, text)} label={t("docs.diff")} /> : <p className="app-muted">{t("docs.noChange")}</p> : null}
        {mode === "agent" && agentVersion ? <DiffView lines={lineDiff(agentVersion.text, text)} label={t("docs.diffAgent")} /> : null}
        {doc.group === "steering" ? <FieldMessage tone="info">{t("docs.steeringNote")}</FieldMessage> : null}
        {ofRun ? (
          <Field label={t("docs.note")} hint={t("docs.noteHint")} error={noteError} value={note} autoComplete="off" onChange={(e) => setNote(e.target.value)} />
        ) : (
          <div className="app-field">
            <label className="app-label" htmlFor="doc-target">
              {t("docs.target")}
            </label>
            <Select id="doc-target" value={target} onChange={(e) => setTarget(e.target.value)} options={roots.map((x) => ({ value: x.id, label: `${x.project} / ${x.branch}` }))} />
            <span className="app-muted">{t("docs.targetHint")}</span>
          </div>
        )}
        {stale ? (
          <Stack gap={1}>
            <FieldMessage tone="warn">{t("docs.staleTitle", { n: current.n })}</FieldMessage>
            <span className="app-muted">{t("docs.staleStages", { list: laterStages })}</span>
            <RadioGroup
              name="doc-after"
              orientation="vertical"
              label={t("docs.staleChoice")}
              value={after}
              onChange={setAfter}
              options={[
                { value: "rerun", label: t("docs.rerun"), hint: t("docs.rerunHint") },
                { value: "keep", label: t("docs.keep"), hint: t("docs.keepHint") },
              ]}
            />
            {choiceError ? <FieldMessage tone="error">{choiceError}</FieldMessage> : null}
          </Stack>
        ) : null}
        <Stack direction="row" gap={2} justify="end" wrap>
          <Button variant="secondary" onClick={() => (changed ? setLeaving(true) : onClose())}>
            {t("docs.discard")}
          </Button>
          <Button variant="primary" disabled={!changed} onClick={save}>
            {t("docs.save")}
          </Button>
        </Stack>
      </Stack>
      {leaving ? (
        <Dialog alert modal busy={false} tone="danger" title={t("docs.discardTitle", { file: doc.file })} confirmLabel={t("docs.discard")} cancelLabel={t("docs.keepEditing")} onCancel={() => setLeaving(false)} onConfirm={onClose}>
          {t("docs.discardBody", { n: current.n })}
        </Dialog>
      ) : null}
    </Card>
  );
}
