// Writes the static logo v12 files in assets/brand. The geometry is the same as in
// src/components/BrandMark/BrandMark.tsx; BrandMark.test.tsx fails when the two drift apart.
// Usage: node scripts/build-brand.mjs   (then render the PNGs, see docs/brand.md)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "../assets/brand");
for (const dir of ["", "systems", "mobile"]) mkdirSync(join(out, dir), { recursive: true });

const ORANGE = "#ff7a3d";

// ---- geometry on a 1024 grid -------------------------------------------------
const YOU = "M185 232H335L575 512L335 792H185L425 512Z";
const YOU_UPPER = "M185 232H335L575 512H425Z";
const YOU_LOWER = "M425 512H575L335 792H185Z";
const AGENT = "M839 232H689L449 512L689 792H839L599 512Z";
const AGENT_UPPER = "M839 232H689L449 512H599Z";
const AGENT_LOWER = "M599 512H449L689 792H839Z";
const CORE = "M512 438.5L575 512L512 585.5L449 512Z";
const SUB_SHIFT = "translate(-20 0)";
const SHAPE_FIT = "translate(735 512) scale(1.15) translate(-725 -512)";

// What stands in for the agent blade in a sub-system mark. Shapes inherit their fill.
// This package is public: a system is added here only once it is public too.
const SHAPE = {
  cleaner: `<path d="M722 527V412A115 115 0 1 0 837 527Z"/><path d="M744 505V390A115 115 0 0 1 859 505Z" opacity=".78"/>`,
  ui: `<rect x="608" y="391" width="110" height="110" rx="28"/><rect x="740" y="391" width="110" height="110" rx="28" opacity=".72"/><rect x="608" y="523" width="110" height="110" rx="28" opacity=".72"/><rect x="740" y="523" width="110" height="110" rx="28" opacity=".46"/>`,
};
const NAME = {
  xdev: ["xDev", ""],
  cleaner: ["Cleaner", "for xDev"],
  ui: ["xDev", "UI"],
};
const shape = (key, fill) => `<g transform="${SHAPE_FIT}" fill="${fill}">${SHAPE[key]}</g>`;

// ---- paints ------------------------------------------------------------------
const PAINT_MARK = `
    <linearGradient id="youUpper" x1="0" y1="232" x2="0" y2="512" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#b9cfff"/><stop offset="1" stop-color="#4f84ff"/></linearGradient>
    <linearGradient id="youLower" x1="0" y1="512" x2="0" y2="792" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2f62e6"/><stop offset="1" stop-color="#1a3db3"/></linearGradient>
    <linearGradient id="agentUpper" x1="0" y1="232" x2="0" y2="512" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffc9a3"/><stop offset="1" stop-color="#ff8a4f"/></linearGradient>
    <linearGradient id="agentLower" x1="0" y1="512" x2="0" y2="792" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${ORANGE}"/><stop offset="1" stop-color="#d94e14"/></linearGradient>
    <linearGradient id="shape" x1="0" y1="322" x2="0" y2="702" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffc9a3"/><stop offset=".5" stop-color="${ORANGE}"/><stop offset="1" stop-color="#d94e14"/></linearGradient>
    <linearGradient id="core" x1="0" y1="438" x2="0" y2="586" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ffe2cc"/></linearGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="34"/></filter>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>`;
const PAINT_GROUND = `
    <linearGradient id="base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#171d33"/><stop offset="1" stop-color="#06080e"/></linearGradient>
    <radialGradient id="glowYou" cx="330" cy="512" r="430" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2f62e6" stop-opacity=".6"/><stop offset="1" stop-color="#2f62e6" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowAgent" cx="700" cy="512" r="400" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${ORANGE}" stop-opacity=".42"/><stop offset="1" stop-color="${ORANGE}" stop-opacity="0"/></radialGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".35" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#fff" stop-opacity=".08"/></linearGradient>
    <linearGradient id="blue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b8dff"/><stop offset="1" stop-color="#1535a8"/></linearGradient>
    <linearGradient id="whiteUpper" x1="0" y1="232" x2="0" y2="512" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#dfe8ff"/></linearGradient>
    <linearGradient id="whiteLower" x1="0" y1="512" x2="0" y2="792" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#c3d3ff"/><stop offset="1" stop-color="#9fb7fb"/></linearGradient>
    <clipPath id="clip"><rect width="1024" height="1024" rx="230"/></clipPath>`;

// ---- pieces ------------------------------------------------------------------
/** The mark with light: blades lit from above, a bright core. `white` is for the blue ground. */
const lit = (key, { shadow = true, white = false } = {}) => {
  const sh = (inner) => (shadow ? `<g opacity="${white ? 0.4 : 0.55}" filter="url(#shadow)" transform="translate(0 22)" fill="${white ? "#061040" : "#000"}">${inner}</g>` : "");
  const you = `<path d="${YOU_UPPER}" fill="url(#${white ? "whiteUpper" : "youUpper"})"/><path d="${YOU_LOWER}" fill="url(#${white ? "whiteLower" : "youLower"})"/>`;
  if (key === "xdev") {
    return `${sh(`<path d="${YOU} ${AGENT}"/>`)}${you}<path d="${AGENT_UPPER}" fill="url(#agentUpper)"/><path d="${AGENT_LOWER}" fill="url(#agentLower)"/><path d="${CORE}" fill="#fff" filter="url(#soft)" opacity=".95"/><path d="${CORE}" fill="url(#core)"/>`;
  }
  return `<g transform="${SUB_SHIFT}">${sh(`<path d="${YOU}"/><g transform="${SHAPE_FIT}">${SHAPE[key]}</g>`)}${you}${shape(key, "url(#shape)")}</g>`;
};
/** The flat mark: no light, your blade in `you`. */
const flat = (key, you, agent = ORANGE, core = "#fff") =>
  key === "xdev"
    ? `<path d="${YOU}" fill="${you}"/><path d="${AGENT}" fill="${agent}"/><path d="${CORE}" fill="${core}"/>`
    : `<g transform="${SUB_SHIFT}"><path d="${YOU}" fill="${you}"/>${shape(key, agent)}</g>`;
