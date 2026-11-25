#!/usr/bin/env node
// Layout check: opens every route of a built app in headless Chrome on a set of emulated devices (size, pixel ratio,
// touch, mobile user agent), in light and dark, in each language. Per page it fails on sideways scroll, a hidden current
// tab, content cut off at the right edge and (touch devices) tap targets under 24x24px; text under 12px is a warning.
// Screenshots and report.json land in --out for review. No dependencies: Chrome is driven over the DevTools protocol.
//
//   node scripts/layout-check.mjs --dir dist-examples/admin --routes examples/admin/layout-routes.json
//   node scripts/layout-check.mjs --dir dist-examples/admin --routes examples/admin/layout-routes.json --devices all
//   node scripts/layout-check.mjs --url https://ui.xdev.asia/showcase/admin/ --routes examples/admin/layout-routes.json --devices phone
//
// Options:
//   --dir <built app> (served on a free port) or --url <running app>; --routes <json>; --out <folder> (default layout-report)
//   --devices <list|all>  presets below (default: DEFAULT_DEVICES); --widths 375,768 is the old form: plain widths,
//                         800px tall, no touch, `mobile` below 600px. Both may be given.
//   --themes light,dark   --locales en,vi (default: the routes json)   --only <route name,...>
//   --jobs <n>            pages checked in parallel, each in its own browser context (default: up to 4)
//   --shots all|fail|none (default all)   --shot-scale css|device (css: one image pixel per CSS px; default css)
//   --warn <check,...>    report these checks as warnings instead of failures (ids in CHECKS)
//   --quiet <ms>          how long the DOM must stay unchanged before a page counts as settled (default 350; above the
//                         admin example's 250ms mock latency, so a page without aria-busy still shows its data)
//   --port <CDP port> (default 9330)
// Chrome comes from $CHROME_BIN, else Playwright's headless shell in ~/.cache/ms-playwright, else `google-chrome-stable`,
// `google-chrome`, `chromium` or `chromium-browser` on PATH.
// routes json: { "signIn": true, "storage": { "theme": "acme-theme", "locale": "acme-locale", "reset": ["acme-prefs"] },
//   "locales": ["en", "vi"], "ready": "main", "busy": ".x-spinner", "routes": [{ "name": "home", "hash": "#/" }, { "name": "privacy", "hash": "#/privacy", "public": true }] }
import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { homedir } from "node:os";
import { extname, join, resolve } from "node:path";

