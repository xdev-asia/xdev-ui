import { useState, type JSX } from "react";
import { Badge, Button, Card, DescriptionList, EmptyState, Field, FieldMessage, FormDialog, List, ListRow, PageHeader, Select, Stack, Tabs, Tag, TreeView, type TreeRow } from "@xdev-asia/ui";
import { skillUsers, type KnowledgeFile, type KnowledgeRepo } from "../config";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { KnowledgeEditor } from "../parts/KnowledgeEditor";
import { MdView } from "../parts/MdView";
import { can, useStore } from "../store";

/** Pure: the rows of a file tree for `paths`, with the folders in `open` expanded. Folders come before files. */
export function treeRows(paths: string[], open: ReadonlySet<string>): TreeRow[] {
  const rows: TreeRow[] = [];
  const walk = (prefix: string, depth: number): void => {
    const here = paths.filter((p) => p.startsWith(prefix)).map((p) => p.slice(prefix.length));
    const dirs = [...new Set(here.filter((p) => p.includes("/")).map((p) => p.split("/")[0]))].sort();
    const files = here.filter((p) => !p.includes("/")).sort();
    for (const d of dirs) {
      const id = `${prefix}${d}/`;
      rows.push({ id, depth, name: d, kind: "dir", open: open.has(id), count: paths.filter((p) => p.startsWith(id)).length });
      if (open.has(id)) walk(id, depth + 1);
    }
    for (const f of files) rows.push({ id: `${prefix}${f}`, depth, name: f, kind: "file" });
  };
  walk("", 0);
  return rows;
}

/** Pure: a made-up grade of a document against a skill's criteria, for the showcase's "try it". */
function sampleGrade(skill: string): { pass: boolean; notes: string[] } {
  const pass = skill
    .split("\n")
    .filter((l) => /pass when/i.test(l))
    .flatMap((l) => l.replace(/^.*pass when:\s*/i, "").split(";"))
    .map((c) => c.trim().replace(/\.$/, ""))
    .filter(Boolean);
  return { pass: true, notes: pass.length > 0 ? pass.map((c) => `Met: ${c}.`) : ["The skill has no criteria to grade against."] };
}

