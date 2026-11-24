#!/usr/bin/env node
// Layout check: opens every route of a built app in headless Chrome at phone and tablet widths, in light and dark,
// in each language, and fails when a page scrolls sideways or the current page tab is hidden. Screenshots and a JSON
// report land in --out for review. No dependencies: Chrome is driven over the DevTools protocol.
//
//   node scripts/layout-check.mjs --dir dist-examples/admin --routes examples/admin/layout-routes.json
//   node scripts/layout-check.mjs --url https://ui.xdev.asia/showcase/admin/ --routes examples/admin/layout-routes.json
//
// Options: --dir <built app> (served on a free port) or --url <running app>; --routes <json>; --out <folder>
// (default layout-report); --widths 375,768; --port <CDP port> (default 9330). Chrome comes from $CHROME_BIN, else
// Playwright's headless shell in ~/.cache/ms-playwright, else `chromium` / `google-chrome` on PATH.
// routes json: { "signIn": true, "storage": { "theme": "acme-theme", "locale": "acme-locale", "reset": ["acme-prefs"] },
//   "locales": ["en", "vi"], "routes": [{ "name": "home", "hash": "#/" }, { "name": "privacy", "hash": "#/privacy", "public": true }] }
import { spawn, spawnSync } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { homedir } from "node:os";
import { extname, join, resolve } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]?.startsWith("--") || all[i + 1] === undefined ? "true" : all[i + 1]]] : acc), []),
);
if (!args.routes || (!args.dir && !args.url)) {
  console.error("usage: node scripts/layout-check.mjs (--dir <built app> | --url <app url>) --routes <routes.json> [--out layout-report] [--widths 375,768]");
  process.exit(2);
}
const spec = JSON.parse(readFileSync(args.routes, "utf8"));
const out = resolve(args.out ?? "layout-report");
const widths = (args.widths ?? "375,768").split(",").map(Number);
const locales = spec.locales ?? ["en"];
const cdpPort = Number(args.port ?? 9330);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(out, { recursive: true });

// 1. The app: serve a built folder, or use the given URL.
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".woff2": "font/woff2", ".ico": "image/x-icon" };
let server;
let base = args.url;
if (args.dir) {
  const root = resolve(args.dir);
  server = createServer((req, res) => {
    const path = decodeURIComponent((req.url ?? "/").split("?")[0]);
    let file = join(root, path);
    if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) file = join(root, "index.html");
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream", "cache-control": "no-store" });
    createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}/`;
}

// 2. Chrome.
function findChrome() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  const cache = join(homedir(), ".cache/ms-playwright");
  if (existsSync(cache)) {
    for (const d of readdirSync(cache).filter((d) => d.startsWith("chromium_headless_shell")).sort().reverse()) {
      const bin = join(cache, d, "chrome-headless-shell-linux64/chrome-headless-shell");
      if (existsSync(bin)) return bin;
    }
  }
  for (const name of ["chromium", "chromium-browser", "google-chrome"]) if (spawnSync("which", [name]).status === 0) return name;
  throw new Error("No Chrome found: set CHROME_BIN");
}
const chrome = spawn(findChrome(), [`--remote-debugging-port=${cdpPort}`, "--headless", "--no-sandbox", "--hide-scrollbars", `--user-data-dir=${join(out, ".profile")}`, "about:blank"], { stdio: "ignore" });
let targets = [];
for (let i = 0; i < 50 && !targets.some((t) => t.type === "page"); i++) {
  try {
    targets = await (await fetch(`http://127.0.0.1:${cdpPort}/json`)).json();
  } catch {
    /* not up yet */
  }
  await wait(200);
}
const page = targets.find((t) => t.type === "page");
if (!page) throw new Error("Chrome did not start (on a bare Linux host, set LD_LIBRARY_PATH to its libraries)");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
});
const send = (method, params = {}) => new Promise((r) => {
  const n = ++id;
  pending.set(n, r);
  ws.send(JSON.stringify({ id: n, method, params }));
});
const run = async (expression) => {
  const r = await Promise.race([send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }), wait(30000).then(() => null)]);
  return r?.result?.result?.value;
};
await send("Page.enable");
await send("Runtime.enable");

// 3. Each width × theme × locale: set the preferences, reload (that signs out), sign in, visit every route.
const until = `const until = async (f, ms = 15000) => { const t0 = Date.now(); while (!f() && Date.now() - t0 < ms) await new Promise((r) => setTimeout(r, 200)); return f(); };`;
const measure = `(() => {
  const vw = innerWidth;
  const main = document.getElementById("main");
  const strip = document.querySelector(".ws-tabstrip");
  const sel = strip && strip.querySelector('[role="tab"][aria-selected="true"]');
  const s = strip && strip.getBoundingClientRect(), t = sel && sel.getBoundingClientRect();
  return JSON.stringify({
    pageScrollsSideways: document.documentElement.scrollWidth > vw,
    mainScrollsSideways: !!main && main.scrollWidth > main.clientWidth,
    currentTabHidden: !!sel && (t.left < s.left - 1 || t.right > s.right + 1),
    title: document.querySelector("h1")?.textContent?.trim() ?? null,
  });
})()`;
const results = [];
const store = spec.storage ?? {};
for (const width of widths) {
  for (const theme of ["light", "dark"]) {
    for (const locale of locales) {
      await send("Emulation.setDeviceMetricsOverride", { width, height: 800, deviceScaleFactor: 1, mobile: width < 600 });
      await send("Page.navigate", { url: base });
      await wait(1500);
      const set = [store.theme && `localStorage.setItem(${JSON.stringify(store.theme)}, ${JSON.stringify(theme)})`, store.locale && `localStorage.setItem(${JSON.stringify(store.locale)}, ${JSON.stringify(locale)})`, ...(store.reset ?? []).map((k) => `localStorage.removeItem(${JSON.stringify(k)})`)].filter(Boolean).join(";");
      await run(`(() => { ${set}; location.reload(); return 1; })()`);
      await wait(1500);
      if (spec.signIn) await run(`(async () => { ${until} await until(() => document.querySelector("form button[type=submit]")); document.querySelector("form button[type=submit]")?.click(); await until(() => document.querySelector(".x-shell")); return 1; })()`);
      for (const route of spec.routes) {
        await run(`(() => { location.hash = ${JSON.stringify(route.hash)}; return 1; })()`);
        await wait(1500);
        const m = JSON.parse((await run(measure)) ?? "{}");
        const name = `${route.name}-${width}-${theme}-${locale}`;
        const shot = await send("Page.captureScreenshot", { format: "png" });
        writeFileSync(join(out, `${name}.png`), Buffer.from(shot.result.data, "base64"));
        const problems = [m.pageScrollsSideways && "page scrolls sideways", m.mainScrollsSideways && "main scrolls sideways", m.currentTabHidden && "current tab hidden"].filter(Boolean);
        results.push({ name, route: route.hash, width, theme, locale, ...m, problems });
        console.log(`${problems.length ? "FAIL" : "ok  "} ${name}${problems.length ? ": " + problems.join(", ") : ""}`);
      }
    }
  }
}

ws.close();
chrome.kill();
server?.close();
writeFileSync(join(out, "report.json"), JSON.stringify(results, null, 2));
const failed = results.filter((r) => r.problems.length);
console.log(`\n${results.length} checks, ${failed.length} failed. Screenshots and report.json in ${out}`);
process.exit(failed.length ? 1 : 0);
