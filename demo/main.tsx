import { createElement as h, StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import * as X from "../src";
import "../src/styles/fonts.css";
import "../src/styles/index.css";
import { previews } from "./previews";
import "./demo.css";

const GROUPS: [string, string[]][] = [
  ["Actions", ["Button", "IconButton"]],
  ["Inputs", ["Segmented", "Select", "Field", "Switch"]],
  ["Display", ["Kbd", "Badge", "Tag", "AgentChip", "DiffStat"]],
  ["Status", ["StatusDot", "Meter", "Banner", "Toast"]],
  ["Navigation", ["TabStrip", "ActivityBar", "StatusBar"]],
  ["Overlays", ["Menu", "Dialog", "CommandPalette"]],
  ["Brand", ["BrandMark", "Icon"]],
];

function App() {
  const [theme, setTheme] = useState("dark");
  document.documentElement.dataset.theme = theme;
  return (
    <div className="demo">
      <header className="demo-head">
        <X.BrandMark variant="lockup" size={28} />
        <span className="demo-pkg">@xdev-asia/ui</span>
        <span className="demo-spacer" />
        <X.Segmented
          label="Theme"
          value={theme}
          onChange={setTheme}
          options={[
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
          ]}
        />
      </header>
      {GROUPS.map(([group, names]) => (
        <section key={group} className="demo-group">
          <h2>{group}</h2>
          {names.map((n) => (
            <article key={n} className="demo-card">
              <h3>{n}</h3>
              <div className="demo-stage" style={previews[n]?.style}>{previews[n] ? previews[n].render(X, h) : null}</div>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
