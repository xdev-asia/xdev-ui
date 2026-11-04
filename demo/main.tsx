import { createElement as h, StrictMode, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import * as X from "../src";
import "../src/styles/fonts.css";
import "../src/styles/index.css";
import { COMPONENTS, GROUPS, ICON_COUNT, MCP_TOOLS, REPO, TOKEN_COUNT, VERSION } from "./data";
import { Palette } from "./palette";
import { previews } from "./previews";
import "./home.css";

const SB = "./storybook/";

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

/* ---------- nav ---------- */

function Nav({ theme, onTheme, onSearch }: { theme: Theme; onTheme: (t: Theme) => void; onSearch: () => void }) {
  return (
    <header className="hp-nav">
      <div className="hp-wrap hp-nav-in">
        <a className="hp-brand" href="./" aria-label="xdev-ui home">
          <X.BrandMark size={22} />
          <span>xdev-ui</span>
          {VERSION && <span className="hp-ver">v{VERSION}</span>}
        </a>
        <nav className="hp-nav-links" aria-label="Primary">
          <a href="#components">Components</a>
          <a href="#install">Install</a>
          <a href="#mcp">MCP</a>
          <a href={SB}>Storybook</a>
        </nav>
        <div className="hp-nav-tools">
          <button type="button" className="hp-search" onClick={onSearch} aria-haspopup="dialog">
            <X.Icon name="search" />
            <span>Search components</span>
            <X.Kbd>Ctrl K</X.Kbd>
          </button>
          <X.Segmented
            label="Theme"
            value={theme}
            onChange={(v) => onTheme(v as Theme)}
            options={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
            ]}
          />
          <a className="hp-nav-gh" href={REPO}>GitHub</a>
        </div>
      </div>
    </header>
  );
}

/* ---------- hero ---------- */

const INSTALL = "pnpm add @xdev-asia/ui";

function CopyLine({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.setTimeout(() => setDone(false), 1600);
    } catch {
      /* clipboard refused: the text stays selectable */
    }
  };
  return (
    <div className="hp-copy">
      <span className="hp-copy-p" aria-hidden="true">$</span>
      <code>{text}</code>
      <X.IconButton icon={done ? "check" : "copy"} label={done ? "Copied" : "Copy install command"} onClick={copy} />
    </div>
  );
}