// Device presets, CSS px. `mobile` turns on Chrome's mobile viewport (meta viewport, overlay scrollbars, text autosizing)
// and a phone user agent. Tablets are touch without `mobile`: iPadOS Safari asks for desktop sites (it sends a Mac user
// agent) and lays out at the full CSS width, so a tablet here is "desktop page, coarse pointer, no hover".
const IOS_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1";
const ANDROID_UA = "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36";
const DEVICES = {
  "phone-small": { width: 320, height: 568, dpr: 2, mobile: true, touch: true, ua: IOS_UA, platform: "iOS" },
  phone: { width: 390, height: 844, dpr: 3, mobile: true, touch: true, ua: IOS_UA, platform: "iOS" },
  "phone-android": { width: 412, height: 915, dpr: 2.625, mobile: true, touch: true, ua: ANDROID_UA, platform: "Android" },
  tablet: { width: 768, height: 1024, dpr: 2, mobile: false, touch: true },
  "tablet-air": { width: 820, height: 1180, dpr: 2, mobile: false, touch: true },
  laptop: { width: 1024, height: 768, dpr: 1, mobile: false, touch: false },
  desktop: { width: 1440, height: 900, dpr: 1, mobile: false, touch: false },
};
// `pnpm check:layout` without --devices: the narrowest phone, a common phone, a touch tablet and a desktop. CI runs all.
const DEFAULT_DEVICES = ["phone-small", "phone", "tablet", "desktop"];
// Check ids. `fail` ones fail the run unless named in --warn (or WARN_BY_DEFAULT); `warn` ones never do.
const CHECKS = {
  "page-scroll": { level: "fail", text: "page scrolls sideways" },
  "main-scroll": { level: "fail", text: "main scrolls sideways" },
  "tab-hidden": { level: "fail", text: "current tab hidden" },
  "tap-target": { level: "fail", text: "tap targets under 24px" },
  "clipped-right": { level: "fail", text: "content past the right edge" },
  "small-text": { level: "warn", text: "text under 12px" },
  "slow-settle": { level: "warn", text: "page never settled" },
};
const WARN_BY_DEFAULT = [];

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]?.startsWith("--") || all[i + 1] === undefined ? "true" : all[i + 1]]] : acc), []),
);
if (!args.routes || (!args.dir && !args.url)) {
  console.error("usage: node scripts/layout-check.mjs (--dir <built app> | --url <app url>) --routes <routes.json> [--devices phone,tablet|all] [--widths 375,768] [--out layout-report]");
  console.error(`devices: ${Object.keys(DEVICES).join(", ")}`);
  process.exit(2);
}
const list = (v) => (v ? String(v).split(",").map((s) => s.trim()).filter(Boolean) : []);
const spec = JSON.parse(readFileSync(args.routes, "utf8"));
const out = resolve(args.out ?? "layout-report");
const devices = [];
for (const name of args.devices === "all" ? Object.keys(DEVICES) : list(args.devices)) {
  if (!DEVICES[name]) {
    console.error(`unknown device "${name}"; known: ${Object.keys(DEVICES).join(", ")}, all`);
    process.exit(2);
  }
  devices.push({ name, ...DEVICES[name] });
}
// Old --widths: the same emulation as before (800px tall, pixel ratio 1, no touch), named by the width.
for (const w of list(args.widths).map(Number)) devices.push({ name: String(w), width: w, height: 800, dpr: 1, mobile: w < 600, touch: false });
if (!devices.length) for (const name of DEFAULT_DEVICES) devices.push({ name, ...DEVICES[name] });
const themes = list(args.themes ?? "light,dark");
const locales = list(args.locales).length ? list(args.locales) : spec.locales ?? ["en"];
const routes = args.only ? spec.routes.filter((r) => list(args.only).includes(r.name)) : spec.routes;
const warnOnly = new Set([...WARN_BY_DEFAULT, ...list(args.warn)]);
const shots = args.shots ?? "all";
const shotScale = args["shot-scale"] ?? "css";
const quietMs = Number(args.quiet ?? 350);
const ready = spec.ready ?? "main, [role=main]";
// Loading indicators: while one shows, the page is not settled (a CSS spinner changes no DOM, so quiet alone misses it).
const busy = spec.busy ?? '[aria-busy="true"], .x-spinner, .x-skeleton';
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
  for (const name of ["google-chrome-stable", "google-chrome", "chromium", "chromium-browser"]) if (spawnSync("which", [name]).status === 0) return name;
  throw new Error("No Chrome found: set CHROME_BIN");
}
const chromeBin = findChrome();
// Chrome picks a free DevTools port (--port pins one) and writes it to DevToolsActivePort in its profile. A cold start
// on a CI runner can take well over 15 s, so wait up to 60 s, try once more, and show Chrome's own error if both fail.
const profileDir = join(out, ".profile");
async function startChrome() {
  const portFile = join(profileDir, "DevToolsActivePort");
  rmSync(portFile, { force: true });
  let log = "";
  const proc = spawn(chromeBin, [`--remote-debugging-port=${args.port ?? 0}`, "--headless", "--no-sandbox", "--hide-scrollbars", "--disable-dev-shm-usage", "--no-first-run", "--no-default-browser-check", "--mute-audio", `--user-data-dir=${profileDir}`, "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  proc.stderr.on("data", (d) => (log = (log + d).slice(-4000)));
  for (let i = 0; i < 300 && proc.exitCode === null; i++) {
    let port = args.port ? Number(args.port) : 0;
    if (!port) {
      try {
        port = parseInt(readFileSync(portFile, "utf8"), 10) || 0;
      } catch {
        /* not written yet */
      }
    }
    if (port) {
      try {
        return { proc, port, version: await (await fetch(`http://127.0.0.1:${port}/json/version`)).json() };
      } catch {
        /* not listening yet */
      }
    }
    await wait(200);
  }
  proc.kill();
  return { log };
}
let launch = await startChrome();
if (!launch.proc) {
  console.error("Chrome did not start; trying once more");
  launch = await startChrome();
}
if (!launch.proc) throw new Error(`Chrome (${chromeBin}) did not start (on a bare Linux host, set LD_LIBRARY_PATH to its libraries)\n${launch.log}`);
const { proc: chrome, port: cdpPort, version } = launch;

// A DevTools session over one WebSocket: send() resolves with the reply, on() listens to events, once() awaits one.
async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((r, j) => {
    ws.addEventListener("open", r, { once: true });
    ws.addEventListener("error", j, { once: true });
  });
  let n = 0;
  const pending = new Map();
  const listeners = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    } else if (m.method) for (const f of listeners.get(m.method) ?? []) f(m.params);
  });
  const send = (method, params = {}) => new Promise((r) => {
    const k = ++n;
    pending.set(k, r);
    ws.send(JSON.stringify({ id: k, method, params }));
  });
  const on = (method, f) => listeners.set(method, [...(listeners.get(method) ?? []), f]);
  const once = (method, ms = 15000) => new Promise((r) => {
    const f = (p) => {
      listeners.set(method, (listeners.get(method) ?? []).filter((x) => x !== f));
      r(p);
    };
    on(method, f);
    setTimeout(() => f(null), ms);
  });
  return { send, on, once, close: () => ws.close() };
}
const browser = await connect(version.webSocketDebuggerUrl);
const desktopUA = version["User-Agent"].replace("HeadlessChrome", "Chrome");
const chromeMajor = (desktopUA.match(/Chrome\/(\d+)/) ?? [])[1] ?? "140";