const darkGround = (bleed) =>
  bleed
    ? `<rect width="1024" height="1024" fill="url(#base)"/><rect width="1024" height="1024" fill="url(#glowYou)"/><rect width="1024" height="1024" fill="url(#glowAgent)"/>`
    : `<g clip-path="url(#clip)"><rect width="1024" height="1024" fill="url(#base)"/><rect width="1024" height="1024" fill="url(#glowYou)"/><rect width="1024" height="1024" fill="url(#glowAgent)"/></g>\n  <rect x="4" y="4" width="1016" height="1016" rx="226" fill="none" stroke="url(#rim)" stroke-width="8"/>`;
const blueGround = (bleed) =>
  bleed
    ? `<rect width="1024" height="1024" fill="url(#blue)"/><rect width="1024" height="1024" fill="url(#glowAgent)"/>`
    : `<g clip-path="url(#clip)"><rect width="1024" height="1024" fill="url(#blue)"/><rect width="1024" height="1024" fill="url(#glowAgent)"/></g>\n  <rect x="4" y="4" width="1016" height="1016" rx="226" fill="none" stroke="url(#rim)" stroke-width="8"/>`;
const defs = (...paints) => `<defs>${paints.join("")}\n  </defs>`;
const icon = (key, { blue = false, bleed = false } = {}) =>
  `${defs(PAINT_GROUND, PAINT_MARK)}\n  ${blue ? blueGround(bleed) : darkGround(bleed)}\n  ${lit(key, { white: blue })}`;
const svg = (inner, { size = 1024, viewBox = "0 0 1024 1024" } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}">\n  ${inner}\n</svg>\n`;
const MARK_BOX = "162 162 700 700";
/** Scales a 1024 drawing about its centre. */
const scaled = (inner, k) => `<g transform="translate(512 512) scale(${k}) translate(-512 -512)">${inner}</g>`;

const lockup = (key, dark) => {
  const [lead, rest] = NAME[key];
  const ink = dark ? "#f4f5f8" : "#111114";
  const muted = dark ? "#9aa8c7" : "#5c5c66";
  const width = 40 + 15 * (lead.length + (rest ? rest.length + 1 : 0)) + 12;
  const name = [lead, rest].filter(Boolean).join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="32" viewBox="0 0 ${width} 32" role="img" aria-label="${name}">\n  <svg width="32" height="32" viewBox="0 0 1024 1024">${icon(key)}</svg>\n  <text x="40" y="24" font-family="'Be Vietnam Pro', 'Segoe UI', sans-serif" font-size="25" letter-spacing="-0.8"><tspan fill="${ink}" font-weight="800">${lead}</tspan>${rest ? `<tspan fill="${muted}" font-weight="500" dx="6">${rest}</tspan>` : ""}</text>\n</svg>\n`;
};

// ---- files -------------------------------------------------------------------
const write = (file, text) => writeFileSync(join(out, file), text);

for (const key of Object.keys(NAME)) {
  const base = key === "xdev" ? "xdev" : `systems/xdev-${key}`;
  write(`${base}-icon.svg`, svg(icon(key)));
  write(`${base}-mark.svg`, svg(flat(key, "currentColor"), { size: 24, viewBox: MARK_BOX }));
  write(`${base}-mark-lit.svg`, svg(`${defs(PAINT_MARK)}\n  ${lit(key, { shadow: false })}`, { size: 512, viewBox: MARK_BOX }));
  write(`${base}-lockup-light.svg`, lockup(key, false));
  write(`${base}-lockup-dark.svg`, lockup(key, true));
}
write("xdev-icon-blue.svg", svg(icon("xdev", { blue: true })));
// Flat tile for 16 to 32 px: no light effects.
write("xdev-mark-tile.svg", svg(`<rect width="1024" height="1024" rx="224" fill="#0d1220"/>${flat("xdev", "#5b8cff")}`, { size: 32 }));

// Mobile: iOS takes a full-bleed square (the OS rounds it); Android takes an adaptive icon in three layers,
// with the mark inside the safe zone.
write("mobile/ios-icon.svg", svg(icon("xdev", { blue: true, bleed: true })));
write("mobile/ios-icon-dark.svg", svg(icon("xdev", { bleed: true })));
write("mobile/android-background.svg", svg(`${defs(PAINT_GROUND)}\n  ${darkGround(true)}`));
write("mobile/android-foreground.svg", svg(`${defs(PAINT_MARK)}\n  ${scaled(lit("xdev"), 0.72)}`));
write("mobile/android-monochrome.svg", svg(scaled(`<path d="${YOU} ${AGENT}" fill="#000"/>`, 0.72)));

console.log(`brand: wrote the logo v12 files to ${out}`);
