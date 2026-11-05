import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommitGraph } from "./CommitGraph";
import { graphRows } from "./graphLanes";

const items = [
  { id: "0000000", parents: ["h"], boundary: true },
  { id: "h", parents: ["m"] },
  { id: "m", parents: ["r", "b"] },
  { id: "r", parents: ["z"] },
  { id: "b", parents: ["z"] },
  { id: "z", parents: [] },
];
const rows = graphRows(items, { head: "h", remote: "r", base: "b" });

const meta = {
  title: "Display/CommitGraph",
  component: CommitGraph,
  args: { row: rows[0] },
} satisfies Meta<typeof CommitGraph>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Boundary: Story = {};
export const Head: Story = { args: { row: rows[1] } };
export const Merge: Story = { args: { row: rows[2] } };
export const Graph: Story = {
  render: () => (
    <div style={{ background: "var(--bg-1)", color: "var(--text-1)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
      {rows.map((row, i) => (
        <div key={items[i].id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CommitGraph row={row} />
          <span>{items[i].id}</span>
        </div>
      ))}
    </div>
  ),
};