// 3. In-page code. `settleState` is polled until the page is quiet; `measure` runs the checks.
const settleState = `(() => {
  if (!window.__lcObs) {
    window.__lcLast = performance.now();
    window.__lcObs = new MutationObserver(() => { window.__lcLast = performance.now(); });
    window.__lcObs.observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
  }
  const busy = [...document.querySelectorAll(${JSON.stringify(busy)})].filter((e) => !e.closest("button") && e.checkVisibility()).length;
  const imgs = [...document.images].filter((i) => !i.complete && i.loading !== "lazy").length;
  return JSON.stringify({ ready: !!document.querySelector(${JSON.stringify(ready)}), busy, imgs, fonts: document.fonts.status, quiet: performance.now() - window.__lcLast, state: document.readyState });
})()`;

const measure = (vw, touch) => `(() => {
  const vw = ${vw}, touch = ${touch};
  const main = document.getElementById("main");
  const strip = document.querySelector(".ws-tabstrip");
  const sel = strip && strip.querySelector('[role="tab"][aria-selected="true"]');
  const s = strip && strip.getBoundingClientRect(), t = sel && sel.getBoundingClientRect();
  const css = new Map();
  const cs = (el) => { let v = css.get(el); if (!v) { v = getComputedStyle(el); css.set(el, v); } return v; };
  const desc = (el) => {
    let d = el.tagName.toLowerCase();
    if (el.id) d += "#" + el.id;
    else if (typeof el.className === "string" && el.className.trim()) d += "." + el.className.trim().split(/\\s+/).slice(0, 2).join(".");
    const name = el.getAttribute("aria-label") || el.getAttribute("title") || (el.textContent || "").trim().replace(/\\s+/g, " ");
    return name ? d + ' "' + name.slice(0, 32) + '"' : d;
  };
  // Shown to a sighted user: rendered, not visibility:hidden or opacity 0, not aria-hidden/inert, not a 1px sr-only box.
  const shownCache = new Map();
  const shown = (el) => {
    if (shownCache.has(el)) return shownCache.get(el);
    let v = el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && !el.closest('[aria-hidden="true"], [inert]');
    if (v) for (let p = el; p && p !== document.body; p = p.parentElement) {
      const r = p.getBoundingClientRect(), c = cs(p);
      if ((r.width <= 1 || r.height <= 1) && (c.overflow !== "visible" || c.position === "absolute")) { v = false; break; }
      if (c.clip && c.clip !== "auto") { v = false; break; }
      if (c.clipPath && /inset\\(\\s*50%/.test(c.clipPath)) { v = false; break; }
    }
    shownCache.set(el, v);
    return v;
  };
  // The right edge beyond which an element's box is not painted: the nearest clipping ancestors (overflow other than
  // visible) that contain it, following absolute and fixed boxes out of their static parents. html/body never count:
  // content they clip is still cut off.
  const clipRight = (el) => {
    let limit = Infinity;
    let mode = cs(el).position;
    for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      const c = cs(p);
      const containsAbs = c.position !== "static" || c.transform !== "none" || c.filter !== "none" || /paint|layout|strict|content/.test(c.contain);
      const containsFixed = c.transform !== "none" || c.filter !== "none" || /paint|layout|strict|content/.test(c.contain);
      const contains = mode === "fixed" ? containsFixed : mode === "absolute" ? containsAbs : true;
      if (contains && c.overflowX !== "visible") limit = Math.min(limit, p.getBoundingClientRect().right);
      if (contains) mode = c.position === "fixed" || c.position === "absolute" ? c.position : "static";
    }
    return limit;
  };

  // (b) Content past the right edge, and (c) text under 12px. Elements and text runs are both checked.
  const past = [];
  const small = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.nodeType === 1 ? n : n.parentElement;
    if (!el || el.closest("script, style, noscript, template")) continue;
    let r;
    if (n.nodeType === 3) {
      if (!n.data.trim()) continue;
      range.selectNodeContents(n);
      r = range.getBoundingClientRect();
    } else r = n.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) continue;
    if (n.nodeType === 3) {
      const size = parseFloat(cs(el).fontSize);
      if (size < 12 && shown(el)) small.push({ el, size, text: n.data.trim().replace(/\\s+/g, " ").slice(0, 32) });
    }
    if (r.right <= vw + 1) continue;
    if (!shown(el)) continue;
    const right = Math.min(r.right, clipRight(n.nodeType === 3 ? el : n));
    if (right > vw + 1) past.push({ node: n, el, right: Math.round(right), left: Math.round(r.left) });
  }
  // Report the outermost offenders only: an element whose ancestor already runs past the edge adds nothing.
  const pastEls = new Set(past.filter((p) => p.node.nodeType === 1).map((p) => p.node));
  const outer = past.filter((p) => { for (let a = (p.node.nodeType === 1 ? p.node.parentElement : p.el); a; a = a.parentElement) if (pastEls.has(a)) return false; return true; });

  // (a) Tap targets (WCAG 2.5.8, touch devices only): at least 24x24px, unless inline in a sentence or spaced so a
  // 24px circle on its centre touches no other target and no other small target's circle.
  const tapSmall = [];
  if (touch) {
    const sel = 'button, a[href], [role="button"], [role="tab"], [role="switch"], [role="checkbox"], [role="radio"], [role="link"], input:not([type="hidden"]), select, summary';
    const targets = [];
    const seen = new Set();
    for (let el of document.querySelectorAll(sel)) {
      if (el.matches(":disabled, [aria-disabled='true']")) continue;
      // A visually hidden native input (custom checkbox, switch, radio) is operated through its label.
      if (el.tagName === "INPUT" && !shown(el) && el.checkVisibility()) el = el.labels?.[0] ?? el.closest("label") ?? el;
      if (seen.has(el) || !shown(el)) continue;
      seen.add(el);
      const r = el.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) continue;
      targets.push({ el, r });
    }
    const inSentence = (el) => {
      if (!cs(el).display.startsWith("inline") || cs(el).display === "inline-block" || cs(el).display === "inline-flex") return false;
      let block = el.parentElement;
      while (block && cs(block).display.startsWith("inline")) block = block.parentElement;
      if (!block) return false;
      const w = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
      for (let x = w.nextNode(); x; x = w.nextNode()) if (x.data.trim() && !el.contains(x)) return true;
      return false;
    };
    // A target covered by another layer where it is now (scrolled under a sticky footer or header) is not tappable
    // there at this scroll position. Hit-test the point that matters; points outside the viewport count as reachable.
    const hitAt = (el, x, y) => {
      if (x < 0 || y < 0 || x >= vw || y >= innerHeight) return true;
      const hit = document.elementFromPoint(x, y);
      return !hit || el.contains(hit);
    };
    const nearest = (x, y, r) => [Math.min(Math.max(x, r.left + 0.5), r.right - 0.5), Math.min(Math.max(y, r.top + 0.5), r.bottom - 0.5)];
    const under = targets
      .filter(({ r }) => r.width < 23.5 || r.height < 23.5)
      .filter(({ el }) => !inSentence(el))
      .filter(({ el, r }) => hitAt(el, r.left + r.width / 2, r.top + r.height / 2));
    const nested = (a, b) => a.contains(b) || b.contains(a);
    const dist = (x, y, r) => Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));
    for (const u of under) {
      const cx = u.r.left + u.r.width / 2, cy = u.r.top + u.r.height / 2;
      const near = targets.find((o) => o !== u && !nested(o.el, u.el) && dist(cx, cy, o.r) < 12 && hitAt(o.el, ...nearest(cx, cy, o.r))) ??
        under.find((o) => o !== u && !nested(o.el, u.el) && Math.hypot(cx - (o.r.left + o.r.width / 2), cy - (o.r.top + o.r.height / 2)) < 24);
      if (near) tapSmall.push({ ...u, near: near.el });
    }
  }

  return JSON.stringify({
    pageScrollsSideways: document.documentElement.scrollWidth > vw,
    mainScrollsSideways: !!main && main.scrollWidth > main.clientWidth,
    currentTabHidden: !!sel && (t.left < s.left - 1 || t.right > s.right + 1),
    tab: sel ? { tab: [Math.round(t.left), Math.round(t.right)], strip: [Math.round(s.left), Math.round(s.right)], scrollLeft: Math.round(strip.scrollLeft) } : null,
    tapTargets: { count: tapSmall.length, first: tapSmall.slice(0, 5).map(({ el, r, near }) => desc(el) + " " + Math.round(r.width) + "x" + Math.round(r.height) + " near " + desc(near)) },
    clippedRight: { count: outer.length, first: outer.slice(0, 5).map((p) => (p.node.nodeType === 3 ? 'text "' + p.node.data.trim().slice(0, 32) + '" in ' + desc(p.el) : desc(p.node)) + " right " + p.right) },
    smallText: { count: small.length, first: small.slice(0, 5).map((x) => x.size + 'px "' + x.text + '" in ' + desc(x.el)) },
    pointer: matchMedia("(pointer: coarse)").matches ? "coarse" : "fine",
    innerWidth,
    title: document.querySelector("h1")?.textContent?.trim() ?? null,
  });
})()`;