function AppMock() {
  return (
    <div className="hp-app" data-ui>
      <div className="hp-app-bar">
        <X.ActivityBar active="terminal" changeCount={7} />
      </div>
      <aside className="hp-app-side" aria-label="Sessions">
        <X.Toolbar title="Sessions" count={3} actions={<X.IconButton icon="plus" label="New session" />} />
        <div className="hp-app-pad">
          <X.SearchInput size="sm" placeholder="Filter" aria-label="Filter sessions" />
        </div>
        <div className="hp-app-rows">
          <X.ListRow title="login-retry" meta="feat/login-retry · 2m" leading={<X.StatusDot state="working" label="working" pulse />} trailing={<X.AgentChip profile="claude" title="Claude" />} selected onClick={() => {}} />
          <X.ListRow title="fix-ci-cache" meta="fix/ci-cache · 9m" leading={<X.StatusDot state="waiting" label="waiting" />} trailing={<X.AgentChip profile="codex" title="Codex" />} onClick={() => {}} />
          <X.ListRow title="docs-sync" meta="docs/sync · 1h" leading={<X.StatusDot state="done" label="done" />} trailing={<X.AgentChip profile="claude" title="Claude" />} onClick={() => {}} />
        </div>
      </aside>
      <section className="hp-app-main" aria-label="Agent tab">
        <X.TabStrip
          label="Agent tabs"
          defaultSelected="a"
          tabs={[
            { id: "a", name: "login-retry", state: "working", profile: "claude", color: 1 },
            { id: "b", name: "fix-ci-cache", state: "waiting", profile: "codex", color: 4, unread: true },
            { id: "c", name: "docs-sync", state: "done", profile: "claude", color: 6 },
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
      <div className="hp-app-status">
        <X.StatusBar
          items={[
            <span key="b">feat/login-retry</span>,
            <X.DiffStat key="d" added={128} removed={14} />,
            "spacer",
            <X.StatusDot key="s" state="working" label="1 working" pulse />,
            <X.AgentChip key="a" profile="claude" title="Claude Code" />,
          ]}
        />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hp-hero" aria-labelledby="hp-h1">
      <div className="hp-wrap hp-hero-copy">
        <a className="hp-pill" href={`${REPO}/releases`}>
          <X.Badge status="new">new</X.Badge>
          <span>{COMPONENTS.length} components and an MCP server</span>
          <span aria-hidden="true">→</span>
        </a>
        <h1 id="hp-h1">The interface kit for the desktop where agents work.</h1>
        <p className="hp-lede">
          React components, design tokens and an MCP server. The same parts xDev is built from, dark by default, light on request, labelled in English and Vietnamese.
        </p>
        <div className="hp-cta">
          <a className="btn hp-btn" href={SB}>Open Storybook</a>
          <a className="btn-secondary hp-btn" href={REPO}>View on GitHub</a>
        </div>
        <CopyLine text={INSTALL} />
      </div>
      <div className="hp-wrap hp-stage" data-reveal>
        <AppMock />
      </div>
    </section>
  );
}

/* ---------- facts ---------- */

function Facts() {
  const facts = [
    { n: String(COMPONENTS.length), t: "components", s: `${GROUPS.length} groups, one import each` },
    { n: String(TOKEN_COUNT), t: "design tokens", s: "Colour, space, radius, type" },
    { n: String(ICON_COUNT), t: "icons", s: "24 grid, stroke 1.75" },
    { n: "2", t: "themes", s: "Dark and light, one token set" },
  ];
  return (
    <section className="hp-wrap hp-facts" aria-label="At a glance">
      {facts.map((f, i) => (
        <div key={f.t} className="hp-fact" data-reveal style={{ ["--i" as string]: i }}>
          <p className="hp-fact-n"><strong>{f.n}</strong> {f.t}</p>
          <p className="hp-fact-s">{f.s}</p>
        </div>
      ))}
    </section>
  );
}

/* ---------- gallery ---------- */

/** Scales a live preview down until it fits its stage; the preview stays real DOM, only inert. */
function Fit({ style, children }: { style: CSSProperties; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const fit = () => {
      const s = Math.min(1, (o.clientWidth - 24) / Math.max(1, i.offsetWidth, i.scrollWidth), (o.clientHeight - 24) / Math.max(1, i.offsetHeight, i.scrollHeight));
      setK(s > 0 ? s : 1);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, []);
  const s: CSSProperties = { maxWidth: style.width ? undefined : 420, ...style, transform: `scale(${k})` };
  return (
    <div ref={outer} className="hp-fit">
      <div ref={inner} className="hp-fit-in" style={s} inert aria-hidden="true">
        {children}
      </div>
    </div>
  );
}

function Gallery() {
  const [group, setGroup] = useState("All");
  const [q, setQ] = useState("");
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    return COMPONENTS.filter((c) => (group === "All" || c.group === group) && (!s || `${c.name} ${c.summary}`.toLowerCase().includes(s)));
  }, [group, q]);

  return (
    <section className="hp-sec" id="components" aria-labelledby="hp-gal-h">
      <div className="hp-wrap">
        <div className="hp-sec-head">
          <div>
            <h2 id="hp-gal-h">Every part, rendered live</h2>
            <p className="hp-sec-sub">Each card is the component itself, not a picture of it. Open one for its states, props and rules.</p>
          </div>
          <div className="hp-gal-search">
            <X.SearchInput
              placeholder="Filter components"
              aria-label="Filter components"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onClear={() => setQ("")}
              count={q ? hits.length : undefined}
            />
          </div>
        </div>
        <div className="hp-chips" role="group" aria-label="Group">
          <X.FilterChip pressed={group === "All"} count={COMPONENTS.length} onClick={() => setGroup("All")}>All</X.FilterChip>
          {GROUPS.map((g) => (
            <X.FilterChip key={g.name} pressed={group === g.name} count={g.items.length} onClick={() => setGroup(g.name)}>
              {g.name}
            </X.FilterChip>
          ))}
        </div>
        {hits.length ? (
          <ul className="hp-grid">
            {hits.map((c) => {
              const p = previews[c.name];
              return (
                <li key={c.name} className="hp-comp">
                  <div className="hp-comp-stage">
                    {p ? <Fit style={p.style}>{p.render(X, h)}</Fit> : <span className="hp-comp-none">{c.name}</span>}
                  </div>
                  <div className="hp-comp-meta">
                    <div className="hp-comp-row">
                      <h3><a href={c.href}>{c.name}</a></h3>
                      <span className="hp-comp-group">{c.group}</span>
                    </div>
                    <p>{c.summary}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="hp-gal-empty">
            <X.EmptyState size="center" icon="search" title="Nothing matches" hint={`No component name or summary contains “${q}”.`} actions={<X.Button variant="secondary" onClick={() => { setQ(""); setGroup("All"); }}>Clear filters</X.Button>} />
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- themes ---------- */

function ThemeSample({ theme }: { theme: Theme }) {
  return (
    <div className="hp-theme" data-theme={theme}>
      <p className="hp-theme-name">{theme === "dark" ? "Dark" : "Light"}</p>
      <X.Card title="Agent settings" subtitle="~/.xdev/profiles/claude.json" monoSubtitle>
        <X.SettingRow label="Notify when done" description="A toast and a sound when a session finishes." control={<X.Switch label="Notify when done" defaultChecked />} />
        <X.SettingRow
          label="Default shell"
          control={
            <X.Segmented
              label="Default shell"
              defaultValue="pwsh"
              options={[
                { value: "pwsh", label: "pwsh" },
                { value: "bash", label: "bash" },
              ]}
            />
          }
        />
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
      <ul className="hp-swatches" aria-label={`${theme} tokens`}>
        {["--bg-0", "--bg-2", "--text-1", "--accent", "--signal", "--ok", "--warn", "--danger"].map((t) => (
          <li key={t}>
            <span className="hp-sw" style={{ background: `var(${t})` }} />
            <code>{t}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Themes() {
  return (
    <section className="hp-sec" aria-labelledby="hp-th-h">
      <div className="hp-wrap">
        <div className="hp-sec-head">
          <div>
            <h2 id="hp-th-h">Two themes, one set of tokens</h2>
            <p className="hp-sec-sub">
              Set <code>data-theme</code> on any element. Components read only tokens, so a pane can be light inside a dark app.
            </p>
          </div>
        </div>
        <div className="hp-themes" data-reveal>
          <ThemeSample theme="dark" />
          <ThemeSample theme="light" />
        </div>
      </div>
    </section>
  );
}

/* ---------- install ---------- */

const STEPS = [
  { t: "Point the scope at GitHub Packages", p: "One line in the .npmrc next to your package.json.", lang: ".npmrc", code: "@xdev-asia:registry=https://npm.pkg.github.com" },
  { t: "Add the package", p: "Components, tokens, icons and the MCP server in one dependency.", lang: "bash", code: INSTALL },
  { t: "Import the styles once", p: "At the root of the app. Dark is the default theme.", lang: "tsx", code: 'import "@xdev-asia/ui/fonts.css";\nimport "@xdev-asia/ui/styles.css";' },
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
    <section className="hp-sec" id="install" aria-labelledby="hp-in-h">
      <div className="hp-wrap">
        <div className="hp-sec-head">
          <div>
            <h2 id="hp-in-h">On screen in three steps</h2>
            <p className="hp-sec-sub">React 19, no runtime dependencies beyond it. Every label ships in English and Vietnamese.</p>
          </div>
        </div>
        <ol className="hp-steps">
          {STEPS.map((s, i) => (
            <li key={s.t} className="hp-step" data-reveal style={{ ["--i" as string]: i }}>
              <span className="hp-step-n">{String(i + 1).padStart(2, "0")}</span>
              <h3>{s.t}</h3>
              <p>{s.p}</p>
              <X.CodeBlock language={s.lang} code={s.code} />
            </li>
          ))}
        </ol>
        <div className="hp-usage" data-reveal>
          <X.CodeBlock language="SessionHead.tsx" code={USAGE} />
          <div className="hp-usage-out" data-ui>
            <p className="hp-usage-label">Result</p>
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

/* ---------- mcp ---------- */

const MCP_JSON = `{
  "mcpServers": {
    "xdev-ui": {
      "command": "node",
      "args": ["node_modules/@xdev-asia/ui/dist/mcp.js"]
    }
  }
}`;

function Mcp() {
  return (
    <section className="hp-sec" id="mcp" aria-labelledby="hp-mcp-h">
      <div className="hp-wrap hp-mcp">
        <div className="hp-mcp-copy">
          <h2 id="hp-mcp-h">Agents read the same catalogue you do</h2>
          <p className="hp-sec-sub">
            The package ships an MCP server. Claude Code, Codex or Cursor ask it for components, exact props, tokens and rules before they write a line, so generated screens use real parts.
          </p>
          <X.CodeBlock language=".mcp.json" code={MCP_JSON} />
          <p className="hp-mcp-alt">
            No MCP client? <a href="./llms.txt">llms.txt</a> and <a href="./ai-manifest.json">ai-manifest.json</a> hold the same content.
          </p>
        </div>
        <ul className="hp-tools" aria-label="MCP tools">
          {MCP_TOOLS.map((t, i) => (
            <li key={t.name} className="hp-tool" data-reveal style={{ ["--i" as string]: i }}>
              <code className="hp-tool-name">{t.name}</code>
              <p>{t.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- closing + footer ---------- */

function Closing() {
  return (
    <section className="hp-wrap hp-close" aria-labelledby="hp-close-h">
      <div className="hp-close-in" data-reveal>
        <X.BrandMark size={40} />
        <h2 id="hp-close-h">Build the next screen with the parts xDev uses.</h2>
        <div className="hp-cta">
          <a className="btn hp-btn" href={SB}>Open Storybook</a>
          <a className="btn-secondary hp-btn" href={`${REPO}#readme`}>Read the README</a>
        </div>
      </div>
    </section>
  );
}

function Footer({ onSearch }: { onSearch: () => void }) {
  return (
    <footer className="hp-foot">
      <div className="hp-wrap hp-foot-in">
        <div className="hp-foot-brand">
          <a className="hp-brand" href="./">
            <X.BrandMark size={22} />
            <span>xdev-ui</span>
          </a>
          <p>The React components, tokens and MCP server behind xDev.</p>
        </div>
        <nav className="hp-foot-col" aria-label="Docs">
          <h3>Docs</h3>
          <a href={SB}>Storybook</a>
          <button type="button" onClick={onSearch}>Search components</button>
          <a href="./llms.txt">llms.txt</a>
          <a href="./ai-manifest.json">ai-manifest.json</a>
        </nav>
        <nav className="hp-foot-col" aria-label="Project">
          <h3>Project</h3>
          <a href={REPO}>GitHub</a>
          <a href={`${REPO}/issues`}>Issues</a>
          <a href={`${REPO}/releases`}>Releases</a>
          <a href={`${REPO}/blob/main/LICENSE`}>Apache-2.0</a>
        </nav>
      </div>
      <div className="hp-wrap hp-foot-base">
        <span>© 2026 xdev-asia</span>
        {VERSION && <span>v{VERSION}</span>}
      </div>
    </footer>
  );
}

/* ---------- page ---------- */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function Home() {
  const [search, setSearch] = useState(false);
  const [theme, setTheme] = useTheme();
  useReveal();
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
  const openSearch = () => setSearch(true);
  return (
    <>
      <Nav theme={theme} onTheme={setTheme} onSearch={openSearch} />
      <main>
        <Hero />
        <Facts />
        <Gallery />
        <Themes />
        <Install />
        <Mcp />
        <Closing />
      </main>
      <Footer onSearch={openSearch} />
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
