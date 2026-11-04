import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../Button/Button";
import { Disclosure } from "./Disclosure";

const files = ["apps/desktop/src/FileTree.tsx", "crates/xdev-core/src/git.rs", "package.json"];
const list = (
  <ul style={{ margin: 0, padding: "4px 12px", listStyle: "none", fontFamily: "var(--font-mono)", fontSize: 12 }}>
    {files.map((f) => (
      <li key={f} style={{ padding: "3px 0" }}>{f}</li>
    ))}
  </ul>
);

const meta = {
  title: "Navigation/Disclosure",
  component: Disclosure,
  args: { title: "Staged", count: 3, children: list },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
} satisfies Meta<typeof Disclosure>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};
export const Collapsed: Story = { args: { title: "Unstaged", count: 12, defaultExpanded: false } };
export const WithActions: Story = {
  args: { actions: <Button variant="secondary">Unstage all</Button> },
};
export const Controlled: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return <Disclosure {...args} expanded={open} onToggle={setOpen} />;
  },
};
