import { useState, type JSX } from "react";
import { Button, Card, DescriptionList, Dialog, Field, FormDialog, Grid, MenuButton, PageHeader, Stack, Tag, Textarea } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { useNotify } from "../notify";
import { href, navigate } from "../router";
import { can, pending, projectOfLabel, useStore } from "../store";
import type { Project } from "../workspace";

export function ProjectsPage(): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const notify = useNotify();
  const [adding, setAdding] = useState(false);
  const [path, setPath] = useState("");
  const [tried, setTried] = useState(false);
  const [setup, setSetup] = useState<Project | null>(null);
  const [script, setScript] = useState("");
  const [copy, setCopy] = useState("");
  const [folders, setFolders] = useState("");
  const [steer, setSteer] = useState("");
  const [removing, setRemoving] = useState<Project | null>(null);
  const admin = can(s.role, "admin");

  const clean = path.trim().replace(/\/+$/, "");
  // The showcase knows one folder of repositories; the daemon asks git.
  const pathError = !clean.startsWith("/") ? t("projects.pathRequired") : s.projects.some((p) => p.path === clean) ? t("projects.exists") : !clean.startsWith("/srv/repos/") || clean.split("/").length !== 4 ? t("projects.notRepo") : undefined;

  const waiting = (p: Project): number => pending(s.approvals).filter((a) => projectOfLabel(a.session) === p.name).length + s.runs.filter((r) => r.project === p.name && r.state === "blocked").length;
  const busy = (p: Project): boolean =>
    s.terminals.some((term) => s.sessions.some((x) => x.id === term.sessionId && x.project === p.name) && term.state === "working") || s.runs.some((r) => r.project === p.name && (r.state === "running" || r.state === "waiting_gate" || r.state === "blocked"));
  const open = (p: Project, to: string): void => {
    s.setProject(p.name);
    const first = s.sessions.find((x) => x.project === p.name);
    if (first && to === href.workspace) s.setSessionId(first.id);
    navigate(to);
  };

  return (
    <Stack gap={4}>
      <PageHeader
        title={t("projects.title")}
        description={t("projects.description")}
        actions={
          admin ? (
            <Button
              variant="primary"
              icon="plus"
              onClick={() => {
                setPath("");
                setTried(false);
                setAdding(true);
              }}
            >
              {t("projects.add")}
            </Button>
          ) : undefined
        }
      />
      <Grid minItemWidth="18rem">
        {s.projects.map((p) => (
          <Card
            key={p.id}
            title={p.name}
            titleAside={waiting(p) > 0 ? <Tag tone="warn">{t("projects.waiting", { count: waiting(p) })}</Tag> : undefined}
            subtitle={admin ? p.path : undefined}
            monoSubtitle={admin}
            headingLevel={2}
            actions={
              admin ? (
                <MenuButton
                  variant="icon"
                  align="end"
                  label={t("projects.actionsFor", { name: p.name })}
                  items={[
                    {
                      label: t("projects.setup"),
                      onSelect: () => {
                        setScript(p.setupScript);
                        setCopy(p.copyFiles.join("\n"));
                        setFolders(p.docFolders.join("\n"));
                        setSteer(p.steering.join("\n"));
                        setSetup(p);
                      },
                    },
                    { type: "separator" },
                    { label: t("projects.remove"), danger: true, onSelect: () => setRemoving(p) },
                  ]}
                />
              ) : undefined
            }
          >
            <Stack gap={3}>
              <DescriptionList
                layout="columns"
                items={[
                  { term: t("projects.baseBranch"), value: p.base },
                  { term: t("projects.statSessions"), value: s.sessions.filter((x) => x.project === p.name).length },
                  { term: t("projects.statRunning"), value: s.terminals.filter((term) => term.state === "working" && s.sessions.some((x) => x.id === term.sessionId && x.project === p.name)).length },
                  { term: t("projects.statRuns"), value: s.runs.filter((r) => r.project === p.name).length },
                  { term: t("projects.statDocs"), value: s.docs.filter((d) => d.project === p.name).length },
                ]}
              />
              <Stack direction="row" gap={2} wrap>
                <Button variant="secondary" onClick={() => open(p, href.workspace)}>
                  {t("projects.open")}
                </Button>
                <Button variant="ghost" icon="docs" onClick={() => open(p, href.documents)}>
                  {t("projects.documents")}
                </Button>
              </Stack>
            </Stack>
          </Card>
        ))}
      </Grid>

      {adding ? (
        <FormDialog
          modal
          busy={false}
          title={t("projects.add")}
          labels={ui.formDialogCreate}
          submitLabel={t("projects.add")}
          onCancel={() => setAdding(false)}
          onSubmit={(e) => {
            e.preventDefault();
            if (pathError) return setTried(true);
            const name = clean.split("/").pop() ?? clean;
            s.setProjects((list) => [...list, { id: Math.random().toString(16).slice(2, 14).padEnd(12, "0"), name, path: clean, base: "main", setupScript: "", copyFiles: [], docFolders: [], steering: [] }]);
            s.setSessions((list) => [...list, { id: Math.random().toString(16).slice(2, 14).padEnd(12, "0"), project: name, branch: "main", root: true, status: "idle", diff: { add: 0, del: 0 } }]);
            notify(t("projects.added", { name }));
            setAdding(false);
          }}
        >
          <Field label={t("projects.path")} hint={t("projects.pathHint")} error={tried ? pathError : undefined} value={path} placeholder="/srv/repos/xdev" autoComplete="off" spellCheck={false} onChange={(e) => setPath(e.target.value)} />
        </FormDialog>
      ) : null}

      {setup ? (
        <FormDialog
          modal
          busy={false}
          title={t("projects.setupTitle", { name: setup.name })}
          description={t("projects.setupHint")}
          labels={ui.formDialog}
          submitLabel={t("projects.save")}
          onCancel={() => setSetup(null)}
          onSubmit={(e) => {
            e.preventDefault();
            const lines = (value: string): string[] =>
              value
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean);
            s.setProjects((list) => list.map((p) => (p.id === setup.id ? { ...p, setupScript: script.trim(), copyFiles: lines(copy), docFolders: lines(folders), steering: lines(steer) } : p)));
            notify(t("projects.saved", { name: setup.name }));
            setSetup(null);
          }}
        >
          <Stack gap={3}>
            <Field label={t("projects.script")} hint={t("projects.scriptHint")} value={script} autoComplete="off" spellCheck={false} onChange={(e) => setScript(e.target.value)} />
            <Textarea label={t("projects.copy")} hint={t("projects.copyHint")} mono value={copy} spellCheck={false} onChange={(e) => setCopy(e.target.value)} />
            <Textarea label={t("projects.docFolders")} hint={t("projects.docFoldersHint")} mono value={folders} spellCheck={false} onChange={(e) => setFolders(e.target.value)} />
            <Textarea label={t("projects.steering")} hint={t("projects.steeringHint")} mono value={steer} spellCheck={false} onChange={(e) => setSteer(e.target.value)} />
          </Stack>
        </FormDialog>
      ) : null}

      {removing ? (
        <Dialog
          alert
          modal
          tone="danger"
          title={t("projects.removeTitle", { name: removing.name })}
          confirmLabel={t("projects.remove")}
          cancelLabel={t("add.cancel")}
          confirmDisabled={busy(removing)}
          onCancel={() => setRemoving(null)}
          onConfirm={() => {
            const gone = removing;
            s.setProjects((list) => list.filter((p) => p.id !== gone.id));
            s.setSessions((list) => list.filter((x) => x.project !== gone.name));
            s.setRuns((list) => list.filter((r) => r.project !== gone.name));
            if (s.project === gone.name) s.setProject("");
            notify(t("projects.removed", { name: gone.name }));
            setRemoving(null);
          }}
        >
          {busy(removing) ? t("projects.removeBusy", { name: removing.name }) : t("projects.removeBody")}
        </Dialog>
      ) : null}
    </Stack>
  );
}
