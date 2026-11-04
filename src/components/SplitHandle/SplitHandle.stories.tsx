import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SplitHandle } from "./SplitHandle";

const meta = {
  title: "Navigation/SplitHandle",
  component: SplitHandle,
  args: { direction: "horizontal", value: 240, min: 160, max: 420, onResize: () => {}, label: "Resize file tree" },
} satisfies Meta<typeof SplitHandle>;
export default meta;
type Story = StoryObj<typeof meta>;

const pane = { background: "var(--x-color-surface)", padding: 12, fontSize: 12, color: "var(--x-color-muted)" };

export const Sidebar: Story = {
  render: (args) => {
    const [w, setW] = useState(240);
    return (
      <div style={{ display: "flex", height: 240, border: "1px solid var(--x-color-line)" }}>
        <div style={{ ...pane, width: w, flex: "none" }}>File tree · {w}px</div>
        <SplitHandle {...args} value={w} onResize={setW} />
        <div style={{ ...pane, flex: 1 }}>Editor</div>
      </div>
    );
  },
};

export const TerminalDock: Story = {
  args: { direction: "vertical", label: "Resize terminal", reverse: true, min: 80, max: 260 },
  render: (args) => {
    const [h, setH] = useState(140);
    return (
      <div style={{ display: "flex", flexDirection: "column", height: 320, width: 520, border: "1px solid var(--x-color-line)" }}>
        <div style={{ ...pane, flex: 1 }}>Diff</div>
        <SplitHandle {...args} value={h} onResize={setH} />
        <div style={{ ...pane, height: h, flex: "none", fontFamily: "var(--font-mono)" }}>$ pnpm test · {h}px</div>
      </div>
    );
  },
};
