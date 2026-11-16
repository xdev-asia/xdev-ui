import { useState, type JSX } from "react";
import { AgentChip, DiffStat, IconButton, List, ListRow, MenuButton, SearchInput, Stack, StatusDot, Tag } from "@xdev-asia/ui";
import { agentOf } from "../data";
import { useI18n } from "../i18n";
import { href, navigate } from "../router";
import { inProject, useStore } from "../store";
import type { Session } from "../workspace";

export interface SessionListProps {
  /** A session was chosen: the caller closes the drawer on a phone. */
  onPick: () => void;
  onNew: () => void;
}

/** The side list: sessions of the chosen project, pinned ones first, with filters and a search that also finds hidden rows. */
export function SessionList({ onPick, onNew }: SessionListProps): JSX.Element {
  const s = useStore();
  const { t, ui } = useI18n();
  const [query, setQuery] = useState("");
  const [hide, setHide] = useState({ idle: false, root: false, runs: false });

  const isRun = (x: Session): boolean => x.branch.startsWith("sdlc/");
  const q = query.trim().toLowerCase();
  const shown = s.sessions
    .filter((x) => inProject(s.project, x.project))
    .filter((x) => (q ? `${x.project} / ${x.branch}`.toLowerCase().includes(q) : !(hide.idle && x.status === "idle") && !(hide.root && x.root) && !(hide.runs && isRun(x))));
  const groups = s.projects.map((p) => p.name).filter((name) => shown.some((x) => x.project === name));
  const ordered = (name: string): Session[] => {
    const mine = shown.filter((x) => x.project === name);
    return [...mine.filter((x) => s.pinned.includes(x.id)), ...mine.filter((x) => !s.pinned.includes(x.id))];
  };

  const pick = (x: Session): void => {
    s.setSessionId(x.id);
    s.setUnread((u) => u.filter((id) => id !== x.id));
    navigate(href.workspace);
    onPick();
  };

  const row = (x: Session): JSX.Element => {
    const pinned = s.pinned.includes(x.id);
    const unread = s.unread.includes(x.id);
    const run = s.runs.find((r) => r.project === x.project && r.branch === x.branch);
    return (
      <ListRow
        key={x.id}
        as="li"
        selected={x.id === s.sessionId}
        onClick={() => pick(x)}
        leading={<StatusDot state={x.status} />}
        title={
          <span className="app-row">
            {unread ? <strong>{x.branch}</strong> : x.branch}
            {pinned ? <Tag>{t("side.pin")}</Tag> : null}
          </span>
        }
        meta={
          <span className="app-row">
            <span>{unread ? t("side.unread") : ui.sessionState[x.status]}</span>
            {run ? <span>{t(`runs.stage${run.stage[0].toUpperCase()}${run.stage.slice(1)}` as "runs.stageCode")}</span> : null}
            {x.diff.add + x.diff.del > 0 ? <DiffStat added={x.diff.add} removed={x.diff.del} labels={{ diffStat: ui.diffStat }} /> : null}
          </span>
        }
        trailing={
          <Stack direction="row" gap={1} align="center">
            {s.terminals
              .filter((term) => term.sessionId === x.id)
              .map((term) => (
                <AgentChip key={term.id} profile={agentOf(term.agent).profile} title={agentOf(term.agent).name} />
              ))}
            <MenuButton
              variant="icon"
              align="end"
              label={t("side.actionsFor", { name: x.branch })}
              items={[{ label: t(pinned ? "side.unpin" : "side.pin"), onSelect: () => s.setPinned((p) => (pinned ? p.filter((id) => id !== x.id) : [...p, x.id])) }]}
            />
          </Stack>
        }
      />
    );
  };

  return (
    <Stack gap={2} className="app-side">
      <Stack direction="row" gap={1} align="center" justify="between">
        <span className="app-label">{t("side.sessions")}</span>
        <Stack direction="row" gap={1} align="center">
          <MenuButton
            variant="icon"
            icon="filter"
            align="end"
            label={t("side.filters")}
            items={[
              { label: t("side.hideIdle"), checked: hide.idle, onSelect: () => setHide((h) => ({ ...h, idle: !h.idle })) },
              { label: t("side.hideRoot"), checked: hide.root, onSelect: () => setHide((h) => ({ ...h, root: !h.root })) },
              { label: t("side.hideRuns"), checked: hide.runs, onSelect: () => setHide((h) => ({ ...h, runs: !h.runs })) },
            ]}
          />
          <IconButton icon="plus" label={t("ws.newSession")} onClick={onNew} />
        </Stack>
      </Stack>
      <SearchInput size="sm" aria-label={t("side.search")} placeholder={t("side.search")} value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery("")} labels={ui.searchInput} />
      {groups.length === 0 ? <p className="app-muted">{t("side.none")}</p> : null}
      {groups.map((name) => (
        <Stack key={name} gap={1}>
          {s.project === "" ? <span className="app-group">{name}</span> : null}
          <List>{ordered(name).map(row)}</List>
        </Stack>
      ))}
    </Stack>
  );
}
