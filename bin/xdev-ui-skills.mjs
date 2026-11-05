#!/usr/bin/env node
// Installs the agent skills of @xdev-asia/ui and scaffolds apps from their templates. Offline: node:fs only.
//   xdev-ui-skills list
//   xdev-ui-skills install [--claude | --codex | --cursor | --dir <path>] [--user] [--skill <name>]... [--force] [--dry-run]
//   xdev-ui-skills create <app|admin> <dir> [--force]
// Exit codes: 0 ok, 1 refused (target exists), 2 usage error.
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SKILLS = fileURLToPath(new URL("../skills/", import.meta.url));
const DOTFILES = { _npmrc: ".npmrc", _gitignore: ".gitignore", "_mcp.json": ".mcp.json" };
const KINDS = { app: "xdev-ui-build-app", admin: "xdev-ui-admin" };

const USAGE = `usage:
  xdev-ui-skills list
  xdev-ui-skills install [--claude | --codex | --cursor | --dir <path>] [--user] [--skill <name>]... [--force] [--dry-run]
  xdev-ui-skills create <app|admin> <dir> [--force]`;

class Usage extends Error {}
class Refused extends Error {}

const skillNames = () =>
  existsSync(SKILLS) ? readdirSync(SKILLS).filter((n) => existsSync(join(SKILLS, n, "SKILL.md"))).sort() : [];

function files(dir) {
  return readdirSync(dir).sort().flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

function description(name) {
  const m = /^description:\s*"?(.*?)"?\s*$/m.exec(readFileSync(join(SKILLS, name, "SKILL.md"), "utf8"));
  return m ? m[1] : "";
}

function parse(argv, spec) {
  const opts = { skills: [] };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      rest.push(a);
      continue;
    }
    const flag = a.slice(2);
    if (!(flag in spec)) throw new Usage(`unknown flag ${a}`);
    if (spec[flag] === "value") {
      const v = argv[++i];
      if (!v || v.startsWith("--")) throw new Usage(`${a} needs a value`);
      if (flag === "skill") opts.skills.push(v);
      else opts[flag] = v;
    } else opts[flag] = true;
  }
  return { opts, rest };
}

function copyTree(from, to, { rename = false, dry = false, log }) {
  for (const f of files(from)) {
    const rel = relative(from, f);
    const parts = rel.split(/[\\/]/);
    if (rename && parts.length === 1 && DOTFILES[parts[0]]) parts[0] = DOTFILES[parts[0]];
    const dest = join(to, ...parts);
    log(dest);
    if (dry) continue;
    mkdirSync(join(dest, ".."), { recursive: true });
    copyFileSync(f, dest);
  }
}

function install(argv) {
  const { opts } = parse(argv, { claude: "flag", codex: "flag", cursor: "flag", dir: "value", user: "flag", skill: "value", force: "flag", "dry-run": "flag" });
  const targets = ["claude", "codex", "cursor", "dir"].filter((k) => opts[k]);
  if (targets.length > 1) throw new Usage(`choose one of --claude, --codex, --cursor, --dir`);
  if (opts.dir && opts.user) throw new Usage("--dir cannot be combined with --user");
  const all = skillNames();
  for (const s of opts.skills) if (!all.includes(s)) throw new Usage(`unknown skill ${s}; available: ${all.join(", ")}`);
  const chosen = opts.skills.length ? [...new Set(opts.skills)] : all;
  const base = opts.dir ? resolve(opts.dir) : join(opts.user ? homedir() : process.cwd(), opts.codex || opts.cursor ? ".agents/skills" : ".claude/skills");
  if (!opts.force) {
    const taken = chosen.filter((n) => existsSync(join(base, n)));
    if (taken.length) throw new Refused(`${taken.map((n) => join(base, n)).join(", ")} already exists. Pass --force to replace it.`);
  }
  for (const n of chosen) {
    const to = join(base, n);
    if (opts.force && !opts["dry-run"]) rmSync(to, { recursive: true, force: true });
    copyTree(join(SKILLS, n), to, { dry: opts["dry-run"], log: (p) => console.log(opts["dry-run"] ? `would write ${p}` : p) });
  }
}

function ownVersion() {
  try {
    const v = JSON.parse(readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8")).version;
    return /^\d+\.\d+\.\d+$/.test(v) ? v : null;
  } catch {
    return null;
  }
}

function create(argv) {
  const { opts, rest } = parse(argv, { force: "flag" });
  const [kind, dir] = rest;
  if (!KINDS[kind]) throw new Usage(`create needs app or admin${kind ? `, not ${kind}` : ""}`);
  if (!dir) throw new Usage("create needs a folder");
  const out = resolve(dir);
  if (existsSync(out) && readdirSync(out).length && !opts.force) throw new Refused(`${out} is not empty. Pass --force to write into it.`);
  copyTree(join(SKILLS, KINDS[kind], "templates", kind), out, { rename: true, log: () => {} });
  const pkgPath = join(out, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  // Pin the UI package to the release that ships these templates; a dev checkout (0.0.0-development) keeps the template value.
  const own = ownVersion();
  if (own && pkg.dependencies?.["@xdev-asia/ui"]) pkg.dependencies["@xdev-asia/ui"] = `^${own}`;
  pkg.name = basename(out).toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^[-.]+/, "") || pkg.name;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`created ${out}\nnext: cd ${dir} && pnpm install && pnpm dev`);
}

function main(argv) {
  const [cmd, ...rest] = argv;
  if (cmd === "list") {
    parse(rest, {});
    for (const n of skillNames()) console.log(`${n}: ${description(n)}`);
  } else if (cmd === "install") install(rest);
  else if (cmd === "create") create(rest);
  else throw new Usage(cmd ? `unknown command ${cmd}` : "missing command");
}

try {
  main(process.argv.slice(2));
} catch (e) {
  if (e instanceof Usage) {
    console.error(`xdev-ui-skills: ${e.message}\n${USAGE}`);
    process.exit(2);
  }
  if (e instanceof Refused) {
    console.error(`xdev-ui-skills: ${e.message}`);
    process.exit(1);
  }
  throw e;
}
