import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { Banner, Button, Card, PageHeader, Segmented, Select, Spinner, type ThemePreference } from "@xdev-asia/ui";
import { inFrame, shareSession, type Session } from "../auth/session";
import type { Role } from "../data/seed";
import { useI18n, type Translate } from "../i18n";
import { initialParam, queryOf, replaceQuery } from "../router";
import { leaves, navFor, type NavLeaf, type NavNode } from "../shell/nav";

/** The three screens, at their CSS sizes in portrait. Phones and tablets turn; a desktop screen does not. */
export const DEVICES = [
  { id: "phone", label: "devices.phone", width: 390, height: 844, turns: true },
  { id: "tablet", label: "devices.tablet", width: 768, height: 1024, turns: true },
  { id: "desktop", label: "devices.desktop", width: 1440, height: 900, turns: false },
] as const;
export type Device = (typeof DEVICES)[number];
export type DeviceId = Device["id"];
export type Orientation = "portrait" | "landscape";
/** "app" follows the console's own theme preference. */
export type FrameTheme = "app" | "light" | "dark";

/** Pure: the CSS size a device shows at; phones and tablets swap sides in landscape. */
export function screenOf(d: Device, o: Orientation): { width: number; height: number } {
  return d.turns && o === "landscape" ? { width: d.height, height: d.width } : { width: d.width, height: d.height };
}

/** Pure: how much a screen `width` CSS px wide shrinks to fit a column `room` px wide; never enlarged. */
export function fitScale(room: number, width: number): number {
  return room > 0 && width > 0 ? Math.min(1, room / width) : 0;
}

/** Pure: the pages a preview can show: every menu page the role sees, except links out and this page itself. */
export function previewable(tree: NavNode[]): NavLeaf[] {
  return leaves(tree).filter((l) => !l.entry.external && l.entry.id !== "devices" && !!l.entry.href?.startsWith("#/"));
}

/** Pure: a frame's address: this app with its own query (store options) plus the theme, at the page's hash. */
export function frameSrc(pathname: string, search: string, href: string, theme: ThemePreference): string {
  const q = new URLSearchParams(search);
  q.set("theme", theme);
  return `${pathname}?${q.toString()}${href}`;
}

interface PageGroup {
  id: string;
  label: string | null;
  pages: { value: string; label: string }[];
}

/** Pure: the select's choices, one group per top menu section; top-level pages stand alone, in menu order. */
export function pageGroups(list: NavLeaf[], t: Translate): PageGroup[] {
  const groups: PageGroup[] = [];
  for (const { entry, trail } of list) {
    const top = trail[0];
    const option = { value: entry.href ?? "", label: [...trail.slice(1), entry].map((n) => t(n.label)).join(" / ") };
    const last = groups[groups.length - 1];
    if (top && last?.id === top.id) last.pages.push(option);
    else groups.push({ id: top?.id ?? entry.id, label: top ? t(top.label) : null, pages: [option] });
  }
  return groups;
}

/** True below the drawer breakpoint (768px), where one frame shows at a time. */
function useNarrow(initial: boolean): boolean {
  const [narrow, setNarrow] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia?.("(min-width: 48rem)");
    if (!mq) return;
    const sync = (): void => setNarrow(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return narrow;
}

interface FrameProps {
  device: Device;
  orientation: Orientation;
  src: string;
  page: string;
}

/** One screen: the console at the device's true CSS size, scaled down with a transform to the column's width. */
function DeviceFrame({ device, orientation, src, page }: FrameProps): JSX.Element {
  const { t, locale } = useI18n();
  const screen = screenOf(device, orientation);
  const box = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = (): void => setScale(fitScale(el.clientWidth, screen.width));
    fit();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(fit);
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [screen.width]);
  const name = t(device.label);
  const lower = name.toLocaleLowerCase(locale);
  // Each column grows with the shape of its screen, so the three screens stand equally tall in one row. The link sits
  // beside the title, so every head keeps one height however narrow its column. It has rel="opener": the new tab then
  // starts with this session (kept in memory) instead of the sign-in page.
  return (
    <Card
      className="app-device"
      data-device={device.id}
      style={{ flexGrow: screen.width / screen.height }}
      headingLevel={2}
      title={name}
      subtitle={`${screen.width} × ${screen.height}`}
      monoSubtitle
      flush
      titleAside={
        <Button variant="ghost" size="sm" icon="external" href={src} target="_blank" rel="opener" aria-label={t("devices.openLabel", { page })}>
          {t("devices.open")}
        </Button>
      }
    >
      <div ref={box} className="app-device-screen" style={{ aspectRatio: `${screen.width} / ${screen.height}` }}>
        <iframe
          className="app-device-frame"
          src={src}
          title={t("devices.frameTitle", { page, device: lower })}
          style={{ width: screen.width, height: screen.height, transform: `scale(${scale})`, visibility: scale ? undefined : "hidden" }}
          onLoad={() => setLoaded(true)}
        />
        {/* After the frame, so it paints over it until the frame has loaded. */}
        {loaded ? null : (
          <div className="app-frame-loading">
            <Spinner size="md" label={t("devices.loading", { device: lower })} />
          </div>
        )}
      </div>
    </Card>
  );
}