// 4. One worker per browser context: each takes a (device, theme, locale), sets the preferences, reloads (that signs
// out), signs in and visits every route.
const until = `const until = async (f, ms = 15000) => { const t0 = Date.now(); while (!f() && Date.now() - t0 < ms) await new Promise((r) => setTimeout(r, 50)); return f(); };`;
const store = spec.storage ?? {};
const queue = devices.flatMap((device) => themes.flatMap((theme) => locales.map((locale) => ({ device, theme, locale }))));
const results = [];
const started = Date.now();

async function worker() {
  const { browserContextId } = (await browser.send("Target.createBrowserContext")).result;
  const { targetId } = (await browser.send("Target.createTarget", { url: "about:blank", browserContextId })).result;
  const cdp = await connect(`ws://127.0.0.1:${cdpPort}/devtools/page/${targetId}`);
  const run = async (expression, ms = 30000) => {
    const r = await Promise.race([cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }), wait(ms).then(() => null)]);
    return r?.result?.result?.value;
  };
  // Network idle: requests in flight, ignoring ones open for over 3s (streams, slow third-party frames).
  const inflight = new Map();
  let lastNet = 0;
  cdp.on("Network.requestWillBeSent", (p) => {
    if (!/^(data|blob):/.test(p.request.url)) inflight.set(p.requestId, Date.now());
    lastNet = Date.now();
  });
  const done = (p) => {
    inflight.delete(p.requestId);
    lastNet = Date.now();
  };
  cdp.on("Network.loadingFinished", done);
  cdp.on("Network.loadingFailed", done);
  await Promise.all(["Page.enable", "Runtime.enable", "Network.enable"].map((m) => cdp.send(m)));
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  // Quiet = the ready selector is there, no loading indicator shows, fonts and images are in, no request for 100ms and no DOM
  // change for --quiet ms. Capped at 8s; a page that never settles is checked anyway and reported.
  const settle = async (cap = 8000) => {
    const t0 = Date.now();
    for (;;) {
      const s = JSON.parse((await run(settleState, 5000)) ?? "null");
      const net = [...inflight.values()].filter((t) => Date.now() - t < 3000).length === 0 && Date.now() - lastNet >= 100;
      if (s && s.state === "complete" && s.ready && !s.busy && !s.imgs && s.fonts === "loaded" && s.quiet >= quietMs && net) return { ms: Date.now() - t0, timedOut: false };
      if (Date.now() - t0 > cap) return { ms: Date.now() - t0, timedOut: true };
      await wait(50);
    }
  };

  for (let job = queue.shift(); job; job = queue.shift()) {
    const { device, theme, locale } = job;
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: device.width, height: device.height, deviceScaleFactor: device.dpr, mobile: device.mobile, screenWidth: device.width, screenHeight: device.height });
    await cdp.send("Emulation.setTouchEmulationEnabled", device.touch ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
    await cdp.send(
      "Emulation.setUserAgentOverride",
      device.ua
        ? { userAgent: device.ua, platform: device.platform === "iOS" ? "iPhone" : "Linux armv8l", userAgentMetadata: { brands: [{ brand: "Chromium", version: chromeMajor }], platform: device.platform, platformVersion: "", architecture: "arm", model: "", mobile: true } }
        : { userAgent: desktopUA },
    );
    const loaded = cdp.once("Page.loadEventFired");
    await cdp.send("Page.navigate", { url: base });
    await loaded;
    const set = [
      store.theme && `localStorage.setItem(${JSON.stringify(store.theme)}, ${JSON.stringify(theme)})`,
      store.locale && `localStorage.setItem(${JSON.stringify(store.locale)}, ${JSON.stringify(locale)})`,
      ...(store.reset ?? []).flatMap((k) => [`localStorage.removeItem(${JSON.stringify(k)})`, `sessionStorage.removeItem(${JSON.stringify(k)})`]),
    ].filter(Boolean).join(";");
    await run(`(() => { ${set}; return 1; })()`);
    const reloaded = cdp.once("Page.loadEventFired");
    await cdp.send("Page.reload", { ignoreCache: false });
    await reloaded;
    // Web fonts load per unicode-range subset on first use (Vietnamese diacritics, bold weights), so a page could
    // render in a fallback font and swap after the app measured itself: a network race, not layout. Load every
    // declared face up front so each page renders in its final fonts.
    await run(`(async () => { await document.fonts.ready; await Promise.all([...document.fonts].map((f) => f.load().catch(() => null))); return 1; })()`, 20000);
    if (spec.signIn) await run(`(async () => { ${until} await until(() => document.querySelector("form button[type=submit]")); document.querySelector("form button[type=submit]")?.click(); await until(() => document.querySelector(".x-shell")); return 1; })()`);
    for (const route of routes) {
      await run(`(() => { location.hash = ${JSON.stringify(route.hash)}; window.__lcLast = performance.now(); return 1; })()`);
      const settled = await settle();
      const m = JSON.parse((await run(measure(device.width, device.touch))) ?? "{}");
      const name = `${route.name}-${device.name}-${theme}-${locale}`;
      const found = {
        "page-scroll": m.pageScrollsSideways,
        "main-scroll": m.mainScrollsSideways,
        "tab-hidden": m.currentTabHidden && `${CHECKS["tab-hidden"].text} (tab ${m.tab.tab.join("-")}, strip ${m.tab.strip.join("-")})`,
        "tap-target": m.tapTargets?.count > 0 && `${CHECKS["tap-target"].text} (${m.tapTargets.count}): ${m.tapTargets.first.join("; ")}`,
        "clipped-right": m.clippedRight?.count > 0 && `${CHECKS["clipped-right"].text} (${m.clippedRight.count}): ${m.clippedRight.first.join("; ")}`,
        "small-text": m.smallText?.count > 0 && `${CHECKS["small-text"].text} (${m.smallText.count})`,
        "slow-settle": settled.timedOut && `${CHECKS["slow-settle"].text} in ${settled.ms}ms`,
      };
      const problems = [];
      const warnings = [];
      for (const [check, hit] of Object.entries(found)) {
        if (!hit) continue;
        const text = typeof hit === "string" ? hit : CHECKS[check].text;
        (CHECKS[check].level === "fail" && !warnOnly.has(check) ? problems : warnings).push(text);
      }
      if (shots === "all" || (shots === "fail" && problems.length)) {
        const scale = shotScale === "device" ? 1 : 1 / device.dpr;
        const shot = await cdp.send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: device.width, height: device.height, scale } });
        if (shot.result?.data) writeFileSync(join(out, `${name}.png`), Buffer.from(shot.result.data, "base64"));
      }
      results.push({ name, route: route.hash, device: device.name, width: device.width, height: device.height, dpr: device.dpr, touch: device.touch, theme, locale, settleMs: settled.ms, ...m, problems, warnings });
      const tag = problems.length ? "FAIL" : warnings.length ? "warn" : "ok  ";
      const notes = [...problems, ...warnings.map((w) => `(warn) ${w}`)];
      console.log(`${tag} ${name}${notes.length ? ": " + notes.join(" | ") : ""}`);
    }
  }
  cdp.close();
  await browser.send("Target.disposeBrowserContext", { browserContextId });
}

