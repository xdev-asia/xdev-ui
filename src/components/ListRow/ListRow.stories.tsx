import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DiffStat } from "../DiffStat/DiffStat";
import { IconButton } from "../IconButton/IconButton";
import { StatusDot } from "../StatusDot/StatusDot";
import { ListRow } from "./ListRow";

const meta = {
  title: "Display/ListRow",
  component: ListRow,
  args: { title: "feat/new-components", meta: "xdev-ui · 4 min ago" },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
} satisfies Meta<typeof ListRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Static: Story = {};
export const Selected: Story = { args: { selected: true, onClick: () => {} } };
export const Disabled: Story = { args: { disabled: true, onClick: () => {}, meta: "Locked by another session" } };

const trees = [
  { id: "main", title: "main", meta: "xdev · clean", add: 0, del: 0 },
  { id: "tabs", title: "feat/tabs", meta: "xdev-ui · 4 min ago", add: 212, del: 18 },
  { id: "fix", title: "fix/tree-focus", meta: "xdev · 1 h ago", add: 9, del: 3 },
];

export const WorktreeList: Story = {
  render: () => {
    const [sel, setSel] = useState("tabs");
    return (
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 2 }}>
        {trees.map((t) => (
          <ListRow
            key={t.id}
            as="li"
            title={t.title}
            meta={t.meta}
            selected={sel === t.id}
            onClick={() => setSel(t.id)}
            leading={<StatusDot state={t.add ? "working" : "idle"} />}
            trailing={
              <>
                {t.add ? <DiffStat added={t.add} removed={t.del} /> : null}
                <IconButton icon="close" label={`Remove ${t.title}`} />
              </>
            }
          />
        ))}
      </ul>
    );
  },
};
