import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../Button/Button";
import { DataTable } from "../DataTable/DataTable";
import { BulkBar } from "./BulkBar";

const meta = {
  title: "Data/BulkBar",
  component: BulkBar,
  args: { count: 3, onClear: () => {} },
} satisfies Meta<typeof BulkBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <BulkBar {...args}>
      <Button variant="secondary">Suspend</Button>
      <Button variant="secondary" icon="trash">Delete</Button>
    </BulkBar>
  ),
};
export const ClearOnly: Story = { args: { count: 1 } };
/** Select rows: the bar appears at the bottom of the scrolling list and goes away when cleared. */
export const WithTable: Story = {
  render: () => {
    const rows = Array.from({ length: 30 }, (_, i) => ({ id: String(i + 1), name: `User ${i + 1}` }));
    const [selected, setSelected] = useState<Set<string>>(new Set(["2", "5"]));
    return (
      <div style={{ height: 360, overflow: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        <DataTable caption="Users" rows={rows} rowKey={(r) => r.id} rowLabel={(r) => r.name} columns={[{ key: "name", header: "Name", cell: (r) => r.name }]} selected={selected} onSelectedChange={setSelected} />
        <BulkBar count={selected.size} onClear={() => setSelected(new Set())}>
          <Button variant="secondary">Suspend</Button>
        </BulkBar>
      </div>
    );
  },
};
