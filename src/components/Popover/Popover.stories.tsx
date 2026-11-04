import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Icon } from "../Icon/Icon";
import { ListRow } from "../ListRow/ListRow";
import { StatusDot } from "../StatusDot/StatusDot";
import { Popover } from "./Popover";

const meta = {
  title: "Overlays/Popover",
  component: Popover,
  args: { open: true, onClose: () => {}, label: "Notifications" },
  decorators: [(Story) => <div style={{ minHeight: 220, padding: 16 }}><Story /></div>],
} satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;

const notes = (
  <div style={{ width: 280, display: "grid", gap: 2 }}>
    <ListRow leading={<StatusDot check="fail" />} title="2 checks failed" meta="feat/tabs · CI · 3 min ago" onClick={() => {}} />
    <ListRow leading={<StatusDot state="waiting" />} title="Claude Code is waiting" meta="fix/tree-focus · needs approval" onClick={() => {}} />
    <ListRow leading={<StatusDot state="done" />} title="Codex finished" meta="docs/adr-0007 · 12 files changed" onClick={() => {}} />
  </div>
);

export const Notifications: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <Popover
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        trigger={(p) => (
          <button type="button" className="ws-icon-btn" aria-label="Notifications" onClick={() => setOpen((o) => !o)} {...p}>
            <Icon name="warn" />
          </button>
        )}
      >
        {notes}
      </Popover>
    );
  },
};

export const OpenBottomEnd: Story = {
  args: { placement: "bottom-end", trigger: <span style={{ marginLeft: 280 }}>Anchor</span>, children: notes },
};