/** The project's knowledge repo: documents and skills the agents read, written by people. */
export function KnowledgePage(): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  const repo = s.knowledge.find((r) => r.project === s.project);
  if (s.project === "") {
    return (
      <Stack gap={4}>
        <PageHeader title={t("kb.title")} description={t("kb.description")} />
        <EmptyState
          size="center"
          icon="docs"
          title={t("kb.pick")}
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
  if (!repo) {
    return (
      <Stack gap={4}>
        <PageHeader title={`${t("kb.title")}: ${s.project}`} description={t("kb.description")} />
        <EmptyState size="center" icon="docs" title={t("kb.none")} />
      </Stack>
    );
  }
  return <RepoView key={repo.project} repo={repo} />;
}

function RepoView({ repo }: { repo: KnowledgeRepo }): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  const [tab, setTab] = useState("files");
  const [open, setOpen] = useState<Set<string>>(new Set(["skills/", "skills/gates/", "skills/stages/"]));
  const [path, setPath] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const writer = can(s.role, "operator");
  const skills = repo.files.filter((f) => f.path.startsWith("skills/"));
  const shown = tab === "files" ? repo.files : skills;
  const file = shown.find((f) => f.path === path) ?? shown[0];

  const pick = (p: string): void => {
    setPath(p);
    setEditing(false);
  };

  return (
    <Stack gap={4}>
      <PageHeader
        title={`${t("kb.title")}: ${repo.project}`}
        description={t("kb.description")}
        actions={
          writer ? (
            <Button variant="secondary" icon="file-plus" onClick={() => setAdding(true)}>
              {t("kb.newFile")}
            </Button>
          ) : undefined
        }
      />
      <DescriptionList
        layout="columns"
        items={[
          { term: t("kb.remote"), value: repo.remote, mono: true },
          { term: t("kb.path"), value: repo.path, mono: true },
        ]}
      />
      <FieldMessage tone="info">{t("kb.mounted", { project: repo.project })}</FieldMessage>
      <Tabs
        label={t("kb.title")}
        value={tab}
        onChange={(id) => {
          setTab(id);
          setPath(null);
          setEditing(false);
        }}
        items={[
          { id: "files", label: t("kb.files"), badge: repo.files.length },
          { id: "skills", label: t("kb.skills"), badge: skills.length },
        ]}
      />
      <div className="app-split">
        <div className="app-col-narrow">
          <Card flush>
            {tab === "files" ? (
              <TreeView
                rows={treeRows(
                  repo.files.map((f) => f.path),
                  open,
                )}
                selected={file?.path}
                labels={{ tree: t("kb.tree") }}
                onToggle={(id) =>
                  setOpen((cur) => {
                    const next = new Set(cur);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  })
                }
                onOpen={pick}
              />
            ) : (
              <List>
                {skills.map((f) => (
                  <ListRow key={f.path} as="li" selected={f.path === file?.path} onClick={() => pick(f.path)} title={f.path.replace(/^skills\//, "")} meta={t(f.path.startsWith("skills/gates/") ? "kb.kindGate" : "kb.kindStage")} />
                ))}
              </List>
            )}
          </Card>
        </div>
        <div className="app-col-wide">
          {file ? (
            <Stack gap={4}>
              <Card
                title={file.path}
                titleAside={<Tag>{t("kb.commit", { n: file.versions[file.versions.length - 1].n })}</Tag>}
                headingLevel={2}
                actions={
                  !editing && writer ? (
                    <Button variant="secondary" icon="edit" onClick={() => setEditing(true)}>
                      {t("kb.edit")}
                    </Button>
                  ) : undefined
                }
              >
                {editing ? <KnowledgeEditor key={file.path} project={repo.project} file={file} onClose={() => setEditing(false)} /> : <MdView text={file.versions[file.versions.length - 1].text} />}
              </Card>
              {file.path.startsWith("skills/") ? <SkillUse file={file} /> : null}
              <Card flush title={t("kb.commits")} headingLevel={2}>
                <List>
                  {[...file.versions].reverse().map((v) => (
                    <ListRow key={v.n} as="li" title={`${t("kb.commit", { n: v.n })} · ${v.note}`} meta={`${v.by} · ${v.at}`} />
                  ))}
                </List>
              </Card>
            </Stack>
          ) : (
            <EmptyState size="inline" title={t("docs.pick")} />
          )}
        </div>
      </div>
      {adding ? <NewFile repo={repo} onClose={() => setAdding(false)} onAdded={(p) => {
            setTab(p.startsWith("skills/") && tab === "skills" ? "skills" : "files");
            pick(p);
          }} /> : null}
    </Stack>
  );
}

/** Where a skill is used, and a dry run of it on the document of a past run. */
function SkillUse({ file }: { file: KnowledgeFile }): JSX.Element {
  const s = useStore();
  const { t } = useI18n();
  const users = skillUsers(file.path, s.pipelines);
  const docs = s.docs.filter((d) => d.group === "run" && d.versions.length > 0);
  const [docId, setDocId] = useState(docs[0]?.id ?? "");
  const [result, setResult] = useState<{ pass: boolean; notes: string[]; doc: string; run: string } | null>(null);
  const gate = file.path.startsWith("skills/gates/");
  const grader = s.agentConfigs.find((a) => a.id === "codex")?.name ?? "Codex";
  return (
    <Card title={t("kb.usedBy")} headingLevel={2}>
      <Stack gap={3}>
        {users.length > 0 ? (
          <span className="app-row">
            {users.map((u) => (
              <Tag key={u}>{u}</Tag>
            ))}
          </span>
        ) : (
          <p className="app-muted">{t("kb.unused")}</p>
        )}
        {gate && docs.length > 0 ? (
          <Stack gap={2}>
            <span className="app-label">{t("kb.try")}</span>
            <Stack direction="row" gap={2} align="end" wrap>
              <div className="app-field">
                <label className="app-label" htmlFor="try-doc">
                  {t("kb.tryRun")}
                </label>
                <Select id="try-doc" value={docId} onChange={(e) => setDocId(e.target.value)} options={docs.map((d) => ({ value: d.id, label: `${s.runs.find((r) => r.id === d.runId)?.title ?? ""} · ${d.file}` }))} />
              </div>
              <Button
                variant="secondary"
                icon="play"
                onClick={() => {
                  const d = docs.find((x) => x.id === docId);
                  if (!d) return;
                  const g = sampleGrade(file.versions[file.versions.length - 1].text);
                  setResult({ ...g, doc: d.file, run: s.runs.find((r) => r.id === d.runId)?.title ?? "" });
                }}
              >
                {t("kb.tryDo")}
              </Button>
            </Stack>
            {result ? (
              <Card title={t("kb.tryResult", { agent: grader, file: result.doc, run: result.run })} titleAside={<Badge status={result.pass ? "new" : "changed"}>{t(result.pass ? "aigate.pass" : "aigate.changes")}</Badge>}>
                <Stack gap={2}>
                  <ul className="app-notes">
                    {result.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                  <FieldMessage tone="info">{t("kb.trySample")}</FieldMessage>
                </Stack>
              </Card>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Card>
  );
}

function NewFile({ repo, onClose, onAdded }: { repo: KnowledgeRepo; onClose: () => void; onAdded: (path: string) => void }): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [path, setPath] = useState("skills/gates/");
  const [tried, setTried] = useState(false);
  const clean = path.trim().replace(/^\/+/, "");
  const error = !clean.endsWith(".md") || repo.files.some((f) => f.path === clean) ? t("kb.errPath") : undefined;
  return (
    <FormDialog
      modal
      busy={false}
      title={t("kb.newFile")}
      labels={ui.formDialogCreate}
      submitLabel={t("kb.newFile")}
      onCancel={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        if (error) return setTried(true);
        s.setKnowledge((repos) => repos.map((r) => (r.project === repo.project ? { ...r, files: [...r.files, { path: clean, versions: [{ n: 1, by: s.device, at: "now", note: "New file", text: `## ${clean.split("/").pop()?.replace(/\.md$/, "")}\n` }] }] } : r)));
        notify(t("kb.committed", { n: 1, file: clean }));
        onAdded(clean);
        onClose();
      }}
    >
      <Field label={t("kb.newFilePath")} hint={t("kb.newFileHint")} error={tried ? error : undefined} value={path} spellCheck={false} autoComplete="off" onChange={(e) => setPath(e.target.value)} />
    </FormDialog>
  );
}
