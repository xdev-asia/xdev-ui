import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Inputs/Checkbox",
  component: Checkbox,
  args: { label: "Delete the branch too" },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const WithHint: Story = { args: { label: "Push after commit", hint: "Uses the upstream of feat/login-retry." } };
export const Indeterminate: Story = { args: { label: "Select all worktrees", indeterminate: true } };
export const Disabled: Story = { args: { label: "Force push", disabled: true, hint: "Protected branch." } };
/** "Select all" over a list: mixed while some, not all, rows are picked. */
export const SelectAll: Story = {
  render: () => {
    const names = ["feat/login-retry", "fix/token-refresh", "docs/setup"];
    const [picked, setPicked] = useState<string[]>(["feat/login-retry"]);
    const all = picked.length === names.length;
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Checkbox
          label="Select all worktrees"
          checked={all}
          indeterminate={picked.length > 0 && !all}
          onChange={() => setPicked(all ? [] : names)}
        />
        {names.map((n) => (
          <Checkbox
            key={n}
            label={n}
            checked={picked.includes(n)}
            onChange={(e) => setPicked((p) => (e.target.checked ? [...p, n] : p.filter((x) => x !== n)))}
          />
        ))}
      </div>
    );
  },
};
