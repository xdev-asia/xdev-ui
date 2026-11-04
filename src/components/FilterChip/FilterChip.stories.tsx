import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FilterChip } from "./FilterChip";

const meta = {
  title: "Inputs/FilterChip",
  component: FilterChip,
  args: { pressed: false, children: "Waiting", count: 2 },
} satisfies Meta<typeof FilterChip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Pressed: Story = { args: { pressed: true, children: "Failed", count: 1 } };
export const WithoutCount: Story = { args: { count: undefined, children: "Has changes" } };
export const Disabled: Story = { args: { disabled: true, children: "Archived", count: 0 } };
/** A filter row over agent sessions. */
export const Row: Story = {
  render: () => {
    const chips = [
      { id: "working", label: "Working", count: 3 },
      { id: "waiting", label: "Waiting", count: 2 },
      { id: "failed", label: "Failed", count: 1 },
      { id: "done", label: "Done", count: 8 },
    ];
    const [on, setOn] = useState<string[]>(["waiting"]);
    return (
      <div className="task-chips">
        {chips.map((c) => (
          <FilterChip
            key={c.id}
            pressed={on.includes(c.id)}
            count={c.count}
            onClick={() => setOn((p) => (p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id]))}
          >
            {c.label}
          </FilterChip>
        ))}
      </div>
    );
  },
};
