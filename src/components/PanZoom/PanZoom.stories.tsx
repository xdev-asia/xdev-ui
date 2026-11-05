import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PanZoom } from "./PanZoom";

const meta = { title: "Display/PanZoom", component: PanZoom } satisfies Meta<typeof PanZoom>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { zoom: 1, x: 0, y: 0, label: "Preview", onZoom() {}, onPan() {} },
  render: () => {
    const [s, set] = useState({ zoom: 1, x: 0, y: 0 });
    return (
      <div style={{ height: 240, display: "flex" }}>
        <PanZoom {...s} label="Preview" onZoom={set} onPan={(x, y) => set({ ...s, x, y })}>
          <div style={{ width: 320, height: 200, background: "var(--x-color-surface-2)" }} />
        </PanZoom>
      </div>
    );
  },
};
