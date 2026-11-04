import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SearchInput } from "./SearchInput";

const meta = {
  title: "Inputs/SearchInput",
  component: SearchInput,
  args: { placeholder: "Find a worktree or branch", size: "md" },
} satisfies Meta<typeof SearchInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithShortcut: Story = { args: { shortcut: "Ctrl K", placeholder: "Search sessions, files and commands" } };
export const Small: Story = { args: { size: "sm", placeholder: "Filter files", "aria-label": "Filter files" } };
export const Disabled: Story = { args: { disabled: true } };
/** Typing shows the clear button and the match count. */
export const WithClearAndCount: Story = {
  render: (args) => {
    const names = ["feat/login-retry", "fix/token-refresh", "feat/login-otp", "docs/setup"];
    const [q, setQ] = useState("login");
    const hits = names.filter((n) => n.includes(q));
    return (
      <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <SearchInput {...args} value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ("")} count={q ? hits.length : undefined} />
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {hits.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>
    );
  },
};
