import { useMemo, useState, type JSX } from "react";
import { CommandPalette, PaletteTrigger, type PaletteRow } from "@xdev-asia/ui";
import { useStore } from "../data/context";
import type { User } from "../data/seed";
import { useI18n } from "../i18n";
import { hrefFor, navigate } from "../router";
import type { NavGroup } from "./nav";
import type { OpenPage } from "./prefs";

/** Ctrl+K search over the pages the role can open and the people in the workspace. */
export function GlobalSearch({ groups, recent = [] }: { groups: NavGroup[]; recent?: OpenPage[] }): JSX.Element {
  const { t, ui } = useI18n();
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [people, setPeople] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const show = (): void => {
    setOpen(true);
    if (!people.length) store.listUsers().then(setPeople, () => setPeople([]));
  };
  const sections = useMemo(
    () => [
      // With nothing typed yet, the pages open in tabs come first, newest first.
      ...(query.trim() || !recent.length ? [] : [{ title: t("shell.recent"), rows: [...recent].reverse().map<PaletteRow>((r) => ({ id: `#${r.path}`, title: r.title, icon: "history" })) }]),
      {
        title: t("shell.pages"),
        rows: groups.flatMap((g) => g.items.filter((e) => !e.external).map<PaletteRow>((e) => ({ id: e.href, title: t(e.label), detail: t(g.title), icon: e.icon }))),
      },
      { title: t("shell.people"), rows: people.map<PaletteRow>((u) => ({ id: hrefFor.user(u.id), title: u.name, detail: u.email, icon: "accounts" })) },
    ],
    [groups, people, recent, query, t],
  );
  return (
    <>
      <PaletteTrigger onOpen={show} labels={ui.paletteTrigger} className="app-top-search" />
      <CommandPalette
        open={open}
        onClose={() => {
          setOpen(false);
          setQuery("");
        }}
        query={query}
        onQueryChange={setQuery}
        sections={sections}
        labels={ui.commandPalette}
        onSelect={(row) => {
          setOpen(false);
          setQuery("");
          if (row.id) navigate(row.id);
        }}
      />
    </>
  );
}