const jobs = Math.max(1, Math.min(Number(args.jobs ?? 4), queue.length));
console.log(`${chromeBin}\n${devices.map((d) => d.name).join(", ")} x ${themes.join("/")} x ${locales.join("/")} x ${routes.length} routes, ${jobs} in parallel\n`);
try {
  await Promise.all(Array.from({ length: jobs }, worker));
} finally {
  browser.close();
  chrome.kill();
  server?.close();
}

// 5. Report: report.json (one entry per page), a per-device summary on stdout and in the GitHub job summary.
results.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(join(out, "report.json"), JSON.stringify(results, null, 2));
const rows = devices.map((d) => {
  const rs = results.filter((r) => r.device === d.name);
  const count = (f) => rs.filter(f).length;
  return {
    device: d.name,
    size: `${d.width}x${d.height}@${d.dpr}${d.touch ? " touch" : ""}`,
    pages: rs.length,
    failed: count((r) => r.problems.length),
    warned: count((r) => r.warnings.length),
    tap: count((r) => r.tapTargets?.count),
    clipped: count((r) => r.clippedRight?.count),
    smallText: count((r) => r.smallText?.count),
    settleMs: rs.length ? Math.round(rs.reduce((a, r) => a + r.settleMs, 0) / rs.length) : 0,
  };
});
console.log("");
console.table(rows);
const failed = results.filter((r) => r.problems.length);
const warned = results.filter((r) => r.warnings.length);
const seconds = Math.round((Date.now() - started) / 1000);
console.log(`${results.length} pages, ${failed.length} failed, ${warned.length} with warnings, ${seconds}s. Screenshots and report.json in ${out}`);
if (process.env.GITHUB_STEP_SUMMARY) {
  const md = [
    `### Layout check: ${failed.length ? `${failed.length} failed` : "passed"}`,
    "",
    "| device | size | pages | failed | warned | small tap targets | past right edge | text < 12px | avg settle ms |",
    "|---|---|---|---|---|---|---|---|---|",
    ...rows.map((r) => `| ${r.device} | ${r.size} | ${r.pages} | ${r.failed} | ${r.warned} | ${r.tap} | ${r.clipped} | ${r.smallText} | ${r.settleMs} |`),
    "",
    ...failed.slice(0, 30).map((r) => `- **${r.name}**: ${r.problems.join("; ")}`),
    "",
  ];
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, md.join("\n"));
}
process.exit(failed.length ? 1 : 0);