export interface DevicesPageProps {
  session: Session;
  roles: Role[];
  /** Paths the back-end access mode switched off; they are not offered. */
  hidden?: ReadonlySet<string>;
  /** The console's theme preference, which "Follow app" passes on to the frames. */
  theme: ThemePreference;
  /** Starting state, for tests. */
  initialNarrow?: boolean;
  initialPage?: string;
}

/** Any menu page at phone, tablet and desktop sizes at once: three live frames of this console, signed in. */
export function DevicesPage({ session, roles, hidden, theme, initialNarrow = false, initialPage }: DevicesPageProps): JSX.Element {
  const { t, locale } = useI18n();
  const narrow = useNarrow(initialNarrow);
  const list = useMemo(() => previewable(navFor(roles, session.role, undefined, hidden)), [roles, session.role, hidden]);
  const [chosen, setChosen] = useState(() => initialPage ?? `#${initialParam("page") ?? "/"}`);
  const [frameTheme, setFrameTheme] = useState<FrameTheme>("app");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [device, setDevice] = useState<DeviceId>("phone");
  // A page the role cannot see (or this page itself, from a typed link) falls back to the first one.
  const page = list.find((l) => l.entry.href === chosen) ?? list[0];
  const framed = inFrame();

  // Consoles in the frames start signed in as this session while the preview shows.
  useEffect(() => (framed ? undefined : shareSession(session)), [session, framed]);
  // A link to another page of the preview (back, forward, a pasted address) keeps this view and swaps the page.
  useEffect(() => {
    const sync = (): void => {
      const p = queryOf(window.location.hash).get("page");
      if (p) setChosen(`#${p}`);
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  if (framed)
    return (
      <>
        <PageHeader title={t("devices.title")} description={t("devices.description")} />
        <Banner tone="info" title={t("devices.nested")}>
          {t("devices.nestedHint")}
        </Banner>
      </>
    );

  const choose = (href: string): void => {
    setChosen(href);
    replaceQuery({ page: href.replace(/^#/, "") });
  };
  const href = page?.entry.href ?? "#/";
  const pageName = page ? t(page.entry.label) : t("nav.dashboard");
  const where = typeof window === "undefined" ? { pathname: "", search: "" } : window.location;
  const src = frameSrc(where.pathname, where.search, href, frameTheme === "app" ? theme : frameTheme);
  const shown = narrow ? DEVICES.filter((d) => d.id === device) : DEVICES;
  const turns = !narrow || DEVICES.some((d) => d.id === device && d.turns);

  return (
    <>
      <PageHeader title={t("devices.title")} description={t("devices.description")} />
      <div className="app-stack">
        <div className="app-filters">
          <Select label={t("devices.page")} value={href} onChange={(e) => choose(e.target.value)}>
            {pageGroups(list, t).map((g) =>
              g.label ? (
                <optgroup key={g.id} label={g.label}>
                  {g.pages.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
              ) : (
                g.pages.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))
              ),
            )}
          </Select>
          <Segmented
            label={t("devices.theme")}
            value={frameTheme}
            onChange={(v) => setFrameTheme(v as FrameTheme)}
            options={(["app", "light", "dark"] as const).map((v) => ({ value: v, label: t(`devices.themes.${v}`) }))}
          />
          <Segmented
            label={t("devices.orientation")}
            value={orientation}
            disabled={!turns}
            onChange={(v) => setOrientation(v as Orientation)}
            options={[
              { value: "portrait", label: t("devices.portrait") },
              { value: "landscape", label: t("devices.landscape") },
            ]}
          />
          {narrow ? (
            <Segmented label={t("devices.device")} value={device} onChange={(v) => setDevice(v as DeviceId)} options={DEVICES.map((d) => ({ value: d.id, label: t(d.label) }))} />
          ) : null}
        </div>
        <div className="app-devices" role="group" aria-label={t("devices.previews")}>
          {shown.map((d) => (
            // A new address or language remounts the frame, so its loading state starts again.
            <DeviceFrame key={`${d.id}-${src}-${locale}`} device={d} orientation={orientation} src={src} page={pageName} />
          ))}
        </div>
      </div>
    </>
  );
}
