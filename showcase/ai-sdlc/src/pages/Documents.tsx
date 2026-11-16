import { useState, type JSX } from "react";
import { Badge, Button, Card, DescriptionList, EmptyState, Field, FieldMessage, List, ListRow, PageHeader, RadioGroup, SearchInput, Segmented, Stack, Tag, Textarea } from "@xdev-asia/ui";
import { useI18n, type MessageKey } from "../i18n";
import { useNotify } from "../notify";
import { DiffView } from "../parts/DiffView";
import { MdView } from "../parts/MdView";
import { href, navigate } from "../router";
import { logEvent, useStore } from "../store";
import { PIPELINES, lineDiff, nextStage, type Doc, type DocStatus, type DocVersion } from "../workspace";

const STATUS_KEY: Record<DocStatus, MessageKey> = { writing: "docs.statusWriting", waiting: "docs.statusWaiting", approved: "docs.statusApproved", changes: "docs.statusChanges" };
const last = (d: Doc): DocVersion => d.versions[d.versions.length - 1];

export function DocumentsPage(): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ doc: string; from: DocVersion } | null>(null);
  const [viewing, setViewing] = useState<number | null>(null);

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

  const q = query.trim().toLowerCase();
  const mine = s.docs.filter((d) => d.project === s.project && (!q || d.file.toLowerCase().includes(q)));
  const doc = mine.find((d) => d.id === s.docId) ?? mine[0];
  const runs = s.runs.filter((r) => r.project === s.project && mine.some((d) => d.runId === r.id));
  const shown = doc ? (doc.versions.find((v) => v.n === viewing) ?? last(doc)) : undefined;
  const run = doc?.runId ? s.runs.find((r) => r.id === doc.runId) : undefined;
  const canEdit = s.role === "admin" || s.role === "approver" || s.role === "operator";

  const pick = (d: Doc): void => {
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
              meta={d.status ? t(STATUS_KEY[d.status]) : d.folder || undefined}
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
            {mine.length === 0 ? <EmptyState size="inline" title={t(q ? "docs.noMatch" : "docs.none")} hint={q ? undefined : t("docs.noneHint")} /> : null}
            {group(t("docs.steering"), t("docs.steeringHint"), mine.filter((d) => d.group === "steering"))}
            {runs.map((r) => group(r.title, undefined, mine.filter((d) => d.runId === r.id)))}
            {group(t("docs.repo"), undefined, mine.filter((d) => d.group === "repo"))}
          </Stack>
        </div>
        <div className="app-col-wide">
          {!doc || !shown ? (
            <EmptyState size="inline" title={t("docs.pick")} />
          ) : editing?.doc === doc.id ? (
            <Editor doc={doc} from={editing.from} onClose={() => setEditing(null)} />
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
                  {!canEdit ? <FieldMessage tone="info">{t("docs.roleNeeded")}</FieldMessage> : null}
                  <MdView text={shown.text} />
                </Stack>
              </Card>
              <div className="app-split">
                <div className="app-col-narrow">
                  <Card title={t("docs.info")} headingLevel={2}>
                    <Stack gap={3}>
                      <DescriptionList
                        items={[
                          ...(run ? [{ term: t("docs.run"), value: run.title }] : []),
                          ...(doc.status ? [{ term: t("docs.state"), value: t(STATUS_KEY[doc.status]) }] : []),
                          ...(shown.approvedBy ? [{ term: t("docs.approvedBy"), value: shown.approvedBy }] : []),
                          { term: t("docs.location"), value: `${doc.folder}${doc.file}`, mono: true },
                          { term: t("docs.inGit"), value: t(doc.inGit ? "docs.yes" : "docs.no") },
                        ]}
                      />
                      {run ? (
                        <Stack direction="row">
                          <Button
                            variant="secondary"
                            onClick={() => {
                              s.setRunId(run.id);
                              navigate(href.runs);
                            }}
                          >
                            {t("docs.openRun")}
                          </Button>
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
                          meta={[v.who, v.at, v.note].filter(Boolean).join(" · ")}
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
    </Stack>
  );
}

/** Edits a document, or restores an older version: both end in a new version. A stage's document needs a note, and
 *  the person must say what happens to the stages that already ran with the version before. */
function Editor({ doc, from, onClose }: { doc: Doc; from: DocVersion; onClose: () => void }): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  const notify = useNotify();
  const current = last(doc);
  const [text, setText] = useState(from.text);
  const [mode, setMode] = useState("write");
  const [note, setNote] = useState("");
  const [after, setAfter] = useState("");
  const [tried, setTried] = useState(false);

  const run = doc.runId ? s.runs.find((r) => r.id === doc.runId) : undefined;
  const stages = run ? PIPELINES[run.pipeline].stages : [];
  const later = run && doc.stage ? run.attempts.filter((a) => stages.indexOf(a.stage) > stages.indexOf(doc.stage as (typeof stages)[number])) : [];
  const stale = doc.status === "approved" && later.length > 0;
  const changed = text !== current.text;
  const needNote = doc.group === "run";
  const noteError = tried && needNote && !note.trim() ? t("docs.noteRequired") : undefined;
  const choiceError = tried && stale && !after ? t("docs.choose") : undefined;

  const save = (): void => {
    if ((needNote && !note.trim()) || (stale && !after)) return setTried(true);
    const n = current.n + 1;
    const version: DocVersion = { n, by: "person", who: s.device, at: "now", text, note: note.trim() || undefined, approvedBy: needNote ? s.device : undefined };
    s.setDocs((list) => list.map((d) => (d.id === doc.id ? { ...d, status: d.status === "waiting" ? "waiting" : d.status, versions: [...d.versions, version] } : d)));
    if (run && doc.stage) {
      logEvent(s, run.id, "doc_edited", s.device, `${doc.file} v${n}: ${note.trim()}`);
      const next = nextStage(run.pipeline, doc.stage);
      if (stale && after === "rerun" && next) {
        s.setRuns((list) =>
          list.map((r) => (r.id === run.id ? { ...r, state: "running", stage: next, attempts: [...r.attempts, { id: `${r.id}-${r.attempts.length + 1}`, stage: next, n: r.attempts.filter((a) => a.stage === next).length + 1, status: "running", at: "now", reason: note.trim() }] } : r)),
        );
        logEvent(s, run.id, "stage_retried", s.device, next);
      } else if (stale) {
        s.setRuns((list) => list.map((r) => (r.id === run.id ? { ...r, attempts: r.attempts.map((a) => (later.some((x) => x.id === a.id) ? { ...a, stale: true } : a)) } : r)));
      }
    }
    notify(from.n === current.n ? t("docs.saved", { n, file: doc.file }) : t("docs.restored", { n: from.n, m: n }));
    onClose();
  };

  return (
    <Card title={doc.file} titleAside={<Tag tone="warn">{t("docs.editing")}</Tag>} subtitle={run?.title} headingLevel={2}>
      <Stack gap={3} className="app-editor">
        <Segmented
          label={t("docs.modes")}
          value={mode}
          onChange={setMode}
          options={[
            { value: "write", label: t("docs.write") },
            { value: "preview", label: t("docs.preview") },
            { value: "diff", label: t("docs.diff") },
          ]}
        />
        {mode === "write" ? <Textarea label={t("docs.content")} mono resize="vertical" value={text} spellCheck={false} onChange={(e) => setText(e.target.value)} /> : null}
        {mode === "preview" ? <MdView text={text} /> : null}
        {mode === "diff" ? changed ? <DiffView lines={lineDiff(current.text, text)} label={t("docs.diff")} /> : <p className="app-muted">{t("docs.noChange")}</p> : null}
        {needNote ? <Field label={t("docs.note")} hint={t("docs.noteHint")} error={noteError} value={note} autoComplete="off" onChange={(e) => setNote(e.target.value)} /> : null}
        {stale ? (
          <Stack gap={1}>
            <FieldMessage tone="warn">{t("docs.staleTitle", { n: current.n })}</FieldMessage>
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
          <Button variant="secondary" onClick={onClose}>
            {t("docs.discard")}
          </Button>
          <Button variant="primary" disabled={!changed} onClick={save}>
            {t("docs.save")}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
