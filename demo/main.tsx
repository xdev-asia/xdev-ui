/*
  Home page, built to tasteskill 2.5 (github.com/Leonxlnx/taste-skill) on the xdev-ui system.
  Kind: software (a developer tool: React UI kit, tokens and an MCP server).
  Deal: hero collage · nav-mega · close-type in footer-statement · rhythm surface-pairs · buttons solid ·
        moment counter-rolls. Colours and type are the client's own (data-ground="ocean", Roboto),
        not dealt. Headlines 500, text 400/500.
  Screens at 1440x900: hero 1 · console (app-frame) 1 · devices (tabs, the moment) 1 · components 1 ·
        themes 1 · install (steps) 1 · agents 1 · footer.closing 1.
*/
import { createElement as h, StrictMode, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import * as X from "../src";
import "../src/styles/fonts.css";
import "../src/styles/index.css";
import { COMPONENTS, FEATURED, GROUPS, MCP_TOOLS, REPO, SHOWCASES, SKILLS, VERSION } from "./data";
import { Palette } from "./palette";
import { previews } from "./previews";
import "./home.css";

const SB = "./storybook/";
const CONSOLE = SHOWCASES[0]?.href ?? "./showcase/admin/";
const DEVICE_PREVIEW = `${CONSOLE}#/devices`;
const CONSOLE_CODE = `${REPO}/tree/main/examples/admin`;
const MAIN_ACTION = "Get xdev-ui";

/* ---------- theme ---------- */

type Theme = "dark" | "light";

function readTheme(): Theme {
  try {
    const t = localStorage.getItem("xdev-ui-theme");
    if (t === "dark" || t === "light") return t;
  } catch {
    /* storage blocked: fall back to the default */
  }
  return "dark";
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", theme);
    try {
      localStorage.setItem("xdev-ui-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  return [theme, setTheme] as const;
}

function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return reduce;
}

/* ---------- nav (nav-mega) ---------- */

const NAV = [
  { href: "#console", label: "Console" },
  { href: "#devices", label: "Devices" },
  { href: "#components", label: "Components" },
  { href: "#install", label: "Install" },
  { href: "#agents", label: "Agents" },
];

const DOCS_MENU = [
  {
    title: "Read",
    links: [
      { href: SB, name: "Storybook", line: "Every story, prop and state" },
      { href: "./llms-full.txt", name: "llms-full.txt", line: "All docs in one text file" },
      { href: "./ai-manifest.json", name: "AI manifest", line: "Tokens and props as JSON" },
    ],
  },
  {
    title: "Project",
    links: [
      { href: REPO, name: "GitHub", line: "Source, issues and pull requests" },
      { href: `${REPO}/releases`, name: "Releases", line: "What changed in each version" },
      { href: `${REPO}/blob/main/LICENSE`, name: "License", line: "Apache-2.0" },
    ],
  },
];

function Nav({ theme, onTheme, onSearch }: { theme: Theme; onTheme: (t: Theme) => void; onSearch: () => void }) {
  const [docs, setDocs] = useState(false);
  const [sheet, setSheet] = useState(false);
  const menuId = useId();
  const sheetId = useId();
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!docs && !sheet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDocs(false);
        setSheet(false);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (docs && bar.current && !bar.current.contains(e.target as Node)) setDocs(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [docs, sheet]);

  useEffect(() => {
    document.documentElement.classList.toggle("hp-locked", sheet);
  }, [sheet]);

  const close = () => {
    setDocs(false);
    setSheet(false);
  };

  return (
    <header className="hp-nav nav" ref={bar}>
      <div className="wrap hp-wrap hp-nav-bar nav__bar">
        <a className="hp-brand nav__logo" href="#top" aria-label="xdev-ui home">
          <X.BrandMark size={22} />
          <span>xdev-ui</span>
        </a>
        <nav className="hp-nav-links" aria-label="Primary">
          {NAV.map((n) => (
            <a key={n.href} className="hp-link" href={n.href}>{n.label}</a>
          ))}
          <button type="button" className="hp-link hp-link-menu" aria-expanded={docs} aria-controls={menuId} onClick={() => setDocs(!docs)}>
            Docs
            <X.Icon name="chevron" size={14} />
          </button>
        </nav>
        <div className="hp-nav-actions nav__actions">
          <X.IconButton icon="search" label="Search components (Ctrl K)" onClick={onSearch} aria-haspopup="dialog" />
          <X.ThemeSwitch variant="icon" value={theme} onChange={(v) => onTheme(v === "light" ? "light" : "dark")} />
          <a className="btn hp-btn hp-nav-cta" href="#install">{MAIN_ACTION}</a>
          <span className="hp-nav-toggle">
            <X.IconButton className="nav__toggle" icon={sheet ? "close" : "menu"} label={sheet ? "Close menu" : "Open menu"} aria-expanded={sheet} aria-controls={sheetId} onClick={() => setSheet(!sheet)} />
          </span>
        </div>
      </div>
      <div id={menuId} className="hp-mega" hidden={!docs}>
        <div className="wrap hp-wrap hp-mega-in">
          {DOCS_MENU.map((col) => (
            <div key={col.title} className="hp-mega-col">
              <p className="hp-label">{col.title}</p>
              <ul>
                {col.links.map((l) => (
                  <li key={l.name}>
                    <a href={l.href} onClick={close}>
                      <span className="hp-mega-name">{l.name}</span>
                      <span className="hp-mega-line">{l.line}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <a className="hp-mega-card" href={DEVICE_PREVIEW} onClick={close}>
            <span className="hp-mega-panel" aria-hidden="true">
              <img src="./devices/phone-dark.webp" alt="" width={390} height={844} loading="lazy" decoding="async" />
            </span>
            <span className="hp-mega-name">New: device preview</span>
            <span className="hp-mega-line">Any console page at three sizes</span>
          </a>
        </div>
      </div>
      <div id={sheetId} className="hp-sheet" hidden={!sheet}>
        <nav className="wrap hp-wrap" aria-label="Menu">
          {NAV.map((n) => (
            <a key={n.href} className="hp-sheet-row" href={n.href} onClick={close}>{n.label}</a>
          ))}
          {DOCS_MENU.flatMap((c) => c.links).map((l) => (
            <a key={l.name} className="hp-sheet-row" href={l.href} onClick={close}>{l.name}</a>
          ))}
          <a className="hp-sheet-row" href={DEVICE_PREVIEW} onClick={close}>Device preview</a>
          <div className="hp-sheet-foot">
            <a className="btn-secondary hp-btn" href={CONSOLE} onClick={close}>See the admin demo</a>
            <a className="btn hp-btn" href="#install" onClick={close}>{MAIN_ACTION}</a>
          </div>
        </nav>
      </div>
    </header>
  );
}

/* ---------- hero (collage) ---------- */

function AppMock() {
  return (
    <div className="hp-app">
      <div className="hp-app-bar">
        <X.ActivityBar active="terminal" changeCount={7} />
      </div>
      <aside className="hp-app-side" aria-label="Sessions" data-ui>
        <X.Toolbar title="Sessions" count={3} actions={<X.IconButton icon="plus" label="New session" />} />
        <div className="hp-app-pad">
          <X.SearchInput size="sm" placeholder="Filter" aria-label="Filter sessions" />
        </div>
        <div className="hp-app-rows">
          <X.ListRow title="login-retry" meta="feat/login-retry · 2m" leading={<X.StatusDot state="working" label="working" pulse />} trailing={<X.AgentChip profile="claude" title="Claude" />} selected onClick={() => {}} />
          <X.ListRow title="fix-ci-cache" meta="fix/ci-cache · 9m" leading={<X.StatusDot state="waiting" label="waiting" />} trailing={<X.AgentChip profile="codex" title="Codex" />} onClick={() => {}} />
          <X.ListRow title="docs-sync" meta="docs/sync · 1h" leading={<X.StatusDot state="done" label="done" />} trailing={<X.AgentChip profile="claude" title="Claude" />} onClick={() => {}} />
          <X.ListRow title="api-types" meta="feat/api-types · 3h" leading={<X.StatusDot state="done" label="done" />} trailing={<X.AgentChip profile="codex" title="Codex" />} onClick={() => {}} />
        </div>
      </aside>
      <section className="hp-app-main" aria-label="Agent tab" data-ui>
        <X.TabStrip
          label="Agent tabs"
          defaultSelected="a"
          tabs={[
            { id: "a", name: "login-retry", state: "working", profile: "claude", color: 1 },
            { id: "b", name: "fix-ci-cache", state: "waiting", profile: "codex", color: 4, unread: true },
          ]}
        />
        <div className="hp-app-crumb">
          <X.Breadcrumb items={[{ label: "xdev" }, { label: "worktrees" }, { label: "feat/login-retry", mono: true }]} />
        </div>
        <div className="hp-app-term">
          <code><span className="hp-dim">claude ›</span> reading src/auth/retry.ts</code>
          <code>Added exponential backoff, capped at 3 attempts.</code>
          <code><span className="hp-dim">$</span> pnpm test auth</code>
          <code className="hp-ok">14 passed · 0 failed</code>
          <code><span className="hp-dim">claude ›</span> opening a pull request</code>
        </div>
        <div className="hp-app-review">
          <X.Banner title="Waiting for review" action={<X.Button variant="secondary">Open diff</X.Button>}>
            fix-ci-cache wants to edit ci.yml.
          </X.Banner>
          <div className="hp-app-meters">
            <X.Meter label="Context" value={42} warnAt={80} />
            <X.Meter label="5h limit" value={63} />
          </div>
        </div>
      </section>
      <aside className="hp-app-files" aria-label="Changes">
        <X.Tabs label="Panel" items={[{ id: "changes", label: "Changes", badge: 3 }, { id: "files", label: "Files" }]} />
        <X.TreeView
          selected="r"
          rows={[
            { id: "s", depth: 0, name: "src", kind: "dir", open: true },
            { id: "a", depth: 1, name: "auth", kind: "dir", open: true, changed: true },
            { id: "r", depth: 2, name: "retry.ts", kind: "file", mark: "modified" },
            { id: "t", depth: 2, name: "retry.test.ts", kind: "file", mark: "added" },
            { id: "p", depth: 0, name: "package.json", kind: "file" },
          ]}
        />
      </aside>
    </div>
  );
}

const RUN_STEPS = ["Read src/auth/retry.ts", "Added backoff, 3 attempts", "14 tests passed"];

/** The hero's one small card: shows the finished run, holds, then its steps arrive again. Pause disc; a phone hides it. */
function RunCard() {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [shown, setShown] = useState(RUN_STEPS.length);
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    if (reduce || paused) {
      setShown(RUN_STEPS.length);
      return;
    }
    // Finished first, hold 1.8 s, then the three steps arrive 0.7 s apart: a 3.9 s cycle.
    const timers = [window.setTimeout(() => setShown(0), 1800)];
    RUN_STEPS.forEach((_, i) => timers.push(window.setTimeout(() => setShown(i + 1), 1800 + 300 + i * 700)));
    timers.push(window.setTimeout(() => setCycle((c) => c + 1), 1800 + 300 + RUN_STEPS.length * 700 + 400));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduce, paused, cycle]);
  return (
    <div className="hp-run" onPointerEnter={() => !paused && setCycle((c) => c + 1)}>
      <div className="hp-run-head">
        <X.StatusDot state={shown === RUN_STEPS.length ? "done" : "working"} label={shown === RUN_STEPS.length ? "Run finished" : "Running"} />
        <X.IconButton icon={paused ? "play" : "pause"} label={paused ? "Play the run" : "Pause the run"} size="sm" onClick={() => setPaused(!paused)} />
      </div>
      <ol className="hp-run-steps">
        {RUN_STEPS.map((s, i) => (
          <li key={s} data-on={i < shown ? "" : undefined} aria-hidden={i < shown ? undefined : true}>
            <X.Icon name="check" size={14} />
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Hero() {
  return (
    <section className="hp-hero hero" id="top" aria-labelledby="hp-h1" data-enter>
      <div className="wrap hp-wrap">
        <div className="hero-text hp-grid hp-hero-grid">
        <div className="hp-hero-text">
          <h1 id="hp-h1">
            <span className="hp-mask"><span>React UI kit for developer tools</span></span>
          </h1>
          <p className="hp-lead hero__lead">
            {COMPONENTS.length} components, design tokens and an MCP server, so Claude Code, Codex and Cursor read the same props and rules your team does. Dark and light, English and Vietnamese.
          </p>
          <div className="hp-actions">
            <a className="btn hp-btn" href="#install">{MAIN_ACTION}</a>
            <a className="btn-secondary hp-btn" href={CONSOLE}>See the admin demo</a>
          </div>
          <p className="hp-proof">Free under Apache-2.0. React 19{VERSION ? `, version ${VERSION}` : ""}.</p>
        </div>
        <div className="hp-art hero__art">
          <div className="hp-art-win" data-ui inert aria-hidden="true">
            <AppMock />
          </div>
          <RunCard />
        </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- console (app-frame) ---------- */

const VISITS = [1420, 1510, 1488, 1630, 1702, 1655, 1590, 1720, 1810, 1760, 1902, 1870, 1955, 2040];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** The admin console's dashboard, made of the same parts, at its real size; Fit scales it into the frame. */
function ConsoleMock() {
  const nav = (items: [string, string, X.IconName][], value?: string) => <X.NavList items={items.map(([id, label, icon]) => ({ id, label, icon }))} value={value} />;
  return (
    <div className="hp-console">
      <aside className="hp-console-side">
        <div className="hp-console-brand">
          <X.BrandMark size={20} />
          <span>Acme console</span>
        </div>
        <p className="hp-console-group">Overview</p>
        {nav([["d", "Dashboard", "home"]], "d")}
        <p className="hp-console-group">Access</p>
        {nav([["u", "Users", "accounts"], ["r", "Roles", "shield"], ["p", "Permissions", "key"]])}
        <p className="hp-console-group">System</p>
        {nav([["m", "Menus", "list"], ["t", "Departments", "layers"], ["a", "Audit log", "history"], ["s", "Settings", "settings"]])}
      </aside>
      <div className="hp-console-main">
        <div className="hp-console-top">
          <X.IconButton icon="sidebar" label="Collapse sidebar" />
          <X.Breadcrumb items={[{ label: "Overview" }, { label: "Dashboard" }]} />
          <span className="hp-console-spacer" />
          <X.PaletteTrigger onOpen={() => {}} hotkey={false} />
          <X.IconButton icon="bell" label="Notifications" />
          <X.IconButton icon="globe" label="Language" />
          <X.Avatar name="Ada Lovelace" size="sm" />
        </div>
        <div className="hp-console-tabs">
          <X.TabStrip label="Open pages" selected="d" onAdd={false} onClose={() => {}} tabs={[{ id: "d", name: "Dashboard", pinned: true }, { id: "u", name: "Users" }, { id: "m", name: "Menus" }, { id: "p", name: "Permissions" }]} />
        </div>
        <div className="hp-console-body">
          <div>
            <p className="hp-console-title">Dashboard</p>
            <p className="hp-console-desc">How the workspace is doing this week.</p>
          </div>
          <div className="hp-console-stats">
            <X.StatTile label="Active users" value="39" delta="+4%" deltaTrend="up" deltaTone="good" hint="vs last 7 days" icon="accounts" />
            <X.StatTile label="Sign-ins" value="1,284" delta="+12%" deltaTrend="up" deltaTone="good" hint="vs last 7 days" icon="key" />
            <X.StatTile label="Storage used" value="82 GB" hint="of 100 GB" icon="database">
              <X.Meter value={82} warnAt={80} label="Storage used" />
            </X.StatTile>
          </div>
          <X.Card title="Visits" titleAside={<X.Segmented label="Period" defaultValue="w" options={[{ value: "w", label: "This week" }, { value: "m", label: "This month" }, { value: "y", label: "This year" }]} />}>
            <X.TimeSeriesChart label="Visits" dots points={VISITS.map((v, i) => ({ key: String(i), value: v, label: `${v} visits` }))} ticks={DAYS.map((d, i) => ({ index: i * 2, label: d }))} maxLabel="2,040" zeroLabel="0" />
          </X.Card>
        </div>
      </div>
    </div>
  );
}

/** Scales a live preview down until it fits its box; the preview stays real DOM, only inert. */
function Fit({ style = {}, children, cover = false }: { style?: CSSProperties; children: ReactNode; cover?: boolean }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const fit = () => {
      const kw = (o.clientWidth - (cover ? 0 : 24)) / Math.max(1, i.offsetWidth, i.scrollWidth);
      const kh = (o.clientHeight - (cover ? 0 : 24)) / Math.max(1, i.offsetHeight, i.scrollHeight);
      const s = Math.min(1, cover ? kw : Math.min(kw, kh));
      setK(s > 0 ? s : 1);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [cover]);
  const s: CSSProperties = { maxWidth: style.width ? undefined : 420, ...style, transform: `scale(${k})` };
  return (
    <div ref={outer} className={cover ? "hp-fit hp-fit-cover" : "hp-fit"}>
      <div ref={inner} className="hp-fit-in" style={s} inert aria-hidden="true">
        {children}
      </div>
    </div>
  );
}

function Console() {
  return (
    <section className="hp-sec" id="console" aria-labelledby="hp-console-h">
      <div className="wrap hp-wrap">
        <div className="hp-head section-head">
          <h2 id="hp-console-h">A full admin console built from the kit</h2>
          <p className="hp-sub">
            Users, roles, menus, an audit log and settings, rebuilt after react-antd-admin with no components of its own. <a className="hp-text-link" href={CONSOLE_CODE}>Read the console code</a>
          </p>
        </div>
        <a className="hp-app-frame frame" data-ui href={CONSOLE} aria-label="See the admin demo: the dashboard of Acme console">
          <Fit cover style={{ width: 1280, height: 720 }}>
            <ConsoleMock />
          </Fit>
        </a>
      </div>
    </section>
  );
}

/* ---------- devices (tabs + the dealt moment: counter-rolls) ---------- */

const DEVICES = [
  { id: "phone", label: "Phone", size: "390 × 844", w: 390, h: 844 },
  { id: "tablet", label: "Tablet", size: "768 × 1024", w: 768, h: 1024 },
  { id: "desktop", label: "Desktop", size: "1440 × 900", w: 1440, h: 900 },
] as const;

/** Real figures from the CI device job (.github/workflows/ci.yml): 24 routes in examples/admin/layout-routes.json,
    7 device presets in scripts/layout-check.mjs, 2 themes, 2 languages. */
const CHECK_FIGURES = [
  { n: 7, unit: "device sizes" },
  { n: 24, unit: "console pages" },
  { n: 672, unit: "checks on every pull request" },
];

/** The dealt moment: tasteskill's counter-rolls (demo/public/taste, MIT), mounted by its own loader. The figures are written as they are. */
function CheckFigures() {
  return (
    <dl className="hp-figures" data-moment="counter-rolls">
      {CHECK_FIGURES.map((f) => (
        <div key={f.unit}>
          <dt className="hp-figure t-stat">{f.n}</dt>
          <dd>{f.unit}</dd>
        </div>
      ))}
    </dl>
  );
}

function Devices({ theme }: { theme: Theme }) {
  const [device, setDevice] = useState<(typeof DEVICES)[number]["id"]>("phone");
  const d = DEVICES.find((x) => x.id === device) ?? DEVICES[0];
  return (
    <section className="hp-sec hp-ground-surface" id="devices" aria-labelledby="hp-devices-h">
      <div className="wrap hp-wrap hp-grid hp-split">
        <div className="hp-split-text">
          <h2 id="hp-devices-h">Layout checks on 7 screen sizes</h2>
          <p className="hp-sub">
            CI opens every console page in Chrome from a 320px phone to a 1440px desktop, in both themes and both languages. Sideways scroll, cut-off content or a tap target under 24px fails the pull request.
          </p>
          <X.Tabs label="Device" variant="pill" idPrefix="hp-dev" value={device} onChange={(id) => setDevice(id as typeof device)} items={DEVICES.map((x) => ({ id: x.id, label: x.label }))} />
          <CheckFigures />
          <a className="hp-text-link" href={DEVICE_PREVIEW}>Try any page in the device preview</a>
        </div>
        <div className="hp-device-stage" role="tabpanel" id={`hp-dev-panel-${d.id}`} aria-labelledby={`hp-dev-tab-${d.id}`}>
          {DEVICES.map((x) => (
            <figure key={x.id} className="hp-device" data-device={x.id} hidden={x.id !== device}>
              <img src={`./devices/${x.id}-${theme}.webp`} alt={`The console dashboard at ${x.label.toLowerCase()} size, ${x.size}`} width={x.w} height={x.h} loading={x.id === "phone" ? "eager" : "lazy"} decoding="async" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- components ---------- */

const PER_PAGE = 6;

function Components() {
  const [group, setGroup] = useState("All");
  const [q, setQ] = useState("");
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    return COMPONENTS.filter((c) => (group === "All" || c.group === group) && (!s || `${c.name} ${c.summary}`.toLowerCase().includes(s)));
  }, [group, q]);
  const browsing = q.trim() !== "" || group !== "All";
  const list = browsing ? hits : FEATURED.map((n) => hits.find((c) => c.name === n)).filter((c): c is (typeof hits)[number] => !!c);
  const shown = list.slice(0, PER_PAGE);
  return (
    <section className="hp-sec" id="components" aria-labelledby="hp-comp-h">
      <div className="wrap hp-wrap">
        <div className="hp-head section-head">
          <h2 id="hp-comp-h">{COMPONENTS.length} components, each one live</h2>
          <p className="hp-sub">Every card renders the component itself. Filter by name or group, then see its states and props in Storybook.</p>
        </div>
        <div className="hp-filter">
          <label className="hp-label hp-filter-label" htmlFor="hp-filter-input">Filter components</label>
          <X.SearchInput id="hp-filter-input" placeholder="Name or summary" value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ("")} count={q ? hits.length : undefined} />
          <div className="hp-chips" role="group" aria-label="Group">
            <X.FilterChip pressed={group === "All"} count={COMPONENTS.length} onClick={() => setGroup("All")}>All</X.FilterChip>
            {GROUPS.map((g) => (
              <X.FilterChip key={g.name} pressed={group === g.name} count={g.items.length} onClick={() => setGroup(g.name)}>
                {g.name}
              </X.FilterChip>
            ))}
          </div>
        </div>
        {shown.length ? (
          <ul className="hp-cards">
            {shown.map((c, i) => {
              const p = previews[c.name];
              // a bento: the first and the last of six run two columns wide, preview beside the name
              const wide = i === 0 || (shown.length === PER_PAGE && i === PER_PAGE - 1);
              return (
                <li key={c.name} className="hp-card" data-wide={wide ? "" : undefined}>
                  <div className="hp-card-stage" data-ui>
                    {p ? (
                      <Fit style={p.style}>{p.render(X, h)}</Fit>
                    ) : (
                      <span className="hp-card-none">
                        <X.Icon name="grid" size={20} />
                      </span>
                    )}
                  </div>
                  <div className="hp-card-text">
                    <h3>
                      <a href={c.href}>{c.name}</a>
                    </h3>
                    <p>{wide ? c.summary : c.group}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="hp-empty">
            <X.EmptyState size="center" icon="search" title="No component matches" hint={`No name or summary contains “${q}”.`} actions={<X.Button variant="secondary" onClick={() => { setQ(""); setGroup("All"); }}>Clear the filter</X.Button>} />
          </div>
        )}
        <p className="hp-more">
          {browsing ? `${Math.min(PER_PAGE, list.length)} of ${list.length} shown. ` : ""}
          <a className="hp-text-link" href={SB}>See all {COMPONENTS.length} in Storybook</a>
        </p>
      </div>
    </section>
  );
}

/* ---------- themes ---------- */

function ThemeSample({ theme }: { theme: Theme }) {
  return (
    <div className="hp-theme" data-theme={theme}>
      <X.Card title="Agent settings" subtitle="~/.xdev/profiles/claude.json" monoSubtitle>
        <X.SettingRow label="Notify when done" description="A toast and a sound when a session finishes." control={<X.Switch label="Notify when done" defaultChecked />} />
        <X.SettingRow label="Default shell" control={<X.Segmented label="Default shell" defaultValue="pwsh" options={[{ value: "pwsh", label: "pwsh" }, { value: "bash", label: "bash" }]} />} />
        <div className="hp-theme-row">
          <X.StatusDot state="working" label="working" />
          <X.StatusDot state="waiting" label="waiting" />
          <X.StatusDot state="failed" label="failed" />
          <X.DiffStat added={42} removed={7} />
        </div>
        <div className="hp-theme-actions">
          <X.Button variant="secondary">Cancel</X.Button>
          <X.Button>Save profile</X.Button>
        </div>
      </X.Card>
    </div>
  );
}

function Themes() {
  return (
    <section className="hp-sec hp-ground-surface" id="themes" aria-labelledby="hp-themes-h">
      <div className="wrap hp-wrap hp-grid hp-split">
        <div className="hp-split-text">
          <h2 id="hp-themes-h">Dark and light themes from one token set</h2>
          <p className="hp-sub">
            Set <code>data-theme</code> on any element. Components read only tokens, so a light pane can sit inside a dark app.
          </p>
        </div>
        <div className="hp-themes" data-ui>
          <ThemeSample theme="dark" />
          <ThemeSample theme="light" />
        </div>
      </div>
    </section>
  );
}

/* ---------- install (steps) ---------- */

const INSTALL = "pnpm add @xdev-asia/ui";
const STEPS = [
  { t: "Add the package", p: "From npmjs.com, no token needed. Components, tokens, icons and the MCP server in one dependency.", lang: "bash", code: INSTALL },
  { t: "Import the styles once", p: "At the root of the app.", lang: "tsx", code: 'import "@xdev-asia/ui/fonts.css";\nimport "@xdev-asia/ui/styles.css";' },
  { t: "Pick the theme", p: "Dark is the default. Add the ocean ground for the look of this site.", lang: "index.html", code: '<html data-theme="dark" data-ground="ocean">' },
];

const USAGE = `import { Button, StatusDot, Switch } from "@xdev-asia/ui";

export function SessionHead() {
  return (
    <div className="session-head">
      <StatusDot state="working" label="2 running" pulse />
      <Switch label="Notify when done" defaultChecked />
      <Button icon="terminal">New session</Button>
    </div>
  );
}`;

function Install() {
  return (
    <section className="hp-sec" id="install" aria-labelledby="hp-install-h">
      <div className="wrap hp-wrap">
        <div className="hp-head section-head">
          <h2 id="hp-install-h">Set up xdev-ui in 3 steps</h2>
        </div>
        <ol className="hp-steps">
          {STEPS.map((s) => (
            <li key={s.t} className="hp-step">
              <h3>{s.t}</h3>
              <p>{s.p}</p>
              <div className="hp-step-panel" data-ui>
                <X.CodeBlock language={s.lang} code={s.code} />
              </div>
            </li>
          ))}
        </ol>
        <div className="hp-usage hp-grid">
          <div className="hp-usage-text">
            <h3>Use a component in your app</h3>
            <p className="hp-sub">Import a part and pass its props; it renders in the current theme.</p>
            <div data-ui>
              <X.CodeBlock language="SessionHead.tsx" code={USAGE} />
            </div>
          </div>
          <div className="hp-usage-out" data-ui>
            <p className="hp-label">What it renders</p>
            <div className="hp-usage-demo">
              <X.StatusDot state="working" label="2 running" pulse />
              <X.Switch label="Notify when done" defaultChecked />
              <X.Button icon="terminal">New session</X.Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- agents ---------- */

const MCP_JSON = `{
  "mcpServers": {
    "xdev-ui": {
      "command": "node",
      "args": ["node_modules/@xdev-asia/ui/dist/mcp.js"]
    }
  }
}`;

const SESSION = [
  { tool: "xdevui_list_components", out: `${COMPONENTS.length} components in ${GROUPS.length} groups` },
  { tool: "xdevui_get_component SettingRow", out: "README rules, props and the classes it renders" },
  { tool: "xdevui_search_tokens focus", out: "--x-color-focus, its value per theme and when to use it" },
  { tool: "xdevui_get_skill xdev-ui-review", out: "The review checklist and its audit script" },
];

function Agents() {
  return (
    <section className="hp-sec" id="agents" aria-labelledby="hp-agents-h">
      <div className="wrap hp-wrap hp-grid hp-split">
        <div className="hp-split-text">
          <h2 id="hp-agents-h">The xdev-ui MCP server for coding agents</h2>
          <p className="hp-sub">
            Claude Code, Codex and Cursor ask it for components, exact props, tokens and rules before they write a line. <code>npx xdev-ui-skills install</code> adds {SKILLS.length} skills for building and reviewing screens.
          </p>
          <div className="hp-agent-code" data-ui>
            <X.CodeBlock language=".mcp.json" code={MCP_JSON} />
          </div>
          <p className="hp-small">
            No MCP client? <a className="hp-text-link" href="./llms-full.txt">Read llms-full.txt</a>, which holds the same content.
          </p>
        </div>
        <div className="hp-session" data-ui role="img" aria-label="A Claude Code session asking the xdev-ui MCP server for components, props and tokens">
          <div className="hp-session-head">
            <X.AgentChip profile="claude" title="Claude Code" />
            <span>Claude Code</span>
            <X.StatusDot state="done" label="done" />
          </div>
          {SESSION.map((c) => (
            <div key={c.tool} className="hp-session-call">
              <code className="hp-session-tool">{c.tool}</code>
              <span className="hp-session-out">{c.out}</span>
            </div>
          ))}
          <p className="hp-session-done">Built the settings page with Card, SettingRow and Switch.</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- footer.closing (close-type on footer-statement) ---------- */

function Closing({ onSearch }: { onSearch: () => void }) {
  return (
    <footer className="hp-closing closing" id="contact">
      <div className="wrap hp-wrap hp-closing-in">
        <div className="hp-close">
          <h2>Build your next screen with xdev-ui</h2>
          <p className="hp-small">Free under Apache-2.0. Works with React 19.</p>
          <a className="btn hp-btn hp-btn-xl" href="#install">{MAIN_ACTION}</a>
        </div>
        <div className="hp-foot">
          <div className="hp-foot-cols">
            <div className="hp-foot-brand">
              <a className="hp-brand" href="#top">
                <X.BrandMark size={22} />
                <span>xdev-ui</span>
              </a>
              <p>The React components, tokens and MCP server behind xDev.</p>
            </div>
            <nav aria-label="Docs">
              <p className="hp-label">Docs</p>
              <a className="hp-link" href={SB}>Storybook</a>
              <a className="hp-link" href={CONSOLE}>Admin demo</a>
              <a className="hp-link" href={DEVICE_PREVIEW}>Device preview</a>
              <button type="button" className="hp-link" onClick={onSearch}>Search components</button>
            </nav>
            <nav aria-label="Project">
              <p className="hp-label">Project</p>
              <a className="hp-link" href={REPO}>GitHub</a>
              <a className="hp-link" href={`${REPO}/issues`}>Issues</a>
              <a className="hp-link" href={`${REPO}/releases`}>Releases</a>
              <a className="hp-link" href="./llms-full.txt">llms-full.txt</a>
            </nav>
          </div>
          <p className="hp-legal">
            <span>© 2026 xdev-asia</span>
            <a className="hp-link" href={`${REPO}/blob/main/LICENSE`}>Apache-2.0</a>
            {VERSION && <span>Version {VERSION}</span>}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ---------- page ---------- */

function Home() {
  const [search, setSearch] = useState(false);
  const [theme, setTheme] = useTheme();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    // tasteskill's moment loader: finds [data-moment] and mounts the dealt counter-rolls once.
    void import(/* @vite-ignore */ new URL("./taste/moments/moments.js", document.baseURI).href).catch(() => {});
  }, []);
  const openSearch = () => setSearch(true);
  return (
    <>
      <a className="hp-skip" href="#main">Skip to content</a>
      <Nav theme={theme} onTheme={setTheme} onSearch={openSearch} />
      <main id="main">
        <Hero />
        <Console />
        <Devices theme={theme} />
        <Components />
        <Themes />
        <Install />
        <Agents />
      </main>
      <Closing onSearch={openSearch} />
      <Palette open={search} onClose={() => setSearch(false)} />
    </>
  );
}

document.documentElement.classList.add("js");
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);
